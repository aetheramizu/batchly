# Deployment and custom domain

Production URL: **https://batchly.my.id**

The app runs on Vercel and uses the existing hosted Supabase project. Changing
the website domain does not require a database migration or moving user data.

## 1. Connect the domain in Vercel

- Add `batchly.my.id` to the existing Vercel project's production domains.
- At the domain registrar/DNS provider, add the DNS records Vercel shows for
  this project. Use those values rather than copying an IP from another guide.
- Wait until Vercel reports valid DNS configuration and HTTPS is working.
- If using `www.batchly.my.id`, add it in Vercel too and redirect it to
  `https://batchly.my.id` so visitors use one production hostname.
- Preserve unrelated DNS records, especially email MX/TXT records.

## 2. Set the Vercel environment variable

In the project's Production environment, set:

```dotenv
SITE_URL=https://batchly.my.id
```

Redeploy after changing the variable. `src/app/layout.tsx` uses it as
`metadataBase` for absolute Open Graph and Twitter share-image URLs.

Keep `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
pointing to the same Supabase project. Do not replace the Supabase API URL with
the website domain. `.env.example` is a template; editing it does not update
Vercel or an existing `.env.local`.

## 3. Configure hosted Supabase Auth before switching traffic

In Supabase Dashboard → Authentication → URL Configuration:

- Set **Site URL** to `https://batchly.my.id`.
- Add these **Redirect URLs** for the app's signup and recovery flows:

  ```text
  https://batchly.my.id/auth/confirm
  https://batchly.my.id/auth/confirm?next=/reset-password
  ```

- Keep local development callback URLs allowed if using hosted Supabase locally:

  ```text
  http://localhost:3000/auth/confirm
  http://localhost:3000/auth/confirm?next=/reset-password
  ```

- Keep the old deployment's callback URLs temporarily if that hostname is
  still in use. Avoid broad production wildcard allow-lists.

The auth actions build email redirect URLs from the request origin, so requests
from the new domain already generate new-domain callbacks. No hardcoded domain
change is needed in `src/features/auth/actions.ts`.

Review the **Confirm signup** and **Reset password** email templates for any
hardcoded old domain. Preserve the existing token/code flow and the recovery
destination (`next=/reset-password`); do not replace every email link with the
homepage. Dashboard email templates are not stored in this repository.

`supabase/config.toml` contains local-development settings, not the hosted
project's production URL configuration. Leave its loopback URLs unchanged.

## 4. Handle the transition

- Users must sign in again on the new domain: browser session cookies from
  `getbatchly.vercel.app` are not shared with `batchly.my.id`. Accounts, passwords,
  purchases, and stored images remain in the same Supabase project.
- Previously sent auth emails may still point to the old hostname. Keep that
  hostname and its callbacks working during the transition, or ask users to
  request a fresh link on the new domain. A redirect alone cannot transfer the
  old hostname's cookies or a PKCE verifier to the new hostname.
- After testing, optionally redirect the old Vercel hostname to the new domain.
  Preserve paths and query strings, and account for outstanding auth links
  before enabling a blanket redirect.
- A website domain change does not require changing the SMTP sender domain.
  If also changing the email sender, configure that separately with the mail
  provider and its required DNS records.

## 5. Post-deployment smoke tests

- [ ] `https://batchly.my.id` loads over HTTPS without a redirect loop.
- [ ] A signed-out visit to `/dashboard` redirects to login on the new domain.
- [ ] An existing user can sign in, refresh, and sign out.
- [ ] Signup confirmation emails complete successfully on the new domain.
- [ ] A fresh password-reset email opens `/reset-password`, accepts a new
      password, and the new password works on the next login.
- [ ] For PKCE email links, test in the browser where the request was started.
- [ ] Existing purchases, finance summaries, and images still load.
- [ ] Creating/editing a purchase and uploading an image still work.
- [ ] Page-source `og:image` and `twitter:image` URLs use
      `https://batchly.my.id/og-image.png`, and that image URL loads.
- [ ] Local development still works if it uses the hosted Supabase project.

These checks require access to the deployed app and the Vercel/Supabase
dashboards; repository changes alone do not complete the domain migration.
