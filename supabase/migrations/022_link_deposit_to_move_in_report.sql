alter table public.deposits
  add column if not exists move_in_report_id uuid references public.move_in_reports(id);
