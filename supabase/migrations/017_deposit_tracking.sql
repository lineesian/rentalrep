-- Deposit Tracker: lets a tenant log a deposit and its outcome,
-- even if the landlord has no RentalRep account yet.

create table if not exists public.deposits (
  id                   uuid primary key default gen_random_uuid(),
  tenant_id            uuid not null references auth.users(id),
  landlord_id          uuid references public.profiles(id),
  guest_landlord_name  text,
  guest_landlord_email text,
  lease_id             uuid references public.leases(id),
  property_address     text not null,
  amount               numeric(10,2) not null,
  bank_name            text,
  is_interest_bearing  boolean not null default false,
  status               text not null default 'held'
    check (status in ('held', 'returned_full', 'returned_partial', 'withheld', 'disputed')),
  amount_returned      numeric(10,2),
  amount_withheld      numeric(10,2),
  deduction_reason     text,
  evidence_url         text,
  created_at           timestamptz not null default now(),
  resolved_at          timestamptz
);

alter table public.deposits add constraint deposits_landlord_check
  check (landlord_id is not null or guest_landlord_name is not null);

alter table public.deposits enable row level security;

create policy "Tenants can insert their own deposit record"
  on public.deposits for insert
  with check (auth.uid() = tenant_id);

create policy "Tenants can view their own deposit record"
  on public.deposits for select using (auth.uid() = tenant_id);

create policy "Tenants can update their own deposit record"
  on public.deposits for update using (auth.uid() = tenant_id);

create policy "Landlords can view deposits logged against them"
  on public.deposits for select using (auth.uid() = landlord_id);

create or replace view public.landlord_deposit_health as
select
  landlord_id,
  count(*)::int as deposit_count,
  round(100.0 * count(*) filter (where status = 'returned_full') / count(*), 0) as pct_returned_full,
  round(100.0 * count(*) filter (where is_interest_bearing) / count(*), 0) as pct_interest_bearing
from public.deposits
where landlord_id is not null
group by landlord_id;

grant select on public.landlord_deposit_health to anon, authenticated;
