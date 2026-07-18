-- Move-in Condition Report: timestamped, room-by-room evidence of a
-- property's condition at move-in, used later to dispute unfair
-- deposit deductions. Same nullable-landlord-plus-guest pattern as
-- deposits and maintenance_requests.

create table if not exists public.move_in_reports (
  id                       uuid primary key default gen_random_uuid(),
  tenant_id                uuid not null references auth.users(id),
  landlord_id              uuid references public.profiles(id),
  guest_landlord_name      text,
  guest_landlord_email     text,
  lease_id                 uuid references public.leases(id),
  property_address         text not null,
  created_at               timestamptz not null default now(),
  landlord_acknowledged_at timestamptz
);

alter table public.move_in_reports add constraint move_in_landlord_check
  check (landlord_id is not null or guest_landlord_name is not null);

create table if not exists public.move_in_report_photos (
  id                uuid primary key default gen_random_uuid(),
  move_in_report_id uuid not null references public.move_in_reports(id) on delete cascade,
  room_label        text not null,
  photo_url         text not null,
  caption           text,
  taken_at          timestamptz not null default now()
);

alter table public.move_in_reports enable row level security;
alter table public.move_in_report_photos enable row level security;

create policy "Tenants manage their own move-in reports"
  on public.move_in_reports for all
  using (auth.uid() = tenant_id) with check (auth.uid() = tenant_id);

create policy "Landlords can view and acknowledge reports about them"
  on public.move_in_reports for select using (auth.uid() = landlord_id);

create policy "Landlords can acknowledge reports"
  on public.move_in_reports for update using (auth.uid() = landlord_id);

create policy "Tenants manage photos on their own reports"
  on public.move_in_report_photos for all
  using (exists (
    select 1 from public.move_in_reports
    where move_in_reports.id = move_in_report_photos.move_in_report_id
      and move_in_reports.tenant_id = auth.uid()
  ));
