# Rift Operations

A League of Legends team management platform built for competitive teams to track scrim results, champion pools, draft synergies, and analytics in one place.

**Live site:** https://mercury-ong.github.io/Rift-Operations/

## Features

- **Dashboard** — Scrim win rate, kill delta, game length, draft diversity, most-played champions (team side only), synergy pairs, suggested picks per role, and recent results
- **Scrims** — Log scrim blocks with per-game champion picks (role-ordered), kill scores, and duration
- **Players** — Manage the roster and individual champion pools with proficiency ratings
- **Synergies** — Track champion pair win rates and sample sizes
- **Team** — View and edit the full team dataset
- **Coach** — Authenticated admin form for bulk data entry (requires Supabase login)

## Tech Stack

Next.js 16 · TypeScript · Tailwind CSS · Supabase (optional real-time sync) · GitHub Pages (static export)

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Environment Variables

Create a `.env.local` file for local development:

```bash
# Optional — enables real-time sync across browsers via Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional — sets the team access password (defaults to 12345 if omitted)
ACCESS_PASSWORD=your_team_password
```

Without Supabase configured, the app runs fully offline using browser local storage.

## Deploy to GitHub Pages

Deployments are automated via GitHub Actions on every push to `master`.

### One-time setup

1. Go to **Settings → Pages** in the repository.
2. Set **Source** to **GitHub Actions** and save.
3. Go to **Settings → Secrets and variables → Actions** and add:
   - `ACCESS_PASSWORD` — shared team password
   - `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL *(optional)*
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key *(optional)*

After setup, every push to `master` builds and deploys automatically.

## Supabase Real-Time Sync

To share data live across multiple browsers or team members:

1. Create a free [Supabase](https://supabase.com) project.
2. Run `supabase-schema.sql` in the Supabase SQL Editor.
3. Add the URL and anon key as environment variables (see above).

With Supabase connected, all edits sync in real time across every open browser session.

## Access Control

The app uses a client-side password gate for casual team access. Users enter the shared password once per browser session. The password is validated against a SHA-256 hash injected at build time — it is **not** server-side authentication and should not be used to protect sensitive data.

