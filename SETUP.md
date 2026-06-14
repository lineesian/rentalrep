# RentalRep — Setup Guide

## Prerequisites
- Node.js 18+ (install via https://nodejs.org or `brew install node`)
- A Supabase account (free at https://supabase.com)

## 1. Install dependencies

```bash
cd ~/Projects/rentalrep
npm install
```

## 2. Create your Supabase project

1. Go to https://supabase.com/dashboard → New project
2. Name it `rentalrep`, choose a region close to South Africa (e.g. Europe West)
3. Once created, go to **Settings → API**
4. Copy your **Project URL** and **anon / public** key

## 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and paste your keys:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
```

## 4. Run the database migration

1. In your Supabase dashboard → **SQL Editor**
2. Paste the entire contents of `supabase/migrations/001_initial_schema.sql`
3. Click **Run**

This creates:
- `profiles` table (auto-populated on sign-up)
- `leases` table
- `reviews` table
- `reputation_scores` computed view
- `leases` storage bucket
- Row Level Security policies

## 5. Enable phone auth (for OTP)

In Supabase dashboard → **Authentication → Providers → Phone**
- Enable it and connect a Twilio account (or use test mode)

## 6. Start the dev server

```bash
npm run dev
```

Open http://localhost:3000 — you'll be redirected to the login screen.

## Screens

| Route | Description |
|-------|-------------|
| `/auth/login` | Email/password or phone OTP sign-in |
| `/auth/register` | Sign-up with role selection (Tenant / Landlord / Agency) |
| `/auth/verify-otp` | 6-digit OTP verification |
| `/home` | Dashboard with reputation score and recent reviews |
| `/search` | Search and filter profiles |
| `/profile/[id]` | Public profile with score breakdown and reviews |
| `/review/new` | 3-step verified review wizard |
| `/agency` | Agency dashboard with tenant screening |
