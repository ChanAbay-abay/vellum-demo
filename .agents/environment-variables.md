# Environment Variables

All env vars live in `packages/env/.env` (copy `packages/env/.env.example`). Validated with Zod via `@t3-oss/env-core`. On Vercel/Cloudflare, set them in the dashboard instead; the `.env` file is optional there.

## Variables

| Variable             | Scope                  | Required                   | Read by                                                       |
| -------------------- | ---------------------- | -------------------------- | ------------------------------------------------------------- |
| `VITE_SITE_URL`      | build-time, public     | production builds          | `vite.config.ts` → inlined as `import.meta.env.VITE_SITE_URL` |
| `DATABASE_URL`       | server runtime, secret | only with `@zo-stack/db`   | `packages/env/src/server/db.env.ts`                           |
| `BETTER_AUTH_SECRET` | server runtime, secret | only with `@zo-stack/auth` | `packages/env/src/server/auth.env.ts`                         |

## How it's wired

- `env.isomorphic.ts` (`ENV_WEB_ISOMORPHIC`): public `VITE_*` vars. Validated in `apps/web/vite.config.ts` at build time, then inlined with `define`. App code reads `import.meta.env.VITE_SITE_URL` (typed in `src/global.d.ts`), which keeps Zod out of the client bundle.
- `server/db.env.ts` (`ENV_DB`) and `server/auth.env.ts` (`ENV_AUTH`): server-only, validated on first import. They're only imported by the opt-in packages, so the default site needs neither.

## Adding a variable

1. Add the Zod rule to the right file in `packages/env/src/` (public → `env.isomorphic.ts` with a `VITE_` prefix; secret → a server file).
2. Add it to `packages/env/.env.example` with a comment.
3. Public vars used in app code: add to `define` in `apps/web/vite.config.ts` and to `ImportMetaEnv` in `apps/web/src/global.d.ts`.
4. Update the table above, [Deployment](./deployment.md) (where to set it), and the root README if it's needed to run the app.

Only `VITE_*` vars reach the browser. Never prefix a secret with `VITE_`. Document only variables the code actually reads.
