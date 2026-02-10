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

1. **Enable Pages:** Repo → **Settings → Pages**. Under **Build and deployment**, set **Source** to **GitHub Actions** (not “Deploy from a branch”). Save.
2. Push to the `main` branch, or go to the **Actions** tab and run the **Deploy to GitHub Pages** workflow.
3. After the workflow finishes, open the site at the **project URL** (see below). Do not use `https://<username>.github.io` alone—that is the user site and will show “There isn’t a GitHub Pages site here.”

## Correct site URL (important)

This app is deployed as a **project site**, not a user site. You must use:

- **URL:** `https://<username>.github.io/<repo-name>/`
- **Example:** `https://octocat.github.io/recipio/`

Use your GitHub username and the **repository name** (e.g. `recipio`). The trailing slash is optional. If you open `https://<username>.github.io` without the repo name, you will get a 404 “There isn’t a GitHub Pages site here.”

## Static export notes

- **Dynamic routes:** Pages are generated only for categories and recipes fetched from Supabase at build time (`generateStaticParams`). New categories or recipes are included in the next deploy.
- **Auth:** The email confirmation link uses a **client-side** callback: `/auth/callback`. In Supabase Dashboard → **Authentication → URL Configuration**, add the site URL to **Redirect URLs**:  
  `https://<username>.github.io/<repo-name>/auth/callback`
- **Auth callback:** The client-side `/auth/callback` page is used for email confirmation (no server route with static export). For a server deploy (e.g. Vercel), you can add the `/api/auth/callback` route back if you want.

## Troubleshooting

- **README or repo files show instead of the app:**  
  GitHub is serving the **branch** (e.g. `main`) as a static site, not the **Actions** build. Fix: go to **Settings → Pages**. Under **Build and deployment**, set **Source** to **GitHub Actions** (not “Deploy from a branch”). Save. Then run the **Deploy to GitHub Pages** workflow from the **Actions** tab once. After it finishes, the site will serve the built app from the workflow artifact.
- **“There isn’t a GitHub Pages site here” (404):**
  1. Use the **project URL** with the repo name: `https://<username>.github.io/<repo-name>/` (e.g. `https://username.github.io/recipio/`). Do not use `https://<username>.github.io` only.
  2. In the repo go to **Settings → Pages** and set **Source** to **GitHub Actions**.
  3. Run the **Deploy to GitHub Pages** workflow from the **Actions** tab and wait until it completes.
- **404 on refresh / other 404s:** The URL must include the repo name (basePath). Use links that start with `/<repo-name>/` (e.g. `/recipio/`).
- **“generateStaticParams” error on build:** Ensure `generateStaticParams` is defined for dynamic pages and that Supabase env vars (secrets) are set during build.
- **Auth callback not working:** Make sure the redirect URL is configured in Supabase and that you are using `/auth/callback` (the page, not the API).
