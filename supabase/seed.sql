-- ═══════════════════════════════════════════════════════════════════════════
-- OMINIPULSE UNIFIED BACKEND — seed.sql
--
-- Dummy sign-in accounts for BOTH web (desktop/admin) and mobile.
-- Every account below works on every platform — that is the point of the
-- unified backend. This file also creates the matching auth.users rows
-- (deterministic UUIDs + bcrypt passwords) before inserting profiles, so a
-- single run seeds identities, profiles, and all demo data together.
--
-- ═══════════════════════════════════════════════════════════════════════════
--  DUMMY LOGIN CREDENTIALS (all platforms)
--
--  ── 6 PLATFORM ADMINS (web admin console) ──────────────────────────────
--   1. superadmin@ominipulse.ai      / OminiAdmin2026!   (super admin)
--   2. verification@ominipulse.ai    / VerifyAdmin2026!  (doctor verification)
--   3. support@ominipulse.ai         / SupportAdmin2026! (patient support)
--   4. security@ominipulse.ai        / SecureAdmin2026!  (security & audit)
--   5. moderator@ominipulse.ai       / Moder8Admin2026!  (AI & content)
--   6. hospitalrel@ominipulse.ai     / PartnerAdmin2026! (hospital relations)
--
--  ── DOCTOR (mobile + web doctor portal) ────────────────────────────────
--   doctor@ominipulse.ai             / Doctor2026!       (Dr. Folake Ademola)
--
--  ── PATIENT (mobile) ───────────────────────────────────────────────────
--   patient@ominipulse.ai            / Patient2026!      (Chioma Egwu)
--
--  ── HOSPITAL STAFF (web hospital portal) ────────────────────────────────
--   admin@xyzspecialist.ng            / HospAdmin2026!    (hospital admin)
--   nurse@xyzspecialist.ng            / Nurse2026!        (ward nurse)
--   pharmacist@xyzspecialist.ng       / Pharm2026!        (pharmacist)
--   labtech@xyzspecialist.ng          / LabTech2026!      (lab scientist)
--   bloodbank@xyzspecialist.ng        / BloodBank2026!    (blood officer)
--   reception@xyzspecialist.ng        / Reception2026!    (front desk)
-- ═══════════════════════════════════════════════════════════════════════════

begin;

-- ─── Auth users (auth.users + auth.identities) ─────────────────────────────────
-- profiles.id has a FK to auth.users(id), so the auth rows must exist first.
-- Passwords are bcrypt-hashed with pgcrypto (create extension is idempotent).
-- Deterministic UUIDs keep re-seeding safe (on conflict do nothing / update).

create extension if not exists pgcrypto;
-- pgcrypto may live in the public or extensions schema depending on setup.
set search_path = public, extensions;

-- If demo accounts were previously created via the dashboard (random UUIDs),
-- remove them so the deterministic UUIDs below win. profiles rows cascade.
delete from auth.users
 where email in (
    'superadmin@ominipulse.ai', 'verification@ominipulse.ai', 'support@ominipulse.ai',
    'security@ominipulse.ai', 'moderator@ominipulse.ai', 'hospitalrel@ominipulse.ai',
    'doctor@ominipulse.ai', 'patient@ominipulse.ai',
    'admin@xyzspecialist.ng', 'nurse@xyzspecialist.ng', 'pharmacist@xyzspecialist.ng',
    'labtech@xyzspecialist.ng', 'bloodbank@xyzspecialist.ng', 'reception@xyzspecialist.ng'
 )
 and id not in (
    '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666',
    '77777777-7777-7777-7777-777777777777', '88888888-8888-8888-8888-888888888888',
    '99999999-9999-9999-9999-999999999999', 'aaaaaaa1-1111-4111-8111-aaaaaaaaaaa1',
    'aaaaaaa2-2222-4222-8222-aaaaaaaaaaa2', 'aaaaaaa3-3333-4333-8333-aaaaaaaaaaa3',
    'aaaaaaa4-4444-4444-8444-aaaaaaaaaaa4', 'aaaaaaa5-5555-4555-8555-aaaaaaaaaaa5'
 );

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, email_change, email_change_confirm_status,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data
) values
  -- 6 platform admins
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'superadmin@ominipulse.ai',    crypt('OminiAdmin2026!',  gen_salt('bf')), now(), '', 0, now(), now(), '{"provider":"email","providers":["email"]}', '{"first_name":"Adaora","last_name":"Obi","role":"admin"}'),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'verification@ominipulse.ai',  crypt('VerifyAdmin2026!',  gen_salt('bf')), now(), '', 0, now(), now(), '{"provider":"email","providers":["email"]}', '{"first_name":"Ngozi","last_name":"Eze","role":"admin"}'),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'support@ominipulse.ai',       crypt('SupportAdmin2026!', gen_salt('bf')), now(), '', 0, now(), now(), '{"provider":"email","providers":["email"]}', '{"first_name":"Tunde","last_name":"Bakare","role":"admin"}'),
  ('00000000-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'authenticated', 'authenticated', 'security@ominipulse.ai',      crypt('SecureAdmin2026!',  gen_salt('bf')), now(), '', 0, now(), now(), '{"provider":"email","providers":["email"]}', '{"first_name":"Halima","last_name":"Bello","role":"admin"}'),
  ('00000000-0000-0000-0000-000000000000', '55555555-5555-5555-5555-555555555555', 'authenticated', 'authenticated', 'moderator@ominipulse.ai',     crypt('Moder8Admin2026!',  gen_salt('bf')), now(), '', 0, now(), now(), '{"provider":"email","providers":["email"]}', '{"first_name":"Emeka","last_name":"Nnamdi","role":"admin"}'),
  ('00000000-0000-0000-0000-000000000000', '66666666-6666-6666-6666-666666666666', 'authenticated', 'authenticated', 'hospitalrel@ominipulse.ai',   crypt('PartnerAdmin2026!', gen_salt('bf')), now(), '', 0, now(), now(), '{"provider":"email","providers":["email"]}', '{"first_name":"Yetunde","last_name":"Adeyemi","role":"admin"}'),
  -- doctor
  ('00000000-0000-0000-0000-000000000000', '77777777-7777-7777-7777-777777777777', 'authenticated', 'authenticated', 'doctor@ominipulse.ai',        crypt('Doctor2026!',       gen_salt('bf')), now(), '', 0, now(), now(), '{"provider":"email","providers":["email"]}', '{"first_name":"Folake","last_name":"Ademola","role":"doctor"}'),
  -- patient
  ('00000000-0000-0000-0000-000000000000', '88888888-8888-8888-8888-888888888888', 'authenticated', 'authenticated', 'patient@ominipulse.ai',       crypt('Patient2026!',       gen_salt('bf')), now(), '', 0, now(), now(), '{"provider":"email","providers":["email"]}', '{"first_name":"Chioma","last_name":"Egwu","role":"patient"}'),
  -- hospital staff
  ('00000000-0000-0000-0000-000000000000', '99999999-9999-9999-9999-999999999999', 'authenticated', 'authenticated', 'admin@xyzspecialist.ng',      crypt('HospAdmin2026!',     gen_salt('bf')), now(), '', 0, now(), now(), '{"provider":"email","providers":["email"]}', '{"first_name":"Ibrahim","last_name":"Sani","role":"hospital_admin"}'),
  ('00000000-0000-0000-0000-000000000000', 'aaaaaaa1-1111-4111-8111-aaaaaaaaaaa1', 'authenticated', 'authenticated', 'nurse@xyzspecialist.ng',      crypt('Nurse2026!',          gen_salt('bf')), now(), '', 0, now(), now(), '{"provider":"email","providers":["email"]}', '{"first_name":"Amina","last_name":"Yusuf","role":"nurse"}'),
  ('00000000-0000-0000-0000-000000000000', 'aaaaaaa2-2222-4222-8222-aaaaaaaaaaa2', 'authenticated', 'authenticated', 'pharmacist@xyzspecialist.ng', crypt('Pharm2026!',          gen_salt('bf')), now(), '', 0, now(), now(), '{"provider":"email","providers":["email"]}', '{"first_name":"Chioma","last_name":"Okonkwo","role":"pharmacist"}'),
  ('00000000-0000-0000-0000-000000000000', 'aaaaaaa3-3333-4333-8333-aaaaaaaaaaa3', 'authenticated', 'authenticated', 'labtech@xyzspecialist.ng',   crypt('LabTech2026!',        gen_salt('bf')), now(), '', 0, now(), now(), '{"provider":"email","providers":["email"]}', '{"first_name":"Emeka","last_name":"Nnamdi","role":"lab_technician"}'),
  ('00000000-0000-0000-0000-000000000000', 'aaaaaaa4-4444-4444-8444-aaaaaaaaaaa4', 'authenticated', 'authenticated', 'bloodbank@xyzspecialist.ng',  crypt('BloodBank2026!',      gen_salt('bf')), now(), '', 0, now(), now(), '{"provider":"email","providers":["email"]}', '{"first_name":"Musa","last_name":"Garba","role":"blood_officer"}'),
  ('00000000-0000-0000-0000-000000000000', 'aaaaaaa5-5555-4555-8555-aaaaaaaaaaa5', 'authenticated', 'authenticated', 'reception@xyzspecialist.ng',  crypt('Reception2026!',      gen_salt('bf')), now(), '', 0, now(), now(), '{"provider":"email","providers":["email"]}', '{"first_name":"Fatima","last_name":"Mohammed","role":"receptionist"}')
on conflict (id) do update
  set email              = excluded.email,
      encrypted_password = excluded.encrypted_password,
      email_confirmed_at = excluded.email_confirmed_at,
      raw_app_meta_data  = excluded.raw_app_meta_data,
      raw_user_meta_data = excluded.raw_user_meta_data,
      updated_at        = now();

-- Identity rows (required — without them password login fails with
-- "Identity not found"). provider_id = the user's id for email identities.
insert into auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) values
  ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '{"sub":"11111111-1111-1111-1111-111111111111","email":"superadmin@ominipulse.ai","email_verified":true}',    'email', now(), now(), now()),
  ('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '{"sub":"22222222-2222-2222-2222-222222222222","email":"verification@ominipulse.ai","email_verified":true}', 'email', now(), now(), now()),
  ('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '{"sub":"33333333-3333-3333-3333-333333333333","email":"support@ominipulse.ai","email_verified":true}',     'email', now(), now(), now()),
  ('44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', '{"sub":"44444444-4444-4444-4444-444444444444","email":"security@ominipulse.ai","email_verified":true}',    'email', now(), now(), now()),
  ('55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', '{"sub":"55555555-5555-5555-5555-555555555555","email":"moderator@ominipulse.ai","email_verified":true}',   'email', now(), now(), now()),
  ('66666666-6666-6666-6666-666666666666', '66666666-6666-6666-6666-666666666666', '66666666-6666-6666-6666-666666666666', '{"sub":"66666666-6666-6666-6666-666666666666","email":"hospitalrel@ominipulse.ai","email_verified":true}', 'email', now(), now(), now()),
  ('77777777-7777-7777-7777-777777777777', '77777777-7777-7777-7777-777777777777', '77777777-7777-7777-7777-777777777777', '{"sub":"77777777-7777-7777-7777-777777777777","email":"doctor@ominipulse.ai","email_verified":true}',       'email', now(), now(), now()),
  ('88888888-8888-8888-8888-888888888888', '88888888-8888-8888-8888-888888888888', '88888888-8888-8888-8888-888888888888', '{"sub":"88888888-8888-8888-8888-888888888888","email":"patient@ominipulse.ai","email_verified":true}',    'email', now(), now(), now()),
  ('99999999-9999-9999-9999-999999999999', '99999999-9999-9999-9999-999999999999', '99999999-9999-9999-9999-999999999999', '{"sub":"99999999-9999-9999-9999-999999999999","email":"admin@xyzspecialist.ng","email_verified":true}',   'email', now(), now(), now()),
  ('aaaaaaa1-1111-4111-8111-aaaaaaaaaaa1', 'aaaaaaa1-1111-4111-8111-aaaaaaaaaaa1', 'aaaaaaa1-1111-4111-8111-aaaaaaaaaaa1', '{"sub":"aaaaaaa1-1111-4111-8111-aaaaaaaaaaa1","email":"nurse@xyzspecialist.ng","email_verified":true}',  'email', now(), now(), now()),
  ('aaaaaaa2-2222-4222-8222-aaaaaaaaaaa2', 'aaaaaaa2-2222-4222-8222-aaaaaaaaaaa2', 'aaaaaaa2-2222-4222-8222-aaaaaaaaaaa2', '{"sub":"aaaaaaa2-2222-4222-8222-aaaaaaaaaaa2","email":"pharmacist@xyzspecialist.ng","email_verified":true}', 'email', now(), now(), now()),
  ('aaaaaaa3-3333-4333-8333-aaaaaaaaaaa3', 'aaaaaaa3-3333-4333-8333-aaaaaaaaaaa3', 'aaaaaaa3-3333-4333-8333-aaaaaaaaaaa3', '{"sub":"aaaaaaa3-3333-4333-8333-aaaaaaaaaaa3","email":"labtech@xyzspecialist.ng","email_verified":true}', 'email', now(), now(), now()),
  ('aaaaaaa4-4444-4444-8444-aaaaaaaaaaa4', 'aaaaaaa4-4444-4444-8444-aaaaaaaaaaa4', 'aaaaaaa4-4444-4444-8444-aaaaaaaaaaa4', '{"sub":"aaaaaaa4-4444-4444-8444-aaaaaaaaaaa4","email":"bloodbank@xyzspecialist.ng","email_verified":true}', 'email', now(), now(), now()),
  ('aaaaaaa5-5555-4555-8555-aaaaaaaaaaa5', 'aaaaaaa5-5555-4555-8555-aaaaaaaaaaa5', 'aaaaaaa5-5555-4555-8555-aaaaaaaaaaa5', '{"sub":"aaaaaaa5-5555-4555-8555-aaaaaaaaaaa5","email":"reception@xyzspecialist.ng","email_verified":true}', 'email', now(), now(), now())
on conflict (id) do update
  set identity_data = excluded.identity_data,
      provider_id  = excluded.provider_id,
      updated_at   = now();

-- ─── Profiles (auth.users ids are deterministic UUIDs so re-seeding is safe) ─

insert into public.profiles (id, email, first_name, last_name, role, phone, is_approved, verification_status, is_two_factor_enabled) values
  -- 6 platform admins
  ('11111111-1111-1111-1111-111111111111', 'superadmin@ominipulse.ai',    'Adaora',   'Obi',         'admin',           '+2348030000001', true,  'approved', true),
  ('22222222-2222-2222-2222-222222222222', 'verification@ominipulse.ai',  'Ngozi',    'Eze',         'admin',           '+2348030000002', true,  'approved', true),
  ('33333333-3333-3333-3333-333333333333', 'support@ominipulse.ai',       'Tunde',    'Bakare',      'admin',           '+2348030000003', true,  'approved', false),
  ('44444444-4444-4444-4444-444444444444', 'security@ominipulse.ai',      'Halima',   'Bello',       'admin',           '+2348030000004', true,  'approved', true),
  ('55555555-5555-5555-5555-555555555555', 'moderator@ominipulse.ai',     'Emeka',    'Nnamdi',      'admin',           '+2348030000005', true,  'approved', false),
  ('66666666-6666-6666-6666-666666666666', 'hospitalrel@ominipulse.ai',   'Yetunde',  'Adeyemi',     'admin',           '+2348030000006', true,  'approved', false),
  -- doctor
  ('77777777-7777-7777-7777-777777777777', 'doctor@ominipulse.ai',        'Folake',   'Ademola',     'doctor',           '+2348030000007', true,  'approved', true),
  -- patient
  ('88888888-8888-8888-8888-888888888888', 'patient@ominipulse.ai',       'Chioma',   'Egwu',        'patient',          '+2348030000008', true,  'approved', false),
  -- hospital staff
  ('99999999-9999-9999-9999-999999999999', 'admin@xyzspecialist.ng',      'Ibrahim',  'Sani',        'hospital_admin',   '+2348030000009', true,  'approved', true),
  ('aaaaaaa1-1111-4111-8111-aaaaaaaaaaa1', 'nurse@xyzspecialist.ng',      'Amina',    'Yusuf',       'nurse',            '+2348030000010', true,  'approved', false),
  ('aaaaaaa2-2222-4222-8222-aaaaaaaaaaa2', 'pharmacist@xyzspecialist.ng', 'Chioma',   'Okonkwo',     'pharmacist',       '+2348030000011', true,  'approved', false),
  ('aaaaaaa3-3333-4333-8333-aaaaaaaaaaa3', 'labtech@xyzspecialist.ng',    'Emeka',    'Nnamdi',      'lab_technician',   '+2348030000012', true,  'approved', false),
  ('aaaaaaa4-4444-4444-8444-aaaaaaaaaaa4', 'bloodbank@xyzspecialist.ng',  'Musa',     'Garba',       'blood_officer',   '+2348030000013', true,  'approved', false),
  ('aaaaaaa5-5555-4555-8555-aaaaaaaaaaa5', 'reception@xyzspecialist.ng', 'Fatima',   'Mohammed',    'receptionist',     '+2348030000014', true,  'approved', false)
on conflict (id) do update
  set email                  = excluded.email,
      first_name            = excluded.first_name,
      last_name             = excluded.last_name,
      role                  = excluded.role,
      phone                 = excluded.phone,
      is_active             = true,
      is_approved           = excluded.is_approved,
      verification_status   = excluded.verification_status,
      is_two_factor_enabled = excluded.is_two_factor_enabled;

-- ─── Hospital ─────────────────────────────────────────────────────────────────

insert into public.hospitals (id, name, short_name, license_number, cac_number, address, city, state, emergency_phone, email, website, admin_email, admin_name, partner_status, status, tier, departments, licensed_beds, annual_fee_ngn, is_verified) values (
  'd0000000-0000-4000-8000-000000000001',
  'XYZ Specialist Hospital & Clinics',
  'XYZ Specialist',
  'FMH/LAG/2026/001',
  'RC-1849302',
  '12 Bourdillon Road, Ikoyi',
  'Lagos', 'Lagos State',
  '+234-1-280-9900',
  'info@xyzspecialist.ng',
  'https://xyzspecialist.ng',
  'admin@xyzspecialist.ng',
  'Dr. Ibrahim Sani',
  'active', 'active', 'specialist',
  array['ICU', 'Emergency', 'Surgery', 'Internal Medicine', 'Pediatrics', 'Maternity', 'Pharmacy', 'Laboratory', 'Blood Bank'],
  18, 1200000.00, true
) on conflict (id) do nothing;

-- ─── Hospital staff links ─────────────────────────────────────────────────────

insert into public.hospital_staff (profile_id, hospital_id, department, staff_role, status) values
  ('99999999-9999-9999-9999-999999999999', 'd0000000-0000-4000-8000-000000000001', 'Administration', 'hospital_admin',  'active'),
  ('aaaaaaa1-1111-4111-8111-aaaaaaaaaaa1', 'd0000000-0000-4000-8000-000000000001', 'Wards',          'nurse',           'active'),
  ('aaaaaaa2-2222-4222-8222-aaaaaaaaaaa2', 'd0000000-0000-4000-8000-000000000001', 'Pharmacy',       'pharmacist',      'active'),
  ('aaaaaaa3-3333-4333-8333-aaaaaaaaaaa3', 'd0000000-0000-4000-8000-000000000001', 'Laboratory',     'lab_technician',  'active'),
  ('aaaaaaa4-4444-4444-8444-aaaaaaaaaaa4', 'd0000000-0000-4000-8000-000000000001', 'Blood Bank',     'blood_officer',  'active'),
  ('aaaaaaa5-5555-4555-8555-aaaaaaaaaaa5', 'd0000000-0000-4000-8000-000000000001', 'Front Desk',     'receptionist',   'active'),
  ('77777777-7777-7777-7777-777777777777', 'd0000000-0000-4000-8000-000000000001', 'Cardiology',     'doctor',         'active')
on conflict do nothing;

-- ─── Doctor profile ───────────────────────────────────────────────────────────

insert into public.doctor_profiles (
  id, profile_id, specialization, license_number, bio, experience_years,
  clinic_name, clinic_address, hospital_id, consultation_fee, rating,
  review_count, is_available, availability_status, license_expiry_date, is_mdcn_verified
) values (
  'c0000000-0000-4000-8000-000000000001',
  '77777777-7777-7777-7777-777777777777',
  'Cardiology',
  'MDCN/DOC/2015/042317',
  'Consultant Cardiologist with 15 years of practice in interventional cardiology and preventive heart care.',
  15,
  'XYZ Heart & Vascular Clinic',
  '12 Bourdillon Road, Ikoyi, Lagos',
  'd0000000-0000-4000-8000-000000000001',
  15000.00, 4.90, 218, true, 'available', '2027-06-30', true
) on conflict (id) do nothing;

insert into public.doctor_working_hours (doctor_id, day, start_time, end_time, is_active, slot_duration) values
  ('c0000000-0000-4000-8000-000000000001', 'monday',    '09:00', '17:00', true, 30),
  ('c0000000-0000-4000-8000-000000000001', 'tuesday',   '09:00', '17:00', true, 30),
  ('c0000000-0000-4000-8000-000000000001', 'wednesday', '10:00', '14:00', true, 30),
  ('c0000000-0000-4000-8000-000000000001', 'thursday',  '09:00', '17:00', true, 30),
  ('c0000000-0000-4000-8000-000000000001', 'friday',    '09:00', '13:00', true, 30),
  ('c0000000-0000-4000-8000-000000000001', 'saturday',  '10:00', '12:00', false, 30),
  ('c0000000-0000-4000-8000-000000000001', 'sunday',    '09:00', '12:00', false, 30)
on conflict do nothing;

insert into public.doctor_verification_documents (doctor_id, doc_type, file_url, status) values
  ('c0000000-0000-4000-8000-000000000001', 'mdcn_license',         'https://storage.ominipulse.ai/docs/mdcn-folake.pdf',         'approved'),
  ('c0000000-0000-4000-8000-000000000001', 'national_id',          'https://storage.ominipulse.ai/docs/nin-folake.pdf',           'approved'),
  ('c0000000-0000-4000-8000-000000000001', 'specialty_certificate','https://storage.ominipulse.ai/docs/cert-cardiology.pdf',     'approved'),
  ('c0000000-0000-4000-8000-000000000001', 'employment_letter',    'https://storage.ominipulse.ai/docs/emp-xyz.pdf',              'approved'),
  ('c0000000-0000-4000-8000-000000000001', 'passport_photo',       'https://storage.ominipulse.ai/docs/photo-folake.jpg',          'approved')
on conflict do nothing;

-- ─── Patient profile ──────────────────────────────────────────────────────────

insert into public.patient_profiles (
  id, profile_id, hospital_id, date_of_birth, gender, blood_group, genotype,
  height, weight, address,
  emergency_contact_name, emergency_contact_relationship, emergency_contact_phone
) values (
  'e0000000-0000-4000-8000-000000000001',
  '88888888-8888-8888-8888-888888888888',
  'd0000000-0000-4000-8000-000000000001',
  '1985-11-10', 'female', 'O+', 'AA', 165, 55,
  '14 Adeola Odeku Street, Victoria Island, Lagos',
  'Obinna Egwu', 'Brother', '+2348034445556'
) on conflict (id) do nothing;

-- ─── Chronic conditions + vitals ──────────────────────────────────────────────

insert into public.chronic_conditions (patient_id, condition, is_active, diagnosed_at) values
  ('e0000000-0000-4000-8000-000000000001', 'diabetes',     true, '2022-03-14'),
  ('e0000000-0000-4000-8000-000000000001', 'hypertension', true, '2023-01-20')
on conflict do nothing;

insert into public.vitals_readings (patient_id, condition, reading_type, systolic, diastolic, pulse, value, category, notes) values
  ('e0000000-0000-4000-8000-000000000001', 'hypertension', 'blood_pressure', 145, 92, 72, null, 'stage1', 'Morning reading before medication'),
  ('e0000000-0000-4000-8000-000000000001', 'hypertension', 'blood_pressure', 128, 84, 70, null, 'elevated', 'Evening reading after medication'),
  ('e0000000-0000-4000-8000-000000000001', 'diabetes',     'blood_glucose',  null, null, null, 145.00, 'high', 'Fasting glucose — above target range'),
  ('e0000000-0000-4000-8000-000000000001', 'diabetes',     'blood_glucose',  null, null, null, 108.00, 'prediabetes', 'Post-meal glucose — improving'),
  ('e0000000-0000-4000-8000-000000000001', null,           'heart_rate',     null, null, 72, null, 'normal', null),
  ('e0000000-0000-4000-8000-000000000001', null,           'spo2',           null, null, null, 98.00, 'normal', 'Room air');

-- ─── Appointment + SOAP + prescription ─────────────────────────────────────────

insert into public.appointments (
  id, doctor_id, patient_id, scheduled_at, duration, status, type, reason,
  is_doctor_approved, payment_status
) values (
  'f0000000-0000-4000-8000-000000000001',
  'c0000000-0000-4000-8000-000000000001',
  'e0000000-0000-4000-8000-000000000001',
  now() + interval '2 days',
  30, 'scheduled', 'video',
  'Diabetes follow-up review and glucose log assessment',
  true, 'held'
) on conflict (id) do nothing;

insert into public.soap_notes (appointment_id, subjective, objective, assessment, plan, created_by) values (
  'f0000000-0000-4000-8000-000000000001',
  'Patient reports chronic fatigue and mild visual blurriness. Irregular blood glucose checks over the past week. No chest discomfort or dyspnea.',
  'Height: 165 cm, Weight: 55 kg, BMI: 20.2 (Normal). Latest fasting glucose 145 mg/dL. Pulse 72 bpm regular.',
  'Type 2 Diabetes Mellitus under review. Mild symptoms suggest glycemic fluctuations. Cardiopulmonary signs clear.',
  '1. Review blood glucose logs and medication adherence.\n2. Advise regular hydration and scheduled carbohydrate intake.\n3. Diabetic retinopathy screening at next visit.',
  '77777777-7777-7777-7777-777777777777'
) on conflict do nothing;

insert into public.prescriptions (id, appointment_id, doctor_id, patient_id, diagnosis, instructions, follow_up_date) values (
  'a0000000-0000-4000-8000-000000000001',
  'f0000000-0000-4000-8000-000000000001',
  'c0000000-0000-4000-8000-000000000001',
  'e0000000-0000-4000-8000-000000000001',
  'Type 2 Diabetes Mellitus — suboptimal glycemic control',
  'Continue metformin. Monitor fasting glucose twice weekly. Return immediately if visual symptoms worsen.',
  current_date + 30
) on conflict (id) do nothing;

insert into public.prescription_medications (prescription_id, name, dosage, frequency, duration, instructions) values
  ('a0000000-0000-4000-8000-000000000001', 'Metformin HCl', '1000mg', 'Twice daily (morning & evening)', '30 days', 'Take with meals to reduce GI upset'),
  ('a0000000-0000-4000-8000-000000000001', 'Vitamin B12',   '1000mcg', 'Once daily',                     '30 days', 'Sublingual tablet in the morning');

-- ─── Medical records ──────────────────────────────────────────────────────────

insert into public.medical_records (id, patient_id, type, title, description, date, doctor_id, doctor_name, attachment_url, visibility) values
  ('b0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000001', 'lab_result', 'Fasting Blood Glucose Panel', 'Fasting glucose 145 mg/dL (ref: 70–99). HbA1c 8.2%. Indicates suboptimal glycemic control.', current_date - 14, 'c0000000-0000-4000-8000-000000000001', 'Dr. Folake Ademola', 'https://storage.ominipulse.ai/records/labs/glucose-panel.pdf', 'all'),
  ('b0000000-0000-4000-8000-000000000002', 'e0000000-0000-4000-8000-000000000001', 'diagnosis',  'Type 2 Diabetes Mellitus',   'Diagnosed 2022-03-14. Currently managed on oral metformin 1000mg BD.', date '2022-03-14', 'c0000000-0000-4000-8000-000000000001', 'Dr. Folake Ademola', null, 'all'),
  ('b0000000-0000-4000-8000-000000000003', 'e0000000-0000-4000-8000-000000000001', 'allergy',    'Penicillin Allergy',         'Documented penicillin hypersensitivity — rash and urticaria. Avoid beta-lactam antibiotics.', date '2021-06-01', null, null, null, 'all')
on conflict (id) do nothing;

-- ─── Consent grants (NDPA) ────────────────────────────────────────────────────

insert into public.consent_grants (patient_id, scope, title, description, target_id, target_name, status, granted_at) values
  ('e0000000-0000-4000-8000-000000000001', 'medical_history', 'Share Medical History', 'Allow Dr. Folake Ademola to access your complete medical history during consultations.', 'c0000000-0000-4000-8000-000000000001', 'Dr. Folake Ademola', 'granted', now() - interval '30 days'),
  ('e0000000-0000-4000-8000-000000000001', 'lab_report',     'Share Lab Reports',     'Allow access to laboratory results linked to your record.', 'c0000000-0000-4000-8000-000000000001', 'Dr. Folake Ademola', 'granted', now() - interval '30 days'),
  ('e0000000-0000-4000-8000-000000000001', 'ai_analysis',    'AI Health Insights',    'Allow the OminiPulse AI assistant to analyze your vitals and records for personalized insights.', null, 'AI Diagnostic Assistant', 'granted', now() - interval '60 days'),
  ('e0000000-0000-4000-8000-000000000001', 'prescription_share', 'Pharmacy Sharing',  'Allow hospital pharmacy to view your prescriptions for dispensing.', null, 'XYZ Specialist Pharmacy', 'granted', now() - interval '30 days')
on conflict do nothing;

-- ─── Audit log entries ────────────────────────────────────────────────────────

insert into public.audit_logs (patient_id, patient_name, actor_id, actor_name, actor_role, actor_title, action, record_id, record_name, record_category, ip_address, device) values
  ('e0000000-0000-4000-8000-000000000001', 'Chioma Egwu', '77777777-7777-7777-7777-777777777777', 'Dr. Folake Ademola', 'doctor', 'Cardiologist', 'view', 'b0000000-0000-4000-8000-000000000001', 'Fasting Blood Glucose Panel.pdf', 'lab_report', '102.89.34.12', 'Web (Desktop App)'),
  ('e0000000-0000-4000-8000-000000000001', 'Chioma Egwu', '88888888-8888-8888-8888-888888888888', 'Chioma Egwu', 'patient', null, 'download', 'b0000000-0000-4000-8000-000000000001', 'Fasting Blood Glucose Panel.pdf', 'lab_report', '105.112.66.4', 'Mobile (Android)'),
  ('e0000000-0000-4000-8000-000000000001', 'Chioma Egwu', '11111111-1111-1111-1111-111111111111', 'Adaora Obi', 'admin', 'System Administrator', 'view', 'b0000000-0000-4000-8000-000000000002', 'Type 2 Diabetes Diagnosis', 'medical_history', '102.89.34.1', 'Web (Admin Console)'),
  ('e0000000-0000-4000-8000-000000000001', 'Chioma Egwu', '77777777-7777-7777-7777-777777777777', 'Dr. Folake Ademola', 'doctor', 'Cardiologist', 'edit', 'b0000000-0000-4000-8000-000000000003', 'Penicillin Allergy', 'medical_history', '102.89.34.12', 'Web (Desktop App)');

-- ─── Hospital beds (18 beds / 6 wards) ────────────────────────────────────────

insert into public.hospital_beds (hospital_id, bed_number, ward, room, status, current_patient_name, diagnosis, admission_date, last_cleaned_at) values
  ('d0000000-0000-4000-8000-000000000001', 'ICU-01', 'icu', 'ICU Ward', 'occupied', 'Chief Ogbonna Eze', 'Septic shock — vasopressor support', now() - interval '3 days', null),
  ('d0000000-0000-4000-8000-000000000001', 'ICU-02', 'icu', 'ICU Ward', 'available', null, null, null, now() - interval '5 hours'),
  ('d0000000-0000-4000-8000-000000000001', 'ICU-03', 'icu', 'ICU Ward', 'maintenance', null, 'Ventilator calibration', null, null),
  ('d0000000-0000-4000-8000-000000000001', 'ER-01', 'emergency', 'Resus Bay', 'occupied', 'Mrs. Kemi Ade', 'Road traffic accident — polytrauma', now() - interval '8 hours', null),
  ('d0000000-0000-4000-8000-000000000001', 'ER-02', 'emergency', 'Resus Bay', 'cleaning_required', null, null, null, null),
  ('d0000000-0000-4000-8000-000000000001', 'ER-03', 'emergency', 'Resus Bay', 'available', null, null, null, now() - interval '1 hour'),
  ('d0000000-0000-4000-8000-000000000001', 'MSW-01', 'male_surgical', 'Male Surgical', 'occupied', 'Mr. Dele Ogun', 'Post-op appendectomy — day 2', now() - interval '2 days', null),
  ('d0000000-0000-4000-8000-000000000001', 'MSW-02', 'male_surgical', 'Male Surgical', 'available', null, null, null, now() - interval '10 hours'),
  ('d0000000-0000-4000-8000-000000000001', 'MSW-03', 'male_surgical', 'Male Surgical', 'available', null, null, null, now() - interval '1 day'),
  ('d0000000-0000-4000-8000-000000000001', 'FMW-01', 'female_medical', 'Female Medical', 'occupied', 'Mrs. Bisi Cole', 'Diabetic ketoacidosis — resolving', now() - interval '4 days', null),
  ('d0000000-0000-4000-8000-000000000001', 'FMW-02', 'female_medical', 'Female Medical', 'occupied', 'Mrs. Ronke Ojo', 'Severe malaria — IV artesunate', now() - interval '2 days', null),
  ('d0000000-0000-4000-8000-000000000001', 'FMW-03', 'female_medical', 'Female Medical', 'cleaning_required', null, null, null, null),
  ('d0000000-0000-4000-8000-000000000001', 'PED-01', 'pediatric_neonatal', 'Pediatrics', 'occupied', 'Baby Ayanfe Ojo (M, 2y)', 'Bronchiolitis — oxygen therapy', now() - interval '1 day', null),
  ('d0000000-0000-4000-8000-000000000001', 'PED-02', 'pediatric_neonatal', 'Pediatrics', 'available', null, null, null, now() - interval '3 hours'),
  ('d0000000-0000-4000-8000-000000000001', 'PED-03', 'pediatric_neonatal', 'Pediatrics', 'available', null, null, null, now() - interval '6 hours'),
  ('d0000000-0000-4000-8000-000000000001', 'MAT-01', 'maternity', 'Maternity', 'occupied', 'Mrs. Funmi Alade', 'Postnatal care — day 1 (NSVD)', now() - interval '1 day', null),
  ('d0000000-0000-4000-8000-000000000001', 'MAT-02', 'maternity', 'Maternity', 'available', null, null, null, now() - interval '12 hours'),
  ('d0000000-0000-4000-8000-000000000001', 'MAT-03', 'maternity', 'Maternity', 'maintenance', null, 'Room repaint & bed rail repair', null, null)
on conflict do nothing;

-- ─── Pharmacy formulary ───────────────────────────────────────────────────────

insert into public.medication_items (hospital_id, name, category, dosage_form, current_stock, min_stock_level, unit_price_ngn, batch_number, expiration_date) values
  ('d0000000-0000-4000-8000-000000000001', 'Amoxicillin 500mg', 'Antibiotics', 'Capsule', 2400, 100, 850.00, 'AMX-2026-014', '2027-03-31'),
  ('d0000000-0000-4000-8000-000000000001', 'Metformin 1000mg', 'Endocrine', 'Tablet', 800, 200, 1200.00, 'MET-2026-009', '2027-01-15'),
  ('d0000000-0000-4000-8000-000000000001', 'Paracetamol 500mg', 'Analgesics', 'Tablet', 5000, 500, 350.00, 'PCM-2026-021', '2028-06-30'),
  ('d0000000-0000-4000-8000-000000000001', 'Normal Saline 500ml', 'IV Fluids', 'IV Bag', 150, 80, 3500.00, 'NS-2026-003', '2026-12-31'),
  ('d0000000-0000-4000-8000-000000000001', 'Amlodipine 10mg', 'Cardiovascular', 'Tablet', 60, 100, 2100.00, 'AML-2026-001', '2026-11-30'),
  ('d0000000-0000-4000-8000-000000000001', 'Artesunate Injection', 'Emergency', 'Ampoule', 40, 30, 6800.00, 'ART-2026-002', '2026-10-31')
on conflict do nothing;

insert into public.pharmacy_orders (prescription_id, patient_id, patient_name, doctor_name, department, status) values
  ('a0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000001', 'Chioma Egwu', 'Dr. Folake Ademola', 'Cardiology', 'pending')
on conflict do nothing;

-- ─── Lab orders ──────────────────────────────────────────────────────────────

insert into public.lab_orders (
  hospital_id, order_number, patient_id, patient_name, doctor_id, doctor_name,
  test_name, test_category, sample_type, urgency, status, results_summary,
  normal_range, findings, technician_id, technician_name, verified_at
) values
  ('d0000000-0000-4000-8000-000000000001', 'LAB-2026-0001',
   'e0000000-0000-4000-8000-000000000001', 'Chioma Egwu',
   'c0000000-0000-4000-8000-000000000001', 'Dr. Folake Ademola',
   'Fasting Blood Glucose + HbA1c', 'Biochemistry', 'Serum', 'routine', 'verified',
   'Fasting glucose 145 mg/dL; HbA1c 8.2%', '70–99 mg/dL; <5.7%',
   'Suboptimal glycemic control consistent with Type 2 Diabetes. Recommend medication adherence review.',
   'aaaaaaa3-3333-4333-8333-aaaaaaaaaaa3', 'MLS. Emeka Nnamdi', now() - interval '13 days'),
  ('d0000000-0000-4000-8000-000000000001', 'LAB-2026-0002',
   null, 'Mr. Dele Ogun',
   null, 'Dr. Adebayo Ojo',
    'Full Blood Count', 'Hematology', 'Blood', 'urgent', 'results_ready',
   null, null, null,
   'aaaaaaa3-3333-4333-8333-aaaaaaaaaaa3', null, null),
  ('d0000000-0000-4000-8000-000000000001', 'LAB-2026-0003',
   null, 'Mrs. Ronke Ojo',
   null, 'Dr. Adebayo Ojo',
    'Malaria RDT + Parasite Count', 'Parasitology', 'Blood', 'stat_emergency', 'sample_collected',
   null, null, null, null, null, null)
on conflict (order_number) do nothing;

-- ─── Blood donors + requests ──────────────────────────────────────────────────

insert into public.blood_donors (profile_id, full_name, blood_group, genotype, city, latitude, longitude, phone, availability_status, is_verified, last_donation_date, donations_count, lab_report_url) values
  (null, 'Obinna Nwalupue',   'O-', 'AA', 'Lagos', 6.524400, 3.379200, '+2348091110001', 'On-Call Emergency', true, '2026-05-14', 7, 'https://storage.ominipulse.ai/donors/obinna-lab.pdf'),
  (null, 'Sade Adegbenro',    'O+', 'AA', 'Lagos', 6.454100, 3.394700, '+2348091110002', 'Available Anytime', true, '2026-06-02', 4, 'https://storage.ominipulse.ai/donors/sade-lab.pdf'),
  (null, 'Yusuf Ibrahim',     'A+', 'AS', 'Lagos', 6.601800, 3.351500, '+2348091110003', 'Available Anytime', true, '2026-04-19', 11, 'https://storage.ominipulse.ai/donors/yusuf-lab.pdf'),
  (null, 'Efe Oghenekaro',    'B+', 'AA', 'Lagos', 6.595700, 3.337400, '+2348091110004', 'Temporarily Unavailable', false, '2026-07-21', 2, null),
  (null, 'Amina Kolo',        'AB+', 'AA', 'Lagos', 6.469800, 3.585200, '+2348091110005', 'On-Call Emergency', true, '2026-03-30', 9, 'https://storage.ominipulse.ai/donors/amina-lab.pdf')
on conflict do nothing;

insert into public.blood_requests (
  patient_id, patient_name, blood_group, units_needed, units_collected,
  hospital_id, hospital_name, city, urgency, status, required_by, requested_by
) values
  ('e0000000-0000-4000-8000-000000000001', 'Chief Ogbonna Eze (ICU-01)', 'O-', 3, 1,
   'd0000000-0000-4000-8000-000000000001', 'XYZ Specialist Hospital & Clinics', 'Lagos',
   'emergency', 'donors_notified', now() + interval '6 hours',
   '99999999-9999-9999-9999-999999999999'),
  (null, 'Mr. Samuel Anyanwu (Theater)', 'A+', 2, 2,
   'd0000000-0000-4000-8000-000000000001', 'XYZ Specialist Hospital & Clinics', 'Lagos',
   'urgent', 'fulfilled', now() - interval '2 days',
   '99999999-9999-9999-9999-999999999999')
on conflict do nothing;

-- ─── Notifications ────────────────────────────────────────────────────────────

insert into public.notifications (profile_id, type, title, body, is_read) values
  ('88888888-8888-8888-8888-888888888888', 'appointment_reminder', 'Upcoming Video Consultation', 'Your consultation with Dr. Folake Ademola is scheduled. Tap to view details and join.', false),
  ('88888888-8888-8888-8888-888888888888', 'prescription_ready', 'Prescription Update', 'Dr. Ademola updated your prescription: Metformin HCl 1000mg twice daily for 30 days.', false),
  ('88888888-8888-8888-8888-888888888888', 'result_ready', 'Lab Result Verified', 'Your Fasting Blood Glucose + HbA1c results have been verified by MLS. Emeka Nnamdi.', true),
  ('77777777-7777-7777-7777-777777777777', 'appointment_reminder', 'Appointment Tomorrow', 'Diabetes follow-up with Chioma Egwu — video consultation at 10:30 AM.', false),
  ('99999999-9999-9999-9999-999999999999', 'general', 'Blood Request Escalation', 'ICU O- emergency request needs 2 more units. Donor notifications have been sent.', false)
on conflict do nothing;

-- ─── Payment transaction (escrow demo) ────────────────────────────────────────

insert into public.payment_transactions (
  reference, appointment_id, patient_id, doctor_id, amount, currency,
  platform_fee, doctor_payout, status, method, escrow_released
) values (
  'OP-DEMO-2026-000001',
  'f0000000-0000-4000-8000-000000000001',
  'e0000000-0000-4000-8000-000000000001',
  'c0000000-0000-4000-8000-000000000001',
  15000.00, 'NGN', 1500.00, 13500.00, 'held', 'card', false
) on conflict (reference) do nothing;

-- ─── AI flag + incident report (admin console demo rows) ─────────────────────

insert into public.ai_flags (profile_id, prompt, reason, severity, status) values
  (null, 'What is the correct dosage of IV potassium for severe hypokalemia?', 'Clinical dosing guidance request — requires CDS safety review', 'medium', 'pending'),
  (null, 'How to mix compounded medications at home without prescription?', 'Potential prescription-bypass / harm vector', 'high', 'pending')
on conflict do nothing;

insert into public.incident_reports (
  reporter_id, reporter_name, target_id, target_name, target_type,
  consultation_id, category, description, status, severity
) values
  ('88888888-8888-8888-8888-888888888888', 'Chioma Egwu',
   '77777777-7777-7777-7777-777777777777', 'Dr. Folake Ademola', 'doctor',
   null, 'other',
   'Demo report: consultation started 7 minutes late due to clinic-side delay. Patient notified and appointment was extended.',
   'resolved', 'low'
) on conflict do nothing;

-- Update seeded appointment payment linkage
update public.appointments
   set payment_status = 'held'
 where id = 'f0000000-0000-4000-8000-000000000001'
   and payment_status <> 'held';

commit;
