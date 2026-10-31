-- Looking to Rent board: score-gated tenant self-listings.
-- Only tenants with a verified reputation score >= 7.0 may post.

create table public.looking_to_rent (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.profiles(id) on delete cascade,
  areas          text[]    not null,        -- suburbs / cities of interest
  budget_min     int       not null,        -- ZAR per month
  budget_max     int       not null,
  move_in_from   date      not null,
  description    text      not null check (char_length(description) between 50 and 500),
  active         boolean   not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint ltr_budget_order check (budget_max >= budget_min),
  constraint ltr_one_active_per_tenant unique (tenant_id) -- only one active listing per tenant (partial via where clause)
);

alter table public.looking_to_rent enable row level security;

-- Public read of active listings
create policy "Public read active listings"
  on public.looking_to_rent
  for select
  using (active = true);

-- Owners can manage their own listing
create policy "Tenant manages own listing"
  on public.looking_to_rent
  for all
  using  (auth.uid() = tenant_id)
  with check (auth.uid() = tenant_id);

-- Trigger: update updated_at on changes
create or replace function public.set_ltr_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger ltr_updated_at
  before update on public.looking_to_rent
  for each row execute function public.set_ltr_updated_at();
