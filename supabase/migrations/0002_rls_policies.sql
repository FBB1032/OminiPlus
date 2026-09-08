-- ═══════════════════════════════════════════════════════════════════════════
-- OMINIPULSE UNIFIED BACKEND — 0002_rls_policies.sql
--
-- Row-Level Security: the single authorization layer shared by ALL platforms.
-- Because RLS lives in the database (not in app code), mobile and web get
-- identical data-consistency guarantees from one place.
--
-- Security model:
--   • patients   → own data only
--   • doctors    → own appointments / patients-of-record
--   • admins     → platform-wide oversight
--   • hospital_* → scoped to their hospital via hospital_staff
--   • service_role → bypasses RLS for edge functions (server-side only)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Helper functions ─────────────────────────────────────────────────────────

create or replace function public.current_profile_role()
returns public.user_role
language sql stable security definer set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.current_profile_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce(public.current_profile_role() in ('admin'), false);
$$;

create or replace function public.is_doctor()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce(public.current_profile_role() = 'doctor', false);
$$;

create or replace function public.is_patient()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce(public.current_profile_role() = 'patient', false);
$$;

-- Resolve the doctor_profiles row for the current user (may be null).
create or replace function public.my_doctor_profile_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select id from public.doctor_profiles where profile_id = auth.uid();
$$;

-- Resolve the patient_profiles row for the current user (may be null).
create or replace function public.my_patient_profile_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select id from public.patient_profiles where profile_id = auth.uid();
$$;

-- True when the current doctor has a consultation history with the patient.
create or replace function public.doctor_has_patient(doctor_id uuid, patient_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.appointments
    where doctor_id = $1 and patient_id = $2
  );
$$;

-- True when the current user belongs to the given hospital staff.
create or replace function public.is_hospital_staff(hospital_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.hospital_staff
    where profile_id = auth.uid()
      and hospital_id = $1
      and status = 'active'
  );
$$;

-- Resolve the hospital a doctor belongs to (for hospital staff visibility).
create or replace function public.hospital_id_from_doctor(doctor_id uuid)
returns uuid
language sql stable security definer set search_path = public
as $$
  select hospital_id from public.doctor_profiles where id = $1;
$$;

-- ─── Enable RLS everywhere ────────────────────────────────────────────────────

alter table public.profiles                     enable row level security;
alter table public.hospitals                    enable row level security;
alter table public.hospital_staff               enable row level security;
alter table public.doctor_profiles              enable row level security;
alter table public.doctor_verification_documents enable row level security;
alter table public.doctor_working_hours         enable row level security;
alter table public.patient_profiles             enable row level security;
alter table public.appointments                 enable row level security;
alter table public.soap_notes                   enable row level security;
alter table public.prescriptions                enable row level security;
alter table public.prescription_medications     enable row level security;
alter table public.medical_records              enable row level security;
alter table public.hospital_beds                enable row level security;
alter table public.ward_transfers               enable row level security;
alter table public.medication_items             enable row level security;
alter table public.pharmacy_orders              enable row level security;
alter table public.lab_orders                   enable row level security;
alter table public.consent_grants               enable row level security;
alter table public.audit_logs                   enable row level security;
alter table public.chronic_conditions           enable row level security;
alter table public.vitals_readings              enable row level security;
alter table public.blood_donors                 enable row level security;
alter table public.blood_requests              enable row level security;
alter table public.notifications                enable row level security;
alter table public.consultation_messages        enable row level security;
alter table public.password_reset_otps          enable row level security;
alter table public.ai_flags                    enable row level security;
alter table public.incident_reports             enable row level security;
alter table public.payment_transactions         enable row level security;

-- ─── PROFILES ────────────────────────────────────────────────────────────────
-- Any authenticated user can read the directory (needed for chat/booking);
-- writes and sensitive listing are admin-gated.

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated using (true);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated using (id = auth.uid());

drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ─── HOSPITALS ───────────────────────────────────────────────────────────────
-- Public directory read (patients browse hospitals); admin/own-staff manage.

drop policy if exists hospitals_select on public.hospitals;
create policy hospitals_select on public.hospitals
  for select to authenticated using (true);

drop policy if exists hospitals_admin_write on public.hospitals;
create policy hospitals_admin_write on public.hospitals
  for all to authenticated
  using (public.is_admin() or public.is_hospital_staff(id))
  with check (public.is_admin() or public.is_hospital_staff(id));

drop policy if exists hospitals_admin_insert on public.hospitals;
create policy hospitals_admin_insert on public.hospitals
  for insert to authenticated with check (public.is_admin());

-- ─── HOSPITAL STAFF ──────────────────────────────────────────────────────────

drop policy if exists hospital_staff_select on public.hospital_staff;
create policy hospital_staff_select on public.hospital_staff
  for select to authenticated
  using (public.is_admin() or profile_id = auth.uid() or public.is_hospital_staff(hospital_id));

drop policy if exists hospital_staff_admin_write on public.hospital_staff;
create policy hospital_staff_admin_write on public.hospital_staff
  for all to authenticated
  using (public.is_admin() or (public.is_hospital_staff(hospital_id)
        and public.current_profile_role() = 'hospital_admin'))
  with check (public.is_admin() or (public.is_hospital_staff(hospital_id)
        and public.current_profile_role() = 'hospital_admin'));

-- ─── DOCTOR PROFILES ─────────────────────────────────────────────────────────
-- Public read for doctor discovery (verification-gated at app layer);
-- doctors update own row; admins manage all.

drop policy if exists doctors_select on public.doctor_profiles;
create policy doctors_select on public.doctor_profiles
  for select to authenticated using (true);

drop policy if exists doctors_insert_own on public.doctor_profiles;
create policy doctors_insert_own on public.doctor_profiles
  for insert to authenticated
  with check (profile_id = auth.uid() and public.is_doctor());

drop policy if exists doctors_update_own on public.doctor_profiles;
create policy doctors_update_own on public.doctor_profiles
  for update to authenticated
  using (profile_id = auth.uid() or public.is_admin());

-- ─── DOCTOR VERIFICATION DOCUMENTS ────────────────────────────────────────────

drop policy if exists doctor_docs_select on public.doctor_verification_documents;
create policy doctor_docs_select on public.doctor_verification_documents
  for select to authenticated
  using (
    public.is_admin()
    or exists (select 1 from public.doctor_profiles dp
               where dp.id = doctor_id and dp.profile_id = auth.uid())
  );

drop policy if exists doctor_docs_write on public.doctor_verification_documents;
create policy doctor_docs_write on public.doctor_verification_documents
  for all to authenticated
  using (public.is_admin() or exists (select 1 from public.doctor_profiles dp
               where dp.id = doctor_id and dp.profile_id = auth.uid()))
  with check (public.is_admin() or exists (select 1 from public.doctor_profiles dp
               where dp.id = doctor_id and dp.profile_id = auth.uid()));

-- ─── DOCTOR WORKING HOURS ─────────────────────────────────────────────────────

drop policy if exists working_hours_select on public.doctor_working_hours;
create policy working_hours_select on public.doctor_working_hours
  for select to authenticated using (true);

drop policy if exists working_hours_write on public.doctor_working_hours;
create policy working_hours_write on public.doctor_working_hours
  for all to authenticated
  using (public.is_admin() or exists (select 1 from public.doctor_profiles dp
               where dp.id = doctor_id and dp.profile_id = auth.uid()))
  with check (public.is_admin() or exists (select 1 from public.doctor_profiles dp
               where dp.id = doctor_id and dp.profile_id = auth.uid()));

-- ─── PATIENT PROFILES ─────────────────────────────────────────────────────────
-- Patients read/update own; doctors read patients they consult; admins all.

drop policy if exists patients_select on public.patient_profiles;
create policy patients_select on public.patient_profiles
  for select to authenticated
  using (
    profile_id = auth.uid()
    or public.is_admin()
    or (public.is_doctor() and public.doctor_has_patient(public.my_doctor_profile_id(), id))
    or public.is_hospital_staff(hospital_id)
  );

drop policy if exists patients_insert_own on public.patient_profiles;
create policy patients_insert_own on public.patient_profiles
  for insert to authenticated
  with check (profile_id = auth.uid());

drop policy if exists patients_update on public.patient_profiles;
create policy patients_update on public.patient_profiles
  for update to authenticated
  using (profile_id = auth.uid() or public.is_admin());

-- ─── APPOINTMENTS ─────────────────────────────────────────────────────────────

drop policy if exists appointments_select on public.appointments;
create policy appointments_select on public.appointments
  for select to authenticated
  using (
    public.is_admin()
    or patient_id = public.my_patient_profile_id()
    or doctor_id = public.my_doctor_profile_id()
    or public.is_hospital_staff(hospital_id_from_doctor(doctor_id))
  );

drop policy if exists appointments_insert on public.appointments;
create policy appointments_insert on public.appointments
  for insert to authenticated
  with check (patient_id = public.my_patient_profile_id());

drop policy if exists appointments_update on public.appointments;
create policy appointments_update on public.appointments
  for update to authenticated
  using (
    public.is_admin()
    or patient_id = public.my_patient_profile_id()
    or doctor_id = public.my_doctor_profile_id()
  );

-- ─── SOAP NOTES ──────────────────────────────────────────────────────────────

drop policy if exists soap_select on public.soap_notes;
create policy soap_select on public.soap_notes
  for select to authenticated
  using (
    public.is_admin()
    or exists (select 1 from public.appointments a
               where a.id = appointment_id
                 and (a.patient_id = public.my_patient_profile_id()
                   or a.doctor_id = public.my_doctor_profile_id()))
  );

drop policy if exists soap_write on public.soap_notes;
create policy soap_write on public.soap_notes
  for all to authenticated
  using (
    public.is_admin()
    or exists (select 1 from public.appointments a
               where a.id = appointment_id
                 and a.doctor_id = public.my_doctor_profile_id())
  )
  with check (
    public.is_admin()
    or exists (select 1 from public.appointments a
               where a.id = appointment_id
                 and a.doctor_id = public.my_doctor_profile_id())
  );

-- ─── PRESCRIPTIONS ────────────────────────────────────────────────────────────

drop policy if exists prescriptions_select on public.prescriptions;
create policy prescriptions_select on public.prescriptions
  for select to authenticated
  using (
    public.is_admin()
    or patient_id = public.my_patient_profile_id()
    or doctor_id = public.my_doctor_profile_id()
  );

drop policy if exists prescriptions_write on public.prescriptions;
create policy prescriptions_write on public.prescriptions
  for all to authenticated
  using (
    public.is_admin()
    or (public.is_doctor() and doctor_id = public.my_doctor_profile_id())
  )
  with check (
    public.is_admin()
    or (public.is_doctor() and doctor_id = public.my_doctor_profile_id())
  );

-- ─── PRESCRIPTION MEDICATIONS ─────────────────────────────────────────────────

drop policy if exists rx_meds_select on public.prescription_medications;
create policy rx_meds_select on public.prescription_medications
  for select to authenticated
  using (
    public.is_admin()
    or exists (select 1 from public.prescriptions p
               where p.id = prescription_id
                 and (p.patient_id = public.my_patient_profile_id()
                   or p.doctor_id = public.my_doctor_profile_id()))
  );

drop policy if exists rx_meds_write on public.prescription_medications;
create policy rx_meds_write on public.prescription_medications
  for all to authenticated
  using (
    public.is_admin()
    or exists (select 1 from public.prescriptions p
               where p.id = prescription_id
                 and p.doctor_id = public.my_doctor_profile_id())
  )
  with check (
    public.is_admin()
    or exists (select 1 from public.prescriptions p
               where p.id = prescription_id
                 and p.doctor_id = public.my_doctor_profile_id())
  );

-- ─── MEDICAL RECORDS ──────────────────────────────────────────────────────────

drop policy if exists records_select on public.medical_records;
create policy records_select on public.medical_records
  for select to authenticated
  using (
    public.is_admin()
    or patient_id = public.my_patient_profile_id()
    or (public.is_doctor()
        and public.doctor_has_patient(public.my_doctor_profile_id(), patient_id)
        and visibility = 'all')
  );

drop policy if exists records_write on public.medical_records;
create policy records_write on public.medical_records
  for all to authenticated
  using (
    public.is_admin()
    or patient_id = public.my_patient_profile_id()
    or (public.is_doctor() and public.doctor_has_patient(public.my_doctor_profile_id(), patient_id))
  )
  with check (
    public.is_admin()
    or patient_id = public.my_patient_profile_id()
    or (public.is_doctor() and public.doctor_has_patient(public.my_doctor_profile_id(), patient_id))
  );

-- ─── HOSPITAL BEDS / WARD TRANSFERS ───────────────────────────────────────────

drop policy if exists beds_select on public.hospital_beds;
create policy beds_select on public.hospital_beds
  for select to authenticated using (true);

drop policy if exists beds_write on public.hospital_beds;
create policy beds_write on public.hospital_beds
  for all to authenticated
  using (
    public.is_admin()
    or (public.is_hospital_staff(hospital_id)
        and public.current_profile_role() in ('hospital_admin', 'nurse', 'receptionist'))
  )
  with check (
    public.is_admin()
    or (public.is_hospital_staff(hospital_id)
        and public.current_profile_role() in ('hospital_admin', 'nurse', 'receptionist'))
  );

drop policy if exists ward_transfers_select on public.ward_transfers;
create policy ward_transfers_select on public.ward_transfers
  for select to authenticated
  using (public.is_admin() or public.is_hospital_staff(
    (select hospital_id from public.hospital_beds b where b.id = bed_id)
  ));

drop policy if exists ward_transfers_write on public.ward_transfers;
create policy ward_transfers_write on public.ward_transfers
  for all to authenticated
  using (public.is_admin() or (
    public.is_hospital_staff((select hospital_id from public.hospital_beds b where b.id = bed_id))
    and public.current_profile_role() in ('hospital_admin', 'nurse')
  ))
  with check (public.is_admin() or (
    public.is_hospital_staff((select hospital_id from public.hospital_beds b where b.id = bed_id))
    and public.current_profile_role() in ('hospital_admin', 'nurse')
  ));

-- ─── MEDICATION ITEMS & PHARMACY ORDERS ───────────────────────────────────────

drop policy if exists meds_select on public.medication_items;
create policy meds_select on public.medication_items
  for select to authenticated
  using (public.is_admin() or public.is_hospital_staff(hospital_id));

drop policy if exists meds_write on public.medication_items;
create policy meds_write on public.medication_items
  for all to authenticated
  using (public.is_admin() or (public.is_hospital_staff(hospital_id)
        and public.current_profile_role() in ('hospital_admin', 'pharmacist')))
  with check (public.is_admin() or (public.is_hospital_staff(hospital_id)
        and public.current_profile_role() in ('hospital_admin', 'pharmacist')));

-- pharmacy_orders references prescriptions not hospitals; scope via hospital
-- staff of the dispensing hospital resolved through the patient's hospital.
drop policy if exists pharmacy_orders_select on public.pharmacy_orders;
create policy pharmacy_orders_select on public.pharmacy_orders
  for select to authenticated
  using (
    public.is_admin()
    or exists (select 1 from public.patient_profiles pp
               where pp.id = patient_id and pp.profile_id = auth.uid())
    or exists (
      select 1
      from public.hospital_staff hs
      join public.patient_profiles pp on pp.hospital_id = hs.hospital_id
      where hs.profile_id = auth.uid() and pp.id = patient_id
        and public.current_profile_role() in ('hospital_admin', 'pharmacist', 'nurse')
    )
  );

drop policy if exists pharmacy_orders_write on public.pharmacy_orders;
create policy pharmacy_orders_write on public.pharmacy_orders
  for all to authenticated
  using (
    public.is_admin()
    or exists (
      select 1
      from public.hospital_staff hs
      join public.patient_profiles pp on pp.hospital_id = hs.hospital_id
      where hs.profile_id = auth.uid() and pp.id = patient_id
        and public.current_profile_role() in ('hospital_admin', 'pharmacist')
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1
      from public.hospital_staff hs
      join public.patient_profiles pp on pp.hospital_id = hs.hospital_id
      where hs.profile_id = auth.uid() and pp.id = patient_id
        and public.current_profile_role() in ('hospital_admin', 'pharmacist')
    )
  );

-- ─── LAB ORDERS ───────────────────────────────────────────────────────────────

drop policy if exists lab_orders_select on public.lab_orders;
create policy lab_orders_select on public.lab_orders
  for select to authenticated
  using (
    public.is_admin()
    or exists (select 1 from public.patient_profiles pp
               where pp.id = patient_id and pp.profile_id = auth.uid())
    or exists (select 1 from public.doctor_profiles dp
               where dp.id = doctor_id and dp.profile_id = auth.uid())
    or (public.is_hospital_staff(hospital_id)
        and public.current_profile_role() in ('hospital_admin', 'lab_technician'))
  );

drop policy if exists lab_orders_write on public.lab_orders;
create policy lab_orders_write on public.lab_orders
  for all to authenticated
  using (
    public.is_admin()
    or (public.is_hospital_staff(hospital_id)
        and public.current_profile_role() in ('hospital_admin', 'lab_technician'))
    or exists (select 1 from public.doctor_profiles dp
               where dp.id = doctor_id and dp.profile_id = auth.uid())
  )
  with check (
    public.is_admin()
    or (public.is_hospital_staff(hospital_id)
        and public.current_profile_role() in ('hospital_admin', 'lab_technician'))
    or exists (select 1 from public.doctor_profiles dp
               where dp.id = doctor_id and dp.profile_id = auth.uid())
  );

-- ─── CONSENT GRANTS ───────────────────────────────────────────────────────────

drop policy if exists consent_select on public.consent_grants;
create policy consent_select on public.consent_grants
  for select to authenticated
  using (
    public.is_admin()
    or patient_id = public.my_patient_profile_id()
    or (public.is_doctor()
        and public.doctor_has_patient(public.my_doctor_profile_id(), patient_id))
  );

drop policy if exists consent_write on public.consent_grants;
create policy consent_write on public.consent_grants
  for all to authenticated
  using (patient_id = public.my_patient_profile_id() or public.is_admin())
  with check (patient_id = public.my_patient_profile_id() or public.is_admin());

-- ─── AUDIT LOGS ───────────────────────────────────────────────────────────────
-- Immutable: no updates/deletes. Patients see own trail; doctors see entries
-- for their patients; admins see everything.

drop policy if exists audit_select on public.audit_logs;
create policy audit_select on public.audit_logs
  for select to authenticated
  using (
    public.is_admin()
    or patient_id = public.my_patient_profile_id()
    or (public.is_doctor()
        and public.doctor_has_patient(public.my_doctor_profile_id(), patient_id))
  );

drop policy if exists audit_insert on public.audit_logs;
create policy audit_insert on public.audit_logs
  for insert to authenticated with check (auth.uid() = actor_id);

-- ─── CHRONIC CONDITIONS & VITALS ──────────────────────────────────────────────

drop policy if exists chronic_select on public.chronic_conditions;
create policy chronic_select on public.chronic_conditions
  for select to authenticated
  using (
    public.is_admin()
    or patient_id = public.my_patient_profile_id()
    or (public.is_doctor() and public.doctor_has_patient(public.my_doctor_profile_id(), patient_id))
  );

drop policy if exists chronic_write on public.chronic_conditions;
create policy chronic_write on public.chronic_conditions
  for all to authenticated
  using (patient_id = public.my_patient_profile_id() or public.is_admin())
  with check (patient_id = public.my_patient_profile_id() or public.is_admin());

drop policy if exists vitals_select on public.vitals_readings;
create policy vitals_select on public.vitals_readings
  for select to authenticated
  using (
    public.is_admin()
    or patient_id = public.my_patient_profile_id()
    or (public.is_doctor() and public.doctor_has_patient(public.my_doctor_profile_id(), patient_id))
  );

drop policy if exists vitals_write on public.vitals_readings;
create policy vitals_write on public.vitals_readings
  for all to authenticated
  using (patient_id = public.my_patient_profile_id() or public.is_admin())
  with check (patient_id = public.my_patient_profile_id() or public.is_admin());

-- ─── BLOOD DONORS / REQUESTS ──────────────────────────────────────────────────
-- Verified donors are publicly searchable by any authenticated user.

drop policy if exists donors_select on public.blood_donors;
create policy donors_select on public.blood_donors
  for select to authenticated
  using (true);

drop policy if exists donors_own_write on public.blood_donors;
create policy donors_own_write on public.blood_donors
  for all to authenticated
  using (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid() or public.is_admin());

drop policy if exists blood_requests_select on public.blood_requests;
create policy blood_requests_select on public.blood_requests
  for select to authenticated using (true);

drop policy if exists blood_requests_write on public.blood_requests;
create policy blood_requests_write on public.blood_requests
  for all to authenticated
  using (
    public.is_admin()
    or requested_by = auth.uid()
    or (public.is_hospital_staff(hospital_id)
        and public.current_profile_role() in ('hospital_admin', 'blood_officer'))
  )
  with check (
    public.is_admin()
    or requested_by = auth.uid()
    or (public.is_hospital_staff(hospital_id)
        and public.current_profile_role() in ('hospital_admin', 'blood_officer'))
  );

-- ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications
  for select to authenticated using (profile_id = auth.uid());

drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications
  for update to authenticated
  using (profile_id = auth.uid() or public.is_admin());

drop policy if exists notifications_admin_insert on public.notifications;
create policy notifications_admin_insert on public.notifications
  for insert to authenticated
  with check (public.is_admin());

-- ─── CONSULTATION MESSAGES ────────────────────────────────────────────────────

drop policy if exists chat_select on public.consultation_messages;
create policy chat_select on public.consultation_messages
  for select to authenticated
  using (
    exists (select 1 from public.appointments a
            where a.id = appointment_id
              and (a.patient_id = public.my_patient_profile_id()
                or a.doctor_id = public.my_doctor_profile_id()))
  );

drop policy if exists chat_insert on public.consultation_messages;
create policy chat_insert on public.consultation_messages
  for insert to authenticated
  with check (
    sender_id = auth.uid()
    and exists (select 1 from public.appointments a
                where a.id = appointment_id
                  and (a.patient_id = public.my_patient_profile_id()
                    or a.doctor_id = public.my_doctor_profile_id()))
  );

-- ─── PASSWORD RESET OTPs ──────────────────────────────────────────────────────
-- OTP hashes are only ever touched by the service_role (edge functions);
-- anon/authenticated get no direct access. (No select/insert policies on
-- purpose — deny by default.)

-- ─── AI FLAGS ─────────────────────────────────────────────────────────────────

drop policy if exists ai_flags_select on public.ai_flags;
create policy ai_flags_select on public.ai_flags
  for select to authenticated using (public.is_admin());

drop policy if exists ai_flags_write on public.ai_flags;
create policy ai_flags_write on public.ai_flags
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ─── INCIDENT REPORTS ────────────────────────────────────────────────────────

drop policy if exists incidents_select on public.incident_reports;
create policy incidents_select on public.incident_reports
  for select to authenticated
  using (public.is_admin() or reporter_id = auth.uid());

drop policy if exists incidents_insert on public.incident_reports;
create policy incidents_insert on public.incident_reports
  for insert to authenticated
  with check (reporter_id = auth.uid() or public.is_admin());

drop policy if exists incidents_admin_write on public.incident_reports;
create policy incidents_admin_write on public.incident_reports
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ─── PAYMENT TRANSACTIONS ─────────────────────────────────────────────────────

drop policy if exists payments_select on public.payment_transactions;
create policy payments_select on public.payment_transactions
  for select to authenticated
  using (
    public.is_admin()
    or exists (select 1 from public.patient_profiles pp
               where pp.id = patient_id and pp.profile_id = auth.uid())
    or exists (select 1 from public.doctor_profiles dp
               where dp.id = doctor_id and dp.profile_id = auth.uid())
  );

drop policy if exists payments_admin_write on public.payment_transactions;
create policy payments_admin_write on public.payment_transactions
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
