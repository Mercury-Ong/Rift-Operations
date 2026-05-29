# LoL Team Tracker

A modern League of Legends team platform to track:

- Champion pools
- Team synergies
- Scrim results and history
- Analytics dashboard snapshots

Built with Next.js + TypeScript + Tailwind CSS.

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Team Password Gate

This app includes a client-side password gate for shared team access.

- Users must enter the shared password before viewing the dashboard.
- Access is remembered in browser session storage.
- The password is validated using a SHA-256 hash injected at build time.

Important: This is a frontend gate and not server-side authentication.

Current default password: `12345`

## Deploy to GitHub Pages

The repository includes an automated GitHub Actions workflow at `.github/workflows/deploy-pages.yml`.

### One-time GitHub setup

1. Push this repository to GitHub.
2. In repository settings, open `Pages`.
3. Set `Build and deployment` source to `GitHub Actions`.
4. In repository settings, open `Secrets and variables` -> `Actions`.
5. Add a secret named `ACCESS_PASSWORD` with your shared team password.

If `ACCESS_PASSWORD` is not set, deployments default to password `12345`.

### Deploy

- Push to the `master` branch.
- The `Deploy to GitHub Pages` workflow will:
  - install dependencies
  - hash your `ACCESS_PASSWORD` secret
  - build static output
  - publish to GitHub Pages

## Notes

- Because GitHub Pages is static hosting, API route handlers were removed.
- The app starts with an empty dataset by default (no mock records).
- With Supabase configured, all clients share one live dataset that syncs across browsers.

## Supabase Shared Sync

To sync edits across multiple browsers/team members, wire Supabase.

1. Create a Supabase project (free tier).
2. In Supabase SQL Editor, run `supabase-schema.sql`.
3. Add env vars in `.env.local` for local dev:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. For GitHub Pages deploys, add the same two values as GitHub Actions secrets:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

How it works:

- Team pages read shared data from Supabase and cache in browser storage.
- Team pages save directly to Supabase using the anon key (via RLS policy in `supabase-schema.sql`).
- Published updates sync to other browsers via Supabase realtime subscription.

Coach form formats:

- Player champ pool rows: `championId,proficiency,games`
- Scrim game rows: `side,duration,killsFor,killsAgainst,objectiveControl`
