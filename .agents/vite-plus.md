# Vite Plus (Vite+)

Vite Plus is the single CLI for this repo. It wraps pnpm for packages and bundles Vite, Oxlint, Oxfmt, and Vitest, configured in the root `vite.config.ts`.

## CLI mapping

| Instead of                     | Use                                                           |
| ------------------------------ | ------------------------------------------------------------- |
| `pnpm` / `npm` / `yarn`        | `vp`                                                          |
| `npx <pkg>`                    | `vpx <pkg>`                                                   |
| `pnpm run <script>`            | `vp run <script>`                                             |
| `pnpm --filter <pkg> <script>` | `vp run --filter <pkg> <script>`                              |
| `pnpm add <dep>`               | `vp add <dep>` (add `--filter <pkg>` for a workspace package) |

Root scripts share names with Vite+ built-ins, so use `vp run <script>` (e.g. `vp run dev`, `vp run build`).

## Key behaviors

- `vp check --fix`: format + lint + typecheck. The normal cleanup command.
- `vp config` (runs on install): installs the `commit-msg` hook from `.vite-hooks/`.
- `vp env doctor`: diagnose toolchain issues.
- Dependency versions live in the `catalog` in `pnpm-workspace.yaml`. Packages reference them as `"catalog:"`. Add new deps to the catalog first. Prefer versions at least 3 days old (`vp run deps` respects this).

## Root `vite.config.ts`

- Vitest includes (`{apps,packages}/*/src/**/__tests__/*.test.ts`)
- Oxfmt: import sorting by FSD layer, Tailwind class sorting
- Oxlint: TanStack, React Hooks/Compiler, and FSD rules
