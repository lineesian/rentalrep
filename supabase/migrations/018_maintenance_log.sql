-- Maintenance Log: timestamped, evidence-backed maintenance requests,
-- feeding directly into the landlord's Maintenance & Responsiveness score.

create table if not exists public.maintenance_requests (
  id                    uuid primary key default gen_random_uuid(),
  tenant_id             uuid not null references auth.users(id),
  landlord_id           uuid references public.profiles(id),
  guest_landlord_name   text,
  guest_landlord_email  text,
  lease_id              uuid references public.leases(id),
  category              text not null
    check (category in ('plumbing','electrical','structural','appliance','security','other')),
  description           text not null,
  photo_url             text,
  logged_at             timestamptz not null default now(),
  acknowledged_at       timestamptz,
  resolved_at           timestamptz,
  resolution_photo_url  text,
  landlord_notes        text
);

alter table public.maintenance_requests add constraint maintenance_landlord_check
  check (landlord_id is not null or guest_landlord_name is not null);

alter table public.maintenance_requests enable row level security;

create policy "Tenants manage their own maintenance requests"
  on public.maintenance_requests for all
  using (auth.uid() = tenant_id) with check (auth.uid() = tenant_id);

create policy "Landlords can view requests logged against them"
  on public.maintenance_requests for select using (auth.uid() = landlord_id);

create policy "Landlords can acknowledge and add notes"
  on public.maintenance_requests for update using (auth.uid() = landlord_id);

create or replace view public.landlord_maintenance_score as
select
  landlord_id,
  count(*)::int as total_requests,
  count(*) filter (
    where resolved_at is null and logged_at < now() - interval '14 days'
  )::int as overdue_unresolved,
  count(*) filter (
    where acknowledged_at is null and logged_at < now() - interval '7 days'
  )::int as unacknowledged_late
from public.maintenance_requests
where landlord_id is not null
group by landlord_id;

grant select on public.landlord_maintenance_score to anon, authenticated;
