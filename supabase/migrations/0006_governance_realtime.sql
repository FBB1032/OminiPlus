-- ═══════════════════════════════════════════════════════════════════════════
-- OMINIPULSE — 0006_governance_realtime.sql
--
-- Platform governance + realtime foundations. Applies on top of 0001–0005:
--   1. admin_audit_logs   — tamper-evident (hash-chained) trail of every
--                           administrative action, timestamped + persisted.
--   2. ai_interaction_logs — every user↔AI prompt/response pair, structured
--                           for retrieval and surfaced in the admin console.
--   3. broadcast_messages — desktop Broadcast Center payloads with audience
--                           targeting, scheduling, and universal delivery
--                           state; fan-out rows land in notifications.
--   4. 'rejected' verification status — doctors can be explicitly rejected
--                           (not just left 'pending') by the super admin.
-- Safe to re-run (idempotent DDL + drop-if-exists policies).
-- ═══════════════════════════════════════════════════════════════════════════

begin;

-- ─── 1. Verification status: explicit 'rejected' ─────────────────────────────
-- Doctors rejected by the super admin keep a distinguishable state so the
-- eligibility gate can say "rejected" instead of a misleading "pending".

alter type public.verification_status add value if not exists 'rejected';

-- ─── 2. Administrative audit trail (hash-chained, insert-only) ───────────────
--
-- Distinct from public.audit_logs (NDPA patient-record access trail): this
-- table captures ADMINISTRATIVE actions — user moderation, verification
-- decisions, broadcast dispatches, AI flag adjudication — for compliance.
--
-- Integrity model:
--   • prev_hash  — hash of the previous row in the chain (per (id) order);
--                  rewriting history breaks the chain detectably.
--   • entry_hash — sha256(prev_hash || canonical entry fields), computed by
--                  a BEFORE INSERT trigger that pins actor identity from
--                  auth.uid() so entries cannot be forged by clients.
--   • No UPDATE/DELETE grants/policies — insert-only by design.

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  actor_name text not null,
  actor_role text not null,
  action text not null,
  target_type text not null check (target_type in (
    'user', 'doctor', 'patient', 'hospital', 'appointment',
    'ai_flag', 'broadcast', 'incident', 'settings', 'payment'
  )),
  target_id text,
  target_label text,
  status text not null default 'success' check (status in ('success', 'failure')),
  metadata jsonb not null default '{}'::jsonb,
  ip_address text,
  user_agent text,
  prev_hash text,
  entry_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_audit_created on public.admin_audit_logs(created_at desc);
create index if not exists idx_admin_audit_actor on public.admin_audit_logs(actor_id, created_at desc);
create index if not exists idx_admin_audit_action on public.admin_audit_logs(action);
create index if not exists idx_admin_audit_target on public.admin_audit_logs(target_type, target_id);

-- Canonical serialization for hashing: field order is fixed so the hash is
-- stable across Postgres versions.
create or replace function public.admin_audit_canonical(
  p_created_at timestamptz,
  p_actor_id uuid,
  p_actor_name text,
  p_actor_role text,
  p_action text,
  p_target_type text,
  p_target_id text,
  p_target_label text,
  p_status text,
  p_metadata jsonb
)
returns text
language sql immutable
as $$
  select concat_ws('|',
    to_char(p_created_at, 'YYYY-MM-DD"T"HH24:MI:SS.US'),
    coalesce(p_actor_id::text, 'system'),
    coalesce(p_actor_name, ''),
    coalesce(p_actor_role, ''),
    coalesce(p_action, ''),
    coalesce(p_target_type, ''),
    coalesce(p_target_id, ''),
    coalesce(p_target_label, ''),
    coalesce(p_status, 'success'),
    coalesce(p_metadata::text, '{}')
  );
$$;

-- Chain + seal: computes prev_hash/entry_hash and pins actor identity.
-- Runs as SECURITY DEFINER so the trigger's profile lookups always work;
-- inserts still require RLS check via the insert policy below.
create or replace function public.admin_audit_chain()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_prev_hash text;
  v_actor public.profiles%rowtype;
begin
  -- Pin actor identity from the session (non-admins cannot forge actor_name).
  if auth.uid() is not null then
    select * into v_actor from public.profiles where id = auth.uid();
    if v_actor.id is not null then
      new.actor_id := v_actor.id;
      new.actor_name := coalesce(v_actor.first_name || ' ' || v_actor.last_name, 'Unknown');
      new.actor_role := v_actor.role::text;
    end if;
  end if;

  select entry_hash into v_prev_hash
    from public.admin_audit_logs
   order by created_at desc, id desc
   limit 1;

  new.prev_hash := v_prev_hash;
  new.entry_hash := encode(digest(
    coalesce(v_prev_hash, 'GENESIS') || '|' ||
    public.admin_audit_canonical(
      new.created_at, new.actor_id, new.actor_name, new.actor_role,
      new.action, new.target_type, new.target_id, new.target_label,
      new.status, new.metadata
    ),
    'sha256'), 'hex');

  return new;
end;
$$;

drop trigger if exists trg_admin_audit_chain on public.admin_audit_logs;
create trigger trg_admin_audit_chain
  before insert on public.admin_audit_logs
  for each row execute function public.admin_audit_chain();

alter table public.admin_audit_logs enable row level security;

-- Admins can read the compliance trail; inserts happen through the
-- security-definer RPC below (service role + backend); nothing can update
-- or delete.
drop policy if exists admin_audit_select on public.admin_audit_logs;
create policy admin_audit_select on public.admin_audit_logs
  for select to authenticated using (public.is_admin());

-- ─── RPC: record an administrative audit entry ────────────────────────────────
-- Called by the Express backend with the caller's Supabase JWT so actor
-- identity is derived server-side; safe to call from admin clients too.

create or replace function public.log_admin_action(
  p_action text,
  p_target_type text,
  p_target_id text default null,
  p_target_label text default null,
  p_status text default 'success',
  p_metadata jsonb default '{}'::jsonb,
  p_ip_address text default null,
  p_user_agent text default null
)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_id uuid;
  v_is_admin boolean;
begin
  select public.is_admin() into v_is_admin;
  if auth.uid() is not null and not v_is_admin then
    raise exception 'log_admin_action: only administrators may write the admin audit trail';
  end if;

  insert into public.admin_audit_logs (
    actor_id, actor_name, actor_role, action, target_type, target_id,
    target_label, status, metadata, ip_address, user_agent
  ) values (
    auth.uid(),
    coalesce((select p.first_name || ' ' || p.last_name from public.profiles p where p.id = auth.uid()), 'System'),
    coalesce((select p.role::text from public.profiles p where p.id = auth.uid()), 'system'),
    p_action, p_target_type, p_target_id, p_target_label, p_status,
    coalesce(p_metadata, '{}'::jsonb), p_ip_address, p_user_agent
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke execute on function public.log_admin_action(text, text, text, text, text, jsonb, text, text) from anon;
grant execute on function public.log_admin_action(text, text, text, text, text, jsonb, text, text) to authenticated, service_role;

-- ─── 3. AI interaction logs (prompt ↔ response pairs) ────────────────────────
-- One row per AI turn: the user prompt AND the generated response, with
-- provider attribution and feature routing. Structured for efficient
-- retrieval (feature + profile + created_at index) and admin review.

create table if not exists public.ai_interaction_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  profile_role public.user_role,
  feature text not null check (feature in ('chat', 'triage', 'clinical_cds', 'soap', 'sentinel')),
  conversation_id uuid references public.ai_conversations(id) on delete set null,
  prompt text not null,
  response text,
  provider text,
  model text,
  urgency text,
  flagged boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_ai_interactions_created on public.ai_interaction_logs(created_at desc);
create index if not exists idx_ai_interactions_profile on public.ai_interaction_logs(profile_id, created_at desc);
create index if not exists idx_ai_interactions_feature on public.ai_interaction_logs(feature, created_at desc);

alter table public.ai_interaction_logs enable row level security;

-- Owner sees own interactions; admins review all (compliance surface).
drop policy if exists ai_interactions_select on public.ai_interaction_logs;
create policy ai_interactions_select on public.ai_interaction_logs
  for select to authenticated
  using (profile_id = auth.uid() or public.is_admin());

-- Inserts go through the security-definer RPC below (backend service role);
-- users cannot forge logs for other profiles.
create or replace function public.log_ai_interaction(
  p_profile_id uuid,
  p_profile_role public.user_role,
  p_feature text,
  p_prompt text,
  p_response text,
  p_provider text default null,
  p_model text default null,
  p_urgency text default null,
  p_flagged boolean default false,
  p_conversation_id uuid default null
)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_profile_id is null or p_feature is null or p_prompt is null then
    raise exception 'log_ai_interaction: profile, feature and prompt are required';
  end if;

  insert into public.ai_interaction_logs (
    profile_id, profile_role, feature, conversation_id, prompt, response,
    provider, model, urgency, flagged
  ) values (
    p_profile_id, p_profile_role, p_feature, p_conversation_id,
    left(p_prompt, 20000), left(p_response, 20000),
    p_provider, p_model, p_urgency, p_flagged
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke execute on function public.log_ai_interaction(uuid, public.user_role, text, text, text, text, text, text, boolean, uuid) from anon, authenticated;
grant execute on function public.log_ai_interaction(uuid, public.user_role, text, text, text, text, text, text, boolean, uuid) to service_role;

-- ─── 4. Broadcast Center (desktop → universal delivery) ──────────────────────
-- Admin-composed messages targeted at an audience. Dispatch writes one row
-- per recipient profile into notifications (fan-out) and the Express layer
-- pushes a realtime event so every connected desktop/admin client renders
-- the broadcast instantly without refresh.

create table if not exists public.broadcast_messages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  type text not null default 'announcement' check (type in ('announcement', 'reminder', 'alert', 'system')),
  target_audience text not null default 'all' check (target_audience in ('all', 'doctors', 'patients', 'staff')),
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'sent')),
  created_by uuid references public.profiles(id) on delete set null,
  recipient_count int not null default 0,
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_broadcasts_status on public.broadcast_messages(status, created_at desc);
create index if not exists idx_broadcasts_audience on public.broadcast_messages(target_audience, status);

alter table public.broadcast_messages enable row level security;

drop policy if exists broadcasts_select on public.broadcast_messages;
create policy broadcasts_select on public.broadcast_messages
  for select to authenticated using (true);

drop policy if exists broadcasts_admin_write on public.broadcast_messages;
create policy broadcasts_admin_write on public.broadcast_messages
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop trigger if exists trg_broadcasts_updated_at on public.broadcast_messages;
create trigger trg_broadcasts_updated_at before update on public.broadcast_messages
  for each row execute function public.set_updated_at();

-- Track per-recipient delivery state for universal distribution accounting.
alter table public.notifications
  add column if not exists broadcast_id uuid
    references public.broadcast_messages(id) on delete cascade;

create index if not exists idx_notifications_broadcast on public.notifications(broadcast_id);

-- ─── RPC: dispatch a broadcast ────────────────────────────────────────────────
-- Fan-out into notifications for every matching active profile, then mark
-- the broadcast sent. Runs as SECURITY DEFINER; only admins may call it.

create or replace function public.dispatch_broadcast(p_broadcast_id uuid)
returns json
language plpgsql
security definer set search_path = public
as $$
declare
  v_broadcast public.broadcast_messages%rowtype;
  v_count int;
begin
  if auth.uid() is not null and not public.is_admin() then
    raise exception 'dispatch_broadcast: administrators only';
  end if;

  select * into v_broadcast from public.broadcast_messages
   where id = p_broadcast_id for update;
  if v_broadcast.id is null then
    return json_build_object('ok', false, 'error', 'broadcast_not_found');
  end if;

  if v_broadcast.status = 'sent' then
    return json_build_object('ok', false, 'error', 'already_sent');
  end if;

  insert into public.notifications (profile_id, type, title, body, broadcast_id)
  select p.id,
         case v_broadcast.type
           when 'alert' then 'general'
           when 'system' then 'general'
           when 'reminder' then 'appointment_reminder'
           else 'general'
         end,
         v_broadcast.title,
         v_broadcast.body,
         v_broadcast.id
    from public.profiles p
   where p.is_active = true
     and p.verification_status <> 'suspended'
     and p.role <> 'admin'
     and (
       v_broadcast.target_audience = 'all'
       or (v_broadcast.target_audience = 'doctors' and p.role = 'doctor')
       or (v_broadcast.target_audience = 'patients' and p.role = 'patient')
       or (v_broadcast.target_audience = 'staff' and p.role in (
         'hospital_admin', 'nurse', 'receptionist', 'blood_officer', 'pharmacist', 'lab_technician'
       ))
     );

  get diagnostics v_count = row_count;

  update public.broadcast_messages
     set status = 'sent', sent_at = now(), recipient_count = v_count
   where id = p_broadcast_id;

  return json_build_object('ok', true, 'recipients', v_count, 'broadcastId', p_broadcast_id);
end;
$$;

revoke execute on function public.dispatch_broadcast(uuid) from anon, authenticated;
grant execute on function public.dispatch_broadcast(uuid) to service_role;

commit;
