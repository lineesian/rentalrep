-- ════════════════════════════════════════════════════════════════
-- RentalRep — Simultaneous Reveal System
-- ════════════════════════════════════════════════════════════════

-- ── 1. Add status + tenancy_key to reviews ───────────────────────

alter table public.reviews
  add column if not exists status text not null default 'pending_reveal'
    check (status in ('pending_reveal', 'published', 'expired'));

-- tenancy_key: canonical key linking both sides of the same tenancy.
-- Format: sort(reviewer_id, reviewee_id).join(':') + ':' + normalize(address)
-- NULL for property-only reviews (no counterpart exists).
alter table public.reviews
  add column if not exists tenancy_key text;

create index if not exists reviews_tenancy_key_idx on public.reviews (tenancy_key)
  where tenancy_key is not null;

-- Backfill: all reviews that existed before this feature are already public.
update public.reviews set status = 'published' where true;

-- ── 2. Update RLS — only show published/expired reviews publicly ──

drop policy if exists "Anyone can read reviews" on public.reviews;

-- Authenticated users can always see reviews they wrote.
create policy "Reviewers can see their own reviews"
  on public.reviews for select
  using (reviewer_id = auth.uid());

-- Published and expired reviews are public.
create policy "Published reviews are public"
  on public.reviews for select
  using (status in ('published', 'expired'));

-- ── 3. Update reputation_scores view to exclude pending reviews ───

create or replace view public.reputation_scores as
select
  reviewee_id                                                               as profile_id,
  round(avg(overall) * 2, 1)                                               as overall,
  round(avg(communication) * 2, 1)                                         as communication,
  round(avg(coalesce(maintenance,0))
    filter (where maintenance is not null) * 2, 1)                         as maintenance,
  round(avg(coalesce(deposit_handling,0))
    filter (where deposit_handling is not null) * 2, 1)                    as deposit_handling,
  round(avg(fairness) * 2, 1)                                              as fairness,
  round(avg(coalesce(payment_history,0))
    filter (where payment_history is not null) * 2, 1)                     as payment_history,
  round(avg(coalesce(property_care,0))
    filter (where property_care is not null) * 2, 1)                       as property_care,
  count(*)::int                                                             as review_count
from public.reviews
where status in ('published', 'expired')
  and reviewee_id is not null
group by reviewee_id;

grant select on public.reputation_scores to anon, authenticated;

-- ── 4. check_and_publish_review ─────────────────────────────────
-- Called from the app immediately after a review is inserted.
-- Publishes a review pair when both sides have submitted,
-- or publishes immediately if no tenancy_key (property reviews).

create or replace function public.check_and_publish_review(p_review_id uuid)
returns text   -- returns 'published_pair' | 'pending' | 'published_solo'
language plpgsql security definer
set search_path = public
as $$
declare
  v_tenancy_key  text;
  v_counterpart  uuid;
begin
  select tenancy_key into v_tenancy_key
  from public.reviews
  where id = p_review_id;

  -- No tenancy key → property review or solo type → publish immediately
  if v_tenancy_key is null then
    update public.reviews set status = 'published' where id = p_review_id;
    return 'published_solo';
  end if;

  -- Look for a counterpart review with the same tenancy key
  select id into v_counterpart
  from public.reviews
  where tenancy_key = v_tenancy_key
    and id            != p_review_id
    and status         = 'pending_reveal'
  limit 1;

  if v_counterpart is not null then
    -- Both sides submitted — reveal simultaneously
    update public.reviews
    set status = 'published'
    where id in (p_review_id, v_counterpart);
    return 'published_pair';
  end if;

  return 'pending';
end;
$$;

revoke execute on function public.check_and_publish_review(uuid) from public;
grant  execute on function public.check_and_publish_review(uuid) to authenticated;

-- ── 5. check_and_publish_reviews ────────────────────────────────
-- Cron / nightly sweep.
-- Publishes any pending review older than 90 days (status → 'expired').
-- Also catches any pairs that slipped through.

create or replace function public.check_and_publish_reviews()
returns integer   -- number of reviews updated
language plpgsql security definer
set search_path = public
as $$
declare
  v_pairs  integer;
  v_expired integer;
begin
  -- Count matched pairs before updating
  select count(*) into v_pairs
  from public.reviews r1
  where r1.status = 'pending_reveal'
    and r1.tenancy_key is not null
    and exists (
      select 1 from public.reviews r2
      where r2.tenancy_key = r1.tenancy_key
        and r2.id          != r1.id
        and r2.status       = 'pending_reveal'
    );

  -- Publish matched pairs
  if v_pairs > 0 then
    update public.reviews r
    set status = 'published'
    where r.status = 'pending_reveal'
      and r.tenancy_key is not null
      and exists (
        select 1 from public.reviews r2
        where r2.tenancy_key = r.tenancy_key
          and r2.id          != r.id
          and r2.status       = 'pending_reveal'
      );
  end if;

  -- Count solo reviews older than 90 days before updating
  select count(*) into v_expired
  from public.reviews
  where status     = 'pending_reveal'
    and created_at < now() - interval '90 days';

  -- Auto-expire solo reviews older than 90 days
  if v_expired > 0 then
    update public.reviews
    set status = 'expired'
    where status     = 'pending_reveal'
      and created_at < now() - interval '90 days';
  end if;

  return v_pairs + v_expired;
end;
$$;

-- Only callable by service_role (cron endpoint uses the service key)
revoke execute on function public.check_and_publish_reviews() from public;
revoke execute on function public.check_and_publish_reviews() from authenticated;
grant  execute on function public.check_and_publish_reviews() to service_role;

-- ── 6. get_pending_review_info ───────────────────────────────────
-- Security-definer: lets a user see THAT they have pending reviews
-- (property address + age) WITHOUT seeing the reviewer or content.

create or replace function public.get_pending_review_info(p_user_id uuid)
returns table (
  review_id        uuid,
  property_address text,
  days_remaining   integer,
  submitted_at     timestamptz
)
language sql security definer
set search_path = public
as $$
  select
    r.id                                                        as review_id,
    coalesce(l.property_address, 'Unknown property')           as property_address,
    greatest(0, 90 - extract(day from now() - r.created_at)::int) as days_remaining,
    r.created_at                                               as submitted_at
  from public.reviews r
  left join public.leases l on l.id = r.lease_id
  where r.reviewee_id = p_user_id
    and r.status      = 'pending_reveal'
  order by r.created_at desc;
$$;

revoke execute on function public.get_pending_review_info(uuid) from public;
grant  execute on function public.get_pending_review_info(uuid) to authenticated;
