# Deployment

One codebase, two targets. Nitro picks the output format from the environment (`apps/web/vite.config.ts`).
Static pages are prerendered and served from the CDN; the server only handles what isn't static (404s, server functions, auth).

## Vercel

1. Import the repo. Set **Root Directory** to `apps/web`. Framework preset: Other.
2. Build command (dashboard setting, runs on Vercel's pnpm): `pnpm run build` (Vercel runs it inside `apps/web`). Install command: default (`pnpm install` at the repo root).
3. Environment variables:
   - `VITE_SITE_URL` = `https://<client-domain>` (build-time, required)
   - `ENABLE_EXPERIMENTAL_COREPACK` = `1` (so Vercel uses the pnpm version in `package.json`)
   - `DATABASE_URL`, `BETTER_AUTH_SECRET` only if the db/auth packages are enabled
4. Nitro detects Vercel and writes `.vercel/output` (static files + one server function).

Preview deployments on `*.vercel.app` get `X-Robots-Tag: noindex` from Vercel, so they won't compete with production in search.

## Cloudflare Workers

Local deploy:

```sh
(cd apps/web && vpx wrangler login)
VITE_SITE_URL=https://<client-domain> vp run deploy:cloudflare
```

Git deploys (Workers Builds), with the project root set to `apps/web` (dashboard commands, run on Cloudflare's pnpm):

- Build command: `pnpm run build:cloudflare`
- Deploy command: `pnpm exec wrangler deploy`
- Build variables: `VITE_SITE_URL`
- Runtime secrets (only if db/auth are enabled): `wrangler secret put DATABASE_URL`, `wrangler secret put BETTER_AUTH_SECRET`

`apps/web/wrangler.jsonc` holds the worker name and compatibility settings. The build merges it into `.output/server/wrangler.json`, which `wrangler deploy` picks up through `.wrangler/deploy/config.json`. Don't set `main` or `assets` in `wrangler.jsonc`.

Change the worker `name` per client. Keep `compatibility_date` at or below what the installed Wrangler supports (the build prerenders inside the local Workers runtime and fails otherwise).

## Checks before going live

- `vp check --fix`, `vp run test:unit:run`, `vp run build` all pass.
- `VITE_SITE_URL` is the final domain (canonical URLs, sitemap, and Open Graph images use it).
- Custom domain attached; `www` redirects to the apex (or the reverse) in the host's dashboard.
- Submit the sitemap in Google Search Console.
