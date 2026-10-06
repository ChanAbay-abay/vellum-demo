# Iridel demo template

Iridel's fork of [zo-stack](https://github.com/iridel-co/zo-stack) for client demos: the same TanStack Start landing page template plus Iridel's GSAP layer, image pipeline and demo workflow. Frontend-only; the opt-in db/auth packages stay off.

Upstream description: landing page template for Philippine SMEs. One TanStack Start app (no separate API server), prerendered for speed and SEO, animated with Motion + Lenis, built on shadcn/ui. Deploys to Vercel or Cloudflare Workers. Postgres and auth are ready as opt-in packages for when a client also needs a system.

## What Iridel adds

- **GSAP layer**: `useGsapScene`, `revealSplit` and `GsapSmoothScroll` (GSAP drives Lenis) in `@zo-stack/ui`, with a worked hero at `/lab/gsap-hero`.
- **Picture pipeline**: `<Picture image={img?responsive}>` generates AVIF/WebP and a blur placeholder at build.
- **Breakpoint smoke test**: `vp run test:breakpoints` checks every prerendered route at 375, 768 and 1440.
- **Templates**: PRD, DESIGN, PROJECT and SPEC in `docs/templates/`.
- **Demo workflow**: [.agents/iridel.md](.agents/iridel.md), read first by agents.

## What you get (from zo-stack)

- **Editorial luxury layout** modeled on high-end product sites: fluid proportional scaling, a squared display face, monochrome palette, and slow scroll scenes. A black hero with a real 3D centerpiece that tilts and comes apart in depth as you scroll, a studio statement that unfolds around a self-drawing ring, collection cards with objects that turn under the pointer, a clip-wipe gallery, a journal, and a film-grain footer.
- **SEO built in**: every page prerendered to HTML; automatic canonical URLs; Open Graph/Twitter tags; `LocalBusiness` and `WebSite` structured data (FAQ and breadcrumb builders ready); auto-generated `sitemap.xml` and `robots.txt`.
- **Made for PH clients**: Messenger-first CTAs, `tel:` links, address + hours with a Maps link, `en_PH` locale, `₱` price range, privacy notice covering the Data Privacy Act of 2012.
- **Content in config**: business details in one file, page copy in another. Most client sites need no component changes.
- **Animation primitives**: `SplitReveal`, `ClipStack`, `GrainCanvas`, `SectionDots`, `Reveal`, `Stagger`, plus `ScrollHighlightText`, `CountUp`, `Marquee`, `ScrollCarousel` for client pages, all respecting reduced motion.
- **Opt-in system packages**: Drizzle + Postgres (VPS or Supabase) and Better Auth, off by default.

## Quick start

Requires Node 24+ and [Vite+](https://viteplus.dev) (`curl -fsSL https://vite.plus | bash`).

```bash
vp install
cp packages/env/.env.example packages/env/.env
vp run dev
```

Open http://localhost:3000.

## New demo

```bash
vp run new-demo <slug> [--name "<Client>"] [--dest <dir>] [--skip-install]
```

Creates `../demos/<slug>-DEMO` (or `--dest`) from this template: fills `PRD.md`, installs, runs `vp check` and a build, and commits to a fresh git repo with no remotes. A failed run removes the partial folder, so you can rerun it. Then follow the per-client checklist below.

Before a demo goes to a client, work through the [delivery checklist](.agents/iridel.md#delivery-checklist). It includes deleting the `/lab` route and its photo.

## New client site

1. Business details: `apps/web/src/config/site.config.ts`
2. Page copy and images: `apps/web/src/pages/home/config/home.content.ts` and `apps/web/src/shared/assets/images/` (rendered with `<Picture>` and `?responsive`)
3. Photography and the 3D centerpiece: `apps/web/src/shared/assets/images/`, `apps/web/src/pages/home/ui/instrument.tsx`
4. Palette, logo, favicon, share image: `apps/web/src/shared/styles/theme.css`, `apps/web/src/shared/ui/logo.tsx`, `apps/web/public/`
5. Review the legal pages, then deploy

Full checklist: [.agents/new-site.md](.agents/new-site.md).

## Commands

| Command                    | Does                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------ |
| `vp run dev`               | Dev server                                                                           |
| `vp check --fix`           | Format, lint, typecheck                                                              |
| `vp run test:unit:run`     | Unit tests                                                                           |
| `vp run test:breakpoints`  | Layout smoke at 375/768/1440 on every prerendered route                              |
| `vp run new-demo <slug>`   | Spin a new demo from this template                                                   |
| `vp run test:e2e:run`      | Browser smoke tests (first run: `vp exec playwright install chromium` in `apps/web`) |
| `vp run build`             | Production build                                                                     |
| `vp run build:cloudflare`  | Production build for Cloudflare Workers                                              |
| `vp run deploy:cloudflare` | Build and deploy to Cloudflare                                                       |

## Deploy

- Dashboard commands below run on the host (locally use `vp run build`).
- **Vercel**: Root Directory `apps/web`, build command `pnpm run build`, env `VITE_SITE_URL` and `ENABLE_EXPERIMENTAL_COREPACK=1`.
- **Cloudflare Workers**: build `pnpm run build:cloudflare`, deploy `pnpm exec wrangler deploy` (from `apps/web`), build variable `VITE_SITE_URL`. Set the worker name in `apps/web/wrangler.jsonc`.

Details: [.agents/deployment.md](.agents/deployment.md).

## Environment variables

| Variable             | Needed                                                                     |
| -------------------- | -------------------------------------------------------------------------- |
| `VITE_SITE_URL`      | Production builds. The site's public origin, e.g. `https://example.com.ph` |
| `DATABASE_URL`       | Only after enabling `@zo-stack/db`                                         |
| `BETTER_AUTH_SECRET` | Only after enabling `@zo-stack/auth`                                       |

## Adding a system (database, accounts)

The landing page runs without a database. When a client needs one:

- Database: [.agents/database.md](.agents/database.md) (Postgres on our VPS or Supabase)
- Accounts/login: [.agents/auth.md](.agents/auth.md)
- Forms and server logic: [.agents/data-flow.md](.agents/data-flow.md) (TanStack Start server functions)

## Structure

```text
apps/web          The site (TanStack Start)
packages/ui       shadcn/ui components and animation primitives
packages/seo      Meta tags, JSON-LD, sitemap, robots helpers
packages/env      Env validation
packages/db       Opt-in: Drizzle + Postgres
packages/auth     Opt-in: Better Auth
tools/            Shared tsconfig and lint rules
```

Coding agents: start at [AGENTS.md](AGENTS.md).

## Improving the template

This template keeps evolving, and every new demo starts from it, so a fix made here reaches every later demo.

- Make the change here first, not in a demo, whenever it would help the next demo too. Demos that already exist don't pick it up automatically.
- Keep changes to zo-stack files small and additive, so upstream merges stay clean. Put Iridel code in Iridel-owned paths ([.agents/iridel.md](.agents/iridel.md#upstream)).
- Try new motion and hero patterns on a `/lab/*` route. Lab routes are noindex and kept out of the sitemap.
- Before you commit, run `vp check`, `vp run test:unit:run`, `vp run build` and `vp run test:e2e:run`.

## Upstream

`git fetch upstream && git merge upstream/main`. Iridel-owned paths are listed in [.agents/iridel.md](.agents/iridel.md). Never push to `upstream`.

## Credits

Based on [tsu-stack](https://github.com/tsu-moe/tsu-stack) by tsu!moe (MIT).
