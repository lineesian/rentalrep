-- ============================================================
-- RentalRep — Initial Schema
-- Run this in your Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================

-- ── Profiles (extends auth.users) ──────────────────────────
create table public.profiles (
  id           uuid primary key references auth.users on delete cascade,
  full_name    text not null,
  phone        text,
  role         text not null check (role in ('tenant', 'landlord', 'agency')),
  suburb       text,
  city         text default 'Johannesburg',
  id_number    text,
  verified     boolean not null default false,
  avatar_url   text,
  bio          text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view all profiles"
  on public.profiles for select using (true);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- Auto-create a profile stub on sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    coalesce(new.raw_user_meta_data->>'role', 'tenant')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ── Leases ──────────────────────────────────────────────────
create table public.leases (
  id               uuid primary key default gen_random_uuid(),
  landlord_id      uuid not null references public.profiles(id),
  tenant_id        uuid not null references public.profiles(id),
  property_address text not null,
  suburb           text,
  start_date       date not null,
  end_date         date,
  document_url     text,
  verified         boolean not null default false,
  created_at       timestamptz not null default now()
);

alter table public.leases enable row level security;

create policy "Lease parties and agencies can view leases"
  on public.leases for select
  using (
    auth.uid() = landlord_id or
    auth.uid() = tenant_id or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'agency')
  );

create policy "Tenants can insert leases"
  on public.leases for insert
  with check (auth.uid() = tenant_id);


-- ── Reviews ─────────────────────────────────────────────────
create table public.reviews (
  id               uuid primary key default gen_random_uuid(),
  reviewer_id      uuid not null references public.profiles(id),
  reviewee_id      uuid not null references public.profiles(id),
  lease_id         uuid not null references public.leases(id),
  -- Shared categories
  overall          smallint not null check (overall between 1 and 5),
  communication    smallint not null check (communication between 1 and 5),
  fairness         smallint not null check (fairness between 1 and 5),
  -- Landlord-specific
  maintenance      smallint check (maintenance between 1 and 5),
  deposit_handling smallint check (deposit_handling between 1 and 5),
  -- Tenant-specific
  payment_history  smallint check (payment_history between 1 and 5),
  property_care    smallint check (property_care between 1 and 5),
  body             text not null check (char_length(body) >= 500),
  reply            text,
  created_at       timestamptz not null default now(),
  -- One review per lease per direction
  unique (reviewer_id, reviewee_id, lease_id)
);

alter table public.reviews enable row level security;

create policy "Anyone can read reviews"
  on public.reviews for select using (true);

create policy "Authenticated users can write reviews"
  on public.reviews for insert
  with check (auth.uid() = reviewer_id);

create policy "Reviewee can update reply field only"
  on public.reviews for update
  using (auth.uid() = reviewee_id);


-- ── Reputation Scores (computed view) ───────────────────────
create or replace view public.reputation_scores as
select
  reviewee_id                                     as profile_id,
  round(avg(overall) * 2, 1)                     as overall,
  round(avg(communication) * 2, 1)               as communication,
  round(avg(coalesce(maintenance,0))
    filter (where maintenance is not null) * 2, 1) as maintenance,
  round(avg(coalesce(deposit_handling,0))
    filter (where deposit_handling is not null) * 2, 1) as deposit_handling,
  round(avg(fairness) * 2, 1)                    as fairness,
  round(avg(coalesce(payment_history,0))
    filter (where payment_history is not null) * 2, 1) as payment_history,
  round(avg(coalesce(property_care,0))
    filter (where property_care is not null) * 2, 1)   as property_care,
  count(*)::int                                   as review_count
from public.reviews
group by reviewee_id;


-- ── Storage bucket for lease documents ──────────────────────
insert into storage.buckets (id, name, public)
values ('leases', 'leases', false)
on conflict do nothing;

create policy "Lease parties can upload documents"
  on storage.objects for insert
  with check (bucket_id = 'leases' and auth.role() = 'authenticated');

create policy "Lease parties can view documents"
  on storage.objects for select
  using (bucket_id = 'leases' and auth.role() = 'authenticated');
