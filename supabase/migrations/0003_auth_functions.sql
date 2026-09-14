-- ═══════════════════════════════════════════════════════════════════════════
-- OMINIPULSE UNIFIED BACKEND — 0003_auth_functions.sql
--
-- Authentication & data-consistency functions shared by mobile + web:
--   • OTP issue/verify (SHA-256 hashed, 10-min expiry, max 5 attempts)
--   • Password reset verification
--   • Login eligibility (suspension / approval gate) so both platforms
--     reject the same accounts for the same reasons.
-- Called via supabase.rpc() from React Native and Next.js alike.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── OTP: issue ──────────────────────────────────────────────────────────────
-- Generates a 6-digit OTP, stores only its SHA-256 hash, returns the code
-- so the edge function can email it. Never expose OTP over anon RPC in prod;
-- the email step happens server-side in supabase/functions/send-otp.

create or replace function public.issue_password_reset_otp(p_email text)
returns text
language plpgsql
security definer set search_path = public
as $$
declare
  v_code text;
  v_hash text;
begin
  -- Normalize + verify account exists
  p_email := lower(trim(p_email));
  if not exists (select 1 from public.profiles where email = p_email) then
    return null;  -- do not leak account existence
  end if;

  -- Invalidate any prior live OTPs for this email
  update public.password_reset_otps
     set is_used = true
   where email = p_email and is_used = false;

  v_code := lpad((floor(random() * 1000000))::text, 6, '0');
  v_hash := encode(digest(v_code, 'sha256'), 'hex');

  insert into public.password_reset_otps (email, otp_hash, expires_at)
  values (p_email, v_hash, now() + interval '10 minutes');

  return v_code;
end;
$$;

-- ─── OTP: verify (before password reset) ─────────────────────────────────────

create or replace function public.verify_password_reset_otp(p_email text, p_otp text)
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  v_row public.password_reset_otps%rowtype;
begin
  p_email := lower(trim(p_email));

  select * into v_row
    from public.password_reset_otps
   where email = p_email
     and is_used = false
     and expires_at > now()
   order by created_at desc
   limit 1;

  if v_row.id is null then
    return false;
  end if;

  if v_row.attempts >= 5 then
    update public.password_reset_otps set is_used = true where id = v_row.id;
    return false;
  end if;

  if v_row.otp_hash = encode(digest(p_otp, 'sha256'), 'hex') then
    return true;
  end if;

  update public.password_reset_otps
     set attempts = attempts + 1
   where id = v_row.id;
  return false;
end;
$$;

-- ─── Complete password reset (marks OTP used + updates auth password) ────────
-- The new password itself is set by the edge function via the admin API;
-- this function only burns the OTP so it cannot be replayed.

create or replace function public.consume_password_reset_otp(p_email text, p_otp text)
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  v_row public.password_reset_otps%rowtype;
begin
  p_email := lower(trim(p_email));

  select * into v_row
    from public.password_reset_otps
   where email = p_email
     and is_used = false
     and expires_at > now()
   order by created_at desc
   limit 1;

  if v_row.id is null or v_row.attempts >= 5 then
    return false;
  end if;

  if v_row.otp_hash <> encode(digest(p_otp, 'sha256'), 'hex') then
    update public.password_reset_otps set attempts = attempts + 1 where id = v_row.id;
    return false;
  end if;

  update public.password_reset_otps set is_used = true where id = v_row.id;
  return true;
end;
$$;

-- ─── Login eligibility check (shared gate for mobile + web) ──────────────────
-- Returns json: { allowed, role, reason } so both clients route identically.

create or replace function public.check_login_eligibility(p_email text)
returns json
language plpgsql
security definer set search_path = public
stable
as $$
declare
  v_profile public.profiles%rowtype;
begin
  select * into v_profile
    from public.profiles
   where email = lower(trim(p_email))
   limit 1;

  if v_profile.id is null then
    return json_build_object('allowed', false, 'role', null, 'reason', 'account_not_found');
  end if;

  if not v_profile.is_active then
    return json_build_object('allowed', false, 'role', null, 'reason', 'account_deactivated');
  end if;

  if v_profile.verification_status = 'suspended' then
    return json_build_object('allowed', false, 'role', null, 'reason', 'account_suspended');
  end if;

  -- Doctors must be MDCN-approved before consulting (MDCN lock)
  if v_profile.role = 'doctor' and v_profile.verification_status <> 'approved' then
    return json_build_object(
      'allowed', false, 'role', 'doctor',
      'reason', 'verification_' || v_profile.verification_status
    );
  end if;

  return json_build_object(
    'allowed', true,
    'role', v_profile.role,
    'reason', null
  );
end;
$$;

-- ─── Unified session snapshot ───────────────────────────────────────────────
-- Returns everything a client (mobile or web) needs after login so both
-- platforms hydrate from ONE call → guaranteed consistent UI state.

create or replace function public.get_my_session()
returns json
language plpgsql
security definer set search_path = public
stable
as $$
declare
  v_profile public.profiles%rowtype;
  v_patient public.patient_profiles%rowtype;
  v_doctor public.doctor_profiles%rowtype;
begin
  select * into v_profile from public.profiles where id = auth.uid();
  if v_profile.id is null then
    return null;
  end if;

  return json_build_object(
    'user', json_build_object(
      'id', v_profile.id,
      'email', v_profile.email,
      'firstName', v_profile.first_name,
      'lastName', v_profile.last_name,
      'role', v_profile.role,
      'phone', v_profile.phone,
      'avatarUrl', v_profile.avatar_url,
      'createdAt', v_profile.created_at,
      'isApproved', v_profile.is_approved,
      'verificationStatus', v_profile.verification_status
    )
  );
end;
$$;

-- ─── Availability slot computation (booking consistency) ────────────────────
-- Derives free 30-min slots from doctor working hours minus booked
-- appointments, so patient (mobile) and receptionist (web) see the
-- exact same availability.

create or replace function public.get_available_slots(p_doctor_id uuid, p_date date)
returns json
language plpgsql
security definer set search_path = public
stable
as $$
declare
  v_day text := lower(to_char(p_date, 'day'));
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

-- ─── Dashboard stats (single source for web + mobile widgets) ────────────────

create or replace function public.get_doctor_dashboard_stats(p_doctor_profile uuid)
returns json
language plpgsql
security definer set search_path = public
stable
as $$
declare
  v_doctor_id uuid;
  v_today int;
  v_pending int;
  v_completed int;
  v_patients int;
begin
  select id into v_doctor_id from public.doctor_profiles where profile_id = p_doctor_profile;
  if v_doctor_id is null then
    return null;
  end if;

  select count(*) into v_today
    from public.appointments
   where doctor_id = v_doctor_id and scheduled_at::date = current_date;

  select count(*) into v_pending
    from public.appointments
   where doctor_id = v_doctor_id
     and status in ('pending', 'scheduled', 'approved')
     and scheduled_at::date = current_date;

  select count(*) into v_completed
    from public.appointments
   where doctor_id = v_doctor_id
     and status = 'completed'
     and scheduled_at::date = current_date;

  select count(distinct patient_id) into v_patients
    from public.appointments
   where doctor_id = v_doctor_id;

  return json_build_object(
    'todayAppointments', v_today,
    'pendingToday', v_pending,
    'completedToday', v_completed,
    'totalPatients', v_patients
  );
end;
$$;

-- ─── Escrow release (payment consistency across platforms) ───────────────────
-- Completing a consultation atomically releases escrow (90/10 split) and
-- marks the appointment completed — one transaction, no drift.

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
  select * into v_appt from public.appointments where id = p_appointment_id
    for update;

  if v_appt.id is null then
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

-- ─── Audit logging helper (both platforms call this) ────────────────────────

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
  v_patient public.patient_profiles%rowtype default 'Unknown'::public.patient_profiles;
  v_id uuid;
begin
  select * into v_actor from public.profiles where id = p_actor_id;

  if p_patient_id is not null then
    select * into v_patient from public.patient_profiles where id = p_patient_id;
  end if;

  insert into public.audit_logs (
    patient_id, patient_name, actor_id, actor_name, actor_role,
    action, record_id, record_name, record_category, ip_address, device
  ) values (
    p_patient_id,
    case when p_patient_id is not null then coalesce(v_patient.first_name || ' ' || v_patient.last_name, 'Unknown') else 'Unknown' end,
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
