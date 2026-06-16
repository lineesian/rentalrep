-- ── New review rating columns ────────────────────────────────────────────────

-- Tenant review categories (landlord rates tenant)
alter table public.reviews add column if not exists compliance_with_lease smallint check (compliance_with_lease between 1 and 5);
alter table public.reviews add column if not exists vacating_conduct      smallint check (vacating_conduct      between 1 and 5);
alter table public.reviews add column if not exists neighbour_relations   smallint check (neighbour_relations   between 1 and 5);

-- Agent review category (individual letting agent)
alter table public.reviews add column if not exists problem_resolution    smallint check (problem_resolution    between 1 and 5);

-- Property review categories
alter table public.reviews add column if not exists condition_on_movein  smallint check (condition_on_movein  between 1 and 5);
alter table public.reviews add column if not exists safety_security       smallint check (safety_security       between 1 and 5);
alter table public.reviews add column if not exists noise_levels          smallint check (noise_levels          between 1 and 5);
alter table public.reviews add column if not exists location_amenities    smallint check (location_amenities    between 1 and 5);

-- ── Properties table ─────────────────────────────────────────────────────────

create table if not exists public.properties (
  id                 uuid primary key default gen_random_uuid(),
  address            text not null,
  normalized_address text not null,
  suburb             text,
  city               text,
  created_at         timestamptz not null default now()
);

create unique index if not exists properties_normalized_address_idx
  on public.properties (normalized_address);

alter table public.properties enable row level security;

create policy "Anyone can view properties"
  on public.properties for select using (true);

create policy "Authenticated users can insert properties"
  on public.properties for insert with check (auth.role() = 'authenticated');

-- Link reviews to properties (nullable — only set for property-type reviews)
alter table public.reviews add column if not exists property_id uuid references public.properties(id);

-- ── Agent role ────────────────────────────────────────────────────────────────

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add  constraint profiles_role_check
  check (role in ('tenant', 'landlord', 'agency', 'agent'));
