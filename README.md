# Batchly

A personal purchase tracker for collectors. Batchly keeps group orders, direct
seller purchases, payments, tracking, additional costs and OS in one place.

Built with Next.js and Supabase (Auth, Postgres with RLS, Storage).

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in your Supabase project URL
   and publishable key.

3. Apply the migrations in `supabase/migrations` to your Supabase project.
   `supabase/seed/dev-seed.sql` contains optional development data for a
   single test account (see the instructions at the top of the file). Never
   run it against production.

4. Start the development server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command             | Purpose                  |
| ------------------- | ------------------------ |
| `npm run dev`       | Development server       |
| `npm run build`     | Production build         |
| `npm run start`     | Serve the production build |
| `npm run lint`      | ESLint                   |
| `npm run typecheck` | TypeScript               |
| `npm test`          | Unit tests               |

## Documentation

Product and implementation rules live in `docs/` (PRD, data model, UX spec,
design system, test plan). See `CLAUDE.md` for how they are prioritised.
