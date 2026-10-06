# Workflow

## Commands

| Command                      | Purpose                                                  |
| ---------------------------- | -------------------------------------------------------- |
| `vp run dev`                 | Dev server at http://localhost:3000                      |
| `vp check --fix`             | Format (Oxfmt), lint (Oxlint), and typecheck in one pass |
| `vp run test:unit:run`       | Unit tests across packages                               |
| `vp run test:e2e:run`        | Playwright smoke tests against a production build        |
| `vp run build`               | Production build (Node preview output)                   |
| `vp run build:cloudflare`    | Production build for Cloudflare Workers                  |
| `vp preview` (in `apps/web`) | Serve the last build locally                             |

## Validation

- Run `vp check --fix` after code or config changes, and again before handing work back. Fix what it reports and rerun until it passes.
- Run `vp run build` when touching routes, `vite.config.ts`, SEO, or anything that affects prerendering. Check the build output lists the expected prerendered pages.
- Run the narrowest relevant tests per [Testing](./testing.md).
- Markdown-only changes need no fix command.

## Completion claims

Don't report work as done until the commands ran and you checked their output. For visual changes, look at the page in the browser preview (desktop and mobile widths).

## Database changes (opt-in package)

Generate migrations with `vp run db:generate` and review them. Never apply migrations yourself; tell the developer to run `vp run db:migrate`. See [Database](./database.md).

## Commits

Conventional Commits (`feat:`, `fix:`, `docs:`...). The `commit-msg` hook runs commitlint. There's no pre-commit hook, so run `vp check --fix` yourself before committing.
