-- ═══════════════════════════════════════════════════════════════════════════
-- OMINIPULSE UNIFIED BACKEND — 0004_ai_engine.sql
--
-- AI engine support tables for the Express backend:
--   • ai_conversations — one row per user conversation (chat / triage)
--   • ai_messages     — transcript rows with provider attribution
--   • ai_usage        — per-call usage metering for caps + cost tracking
--   • ai_count_usage_today(p_user_id) — daily cap helper (revokable)
--
-- Run order: 0001 → 0002 → 0003 → 0004 → seed.sql
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── AI CONVERSATIONS ────────────────────────────────────────────────────────

create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  feature text not null default 'chat'
    check (feature in ('chat', 'clinical_cds', 'soap', 'triage')),
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ai_conv_profile on public.ai_conversations(profile_id, updated_at desc);

-- ─── AI MESSAGES ─────────────────────────────────────────────────────────────

create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  provider text,
  model text,
  created_at timestamptz not null default now()
);

create index if not exists idx_ai_msg_conv on public.ai_messages(conversation_id, created_at);

-- ─── AI USAGE (metering + cost control) ──────────────────────────────────────

create table if not exists public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  feature text not null check (feature in ('chat', 'clinical_cds', 'soap', 'triage', 'sentinel')),
  provider text not null,
  model text not null,
  prompt_tokens int not null default 0,
  completion_tokens int not null default 0,
  flagged boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_ai_usage_profile on public.ai_usage(profile_id, created_at desc);

-- ─── Daily usage helper (used by the Express daily-cap middleware) ───────────

create or replace function public.ai_count_usage_today(p_user_id uuid)
returns int
language sql
stable
security definer set search_path = public
as $$
  select count(*)::int
    from public.ai_usage
   where profile_id = p_user_id
     and created_at >= date_trunc('day', now());
$$;

-- ─── RLS ─────────────────────────────────────────────────────────────────────

alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.ai_usage enable row level security;

-- Conversations: owner-only; admins can review for safety/abuse investigations.
drop policy if exists ai_conv_select on public.ai_conversations;
create policy ai_conv_select on public.ai_conversations
  for select using (
    auth.uid() = profile_id
    or public.is_admin()
  );

drop policy if exists ai_conv_insert on public.ai_conversations;
create policy ai_conv_insert on public.ai_conversations
  for insert with check (auth.uid() = profile_id);

drop policy if exists ai_conv_update on public.ai_conversations;
create policy ai_conv_update on public.ai_conversations
  for update using (auth.uid() = profile_id);

-- Messages: readable through an owned conversation.
drop policy if exists ai_msg_select on public.ai_messages;
create policy ai_msg_select on public.ai_messages
  for select using (
    exists (
      select 1 from public.ai_conversations c
       where c.id = conversation_id
         and (c.profile_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists ai_msg_insert on public.ai_messages;
create policy ai_msg_insert on public.ai_messages
  for insert with check (
    exists (
      select 1 from public.ai_conversations c
       where c.id = conversation_id
         and c.profile_id = auth.uid()
    )
  );

-- Usage: owner + platform admins (cost dashboards).
drop policy if exists ai_usage_select on public.ai_usage;
create policy ai_usage_select on public.ai_usage
  for select using (auth.uid() = profile_id or public.is_admin());

drop policy if exists ai_usage_insert on public.ai_usage;
create policy ai_usage_insert on public.ai_usage
  for insert with check (auth.uid() = profile_id or public.is_admin());

-- ─── updated_at trigger for conversations ────────────────────────────────────

drop trigger if exists trg_ai_conv_updated_at on public.ai_conversations;
create trigger trg_ai_conv_updated_at before update on public.ai_conversations
  for each row execute function public.set_updated_at();
