-- ════════════════════════════════════════════════════════════════
-- RentalRep — Comprehensive reviews table column audit
-- Safe to run regardless of which prior migrations were applied.
-- Every column the review submission payload can write is listed here.
-- ════════════════════════════════════════════════════════════════

-- ── Core identity & linking ───────────────────────────────────────
-- reviewer_id / reviewee_id / lease_id exist from migration 001 (NOT NULL),
-- but reviewee_id and lease_id must be nullable for guest & property flows.
alter table public.reviews alter column reviewee_id drop not null;
alter table public.reviews alter column lease_id    drop not null;

alter table public.reviews add column if not exists property_id    uuid references public.properties(id);
alter table public.reviews add column if not exists tenancy_key    text;
alter table public.reviews add column if not exists guest_name     text;
alter table public.reviews add column if not exists guest_email    text;
alter table public.reviews add column if not exists document_url   text;

-- ── Reveal / status system ────────────────────────────────────────
alter table public.reviews add column if not exists status text not null default 'pending_reveal'
  check (status in ('pending_reveal', 'published', 'expired'));

-- ── Direction metadata ────────────────────────────────────────────
alter table public.reviews add column if not exists reviewer_role text
  check (reviewer_role in ('tenant', 'landlord', 'agency', 'agent'));

alter table public.reviews add column if not exists reviewee_role text
  check (reviewee_role in ('tenant', 'landlord', 'agency', 'agent', 'property'));

-- ── Review meta ───────────────────────────────────────────────────
alter table public.reviews add column if not exists would_recommend text
  check (would_recommend in ('yes', 'no', 'maybe'));

alter table public.reviews add column if not exists anonymous boolean not null default false;

-- ── Shared / always-present scores ───────────────────────────────
-- communication and fairness have been NOT NULL since migration 001.
-- All other score columns are optional (smallint, nullable).

-- ── LANDLORD review categories ───────────────────────────────────
alter table public.reviews add column if not exists maintenance        smallint check (maintenance        between 1 and 5);
alter table public.reviews add column if not exists deposit_handling   smallint check (deposit_handling   between 1 and 5);
alter table public.reviews add column if not exists professionalism    smallint check (professionalism    between 1 and 5);
alter table public.reviews add column if not exists privacy_boundaries smallint check (privacy_boundaries between 1 and 5);

-- ── TENANT review categories ─────────────────────────────────────
alter table public.reviews add column if not exists payment_history       smallint check (payment_history       between 1 and 5);
alter table public.reviews add column if not exists property_care         smallint check (property_care         between 1 and 5);
alter table public.reviews add column if not exists compliance_with_lease smallint check (compliance_with_lease between 1 and 5);
alter table public.reviews add column if not exists vacating_conduct      smallint check (vacating_conduct      between 1 and 5);
alter table public.reviews add column if not exists neighbour_relations   smallint check (neighbour_relations   between 1 and 5);

-- ── AGENCY review categories ─────────────────────────────────────
alter table public.reviews add column if not exists transparency      smallint check (transparency      between 1 and 5);
alter table public.reviews add column if not exists value_for_money   smallint check (value_for_money   between 1 and 5);
alter table public.reviews add column if not exists paperwork_quality smallint check (paperwork_quality between 1 and 5);

-- ── AGENT review categories ──────────────────────────────────────
alter table public.reviews add column if not exists responsiveness    smallint check (responsiveness    between 1 and 5);
alter table public.reviews add column if not exists problem_resolution smallint check (problem_resolution between 1 and 5);

-- ── PROPERTY review categories ───────────────────────────────────
alter table public.reviews add column if not exists condition_on_movein smallint check (condition_on_movein between 1 and 5);
alter table public.reviews add column if not exists safety_security      smallint check (safety_security     between 1 and 5);
alter table public.reviews add column if not exists noise_levels         smallint check (noise_levels        between 1 and 5);
alter table public.reviews add column if not exists location_amenities   smallint check (location_amenities  between 1 and 5);

-- ── Body length constraint ────────────────────────────────────────
-- Lower minimum from 500 (original) to 100 characters.
alter table public.reviews drop constraint if exists reviews_body_check;
alter table public.reviews add  constraint reviews_body_check check (char_length(body) >= 100);

-- ── Guest-review constraint ───────────────────────────────────────
-- At least one of reviewee_id or guest_name must be present
-- (property reviews are exempt — both can be null).
alter table public.reviews drop constraint if exists reviews_reviewee_check;
alter table public.reviews add  constraint reviews_reviewee_check
  check (
    reviewee_id is not null
    or guest_name  is not null
    or property_id is not null   -- property reviews have neither a person nor a guest name
  );

-- ── Indexes ───────────────────────────────────────────────────────
create index if not exists reviews_tenancy_key_idx on public.reviews (tenancy_key)
  where tenancy_key is not null;

create index if not exists reviews_property_id_idx on public.reviews (property_id)
  where property_id is not null;

create index if not exists reviews_status_idx on public.reviews (status);

-- ── RLS — published reviews visible to all, reviewer sees own ────
drop policy if exists "Anyone can read reviews"             on public.reviews;
drop policy if exists "Published reviews are public"        on public.reviews;
drop policy if exists "Reviewers can see their own reviews" on public.reviews;

create policy "Published reviews are public"
  on public.reviews for select
  using (status in ('published', 'expired'));

create policy "Reviewers can see their own reviews"
  on public.reviews for select
  using (reviewer_id = auth.uid());

-- ── Reputation scores view — only count published reviews ─────────
create or replace view public.reputation_scores as
select
  reviewee_id                                                                    as profile_id,
  round(avg(overall) * 2, 1)                                                    as overall,
  round(avg(communication) * 2, 1)                                              as communication,
  round(avg(coalesce(maintenance,0))       filter (where maintenance       is not null) * 2, 1) as maintenance,
  round(avg(coalesce(deposit_handling,0))  filter (where deposit_handling  is not null) * 2, 1) as deposit_handling,
  round(avg(fairness) * 2, 1)                                                   as fairness,
  round(avg(coalesce(payment_history,0))   filter (where payment_history   is not null) * 2, 1) as payment_history,
  round(avg(coalesce(property_care,0))     filter (where property_care     is not null) * 2, 1) as property_care,
  count(*)::int                                                                  as review_count
from public.reviews
where status      in ('published', 'expired')
  and reviewee_id is not null
group by reviewee_id;

grant select on public.reputation_scores to anon, authenticated;

-- ── Backfill: all pre-existing reviews are already public ─────────
update public.reviews
set status = 'published'
where status = 'pending_reveal'
  and created_at < now() - interval '1 second';
