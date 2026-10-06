# Testing

Keep tests small and high-signal. Test behavior a client site depends on, not framework internals.

## Layers

- **Unit** (Vitest via Vite+): pure logic and contracts. Main home: `packages/seo` (head tags, JSON-LD escaping, sitemap, robots).
- **E2E** (Playwright, `apps/web/__e2e__`): smoke tests against a production build and preview. They check the home page renders with canonical + JSON-LD, and that `robots.txt` and `sitemap.xml` are served.

Skip tests for copy, styling, and content-only changes.

## Commands

- `vp run test:unit:run` (all packages) or `vp test` inside a package.
- `vp run test:e2e:run` or `vp exec playwright test` inside `apps/web`.
- First e2e run on a machine: `vp exec playwright install chromium` (in `apps/web`).

## Conventions

- Unit tests: `src/__tests__/<source-basename>.test.ts`, directly in `__tests__`.
- E2E specs: `__e2e__/<surface>.spec.ts`.
- Vitest config goes in the package's `vite.config.ts` (no `vitest.config.ts`). Add `"test:unit": "vp test"` to the package so the root lane finds it.
- Import test APIs from `vite-plus/test`.
- No remote services in tests. E2E blocks all requests that aren't to the local preview server.
- Prefer table-driven tests and real inputs over mocks.
