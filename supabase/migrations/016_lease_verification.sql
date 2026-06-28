-- 016_lease_verification.sql
-- Private lease verification store for agency-uploaded historical records.
-- Run manually in Supabase SQL Editor.

-- ── private_lease_records ─────────────────────────────────────────────────────
-- Upload-only store. Never exposed to public API routes or client queries.
-- Used exclusively by the service-role verifyTenancy() function.

create table if not exists public.private_lease_records (
  id                    uuid        primary key default gen_random_uuid(),
  uploaded_by_agency_id uuid        not null references public.profiles(id) on delete cascade,
  tenant_full_name      text        not null,
  landlord_full_name    text        not null,
  property_address      text        not null,
  lease_start_date      date        not null,
  lease_end_date        date        not null,
  created_at            timestamptz not null default now(),
  expires_at            timestamptz,          -- 3 years from upload, for auto-deletion
  matched               boolean     not null default false
);

-- Index to help the service-role verification query
create index if not exists private_lease_records_names_idx
  on public.private_lease_records (
    lower(tenant_full_name),
    lower(landlord_full_name)
  );

create index if not exists private_lease_records_expires_idx
  on public.private_lease_records (expires_at)
  where expires_at is not null;

-- ── RLS ───────────────────────────────────────────────────────────────────────

alter table public.private_lease_records enable row level security;

-- Agencies may INSERT their own records only
create policy "Agencies can insert lease records"
  on public.private_lease_records for insert
  with check (
    auth.uid() = uploaded_by_agency_id
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'agency'
    )
  );

-- No SELECT, UPDATE, or DELETE for any authenticated or anonymous role.
-- The service_role key bypasses RLS entirely and is used for verification reads.

-- ── verified_tenancy on reviews ───────────────────────────────────────────────

alter table public.reviews
  add column if not exists verified_tenancy boolean not null default false;
