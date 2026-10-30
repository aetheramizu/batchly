# Batchly

A personal purchase tracker for collectors. Batchly keeps group orders, direct
seller purchases, payments, tracking, additional costs and OS in one place.

Built with Next.js and Supabase (Auth, Postgres with RLS, Storage).

**Live app:** [batchly.my.id](https://batchly.my.id)

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

## Production setup

- **Hosting:** Vercel, with `https://batchly.my.id` as the production URL.
- **Environment:** Set `SITE_URL=https://batchly.my.id` in Vercel's Production
  environment and redeploy after changing it. This controls absolute share-image
  URLs; editing `.env.example` does not update the deployed environment.
- **Authentication:** Supabase Auth uses the production domain as its Site URL
  and allows both email callbacks:
  - `https://batchly.my.id/auth/confirm`
  - `https://batchly.my.id/auth/confirm?next=/reset-password`
- **Auth emails:** Resend delivers emails through Supabase's custom SMTP setup
  as **Batchly <noreply@batchly.my.id>**. The sending domain is verified in Resend.
- **Email branding:** The Confirm signup and Reset password templates are managed
  in the Supabase dashboard, including their subjects and HTML. Keep
  `{{ .ConfirmationURL }}` intact so the existing auth flows continue to work.
  Template changes apply to newly generated emails without a Vercel redeploy.

SMTP credentials belong only in Supabase's SMTP settings, never in this
repository or client-side environment variables. The hosted email templates
and SMTP configuration are not automatically applied by cloning this repo.

Existing-account login, signup confirmation, and password reset have been
manually tested on the custom domain.

## Documentation

Product and implementation rules live in `docs/` (PRD, data model, UX spec,
design system, test plan). See `CLAUDE.md` for how they are prioritised.

For production domain setup and verification, see
[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).
