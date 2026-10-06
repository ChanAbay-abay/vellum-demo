# Routes and Data

Use this for routes, server functions, forms, and server-only code.

## Routes

- File routes in `apps/web/src/routes`. Route files stay thin: `head()`, `staticData`, guards, and the page component. UI goes in `pages/`.
- `(root-layout)/` is a pathless group that wraps pages in the navbar and footer.
- Server-only routes (files like `sitemap[.]xml.ts`) use `server.handlers`.
- New static pages are prerendered and added to the sitemap automatically.

## Server functions (no separate API server)

Use TanStack Start server functions for anything that needs secrets or a database, e.g. a contact form that emails the client (add `zod` to `apps/web` first: `vp add zod --filter @zo-stack/web`):

```ts
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const $sendInquiry = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.email(), message: z.string().min(1).max(2000) }))
  .handler(async ({ data }) => {
    // call an email provider here with a server-only API key
  });
```

- Prefix server functions with `$` and import them statically.
- Validate every input with Zod at the boundary.
- Server functions are protected by the CSRF middleware in `src/start.ts`.
- Keep secrets in server-only modules (`*.server.ts`, server functions, or `@tanstack/react-start/server-only`). Never in `VITE_*` vars.
- A page that calls a server function at request time can't be fully static. Keep landing pages static and call server functions from user actions (form submit).

## Data fetching

The default template has no client data fetching. When a client needs it, call server functions from route loaders (data needed for SEO/first paint) or from event handlers. Add TanStack Query only for real client-side caching needs.

## Gotchas

- Route loaders run on both server and client. Keep server-only work inside server functions.
- Don't call React hooks in loaders or `beforeLoad`.
- Don't `fetch("/api/...")` from loaders; call server functions instead.
