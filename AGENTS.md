# zo-stack

Landing page template for Philippine SME clients. TanStack Start (full stack, no separate API server), prerendered and SEO-ready, animated with Motion + Lenis, styled with shadcn/ui and Tailwind v4. Deploys to Vercel or Cloudflare Workers. Postgres and Better Auth are opt-in packages, off by default.

## Code style

- Prefer straightforward solutions for current requirements. Add abstractions, config options, or layers only for a concrete need.
- Keep the main control flow easy to follow. Avoid wrapper layers that only rename or forward calls.
- Keep types simple and close to where they are used. Prefer inference.
- Be robust at system boundaries (user input, auth, external APIs, persistence). Trust invariants inside them.
- Comment only non-obvious intent and constraints. Explain why, not what.
- Do not add or revise documentation unless asked, except where a doc below says it must stay in sync with a change.

Use Vite Plus: `vp` for packages/scripts, `vpx` for one-off CLIs. Never call pnpm/npm/yarn directly.

Common commands:

- `vp run dev` - dev server on http://localhost:3000
- `vp check --fix` - format, lint, typecheck (run after every change)
- `vp run test:unit:run` - unit tests
- `vp run build` - production build (Node output in `apps/web/.output`)
- `vp run build:cloudflare` - production build for Cloudflare Workers

## Layout

```text
apps/web          TanStack Start app (pages, routes, server functions)
packages/ui       shadcn/ui components + Motion/Lenis animation primitives
packages/seo      head() builder, JSON-LD builders, sitemap.xml and robots.txt generators
packages/env      env validation (packages/env/.env)
packages/db       opt-in: Drizzle + Postgres (VPS or Supabase)
packages/auth     opt-in: Better Auth (needs packages/db)
tools/*           shared tsconfig and FSD lint rules
```

## Task entry points

Open the most specific doc first. Follow its links only when the task crosses into another concern.

- Iridel client demo (any work in Iridel's fork): [Iridel demos](.agents/iridel.md). Read it first.
- New client site: [New site checklist](.agents/new-site.md).
- Page copy, sections, layout, components: [UI guidelines](.agents/ui.md).
- Animations: [Animations](.agents/animations.md).
- Meta tags, structured data, sitemap: [SEO](.agents/seo.md).
- Routes, server functions, forms: [Routes and data](.agents/data-flow.md).
- Deploying: [Deployment](.agents/deployment.md).
- Env vars: [Environment variables](.agents/environment-variables.md).
- Database (only when the client needs one): [Database](.agents/database.md).
- Login/accounts (only when the client needs them): [Auth](.agents/auth.md).
- Tests: [Testing](.agents/testing.md).
- Shared client state: [Zustand](.agents/zustand.md).

## Cross-cutting

- [Workflow](.agents/workflow.md): validation cadence, completion claims, commits.
- [Vite+ toolchain](.agents/vite-plus.md): `vp`/`vpx` and package management.
- [TypeScript conventions](.agents/typescript.md): schemas, imports, lint.
- [Choice flows](.agents/choice-flows.md): when and how to ask the user to decide.
