-- 015_subscriptions.sql
-- PayFast subscription columns on profiles
-- Run manually in Supabase SQL Editor.

alter table public.profiles
  add column if not exists subscription_tier      text not null default 'free'
    check (subscription_tier in ('free','tenant_pro','landlord_pro','agency_starter','agency_growth')),
  add column if not exists payfast_token          text,
  add column if not exists payfast_subscription_id text,
  add column if not exists subscription_status    text not null default 'inactive'
    check (subscription_status in ('active','inactive','cancelled','past_due'));
