-- Rental Market Insights: anonymised aggregate views for the public dashboard.
-- All views are owned by postgres (superuser) so they bypass RLS on the underlying tables,
-- and are granted to anon so the public page can read them.

-- 1. Suburb-level landlord scores (from published reviews of landlords)
create or replace view public.v_suburb_landlord_scores as
select
  p.suburb,
  p.city,
  count(r.id)::int                                    as review_count,
  round(avg(r.overall)::numeric, 1)                  as avg_overall,
  round(avg(r.maintenance)::numeric, 1)              as avg_maintenance,
  round(avg(r.deposit_handling)::numeric, 1)         as avg_deposit_handling,
  round(avg(r.communication)::numeric, 1)            as avg_communication
from public.reviews r
join public.profiles p on p.id = r.reviewee_id
where r.reviewee_role = 'landlord'
  and r.status in ('published', 'expired')
  and p.suburb is not null
group by p.suburb, p.city
having count(r.id) >= 3
order by avg_overall desc;

grant select on public.v_suburb_landlord_scores to anon, authenticated;

-- 2. Suburb-level deposit return rates
create or replace view public.v_suburb_deposit_stats as
select
  p.suburb,
  p.city,
  count(d.id)::int                                                                       as deposit_count,
  round(100.0 * count(d.id) filter (where d.status = 'returned_full') / count(d.id), 0) as pct_returned_full,
  round(100.0 * count(d.id) filter (where d.is_interest_bearing) / count(d.id), 0)     as pct_interest_bearing,
  round(avg(d.amount)::numeric, 0)                                                       as avg_deposit_amount
from public.deposits d
join public.profiles p on p.id = d.landlord_id
where p.suburb is not null
group by p.suburb, p.city
having count(d.id) >= 3
order by pct_returned_full desc;

grant select on public.v_suburb_deposit_stats to anon, authenticated;

-- 3. Most active areas by review count
create or replace view public.v_suburb_activity as
select
  coalesce(p.suburb, 'Unknown')    as suburb,
  coalesce(p.city, 'South Africa') as city,
  count(r.id)::int                 as review_count,
  count(distinct r.reviewer_id)::int as reviewer_count,
  count(distinct r.reviewee_id)::int as reviewee_count,
  max(r.created_at)                as last_review_at
from public.reviews r
join public.profiles p on p.id = r.reviewee_id
where r.status in ('published', 'expired')
  and p.suburb is not null
group by p.suburb, p.city
order by review_count desc;

grant select on public.v_suburb_activity to anon, authenticated;

-- 4. Maintenance resolution times by suburb
create or replace view public.v_suburb_maintenance_stats as
select
  p.suburb,
  p.city,
  count(m.id)::int                                                                           as request_count,
  count(m.id) filter (where m.resolved_at is not null)::int                                as resolved_count,
  round(
    avg(extract(epoch from (m.resolved_at - m.logged_at)) / 3600)
    filter (where m.resolved_at is not null)::numeric,
    0
  )                                                                                          as avg_hours_to_resolve,
  round(
    100.0 * count(m.id) filter (where m.resolved_at is not null) / count(m.id), 0
  )                                                                                          as pct_resolved
from public.maintenance_requests m
join public.profiles p on p.id = m.landlord_id
where p.suburb is not null
group by p.suburb, p.city
having count(m.id) >= 3
order by avg_hours_to_resolve asc nulls last;

grant select on public.v_suburb_maintenance_stats to anon, authenticated;

-- 5. Platform-wide summary counters (single-row view)
create or replace view public.v_platform_summary as
select
  (select count(*) from public.profiles where not is_guest)::int    as total_users,
  (select count(*) from public.reviews where status in ('published','expired'))::int as total_reviews,
  (select count(*) from public.deposits)::int                        as total_deposits,
  (select count(*) from public.maintenance_requests)::int            as total_maintenance_requests,
  (select count(distinct coalesce(suburb,'')) from public.profiles where suburb is not null)::int as suburbs_covered;

grant select on public.v_platform_summary to anon, authenticated;
