-- ═══════════════════════════════════════════════════════════════════════════
-- OMINIPULSE — 0005_security_hardening.sql
--
-- End-to-end audit fixes (database layer). Applies on top of 0001–0004:
--   1. Close signup role injection (handle_new_user trusts client metadata)
--   2. Lock privileged profile columns (role / verification / approval) against
--      self-elevation via profiles_update_own
--   3. Revoke public execute on issue_password_reset_otp (OTP leak → takeover)
--   4. Authorize complete_appointment_and_release_escrow (doctor-owned only)
--   5. Fix get_available_slots day-name padding bug (slots always empty)
--   6. Fix cancelled appointments permanently blocking their slot
--   7. Restrict beds_select (ward census PHI), donors_select (unverified donors
--      + GPS), blood_requests_select (patient names) to appropriate roles
--   8. Lock doctor MDCN/rating and donor is_verified against self-verification
--   9. Force sane defaults on appointment status/payment columns written by
--      non-admins
--  10. Seal audit_logs actor identity (no forged actor_name/role)
--  11. Restrict ai_count_usage_today to service role
--  12. log_audit_entry must attribute entries to the caller
--  13. Align hospital-staff workflows (booking / vitals / records) with RLS
-- Safe to re-run (idempotent: create or replace / drop-if-exists policies).
-- ═══════════════════════════════════════════════════════════════════════════

begin;

-- ─── 1. Signup role injection ─────────────────────────────────────────────────
-- handle_new_user (0001) read the role from client-controlled signup metadata.
-- Any signup could claim role 'admin' and pass every is_admin() gate on login.
-- Privileged roles are now provisioned server-side only.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    'patient'::public.user_role
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ─── 2. Lock privileged profile columns ───────────────────────────────────────
-- profiles_update_own allowed any user to set role='admin',
-- verification_status='approved', is_active=true on their own row.

create or replace function public.lock_privileged_profile_columns()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin()
     and (new.role, new.is_approved, new.verification_status, new.is_active)
         is distinct from
         (old.role, old.is_approved, old.verification_status, old.is_active) then
    raise exception 'profiles: role/verification/approval columns are admin-managed only';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_lock on public.profiles;
create trigger trg_profiles_lock
  before update on public.profiles
  for each row execute function public.lock_privileged_profile_columns();

-- ─── 3. OTP issue function exposure ──────────────────────────────────────────
-- SECURITY DEFINER + execute-to-public returned the 6-digit OTP to any anon
-- caller — full account takeover of any known email. The send-otp edge
-- function calls this via the service role, so public access is revoked.

revoke execute on function public.issue_password_reset_otp(text) from public, anon, authenticated;
grant execute on function public.issue_password_reset_otp(text) to service_role;

-- Also tighten verify/consume: verify must stay callable by anon (the mobile
-- forgot-password flow calls it before login; it only validates a SHA-256
-- hash against an existing row, cannot enumerate accounts, and the consume
-- path is attempt-capped in-function).
revoke execute on function public.verify_password_reset_otp(text, text) from public;
grant execute on function public.verify_password_reset_otp(text, text) to anon, authenticated, service_role;

revoke execute on function public.consume_password_reset_otp(text, text) from public;
grant execute on function public.consume_password_reset_otp(text, text) to service_role;

-- ─── 4. Escrow release authorization ─────────────────────────────────────────
-- Any authenticated user could complete any appointment and release escrow.

create or replace function public.complete_appointment_and_release_escrow(
  p_appointment_id uuid
)
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  v_appt public.appointments%rowtype;
  v_fee numeric(12, 2);
  v_payout numeric(12, 2);
begin
  -- Caller must be the consultation's doctor (or service role / admin).
  if auth.uid() is not null then
    if not exists (
      select 1
        from public.appointments a
        join public.doctor_profiles dp on dp.id = a.doctor_id
       where a.id = p_appointment_id
         and (dp.profile_id = auth.uid() or public.is_admin())
    ) then
      return false;
    end if;
  end if;

  select * into v_appt from public.appointments where id = p_appointment_id
    for update;

  if v_appt.id is null then
    return false;
  end if;

  -- Only a currently-active consultation can be completed.
  if v_appt.status in ('cancelled', 'no_show') then
    return false;
  end if;

  select consultation_fee into v_fee
    from public.doctor_profiles where id = v_appt.doctor_id;

  v_payout := round(v_fee * 0.90, 2);

  update public.appointments
     set status = 'completed',
         payment_status = 'released',
         doctor_approved_at = now(),
         is_doctor_approved = true
   where id = p_appointment_id;

  update public.payment_transactions
     set status = 'released',
         escrow_released = true,
         escrow_released_at = now(),
         doctor_payout = v_payout,
         platform_fee = v_fee - v_payout
   where appointment_id = p_appointment_id;

  return true;
end;
$$;

-- ─── 5. Slot availability day-padding bug ────────────────────────────────────
-- to_char(p_date, 'day') pads to 9 chars ('monday   ') which never equals
-- doctor_working_hours.day — get_available_slots returned [] for 6 of 7 days.

create or replace function public.get_available_slots(p_doctor_id uuid, p_date date)
returns json
language plpgsql
security definer set search_path = public
stable
as $$
declare
  v_day text := btrim(lower(to_char(p_date, 'day')));
  v_start time;
  v_end time;
  v_slot_minutes int;
  v_booked timestamptz[];
  v_slots text[] := '{}';
  v_cursor timestamptz;
  v_slot_text text;
begin
  select start_time, end_time, slot_duration
    into v_start, v_end, v_slot_minutes
    from public.doctor_working_hours
   where doctor_id = p_doctor_id
     and day = v_day
     and is_active = true;

  if v_start is null then
    return to_json(v_slots);
  end if;

  select coalesce(array_agg(scheduled_at), '{}')
    into v_booked
    from public.appointments
   where doctor_id = p_doctor_id
     and scheduled_at::date = p_date
     and status in ('pending', 'scheduled', 'approved');

  v_cursor := p_date + v_start;
  while v_cursor::time < v_end loop
    if not (v_cursor = any(v_booked)) then
      v_slot_text := to_char(v_cursor, 'HH24:MI');
      v_slots := array_append(v_slots, v_slot_text);
    end if;
    v_cursor := v_cursor + (v_slot_minutes || ' minutes')::interval;
  end loop;

  return to_json(v_slots);
end;
$$;

-- ─── 6. Cancelled appointments no longer block slots ──────────────────────────
-- The old unique (doctor_id, scheduled_at) made every cancelled time dead
-- forever: the slot showed available, the re-booking INSERT violated the
-- constraint and 500'd.
-- NOTE: no_double_booking exists as a unique CONSTRAINT (which owns a
-- backing index) — drop the constraint first; dropping the index directly
-- fails while the constraint still requires it.

alter table public.appointments drop constraint if exists no_double_booking;
drop index if exists no_double_booking;
create unique index if not exists no_double_booking
  on public.appointments (doctor_id, scheduled_at)
  where status in ('pending', 'scheduled', 'approved');

-- ─── 7. PHI-restricting RLS policies ─────────────────────────────────────────

-- Ward census (patient names + diagnoses) was readable by every account.
drop policy if exists beds_select on public.hospital_beds;
create policy beds_select on public.hospital_beds
  for select to authenticated
  using (public.is_admin() or public.is_hospital_staff(hospital_id));

-- Unverified donors, with phone numbers and home GPS, were publicly listed.
drop policy if exists donors_select on public.blood_donors;
create policy donors_select on public.blood_donors
  for select to authenticated
  using (is_verified = true or profile_id = auth.uid() or public.is_admin());

-- Blood requests exposed patient names + conditions to every account.
drop policy if exists blood_requests_select on public.blood_requests;
create policy blood_requests_select on public.blood_requests
  for select to authenticated
  using (
    public.is_admin()
    or requested_by = auth.uid()
    or public.is_hospital_staff(hospital_id)
    or public.is_doctor()
  );

-- ─── 8. Self-verification guards ─────────────────────────────────────────────

-- Doctors could insert/update is_mdcn_verified, rating, review_count.
create or replace function public.guard_doctor_verification()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.is_mdcn_verified := false;
    if tg_op = 'UPDATE' then
      new.rating := old.rating;
      new.review_count := old.review_count;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_doctor_verify_guard on public.doctor_profiles;
create trigger trg_doctor_verify_guard
  before insert or update on public.doctor_profiles
  for each row execute function public.guard_doctor_verification();

-- Blood donors could set is_verified = true themselves.
create or replace function public.guard_donor_verification()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.is_verified := false;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_donor_verify_guard on public.blood_donors;
create trigger trg_donor_verify_guard
  before insert or update on public.blood_donors
  for each row execute function public.guard_donor_verification();

-- ─── 9. Appointment status/payment integrity ─────────────────────────────────
-- Patients could set status='completed' / payment_status='released' on their
-- own appointments via direct Supabase calls.

create or replace function public.guard_appointment_integrity()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if tg_op = 'INSERT' then
      new.status := 'pending';
      new.payment_status := 'pending';
      new.is_doctor_approved := false;
    else
      -- Only the consulting doctor (or admin) may change payment/approval
      -- columns; patients may still cancel or reschedule their own rows.
      if (new.payment_status is distinct from old.payment_status)
         or (new.is_doctor_approved is distinct from old.is_doctor_approved)
         or (new.status = 'completed' and old.status <> 'completed') then
        if not exists (
          select 1
            from public.doctor_profiles dp
           where dp.profile_id = auth.uid()
             and dp.id = old.doctor_id
        ) then
          raise exception 'appointments: status/payment columns are doctor/admin-managed only';
        end if;
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_appointment_guard on public.appointments;
create trigger trg_appointment_guard
  before insert or update on public.appointments
  for each row execute function public.guard_appointment_integrity();

-- payment_status should always carry a value (consistent with every other
-- status column). Backfill first: SET NOT NULL fails if any legacy row is NULL.
update public.appointments
   set payment_status = 'pending'
 where payment_status is null;
alter table public.appointments alter column payment_status set not null;

-- ─── 10. Seal audit actor identity ───────────────────────────────────────────
-- audit_insert pinned actor_id to the caller but left actor_name/actor_role
-- forgeable.

create or replace function public.audit_seal_actor()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_name text;
  v_role public.actor_role;
begin
  if auth.uid() is not null and not public.is_admin() then
    select p.first_name || ' ' || p.last_name, p.role into v_name, v_role
      from public.profiles p where p.id = auth.uid();
    if v_name is not null then
      new.actor_name := v_name;
      new.actor_role := case v_role
        when 'admin' then 'admin'::public.actor_role
        when 'doctor' then 'doctor'::public.actor_role
        else 'patient'::public.actor_role
      end;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_audit_seal on public.audit_logs;
create trigger trg_audit_seal
  before insert on public.audit_logs
  for each row execute function public.audit_seal_actor();

-- ─── 11. AI usage counter leak ───────────────────────────────────────────────

revoke execute on function public.ai_count_usage_today(uuid) from public, anon, authenticated;
grant execute on function public.ai_count_usage_today(uuid) to service_role;

-- ─── 12. log_audit_entry caller attribution ─────────────────────────────────
-- Signature must match 0003 EXACTLY (create or replace with a different
-- signature would create a second overload, leaving the forgeable original
-- callable). The backend calls: (p_patient_id, p_actor_id, p_action,
-- p_record_id, p_record_name, p_record_category, p_ip_address, p_device).

create or replace function public.log_audit_entry(
  p_patient_id uuid,
  p_actor_id uuid,
  p_action public.audit_action,
  p_record_id text,
  p_record_name text,
  p_record_category public.record_category,
  p_ip_address text default null,
  p_device text default null
)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_actor public.profiles%rowtype;
  v_patient public.patient_profiles%rowtype;
  v_id uuid;
begin
  -- Entries must be attributed to the caller (admins may act for others).
  if auth.uid() is not null
     and p_actor_id is distinct from auth.uid()
     and not public.is_admin() then
    raise exception 'log_audit_entry: actor must be the caller';
  end if;

  select * into v_actor from public.profiles where id = p_actor_id;
  select * into v_patient from public.patient_profiles where id = p_patient_id;

  insert into public.audit_logs (
    patient_id, patient_name, actor_id, actor_name, actor_role,
    action, record_id, record_name, record_category, ip_address, device
  ) values (
    p_patient_id,
    coalesce(v_patient.first_name || ' ' || v_patient.last_name, 'Unknown'),
    p_actor_id,
    coalesce(v_actor.first_name || ' ' || v_actor.last_name, 'System'),
    case v_actor.role
      when 'admin' then 'admin'::public.actor_role
      when 'doctor' then 'doctor'::public.actor_role
      else 'patient'::public.actor_role
    end,
    p_action, p_record_id, p_record_name, p_record_category,
    p_ip_address, p_device
  ) returning id into v_id;

  return v_id;
end;
$$;

-- ─── 13. Align hospital-staff workflows with RLS ─────────────────────────────
-- The Express permission matrix grants receptionists booking, nurses vitals
-- and record reads, and lab techs record creation — but the 0002 policies
-- denied all three, so those features 400'd or silently returned nothing.

-- Staff may book appointments for patients of their hospital.
drop policy if exists appointments_insert on public.appointments;
create policy appointments_insert on public.appointments
  for insert to authenticated
  with check (
    patient_id = public.my_patient_profile_id()
    or (
      public.current_profile_role() = 'receptionist'
      and public.is_hospital_staff(public.hospital_id_from_doctor(doctor_id))
    )
  );

-- Staff may update appointments for their hospital (approve / no_show).
drop policy if exists appointments_update on public.appointments;
create policy appointments_update on public.appointments
  for update to authenticated
  using (
    public.is_admin()
    or patient_id = public.my_patient_profile_id()
    or doctor_id = public.my_doctor_profile_id()
    or (
      public.current_profile_role() = 'receptionist'
      and public.is_hospital_staff(public.hospital_id_from_doctor(doctor_id))
    )
  );

-- Nurses may read records of patients admitted to their hospital.
drop policy if exists records_select on public.medical_records;
create policy records_select on public.medical_records
  for select to authenticated
  using (
    public.is_admin()
    or patient_id = public.my_patient_profile_id()
    or (public.is_doctor()
        and public.doctor_has_patient(public.my_doctor_profile_id(), patient_id)
        and visibility = 'all')
    or (
      public.current_profile_role() = 'nurse'
      and public.is_hospital_staff((select pp.hospital_id from public.patient_profiles pp where pp.id = patient_id))
    )
  );

-- Lab technicians may file results for their hospital's patients.
drop policy if exists records_write on public.medical_records;
create policy records_write on public.medical_records
  for all to authenticated
  using (
    public.is_admin()
    or patient_id = public.my_patient_profile_id()
    or (public.is_doctor() and public.doctor_has_patient(public.my_doctor_profile_id(), patient_id))
    or (
      public.current_profile_role() = 'lab_technician'
      and public.is_hospital_staff((select pp.hospital_id from public.patient_profiles pp where pp.id = patient_id))
    )
  )
  with check (
    public.is_admin()
    or patient_id = public.my_patient_profile_id()
    or (public.is_doctor() and public.doctor_has_patient(public.my_doctor_profile_id(), patient_id))
    or (
      public.current_profile_role() = 'lab_technician'
      and public.is_hospital_staff((select pp.hospital_id from public.patient_profiles pp where pp.id = patient_id))
    )
  );

-- Nurses and doctors may record vitals for their hospital's patients.
drop policy if exists vitals_write on public.vitals_readings;
create policy vitals_write on public.vitals_readings
  for all to authenticated
  using (
    patient_id = public.my_patient_profile_id()
    or public.is_admin()
    or (
      public.current_profile_role() in ('nurse', 'doctor')
      and public.is_hospital_staff((select pp.hospital_id from public.patient_profiles pp where pp.id = patient_id))
    )
  )
  with check (
    patient_id = public.my_patient_profile_id()
    or public.is_admin()
    or (
      public.current_profile_role() in ('nurse', 'doctor')
      and public.is_hospital_staff((select pp.hospital_id from public.patient_profiles pp where pp.id = patient_id))
    )
  );

-- Hospital staff may read vitals of their hospital's patients.
drop policy if exists vitals_select on public.vitals_readings;
create policy vitals_select on public.vitals_readings
  for select to authenticated
  using (
    public.is_admin()
    or patient_id = public.my_patient_profile_id()
    or (public.is_doctor() and public.doctor_has_patient(public.my_doctor_profile_id(), patient_id))
    or (
      public.current_profile_role() in ('nurse', 'receptionist')
      and public.is_hospital_staff((select pp.hospital_id from public.patient_profiles pp where pp.id = patient_id))
    )
  );

commit;
