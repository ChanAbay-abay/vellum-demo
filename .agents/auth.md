# Auth (opt-in)

`packages/auth` is Better Auth (email + password) on top of `packages/db`. Off by default. Enable it only when a client needs accounts or a members area.

## Enabling

1. Enable the database first: [Database](./database.md).
2. Set `BETTER_AUTH_SECRET` (generate with `vp run auth:secret`) locally and in the host's dashboard.
3. Add `"@zo-stack/auth": "workspace:*"` to `apps/web/package.json` dependencies and run `vp install`.
4. Generate the auth tables and migration: `vp run auth:generate`, then `vp run db:generate`. A developer applies it with `vp run db:migrate`.
5. Mount the handler at `apps/web/src/routes/api/auth/$.ts`:

```ts
import { createFileRoute } from "@tanstack/react-router";

import { createAuth } from "@zo-stack/auth/index";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => createAuth().handler(request),
      POST: ({ request }) => createAuth().handler(request)
    }
  }
});
```

## Usage

- Browser: `authClient` from `@zo-stack/auth/react/auth-client` (`signIn.email`, `signUp.email`, `signOut`, `useSession`). Never use it during SSR.
- Protect a page with `beforeLoad` and the `$getUser` server function:

```ts
beforeLoad: async ({ location }) => {
  const user = await $getUser();
  if (!user) throw redirect({ to: "/sign-in", search: { redirect: location.href } });
  return { user };
};
```

- Protect server functions with `authMiddleware` (cached session, 5 min) or `freshAuthMiddleware` (hits the DB; for sensitive actions), from `@zo-stack/auth/react/tanstack-start/middleware`.
- Mark auth and account pages `robots: { index: false }` and add them to `EXCLUDED_PATHS` in the sitemap route.
- Validate `redirect` params against your own routes before redirecting.

## Notes

- `createAuth()` is per request for the same reason as `createDb()`.
- Auth runs on the site's own origin (`/api/auth`), so cookies need no cross-domain setup.
- Extending the user/session: add `additionalFields` in `packages/auth/src/index.ts`, rerun `vp run auth:generate`, generate a migration.
- `packages/auth/src/generate.ts` exists only for the Better Auth CLI.
