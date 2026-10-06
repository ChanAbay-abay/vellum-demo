# TypeScript Conventions

## Types

- Derive types from their source (Zod schema, `as const` config, function return types). Don't maintain duplicate shapes.
- Use `satisfies` to check config objects while keeping literal types (see `site.config.ts`, `seo.ts`).
- Use `as` only where a library type can't express a fact the code already established. Keep it next to the evidence.
- Use `type` aliases. Interfaces only for declaration merging (e.g. `Register`, `StaticDataRouteOption`, `ImportMetaEnv`), with an `oxlint-disable-next-line typescript/consistent-type-definitions` comment.

## Validation

- Parse untrusted data (form input, query params, external APIs) with Zod at the boundary.
- Keep one-off schemas inline. Extract only when reused.
- Avoid loose types like `Record<string, unknown>` and `object` (lint rejects them).

## Imports

- Cross-package: `@zo-stack/<package>/<path>`.
- Inside `apps/web`: `@/` alias. Inside packages: `#@/` alias.
- Import order is auto-sorted by Oxfmt: builtins → external → `@zo-stack/*` → `@/shared` → `@/features` → `@/widgets` → `@/pages` → relative → styles.
- FSD boundaries in `apps/web` are lint-enforced: import downward, through slice `index.ts` files.

## Linting

- `vp check --fix` runs Oxlint with type-aware rules and typechecks. Don't run `tsc` separately.
- Disable a rule inline only with a reason: `// oxlint-disable-next-line <rule>`.
- No `any`, no `@ts-ignore`, no `console.log` (only `console.debug` is allowed, and remove it before handoff).
