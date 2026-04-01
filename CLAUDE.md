# TripSync — Project Notes

## What
Mobile-first web platform for end-to-end trip planning, itinerary sharing, and travel expense sync.

## Stack
- **Frontend**: Next.js (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **DB / Auth / Realtime**: Supabase
- **Deploy**: Vercel

## Core Features
1. Trip planning (create, manage trips)
2. Itinerary sharing (collaborate with others)
3. Travel expense sync (track and split costs)

## Conventions
- App Router (`src/app/`) — Server Components by default
- Mobile-first breakpoints
- Supabase client in `src/lib/supabase.ts`
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
