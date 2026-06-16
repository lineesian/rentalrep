-- ── Extend reviews table for new rating categories ──────────
alter table public.reviews add column if not exists professionalism   smallint check (professionalism   between 1 and 5);
alter table public.reviews add column if not exists transparency      smallint check (transparency      between 1 and 5);
alter table public.reviews add column if not exists value_for_money   smallint check (value_for_money   between 1 and 5);
alter table public.reviews add column if not exists responsiveness    smallint check (responsiveness    between 1 and 5);
alter table public.reviews add column if not exists paperwork_quality smallint check (paperwork_quality between 1 and 5);
alter table public.reviews add column if not exists privacy_boundaries smallint check (privacy_boundaries between 1 and 5);

-- Meta fields
alter table public.reviews add column if not exists would_recommend text check (would_recommend in ('yes', 'no', 'maybe'));
alter table public.reviews add column if not exists anonymous boolean not null default false;

-- Lower body minimum from 500 → 100 characters
alter table public.reviews drop constraint if exists reviews_body_check;
alter table public.reviews add constraint reviews_body_check check (char_length(body) >= 100);

-- Allow landlords to insert leases (they can be reviewee)
drop policy if exists "Tenants can insert leases" on public.leases;
create policy "Authenticated users can insert leases"
  on public.leases for insert
  with check (auth.role() = 'authenticated');
