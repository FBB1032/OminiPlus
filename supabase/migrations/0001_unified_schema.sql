-- ═══════════════════════════════════════════════════════════════════════════
-- OMINIPULSE UNIFIED BACKEND — 0001_unified_schema.sql
--
-- Single centralized PostgreSQL schema served by Supabase, shared by:
--   • Patient / Doctor Mobile App (React Native + Expo)
--   • Clinical Desktop & Admin Web App (Next.js / Electron)
--   • All platforms authenticate against the SAME auth.users table,
--     so an account created on mobile logs into the web app seamlessly.
--
-- Run order: 0001 → 0002 (RLS) → 0003 (functions) → seed.sql
-- ═══════════════════════════════════════════════════════════════════════════

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- ─── ENUMS ───────────────────────────────────────────────────────────────────

do $$ begin
  create type public.user_role as enum (
    'patient', 'doctor', 'admin',
    'hospital_admin', 'nurse', 'receptionist',
    'blood_officer', 'pharmacist', 'lab_technician'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.verification_status as enum (
    'pending', 'approved', 'suspended', 'license_expired', 'license_renewal_pending'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.appointment_status as enum (
    'pending', 'scheduled', 'approved', 'completed', 'cancelled', 'no_show'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.appointment_type as enum ('in_person', 'video', 'phone');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum ('pending', 'held', 'released', 'refunded', 'failed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.bed_status as enum ('available', 'occupied', 'cleaning_required', 'maintenance');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.ward_type as enum (
    'icu', 'emergency', 'male_surgical', 'female_medical', 'pediatric_neonatal', 'maternity'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.lab_order_status as enum (
    'ordered', 'sample_pending', 'sample_collected', 'in_testing', 'results_ready', 'verified'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.consent_scope as enum (
    'medical_history', 'lab_report', 'ai_analysis', 'prescription_share'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.consent_status as enum ('granted', 'revoked', 'pending');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.audit_action as enum (
    'view', 'download', 'edit', 'delete', 'share',
    'patient_created', 'doctor_created', 'user_approved', 'user_rejected',
    'user_updated', 'user_deactivated', 'user_deleted'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.actor_role as enum ('doctor', 'admin', 'patient', 'system_ai');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.record_category as enum (
    'lab_report', 'prescription', 'medical_history', 'vitals', 'ai_chat',
    'patient_profile', 'doctor_profile'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.chronic_condition_type as enum ('hypertension', 'diabetes', 'asthma', 'pregnancy');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.blood_request_urgency as enum ('routine', 'urgent', 'emergency');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.blood_request_status as enum (
    'pending_hospital_confirmation', 'hospital_confirmed', 'ominipulse_verified',
    'donors_notified', 'screening_scheduled', 'fulfilled', 'closed'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.partner_status as enum ('active', 'pending', 'inactive', 'suspended', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.hospital_tier as enum ('general', 'specialist', 'tertiary_teaching', 'private_clinic');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.record_visibility as enum ('all', 'patient_only');
exception when duplicate_object then null; end $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- CORE IDENTITY — profiles is the single source of truth for every user
-- across mobile and web. It extends Supabase auth.users (1:1) and drives
-- all cross-platform role-based access control.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  first_name text not null,
  last_name text not null,
  role public.user_role not null default 'patient',
  phone text,
  avatar_url text,
  is_active boolean not null default true,
  is_two_factor_enabled boolean not null default false,
  is_approved boolean not null default false,
  verification_status public.verification_status not null default 'pending',
  last_login timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-sync profiles row whenever a new auth user is created.
-- This guarantees the same user exists on every platform from day one.
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
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'patient')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create index if not exists idx_profiles_role on public.profiles(role);

-- ─── HOSPITALS ────────────────────────────────────────────────────────────────

create table if not exists public.hospitals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_name text,
  license_number text unique not null,
  cac_number text,
  address text not null,
  city text not null,
  state text not null,
  country text not null default 'Nigeria',
  emergency_phone text,
  email text,
  website text,
  admin_email text,
  admin_name text,
  partner_status public.partner_status not null default 'pending',
  status text check (status in ('active', 'pending_verification', 'suspended')) not null default 'active',
  tier public.hospital_tier not null default 'general',
  departments text[] not null default '{}',
  licensed_beds int not null default 18,
  annual_fee_ngn numeric(12, 2),
  is_verified boolean not null default false,
  logo_url text,
  created_at timestamptz not null default now()
);

-- Hospital staff bridge: links any staff profile to a hospital facility.
-- Drives hospital_admin / nurse / pharmacist / etc. workspaces on web.
create table if not exists public.hospital_staff (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  department text not null default 'General',
  staff_role public.user_role not null,
  status text not null default 'active' check (status in ('active', 'suspended')),
  joined_at timestamptz not null default now(),
  unique (profile_id, hospital_id)
);

-- ─── DOCTOR PROFILES ─────────────────────────────────────────────────────────

create table if not exists public.doctor_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  specialization text not null,
  license_number text unique not null,
  bio text,
  experience_years int not null default 0,
  clinic_name text,
  clinic_address text,
  hospital_id uuid references public.hospitals(id) on delete set null,
  consultation_fee numeric(12, 2) not null default 0,
  rating numeric(3, 2) not null default 0,
  review_count int not null default 0,
  is_available boolean not null default false,
  availability_status text default 'offline'
    check (availability_status in ('available', 'busy', 'offline')),
  license_expiry_date date,
  suspension_reason text,
  suspended_at timestamptz,
  is_mdcn_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_doctor_specialization on public.doctor_profiles(specialization);

create table if not exists public.doctor_verification_documents (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctor_profiles(id) on delete cascade,
  doc_type text not null check (doc_type in (
    'mdcn_license', 'national_id', 'specialty_certificate',
    'employment_letter', 'passport_photo'
  )),
  file_url text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  uploaded_at timestamptz not null default now()
);

create table if not exists public.doctor_working_hours (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctor_profiles(id) on delete cascade,
  day text not null check (day in (
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  )),
  start_time time not null,
  end_time time not null,
  is_active boolean not null default true,
  slot_duration int not null default 30,
  unique (doctor_id, day)
);

-- ─── PATIENT PROFILES ────────────────────────────────────────────────────────

create table if not exists public.patient_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  hospital_id uuid references public.hospitals(id) on delete set null,
  date_of_birth date,
  gender text check (gender in ('male', 'female', 'other')),
  blood_group text,
  genotype text,
  height numeric(5, 1),
  weight numeric(5, 1),
  address text,
  emergency_contact_name text,
  emergency_contact_relationship text,
  emergency_contact_phone text,
  created_at timestamptz not null default now()
);

-- ─── APPOINTMENTS ────────────────────────────────────────────────────────────

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctor_profiles(id) on delete cascade,
  patient_id uuid not null references public.patient_profiles(id) on delete cascade,
  scheduled_at timestamptz not null,
  duration int not null default 30,
  status public.appointment_status not null default 'pending',
  type public.appointment_type not null default 'video',
  reason text not null,
  notes text,
  is_doctor_approved boolean not null default false,
  doctor_approved_at timestamptz,
  cancellation_reason text,
  payment_status public.payment_status default 'pending',
  payment_held_at timestamptz,
  refund_amount numeric(12, 2),
  created_at timestamptz not null default now(),
  constraint no_double_booking
    unique (doctor_id, scheduled_at)
);

create index if not exists idx_appointments_doctor on public.appointments(doctor_id, scheduled_at);
create index if not exists idx_appointments_patient on public.appointments(patient_id, scheduled_at);
create index if not exists idx_appointments_status on public.appointments(status);

-- SOAP clinical notes attached to a consultation.
create table if not exists public.soap_notes (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null unique references public.appointments(id) on delete cascade,
  subjective text,
  objective text,
  assessment text,
  plan text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ─── PRESCRIPTIONS ───────────────────────────────────────────────────────────

create table if not exists public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references public.appointments(id) on delete set null,
  doctor_id uuid not null references public.doctor_profiles(id) on delete cascade,
  patient_id uuid not null references public.patient_profiles(id) on delete cascade,
  diagnosis text not null,
  instructions text,
  follow_up_date date,
  issued_at timestamptz not null default now()
);

create table if not exists public.prescription_medications (
  id uuid primary key default gen_random_uuid(),
  prescription_id uuid not null references public.prescriptions(id) on delete cascade,
  name text not null,
  dosage text not null,
  frequency text not null,
  duration text not null,
  instructions text
);

-- ─── MEDICAL RECORDS ─────────────────────────────────────────────────────────

create table if not exists public.medical_records (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patient_profiles(id) on delete cascade,
  type text not null check (type in (
    'lab_result', 'imaging', 'diagnosis', 'surgery', 'vaccination', 'allergy', 'other'
  )),
  title text not null,
  description text,
  date date not null default current_date,
  doctor_id uuid references public.doctor_profiles(id) on delete set null,
  doctor_name text,
  attachment_url text,
  visibility public.record_visibility not null default 'all',
  created_at timestamptz not null default now()
);

create index if not exists idx_medical_records_patient on public.medical_records(patient_id);

-- ─── HOSPITAL WARDS & BEDS ───────────────────────────────────────────────────

create table if not exists public.hospital_beds (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  bed_number text not null,
  ward public.ward_type not null,
  room text,
  status public.bed_status not null default 'available',
  current_patient_id uuid references public.patient_profiles(id) on delete set null,
  current_patient_name text,
  diagnosis text,
  assigned_nurse_id uuid references public.profiles(id) on delete set null,
  admission_date timestamptz,
  last_cleaned_at timestamptz,
  unique (hospital_id, bed_number)
);

create table if not exists public.ward_transfers (
  id uuid primary key default gen_random_uuid(),
  bed_id uuid not null references public.hospital_beds(id) on delete cascade,
  from_ward public.ward_type,
  to_ward public.ward_type,
  patient_name text,
  performed_by uuid references public.profiles(id) on delete set null,
  performed_at timestamptz not null default now()
);

-- ─── HOSPITAL PHARMACY ───────────────────────────────────────────────────────

create table if not exists public.medication_items (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  name text not null,
  category text not null,
  dosage_form text,
  current_stock int not null default 0,
  min_stock_level int not null default 20,
  unit_price_ngn numeric(12, 2) not null default 0,
  batch_number text,
  expiration_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.pharmacy_orders (
  id uuid primary key default gen_random_uuid(),
  prescription_id uuid references public.prescriptions(id) on delete set null,
  patient_id uuid references public.patient_profiles(id) on delete set null,
  patient_name text not null,
  doctor_name text,
  department text,
  status text not null default 'pending' check (status in ('pending', 'dispensed', 'cancelled')),
  dispensed_by uuid references public.profiles(id) on delete set null,
  dispensed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ─── LABORATORY ──────────────────────────────────────────────────────────────

create table if not exists public.lab_orders (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid references public.hospitals(id) on delete set null,
  order_number text unique not null,
  patient_id uuid references public.patient_profiles(id) on delete set null,
  patient_name text not null,
  doctor_id uuid references public.doctor_profiles(id) on delete set null,
  doctor_name text,
  test_name text not null,
  test_category text,
  sample_type text check (sample_type in ('Blood', 'Serum', 'Plasma', 'Urine', 'Stool', 'Swab', 'CSF')),
  urgency text not null default 'routine' check (urgency in ('routine', 'urgent', 'stat_emergency')),
  status public.lab_order_status not null default 'ordered',
  results_summary text,
  normal_range text,
  findings text,
  technician_id uuid references public.profiles(id) on delete set null,
  technician_name text,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_lab_orders_status on public.lab_orders(status);

-- ─── CONSENT MANAGEMENT (NDPA 2023) ───────────────────────────────────────────

create table if not exists public.consent_grants (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patient_profiles(id) on delete cascade,
  scope public.consent_scope not null,
  title text not null,
  description text,
  target_id uuid,
  target_name text not null,
  status public.consent_status not null default 'pending',
  granted_at timestamptz,
  revoked_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_consent_patient on public.consent_grants(patient_id);

-- ─── AUDIT LOGS (NDPA 2023 cross-platform trail) ─────────────────────────────

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.patient_profiles(id) on delete set null,
  patient_name text,
  actor_id uuid references public.profiles(id) on delete set null,
  actor_name text not null,
  actor_role public.actor_role not null,
  actor_title text,
  action public.audit_action not null,
  record_id text,
  record_name text,
  record_category public.record_category,
  ip_address text,
  location text,
  device text,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_patient on public.audit_logs(patient_id, created_at desc);

-- ─── CHRONIC CARE TRACKING ───────────────────────────────────────────────────

create table if not exists public.chronic_conditions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patient_profiles(id) on delete cascade,
  condition public.chronic_condition_type not null,
  is_active boolean not null default true,
  diagnosed_at date,
  created_at timestamptz not null default now(),
  unique (patient_id, condition)
);

create table if not exists public.vitals_readings (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patient_profiles(id) on delete cascade,
  condition public.chronic_condition_type,
  reading_type text not null check (reading_type in (
    'blood_pressure', 'blood_glucose', 'peak_flow', 'pregnancy_log', 'heart_rate', 'spo2', 'weight'
  )),
  systolic int,
  diastolic int,
  pulse int,
  value numeric(8, 2),
  category text,
  notes text,
  recorded_at timestamptz not null default now()
);

create index if not exists idx_vitals_patient on public.vitals_readings(patient_id, recorded_at desc);

-- ─── BLOOD DONOR NETWORK (non-commercial) ────────────────────────────────────

create table if not exists public.blood_donors (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles(id) on delete cascade,
  full_name text not null,
  blood_group text not null check (blood_group in ('O-', 'O+', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-')),
  genotype text,
  city text not null,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  phone text not null,
  availability_status text not null default 'Available Anytime'
    check (availability_status in ('Available Anytime', 'On-Call Emergency', 'Temporarily Unavailable')),
  is_verified boolean not null default false,
  last_donation_date date,
  donations_count int not null default 0,
  lab_report_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_donors_blood_group on public.blood_donors(blood_group, city);

create table if not exists public.blood_requests (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.patient_profiles(id) on delete set null,
  patient_name text not null,
  blood_group text not null,
  units_needed int not null default 1,
  units_collected int not null default 0,
  hospital_id uuid references public.hospitals(id) on delete set null,
  hospital_name text,
  city text,
  urgency public.blood_request_urgency not null default 'urgent',
  status public.blood_request_status not null default 'pending_hospital_confirmation',
  required_by timestamptz,
  requested_by uuid references public.profiles(id) on delete set null,
  hospital_confirmed_at timestamptz,
  ominipulse_verified_at timestamptz,
  created_at timestamptz not null default now()
);

-- ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'general' check (type in (
    'appointment_reminder', 'prescription_ready', 'result_ready', 'general'
  )),
  title text not null,
  body text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_profile on public.notifications(profile_id, is_read);

-- ─── CONSULTATION CHAT ───────────────────────────────────────────────────────

create table if not exists public.consultation_messages (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_chat_appointment on public.consultation_messages(appointment_id, created_at);

-- ─── PASSWORD RESET OTP (unified across mobile + web) ─────────────────────────

create table if not exists public.password_reset_otps (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  otp_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  is_used boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_otp_email on public.password_reset_otps(email, created_at desc);

-- ─── AI FLAG MONITORING ──────────────────────────────────────────────────────

create table if not exists public.ai_flags (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  prompt text not null,
  reason text,
  severity text not null default 'low' check (severity in ('low', 'medium', 'high')),
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now()
);

-- ─── INCIDENT REPORTS ────────────────────────────────────────────────────────

create table if not exists public.incident_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  reporter_name text,
  target_id uuid references public.profiles(id) on delete set null,
  target_name text,
  target_type text not null check (target_type in ('doctor', 'patient', 'pharmacy', 'hospital')),
  consultation_id uuid references public.appointments(id) on delete set null,
  category text not null check (category in (
    'fake_credentials', 'inappropriate_behavior', 'fraud', 'spam',
    'malpractice', 'prescription_error', 'other'
  )),
  description text not null,
  status text not null default 'pending' check (status in (
    'pending', 'under_review', 'resolved', 'dismissed',
    'handover_to_board', 'temp_suspended', 'perm_suspended'
  )),
  severity text not null default 'low' check (severity in ('low', 'medium', 'high', 'critical')),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

-- ─── PAYMENT TRANSACTIONS (escrow ledger) ─────────────────────────────────────

create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  appointment_id uuid references public.appointments(id) on delete set null,
  patient_id uuid references public.patient_profiles(id) on delete set null,
  doctor_id uuid references public.doctor_profiles(id) on delete set null,
  amount numeric(12, 2) not null,
  currency text not null default 'NGN',
  platform_fee numeric(12, 2) not null default 0,
  doctor_payout numeric(12, 2) not null default 0,
  status public.payment_status not null default 'pending',
  method text check (method in ('card', 'bank_transfer', 'ussd', 'wallet')),
  escrow_released boolean not null default false,
  escrow_released_at timestamptz,
  refund_reason text,
  refunded_at timestamptz,
  created_at timestamptz not null default now()
);

-- ─── DOCUMENTS (patient + doctor uploaded files) ───────────────────────────────────────────
--
-- Stores metadata for all documents uploaded by patients and doctors.
-- Each document is associated with a profile (patient or doctor) and has
-- a status that controls super-admin visibility.
--

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null,
  profile_type public.user_role not null check (profile_type in ('patient', 'doctor')),
  doc_type text not null check (doc_type in (
    'gov_id', 'medical_license', 'selfie', 'passport_photo', 'national_id',
    'specialty_certificate', 'employment_letter', 'other'
  )),
  file_name text not null,
  file_path text not null,
  mime_type text not null,
  upload_date timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_documents_profile on public.documents(profile_id, profile_type, status);
create index if not exists idx_documents_upload on public.documents(upload_date desc);

-- ═══════════════════════════════════════════════════════════════════════════
-- updated_at maintenance trigger
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_doctor_updated_at on public.doctor_profiles;
create trigger trg_doctor_updated_at before update on public.doctor_profiles
  for each row execute function public.set_updated_at();
