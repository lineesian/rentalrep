-- Clause Warnings: lets a reviewer flag specific risky lease clauses on a
-- property or landlord review, using the same categories as Lease Check.
-- These ride on the existing verified review system rather than being a
-- standalone unverified public post, so they inherit the same trust model.

create table if not exists public.review_clause_flags (
  id                   uuid primary key default gen_random_uuid(),
  review_id            uuid not null references public.reviews(id) on delete cascade,
  flag_type            text not null check (flag_type in (
                         'reletting_fee', 'excessive_notice', 'deposit_overreach',
                         'maintenance_waiver', 'auto_renewal', 'rent_increase', 'other')),
  note                 text,
  lease_check_flag_id  uuid references public.lease_check_flags(id),
  created_at           timestamptz not null default now()
);

alter table public.review_clause_flags enable row level security;

create policy "Reviewers can insert clause flags on their own review"
  on public.review_clause_flags for insert
  with check (
    exists (select 1 from public.reviews r where r.id = review_id and r.reviewer_id = auth.uid())
  );

create policy "Reviewers can view clause flags on their own review"
  on public.review_clause_flags for select
  using (
    exists (select 1 from public.reviews r where r.id = review_id and r.reviewer_id = auth.uid())
  );

create index if not exists review_clause_flags_review_id_idx on public.review_clause_flags (review_id);

-- Public read surface: only flags attached to a published review, joined
-- through to the review's property_id / reviewee_id so a property or
-- landlord page can filter to just its own warnings. Same pattern as
-- landlord_deposit_health and reputation_scores.
create or replace view public.review_clause_warnings as
select
  rcf.id,
  rcf.review_id,
  rcf.flag_type,
  rcf.note,
  r.property_id,
  r.reviewee_id,
  r.created_at
from public.review_clause_flags rcf
join public.reviews r on r.id = rcf.review_id
where r.status in ('published', 'expired');

grant select on public.review_clause_warnings to anon, authenticated;
