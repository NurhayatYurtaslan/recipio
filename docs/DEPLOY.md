# Deploy (GitHub Pages)

This project can be deployed to GitHub Pages using **static export**.

## Requirements

- In the GitHub repo: **Settings → Pages → Build and deployment → Source: GitHub Actions** must be selected.
- Supabase project must be set up; public data (categories, recipes) must be fetchable during build.

## Environment variables (GitHub Secrets)

The following **Repository secrets** must be defined for the Actions build:

| Secret | Description |
|--------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |

**Secrets:** Repo → Settings → Secrets and variables → Actions → New repository secret.

## How to deploy

1. Push to the `main` branch, or go to the Actions tab and run the **Deploy to GitHub Pages** workflow with **Run workflow**.
2. After deploy completes, the site is available at:  
   `https://<username>.github.io/<repo-name>/`  
   e.g. `https://username.github.io/recipio/`

## Static export notes

- **Dynamic routes:** Pages are generated only for categories and recipes fetched from Supabase at build time (`generateStaticParams`). New categories or recipes are included in the next deploy.
- **Auth:** The email confirmation link uses a **client-side** callback: `/auth/callback`. In Supabase Dashboard → **Authentication → URL Configuration**, add the site URL to **Redirect URLs**:  
  `https://<username>.github.io/<repo-name>/auth/callback`
- **Auth callback:** The client-side `/auth/callback` page is used for email confirmation (no server route with static export). For a server deploy (e.g. Vercel), you can add the `/api/auth/callback` route back if you want.

## Troubleshooting

- **Pages 404:** Check that the repo name and basePath match; the URL should include the basePath (e.g. `/recipio/`).
- **“generateStaticParams” error on build:** Ensure `generateStaticParams` is defined for dynamic pages and that Supabase env vars (secrets) are set during build.
- **Auth callback not working:** Make sure the redirect URL is configured in Supabase and that you are using `/auth/callback` (the page, not the API).
