-- Lease Check: lets a tenant upload a draft lease before signing
-- and get risky clauses flagged in plain language. No landlord_id,
-- this happens before any tenancy relationship exists.

create table if not exists public.lease_checks (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id),
  document_url     text not null,
  extracted_text   text,
  status           text not null default 'processing'
    check (status in ('processing', 'completed', 'failed')),
  created_at       timestamptz not null default now(),
  completed_at     timestamptz
);

create table if not exists public.lease_check_flags (
  id               uuid primary key default gen_random_uuid(),
  lease_check_id   uuid not null references public.lease_checks(id) on delete cascade,
  clause_excerpt   text not null,
  flag_type        text not null check (flag_type in (
    'reletting_fee', 'excessive_notice', 'deposit_overreach',
    'maintenance_waiver', 'auto_renewal', 'rent_increase', 'other'
  )),
  risk_level       text not null check (risk_level in ('low', 'medium', 'high')),
  explanation      text not null
);

alter table public.lease_checks enable row level security;
alter table public.lease_check_flags enable row level security;

create policy "Users manage their own lease checks"
  on public.lease_checks for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can view flags on their own lease checks"
  on public.lease_check_flags for select
  using (exists (
    select 1 from public.lease_checks
    where lease_checks.id = lease_check_flags.lease_check_id
      and lease_checks.user_id = auth.uid()
  ));
