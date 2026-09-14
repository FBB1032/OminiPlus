-- ═══════════════════════════════════════════════════════════════════════════
-- OMINIPULSE — 0007_desktop_demo_seed.sql
--
-- One-time migration of the desktop console's built-in demo rosters into the
-- live Supabase database. After this seed, every console page fetches rows
-- from Supabase exclusively (fallback modes removed from the frontend).
--
-- What is seeded here (mirrors the former desktop mock arrays):
--   • hospitals           — 4 partner facilities (h-100 … h-103 demo rows)
--   • auth.users + auth.identities + profiles — 6 doctor accounts + 8 patient
--                           accounts (log-inable demo identities; passwords
--                           listed below, bcrypt-hashed via pgcrypto)
--   • doctor_profiles     — clinical rows for the 6 doctors
--   • patient_profiles    — clinical rows for the 8 patients
--   • appointments        — consultations linking doctors ↔ patients
--   • payment_transactions— escrow ledger rows for the appointments
--   • ai_flags            — flagged AI prompts for the AI monitoring console
--   • incident_reports    — reported cases for the Reports console
--   • broadcast_messages  — sent/draft/scheduled platform broadcasts
--   • blood_donors        — partner donor registry + verification columns
--
-- Demo passwords: doctors → Doctor2026!   patients → Patient2026!
--
-- Explicitly NOT seeded (audit logs stay on their current handling logic):
--   • audit_logs          — NDPA patient-record trail (append-only, live)
--   • admin_audit_logs    — hash-chained admin trail (trigger-generated)
--
-- Idempotent: deterministic UUIDs + on-conflict-do-update everywhere.
-- Run AFTER 0001–0006 migrations.
-- ═══════════════════════════════════════════════════════════════════════════

begin;

-- ─── 0. Blood donor registry columns (verification workflow support) ─────────
-- The desktop Blood Donor verification console reviews partner donor
-- applications: these columns back that workflow.

alter table public.blood_donors
  add column if not exists region text,
  add column if not exists gender text,
  add column if not exists email text,
  add column if not exists partner_status public.partner_status not null default 'pending',
  add column if not exists verification_submitted_at timestamptz default now(),
  add column if not exists verification_reviewed_at timestamptz,
  add column if not exists verification_reviewed_by text,
  add column if not exists rejection_reason text,
  add column if not exists donor_card_url text,
  add column if not exists medical_check_url text;

create index if not exists idx_donors_partner_status on public.blood_donors(partner_status);

-- ─── 1. Hospitals (the four demo facilities from the Hospitals console) ─────

insert into public.hospitals (
  id, name, license_number, address, city, state, country,
  emergency_phone, email, website, admin_name, admin_email,
  partner_status, status, tier, is_verified, licensed_beds
) values
  ('dd000000-0000-4000-8000-000000000101',
   'XYZ Specialist Hospital', 'HEF/LAG/2026/0101', 'Plot 12 Muhammadu Buhari Way, Kaduna Central',
   'Kaduna', 'Kaduna State', 'Nigeria', '+234 800 999 0000',
   'info@xyzspecialist.ng', 'https://xyzspecialist.ng', 'Dr. Ibrahim Sani', 'i.sani@xyzspecialist.ng',
   'active', 'active', 'specialist', true, 60),
  ('dd000000-0000-4000-8000-000000000102',
   'Lagos General Hospital Marina', 'HEF/LAG/2026/0102', '1-4 Broad Street, Lagos Island',
   'Lagos', 'Lagos State', 'Nigeria', '+234 800 111 2222',
   'marina@lagosgeneral.gov.ng', 'https://lagosgeneral.gov.ng', 'Dr. Babatunde Williams', 'admin@lagosgeneral.gov.ng',
   'pending', 'pending_verification', 'general', false, 120),
  ('dd000000-0000-4000-8000-000000000103',
   'Victoria Island Medical Center', 'HEF/LAG/2026/0103', 'Plot 24, Karimu Kotun Street',
   'Lagos', 'Lagos State', 'Nigeria', '+234 800 333 4444',
   'info@vimc.ng', 'https://vimc.ng', 'Dr. Folashade Adeyemi', 'admin@vimc.ng',
   'active', 'active', 'tertiary_teaching', true, 90),
  ('dd000000-0000-4000-8000-000000000104',
   'Eko Medical Center Ikeja', 'HEF/LAG/2026/0104', '31 Mobolaji Bank Anthony Way',
   'Lagos', 'Lagos State', 'Nigeria', '+234 800 555 6666',
   'contact@ekomc.ng', 'https://ekomc.ng', 'Dr. Chukwuma Obi', 'admin@ekomc.ng',
   'rejected', 'suspended', 'general', false, 75)
on conflict (id) do update
  set name           = excluded.name,
      license_number = excluded.license_number,
      address        = excluded.address,
      city           = excluded.city,
      state          = excluded.state,
      emergency_phone= excluded.emergency_phone,
      email          = excluded.email,
      website        = excluded.website,
      admin_name     = excluded.admin_name,
      admin_email    = excluded.admin_email,
      partner_status = excluded.partner_status,
      status         = excluded.status,
      is_verified    = excluded.is_verified;

-- ─── 2. Demo doctor + patient profiles ───────────────────────────────────────
-- profiles.id has an FK to auth.users(id), so matching auth rows are created
-- first (deterministic UUIDs + bcrypt passwords, same pattern as seed.sql).
-- These accounts CAN log in with the listed passwords — they are the demo
-- identities migrated from the desktop console rosters.

create extension if not exists pgcrypto;
set search_path = public, extensions;

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, email_change, email_change_confirm_status,
  confirmation_token, recovery_token,
  email_change_token_current, email_change_token_new,
  phone_change, phone_change_token, reauthentication_token,
  is_sso_user, is_anonymous,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data
) values
  -- Doctors (doc-101 … doc-106)
  ('00000000-0000-0000-0000-000000000000', 'dd000000-0000-4000-8000-000000000201', 'authenticated', 'authenticated', 'amina.bello@ominipulse.ai',    crypt('Doctor2026!',   gen_salt('bf')), now(), '', 0, '', '', '', '', '', '', '', false, false, now(), now(), '{"provider":"email","providers":["email"]}', '{"first_name":"Amina","last_name":"Bello","role":"doctor"}'),
  ('00000000-0000-0000-0000-000000000000', 'dd000000-0000-4000-8000-000000000202', 'authenticated', 'authenticated', 'felix.okafor@ominipulse.ai',   crypt('Doctor2026!',   gen_salt('bf')), now(), '', 0, '', '', '', '', '', '', '', false, false, now(), now(), '{"provider":"email","providers":["email"]}', '{"first_name":"Felix","last_name":"Okafor","role":"doctor"}'),
  ('00000000-0000-0000-0000-000000000000', 'dd000000-0000-4000-8000-000000000203', 'authenticated', 'authenticated', 'blessing.okoro@ominipulse.ai', crypt('Doctor2026!',   gen_salt('bf')), now(), '', 0, '', '', '', '', '', '', '', false, false, now(), now(), '{"provider":"email","providers":["email"]}', '{"first_name":"Blessing","last_name":"Okoro","role":"doctor"}'),
  ('00000000-0000-0000-0000-000000000000', 'dd000000-0000-4000-8000-000000000204', 'authenticated', 'authenticated', 'david.okoye@ominipulse.ai',     crypt('Doctor2026!',   gen_salt('bf')), now(), '', 0, '', '', '', '', '', '', '', false, false, now(), now(), '{"provider":"email","providers":["email"]}', '{"first_name":"David","last_name":"Okoye","role":"doctor"}'),
  ('00000000-0000-0000-0000-000000000000', 'dd000000-0000-4000-8000-000000000205', 'authenticated', 'authenticated', 'seun.adeyemi@ominipulse.ai',    crypt('Doctor2026!',   gen_salt('bf')), now(), '', 0, '', '', '', '', '', '', '', false, false, now(), now(), '{"provider":"email","providers":["email"]}', '{"first_name":"Oluwaseun","last_name":"Adeyemi","role":"doctor"}'),
  ('00000000-0000-0000-0000-000000000000', 'dd000000-0000-4000-8000-000000000206', 'authenticated', 'authenticated', 'maria.ezenwa@ominipulse.ai',    crypt('Doctor2026!',   gen_salt('bf')), now(), '', 0, '', '', '', '', '', '', '', false, false, now(), now(), '{"provider":"email","providers":["email"]}', '{"first_name":"Maria","last_name":"Ezenwa","role":"doctor"}'),
  -- Patients (pat-4901 … pat-4908)
  ('00000000-0000-0000-0000-000000000000', 'dd000000-0000-4000-8000-000000000301', 'authenticated', 'authenticated', 'aisha.okonkwo@gmail.com',     crypt('Patient2026!',  gen_salt('bf')), now(), '', 0, '', '', '', '', '', '', '', false, false, now(), now(), '{"provider":"email","providers":["email"]}', '{"first_name":"Aisha","last_name":"Okonkwo","role":"patient"}'),
  ('00000000-0000-0000-0000-000000000000', 'dd000000-0000-4000-8000-000000000302', 'authenticated', 'authenticated', 'babatunde.balogun@yahoo.com',  crypt('Patient2026!',  gen_salt('bf')), now(), '', 0, '', '', '', '', '', '', '', false, false, now(), now(), '{"provider":"email","providers":["email"]}', '{"first_name":"Babatunde","last_name":"Balogun","role":"patient"}'),
  ('00000000-0000-0000-0000-000000000000', 'dd000000-0000-4000-8000-000000000303', 'authenticated', 'authenticated', 'chioma.n@outlook.com',        crypt('Patient2026!',  gen_salt('bf')), now(), '', 0, '', '', '', '', '', '', '', false, false, now(), now(), '{"provider":"email","providers":["email"]}', '{"first_name":"Chioma","last_name":"Nwachukwu","role":"patient"}'),
  ('00000000-0000-0000-0000-000000000000', 'dd000000-0000-4000-8000-000000000304', 'authenticated', 'authenticated', 'david.adebayo@gmail.com',      crypt('Patient2026!',  gen_salt('bf')), now(), '', 0, '', '', '', '', '', '', '', false, false, now(), now(), '{"provider":"email","providers":["email"]}', '{"first_name":"David","last_name":"Adebayo","role":"patient"}'),
  ('00000000-0000-0000-0000-000000000000', 'dd000000-0000-4000-8000-000000000305', 'authenticated', 'authenticated', 'efe.eze@icloud.com',           crypt('Patient2026!',  gen_salt('bf')), now(), '', 0, '', '', '', '', '', '', '', false, false, now(), now(), '{"provider":"email","providers":["email"]}', '{"first_name":"Efe","last_name":"Eze","role":"patient"}'),
  ('00000000-0000-0000-0000-000000000000', 'dd000000-0000-4000-8000-000000000306', 'authenticated', 'authenticated', 'funmi.okeke@gmail.com',       crypt('Patient2026!',  gen_salt('bf')), now(), '', 0, '', '', '', '', '', '', '', false, false, now(), now(), '{"provider":"email","providers":["email"]}', '{"first_name":"Funmi","last_name":"Okeke","role":"patient"}'),
  ('00000000-0000-0000-0000-000000000000', 'dd000000-0000-4000-8000-000000000307', 'authenticated', 'authenticated', 'grace.ojo@yahoo.com',          crypt('Patient2026!',  gen_salt('bf')), now(), '', 0, '', '', '', '', '', '', '', false, false, now(), now(), '{"provider":"email","providers":["email"]}', '{"first_name":"Grace","last_name":"Ojo","role":"patient"}'),
  ('00000000-0000-0000-0000-000000000000', 'dd000000-0000-4000-8000-000000000308', 'authenticated', 'authenticated', 'henry.bello@hotmail.com',      crypt('Patient2026!',  gen_salt('bf')), now(), '', 0, '', '', '', '', '', '', '', false, false, now(), now(), '{"provider":"email","providers":["email"]}', '{"first_name":"Henry","last_name":"Bello","role":"patient"}')
on conflict (id) do update
  set email                      = excluded.email,
      encrypted_password         = excluded.encrypted_password,
      email_confirmed_at         = excluded.email_confirmed_at,
      confirmation_token         = '',
      recovery_token             = '',
      email_change_token_current = '',
      email_change_token_new     = '',
      phone_change               = '',
      phone_change_token         = '',
      reauthentication_token     = '',
      email_change              = '',
      email_change_confirm_status = 0,
      raw_app_meta_data          = excluded.raw_app_meta_data,
      raw_user_meta_data         = excluded.raw_user_meta_data,
      updated_at                 = now();

-- Identity rows (required — without them password login fails with
-- "Identity not found"). provider_id = the user's id for email identities.
insert into auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) values
  ('dd000000-0000-4000-8000-000000000201', 'dd000000-0000-4000-8000-000000000201', 'dd000000-0000-4000-8000-000000000201', '{"sub":"dd000000-0000-4000-8000-000000000201","email":"amina.bello@ominipulse.ai","email_verified":true}',    'email', now(), now(), now()),
  ('dd000000-0000-4000-8000-000000000202', 'dd000000-0000-4000-8000-000000000202', 'dd000000-0000-4000-8000-000000000202', '{"sub":"dd000000-0000-4000-8000-000000000202","email":"felix.okafor@ominipulse.ai","email_verified":true}',   'email', now(), now(), now()),
  ('dd000000-0000-4000-8000-000000000203', 'dd000000-0000-4000-8000-000000000203', 'dd000000-0000-4000-8000-000000000203', '{"sub":"dd000000-0000-4000-8000-000000000203","email":"blessing.okoro@ominipulse.ai","email_verified":true}', 'email', now(), now(), now()),
  ('dd000000-0000-4000-8000-000000000204', 'dd000000-0000-4000-8000-000000000204', 'dd000000-0000-4000-8000-000000000204', '{"sub":"dd000000-0000-4000-8000-000000000204","email":"david.okoye@ominipulse.ai","email_verified":true}',     'email', now(), now(), now()),
  ('dd000000-0000-4000-8000-000000000205', 'dd000000-0000-4000-8000-000000000205', 'dd000000-0000-4000-8000-000000000205', '{"sub":"dd000000-0000-4000-8000-000000000205","email":"seun.adeyemi@ominipulse.ai","email_verified":true}',    'email', now(), now(), now()),
  ('dd000000-0000-4000-8000-000000000206', 'dd000000-0000-4000-8000-000000000206', 'dd000000-0000-4000-8000-000000000206', '{"sub":"dd000000-0000-4000-8000-000000000206","email":"maria.ezenwa@ominipulse.ai","email_verified":true}',    'email', now(), now(), now()),
  ('dd000000-0000-4000-8000-000000000301', 'dd000000-0000-4000-8000-000000000301', 'dd000000-0000-4000-8000-000000000301', '{"sub":"dd000000-0000-4000-8000-000000000301","email":"aisha.okonkwo@gmail.com","email_verified":true}',     'email', now(), now(), now()),
  ('dd000000-0000-4000-8000-000000000302', 'dd000000-0000-4000-8000-000000000302', 'dd000000-0000-4000-8000-000000000302', '{"sub":"dd000000-0000-4000-8000-000000000302","email":"babatunde.balogun@yahoo.com","email_verified":true}',  'email', now(), now(), now()),
  ('dd000000-0000-4000-8000-000000000303', 'dd000000-0000-4000-8000-000000000303', 'dd000000-0000-4000-8000-000000000303', '{"sub":"dd000000-0000-4000-8000-000000000303","email":"chioma.n@outlook.com","email_verified":true}',        'email', now(), now(), now()),
  ('dd000000-0000-4000-8000-000000000304', 'dd000000-0000-4000-8000-000000000304', 'dd000000-0000-4000-8000-000000000304', '{"sub":"dd000000-0000-4000-8000-000000000304","email":"david.adebayo@gmail.com","email_verified":true}',      'email', now(), now(), now()),
  ('dd000000-0000-4000-8000-000000000305', 'dd000000-0000-4000-8000-000000000305', 'dd000000-0000-4000-8000-000000000305', '{"sub":"dd000000-0000-4000-8000-000000000305","email":"efe.eze@icloud.com","email_verified":true}',           'email', now(), now(), now()),
  ('dd000000-0000-4000-8000-000000000306', 'dd000000-0000-4000-8000-000000000306', 'dd000000-0000-4000-8000-000000000306', '{"sub":"dd000000-0000-4000-8000-000000000306","email":"funmi.okeke@gmail.com","email_verified":true}',       'email', now(), now(), now()),
  ('dd000000-0000-4000-8000-000000000307', 'dd000000-0000-4000-8000-000000000307', 'dd000000-0000-4000-8000-000000000307', '{"sub":"dd000000-0000-4000-8000-000000000307","email":"grace.ojo@yahoo.com","email_verified":true}',          'email', now(), now(), now()),
  ('dd000000-0000-4000-8000-000000000308', 'dd000000-0000-4000-8000-000000000308', 'dd000000-0000-4000-8000-000000000308', '{"sub":"dd000000-0000-4000-8000-000000000308","email":"henry.bello@hotmail.com","email_verified":true}',      'email', now(), now(), now())
on conflict (id) do update
  set identity_data = excluded.identity_data,
      provider_id  = excluded.provider_id,
      updated_at   = now();

insert into public.profiles (id, email, first_name, last_name, role, phone, verification_status, is_approved, is_active) values
  -- Doctors (doc-101 … doc-106 from the Doctors console)
  ('dd000000-0000-4000-8000-000000000201', 'amina.bello@ominipulse.ai',     'Amina',    'Bello',   'doctor', '+234 803 123 4567', 'pending',   false, true),
  ('dd000000-0000-4000-8000-000000000202', 'felix.okafor@ominipulse.ai',    'Felix',    'Okafor',  'doctor', '+234 805 987 6543', 'approved',  true,  true),
  ('dd000000-0000-4000-8000-000000000203', 'blessing.okoro@ominipulse.ai',  'Blessing','Okoro',   'doctor', '+234 812 345 6789', 'rejected',  false, true),
  ('dd000000-0000-4000-8000-000000000204', 'david.okoye@ominipulse.ai',      'David',    'Okoye',   'doctor', '+234 901 234 5678', 'approved',  true,  true),
  ('dd000000-0000-4000-8000-000000000205', 'seun.adeyemi@ominipulse.ai',     'Oluwaseun','Adeyemi', 'doctor', '+234 802 888 9999', 'suspended', false, false),
  ('dd000000-0000-4000-8000-000000000206', 'maria.ezenwa@ominipulse.ai',     'Maria',    'Ezenwa',  'doctor', '+234 810 555 4444', 'pending',   false, true),
  -- Patients (pat-4901 … pat-4908 from the Patients console)
  ('dd000000-0000-4000-8000-000000000301', 'aisha.okonkwo@gmail.com',       'Aisha',     'Okonkwo',    'patient', '+234 803 111 2233', 'approved', true, true),
  ('dd000000-0000-4000-8000-000000000302', 'babatunde.balogun@yahoo.com',   'Babatunde', 'Balogun',    'patient', '+234 805 222 3344', 'approved', true, true),
  ('dd000000-0000-4000-8000-000000000303', 'chioma.n@outlook.com',          'Chioma',    'Nwachukwu',  'patient', '+234 812 333 4455', 'approved', true, true),
  ('dd000000-0000-4000-8000-000000000304', 'david.adebayo@gmail.com',       'David',     'Adebayo',    'patient', '+234 901 444 5566', 'approved', true, true),
  ('dd000000-0000-4000-8000-000000000305', 'efe.eze@icloud.com',            'Efe',       'Eze',        'patient', '+234 802 555 6677', 'approved', true, false),
  ('dd000000-0000-4000-8000-000000000306', 'funmi.okeke@gmail.com',         'Funmi',     'Okeke',      'patient', '+234 810 666 7788', 'approved', true, true),
  ('dd000000-0000-4000-8000-000000000307', 'grace.ojo@yahoo.com',           'Grace',     'Ojo',        'patient', '+234 814 777 8899', 'approved', true, true),
  ('dd000000-0000-4000-8000-000000000308', 'henry.bello@hotmail.com',        'Henry',     'Bello',      'patient', '+234 809 888 9900', 'approved', true, true)
on conflict (id) do update
  set email  = excluded.email,
      first_name = excluded.first_name,
      last_name = excluded.last_name,
      role   = excluded.role,
      phone  = excluded.phone,
      verification_status = excluded.verification_status,
      is_approved = excluded.is_approved,
      is_active   = excluded.is_active;

-- ─── 3. Clinical rows for the demo doctors ───────────────────────────────────

insert into public.doctor_profiles (
  id, profile_id, specialization, license_number, experience_years,
  clinic_name, hospital_id, consultation_fee, rating, review_count,
  is_mdcn_verified, is_available, availability_status, suspension_reason
) values
  ('dd000000-0000-4000-8000-000000000401', 'dd000000-0000-4000-8000-000000000201', 'Cardiology',   'LIC-98347102',  8,  'Lagos General Hospital Marina',      'dd000000-0000-4000-8000-000000000102', 18000, 4.80, 96,  false, false, 'offline', null),
  ('dd000000-0000-4000-8000-000000000402', 'dd000000-0000-4000-8000-000000000202', 'Pediatrics',   'LIC-10492837', 12,  'Victoria Island Medical Center',    'dd000000-0000-4000-8000-000000000103', 20000, 4.90, 152, true,  true,  'available', null),
  ('dd000000-0000-4000-8000-000000000403', 'dd000000-0000-4000-8000-000000000203', 'Neurology',    'LIC-49381029',  5,  'Eko Medical Center Ikeja',          'dd000000-0000-4000-8000-000000000104', 17000, 4.00, 41,  false, false, 'offline', 'The submitted Medical License certificate is expired (validity ended Dec 2025). Please re-submit a current document.'),
  ('dd000000-0000-4000-8000-000000000404', 'dd000000-0000-4000-8000-000000000204', 'Dermatology',  'LIC-38491024',  6,  'Lagos General Hospital Marina',      'dd000000-0000-4000-8000-000000000102', 15000, 4.60, 78,  true,  true,  'available', null),
  ('dd000000-0000-4000-8000-000000000405', 'dd000000-0000-4000-8000-000000000205', 'Orthopedics',  'LIC-77491028', 15,  'Victoria Island Medical Center',    'dd000000-0000-4000-8000-000000000103', 22000, 4.70, 134, false, false, 'offline', 'Suspended due to reported operational malpractice, pending internal medical board investigation.'),
  ('dd000000-0000-4000-8000-000000000406', 'dd000000-0000-4000-8000-000000000206', 'Psychiatry',   'LIC-55102938',  9,  'Eko Medical Center Ikeja',          'dd000000-0000-4000-8000-000000000104', 19000, 4.20, 63,  false, false, 'offline', null)
on conflict (id) do update
  set specialization = excluded.specialization,
      license_number = excluded.license_number,
      experience_years = excluded.experience_years,
      clinic_name = excluded.clinic_name,
      hospital_id = excluded.hospital_id,
      consultation_fee = excluded.consultation_fee,
      rating = excluded.rating,
      review_count = excluded.review_count,
      is_mdcn_verified = excluded.is_mdcn_verified,
      suspension_reason = excluded.suspension_reason;

-- ─── 4. Clinical rows for the demo patients ──────────────────────────────────

insert into public.patient_profiles (
  id, profile_id, date_of_birth, gender, blood_group, genotype
) values
  ('dd000000-0000-4000-8000-000000000501', 'dd000000-0000-4000-8000-000000000301', '1994-05-12', 'female', 'O+',  'AA'),
  ('dd000000-0000-4000-8000-000000000502', 'dd000000-0000-4000-8000-000000000302', '1988-11-20', 'male',   'A+',  'AS'),
  ('dd000000-0000-4000-8000-000000000503', 'dd000000-0000-4000-8000-000000000303', '1999-03-08', 'female', 'B+',  'AA'),
  ('dd000000-0000-4000-8000-000000000504', 'dd000000-0000-4000-8000-000000000304', '1976-08-15', 'male',   'O-',  'AA'),
  ('dd000000-0000-4000-8000-000000000505', 'dd000000-0000-4000-8000-000000000305', '2001-12-04', 'male',   'AB+', 'AS'),
  ('dd000000-0000-4000-8000-000000000506', 'dd000000-0000-4000-8000-000000000306', '1992-07-25', 'female', 'O+',  'AA'),
  ('dd000000-0000-4000-8000-000000000507', 'dd000000-0000-4000-8000-000000000307', '1985-02-18', 'female', 'A-',  'AA'),
  ('dd000000-0000-4000-8000-000000000508', 'dd000000-0000-4000-8000-000000000308', '1990-09-30', 'male',   'O+',  'SS')
on conflict (id) do update
  set date_of_birth = excluded.date_of_birth,
      gender        = excluded.gender,
      blood_group   = excluded.blood_group,
      genotype      = excluded.genotype;

-- ─── 5. Appointments linking the demo doctors and patients ───────────────────
-- Statuses spread across scheduled/completed/cancelled so the console filters work.

insert into public.appointments (
  id, doctor_id, patient_id, scheduled_at, duration, status, type, reason, is_doctor_approved, payment_status, created_at
) values
  ('dd000000-0000-4000-8000-000000000601', 'dd000000-0000-4000-8000-000000000402', 'dd000000-0000-4000-8000-000000000501', now() + interval '1 day 2 hours',  30, 'scheduled', 'video',     'Pediatric follow-up on recurrent migraine episodes', true,  'held',     now() - interval '2 days'),
  ('dd000000-0000-4000-8000-000000000602', 'dd000000-0000-4000-8000-000000000404', 'dd000000-0000-4000-8000-000000000502', now() + interval '2 days 4 hours', 30, 'scheduled', 'in_person', 'Dermatology review of eczema treatment response',   true,  'held',     now() - interval '3 days'),
  ('dd000000-0000-4000-8000-000000000603', 'dd000000-0000-4000-8000-000000000402', 'dd000000-0000-4000-8000-000000000503', now() - interval '7 days',           30, 'completed', 'video',     'Post-viral fatigue review and lab interpretation',    true,  'released', now() - interval '10 days'),
  ('dd000000-0000-4000-8000-000000000604', 'dd000000-0000-4000-8000-000000000404', 'dd000000-0000-4000-8000-000000000504', now() - interval '14 days',          45, 'completed', 'in_person', 'Chronic rash management consultation',               true,  'released', now() - interval '17 days'),
  ('dd000000-0000-4000-8000-000000000605', 'dd000000-0000-4000-8000-000000000402', 'dd000000-0000-4000-8000-000000000505', now() - interval '5 days',           30, 'cancelled', 'video',     'General pediatric consultation',                     false, 'refunded', now() - interval '6 days'),
  ('dd000000-0000-4000-8000-000000000606', 'dd000000-0000-4000-8000-000000000406', 'dd000000-0000-4000-8000-000000000506', now() + interval '3 days 1 hour',  30, 'scheduled', 'video',     'Anxiety management therapy session',                  true,  'held',     now() - interval '1 day'),
  ('dd000000-0000-4000-8000-000000000607', 'dd000000-0000-4000-8000-000000000406', 'dd000000-0000-4000-8000-000000000507', now() - interval '21 days',          30, 'completed', 'video',     'Sleep disorder initial assessment',                   true,  'released', now() - interval '24 days'),
  ('dd000000-0000-4000-8000-000000000608', 'dd000000-0000-4000-8000-000000000402', 'dd000000-0000-4000-8000-000000000508', now() - interval '2 days',           30, 'completed', 'in_person', 'Sickle-cell pain crisis follow-up',                  true,  'released', now() - interval '5 days')
on conflict (id) do update
  set scheduled_at = excluded.scheduled_at,
      status       = excluded.status,
      type         = excluded.type,
      reason       = excluded.reason,
      payment_status = excluded.payment_status;

-- ─── 6. Escrow ledger for the demo appointments ──────────────────────────────

insert into public.payment_transactions (
  id, reference, appointment_id, patient_id, doctor_id,
  amount, currency, platform_fee, doctor_payout,
  status, method, escrow_released, escrow_released_at, created_at
) values
  ('dd000000-0000-4000-8000-000000000701', 'PAY-2026-88102', 'dd000000-0000-4000-8000-000000000601', 'dd000000-0000-4000-8000-000000000501', 'dd000000-0000-4000-8000-000000000402', 20000.00, 'NGN', 3000.00, 17000.00, 'held',     'card',          false, null,                    now() - interval '2 days'),
  ('dd000000-0000-4000-8000-000000000702', 'PAY-2026-88103', 'dd000000-0000-4000-8000-000000000602', 'dd000000-0000-4000-8000-000000000502', 'dd000000-0000-4000-8000-000000000404', 15000.00, 'NGN', 2250.00, 12750.00, 'held',     'card',          false, null,                    now() - interval '3 days'),
  ('dd000000-0000-4000-8000-000000000703', 'PAY-2026-88104', 'dd000000-0000-4000-8000-000000000603', 'dd000000-0000-4000-8000-000000000503', 'dd000000-0000-4000-8000-000000000402', 20000.00, 'NGN', 3000.00, 17000.00, 'released', 'card',          true,  now() - interval '7 days',  now() - interval '10 days'),
  ('dd000000-0000-4000-8000-000000000704', 'PAY-2026-88105', 'dd000000-0000-4000-8000-000000000604', 'dd000000-0000-4000-8000-000000000504', 'dd000000-0000-4000-8000-000000000404', 15000.00, 'NGN', 2250.00, 12750.00, 'released', 'bank_transfer', true,  now() - interval '14 days', now() - interval '17 days'),
  ('dd000000-0000-4000-8000-000000000705', 'PAY-2026-88106', 'dd000000-0000-4000-8000-000000000605', 'dd000000-0000-4000-8000-000000000505', 'dd000000-0000-4000-8000-000000000402', 20000.00, 'NGN', 3000.00, 17000.00, 'refunded', 'card',          false, null,                    now() - interval '6 days'),
  ('dd000000-0000-4000-8000-000000000706', 'PAY-2026-88107', 'dd000000-0000-4000-8000-000000000606', 'dd000000-0000-4000-8000-000000000506', 'dd000000-0000-4000-8000-000000000406', 19000.00, 'NGN', 2850.00, 16150.00, 'held',     'card',          false, null,                    now() - interval '1 day'),
  ('dd000000-0000-4000-8000-000000000707', 'PAY-2026-88108', 'dd000000-0000-4000-8000-000000000607', 'dd000000-0000-4000-8000-000000000507', 'dd000000-0000-4000-8000-000000000406', 19000.00, 'NGN', 2850.00, 16150.00, 'released', 'card',          true,  now() - interval '21 days', now() - interval '24 days'),
  ('dd000000-0000-4000-8000-000000000708', 'PAY-2026-88109', 'dd000000-0000-4000-8000-000000000608', 'dd000000-0000-4000-8000-000000000508', 'dd000000-0000-4000-8000-000000000402', 20000.00, 'NGN', 3000.00, 17000.00, 'released', 'card',          true,  now() - interval '2 days',  now() - interval '5 days')
on conflict (id) do update
  set reference   = excluded.reference,
      appointment_id = excluded.appointment_id,
      patient_id   = excluded.patient_id,
      doctor_id    = excluded.doctor_id,
      amount       = excluded.amount,
      platform_fee = excluded.platform_fee,
      doctor_payout = excluded.doctor_payout,
      status       = excluded.status,
      method       = excluded.method,
      escrow_released = excluded.escrow_released;

-- ─── 7. AI flags (AI Monitoring console demo rows) ───────────────────────────

delete from public.ai_flags where id in (
  'dd000000-0000-4000-8000-000000000801',
  'dd000000-0000-4000-8000-000000000802',
  'dd000000-0000-4000-8000-000000000803',
  'dd000000-0000-4000-8000-000000000804'
);

insert into public.ai_flags (id, profile_id, prompt, reason, severity, status) values
  ('dd000000-0000-4000-8000-000000000801', null, 'How can I take more than the prescribed dose of pain relievers without getting caught?', 'Potentially harmful medication overdose & self-harm risk pattern', 'high',   'pending'),
  ('dd000000-0000-4000-8000-000000000802', null, 'Can you generate me an electronic prescription for 30mg Codeine tablets?',              'Unauthorized controlled substance prescription request (Class A Controlled Drug)', 'high', 'pending'),
  ('dd000000-0000-4000-8000-000000000803', null, 'I have severe crushing pain in the middle of my chest and sweating for 2 hours, should I just drink hot tea?', 'Acute cardiovascular emergency misinterpretation (Suspected Acute Myocardial Infarction)', 'high', 'reviewed'),
  ('dd000000-0000-4000-8000-000000000804', null, 'What is the correct dosage of IV potassium for severe hypokalemia?',                    'Clinical dosing guidance request — requires CDS safety review', 'medium', 'pending')
on conflict (id) do nothing;

-- ─── 8. Incident reports (Reports console demo rows) ─────────────────────────

delete from public.incident_reports where id in (
  'dd000000-0000-4000-8000-000000000901',
  'dd000000-0000-4000-8000-000000000902',
  'dd000000-0000-4000-8000-000000000903',
  'dd000000-0000-4000-8000-000000000904'
);

insert into public.incident_reports (
  id, reporter_id, reporter_name, target_id, target_name, target_type,
  category, description, status, severity
) values
  ('dd000000-0000-4000-8000-000000000901', 'dd000000-0000-4000-8000-000000000301', 'Aisha Okonkwo',
   'dd000000-0000-4000-8000-000000000202', 'Dr. Felix Okafor', 'doctor',
   'malpractice', 'Patient reported severe prescription overdose and unverified dosage instructions during tele-consultation. Consultation chat log transcript attached shows contradictory advice.',
   'pending', 'critical'),
  ('dd000000-0000-4000-8000-000000000902', 'dd000000-0000-4000-8000-000000000302', 'Babatunde Balogun',
   'dd000000-0000-4000-8000-000000000204', 'Dr. David Okoye', 'doctor',
   'inappropriate_behavior', 'Use of unprofessional and dismissive language during video consultation. Audio evidence transcript recorded by patient during session.',
   'under_review', 'high'),
  ('dd000000-0000-4000-8000-000000000903', 'dd000000-0000-4000-8000-000000000303', 'Chioma Nwachukwu',
   'dd000000-0000-4000-8000-000000000306', 'Funmi Okeke', 'patient',
   'fraud', 'Suspected identity misrepresentation during booking. Photo evidence of mismatched registration details attached by the reporting patient.',
   'pending', 'high'),
  ('dd000000-0000-4000-8000-000000000904', 'dd000000-0000-4000-8000-000000000304', 'David Adebayo',
   'dd000000-0000-4000-8000-000000000203', 'Dr. Blessing Okoro', 'doctor',
   'fake_credentials', 'Suspicious medical license credentials. System audit flagged invalid MDCN registration state.',
   'handover_to_board', 'critical')
on conflict (id) do nothing;

-- ─── 9. Broadcast messages (Broadcast Center demo rows) ─────────────────────

insert into public.broadcast_messages (
  id, title, body, type, target_audience, status, recipient_count, sent_at, scheduled_at
) values
  ('dd000000-0000-4000-8000-000000000a01', 'App Maintenance Window',
   'We will be performing scheduled maintenance on June 10th from 2AM–4AM WAT. Services may be briefly unavailable.',
   'system', 'all', 'sent', 14, now() - interval '9 days', null),
  ('dd000000-0000-4000-8000-000000000a02', 'New Feature: Video Consultations',
   'We''ve launched HD video consultations! Book your next appointment as a video call.',
   'announcement', 'patients', 'sent', 8, now() - interval '10 days', null),
  ('dd000000-0000-4000-8000-000000000a03', 'Doctor Verification Reminder',
   'Please complete your profile verification to start accepting consultations.',
   'reminder', 'doctors', 'sent', 6, now() - interval '11 days', null),
  ('dd000000-0000-4000-8000-000000000a04', 'Holiday Hours Notice',
   'Support hours will be limited on June 12th for the public holiday.',
   'announcement', 'all', 'draft', 0, null, null),
  ('dd000000-0000-4000-8000-000000000a05', 'Scheduled Maintenance',
   'Routine server maintenance scheduled for June 15th midnight.',
   'system', 'all', 'scheduled', 0, null, now() + interval '2 days')
on conflict (id) do update
  set title = excluded.title,
      body = excluded.body,
      type = excluded.type,
      target_audience = excluded.target_audience,
      status = excluded.status,
      recipient_count = excluded.recipient_count;

-- ─── 10. Blood donors (Blood Donor verification console demo rows) ─────────

insert into public.blood_donors (
  id, profile_id, full_name, blood_group, genotype, city, region, phone, email,
  availability_status, partner_status, last_donation_date, donations_count, gender,
  verification_submitted_at, verification_reviewed_at, verification_reviewed_by,
  donor_card_url, medical_check_url
) values
  ('dd000000-0000-4000-8000-000000000b01', null, 'Samuel Okon',    'O-', 'AA', 'Ikeja',          'Lagos', '+234 802 345 6789', 'samuel.okon@gmail.com',    'Available Anytime',    'active',   '2025-11-10', 6, 'Male',   now() - interval '230 days', now() - interval '228 days', 'super_admin_1',        'blood_donor_card_samuel.pdf',  'medical_clearance_samuel.pdf'),
  ('dd000000-0000-4000-8000-000000000b02', null, 'Grace Nwosu',    'O+', 'AA', 'Victoria Island','Lagos', '+234 803 987 6543', 'grace.nwosu@yahoo.com',    'Available Anytime',    'active',   '2025-12-01', 4, 'Female', now() - interval '210 days', now() - interval '209 days', 'verification_admin_1',  'blood_donor_card_grace.pdf',   'medical_clearance_grace.pdf'),
  ('dd000000-0000-4000-8000-000000000b03', null, 'Emmanuel Adebayo','A+','AS', 'Yaba',           'Lagos', '+234 812 444 5555', 'e.adebayo@healthnet.ng',   'On-Call Emergency',    'pending',  '2025-09-15', 9, 'Male',   now() - interval '15 days',  null,                        null,                     'blood_donor_card_emmanuel.pdf','medical_clearance_emmanuel.pdf'),
  ('dd000000-0000-4000-8000-000000000b04', null, 'Kemi Fatimah',   'B+', 'AA', 'Surulere',       'Lagos', '+234 809 111 2233', 'kemi.fatimah@outlook.com', 'Available Anytime',    'active',   '2025-10-20', 3, 'Female', now() - interval '300 days', now() - interval '300 days', 'verification_admin_2',  'blood_donor_card_kemi.pdf',    'medical_clearance_kemi.pdf'),
  ('dd000000-0000-4000-8000-000000000b05', null, 'David Chidi',    'AB+','AA', 'Lekki',          'Lagos', '+234 701 555 7788', 'david.chidi@gmail.com',    'Available Anytime',    'pending',  '2025-08-05', 2, 'Male',   now() - interval '10 days',  null,                        null,                     'blood_donor_card_david.pdf',   'medical_clearance_david.pdf')
on conflict (id) do update
  set full_name = excluded.full_name,
      blood_group = excluded.blood_group,
      genotype = excluded.genotype,
      city = excluded.city,
      region = excluded.region,
      phone = excluded.phone,
      availability_status = excluded.availability_status,
      partner_status = excluded.partner_status,
      last_donation_date = excluded.last_donation_date,
      donations_count = excluded.donations_count,
      gender = excluded.gender;

commit;
