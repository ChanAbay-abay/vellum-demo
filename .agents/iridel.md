# Iridel demos

Read this first for any work in Iridel's fork.

## Purpose

- This fork is Iridel's only demo template: zo-stack plus Iridel's demo workflow.
- `CLAUDE.local.md` (if present) names the machine-local Iridel rules files. They are binding.

## Read order

1. `PRD.md` (what we are saying).
2. `DESIGN.md` (binding on anything visual; do not re-decide its tokens).
3. This file.
4. The task doc named in `AGENTS.md`.

Templates for PRD, DESIGN, PROJECT and SPEC live in `docs/templates/`.

## Demos are frontend-only

- Never enable `packages/db` or `packages/auth`, and never add server functions for forms.
- Forms, logins and dashboards are static UI that responds visually and persists nothing.
- Placeholder links intercept the click with a "coming soon" toast and a small pulsing dot. Never a dead `href="#"`.

## Hero-first

- `designer` gives three hero directions in `DESIGN.md` §6. Chan picks one; build only that one, finished, before anything below it.
- Alternatives go on a `hero-explorations` branch, never on `main`.

## Motion split

| Effect                                                                              | Library    | Primitive                                                   |
| ----------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------- |
| Hero intro timeline, pinned/scrubbed scroll scenes, multi-step timelines, SplitText | **GSAP**   | `useGsapScene` and `revealSplit` from `@zo-stack/ui`        |
| Component micro-motion: hover, press, presence, layout, simple in-view reveals      | **Motion** | `m.*`, `Reveal`, `Stagger`, `SplitReveal`, `ClipStack` etc. |
| Above-the-fold mount entrance with no JS dependency                                 | **CSS**    | `animate-in fade-in` (tw-animate-css)                       |
| Smooth scroll                                                                       | **Lenis**  | `GsapSmoothScroll` (root, already mounted)                  |

- One library per element and property. Never put GSAP and Motion on the same node.
- Pin with native `position: sticky` plus a GSAP `scrub` timeline. Never `pin: true`.
- Port from `apps/web/src/pages/lab-gsap-hero` (route `/lab/gsap-hero`).

## Images

- Put source JPG/PNG in `apps/web/src/shared/assets/images/`, flat, named for the final job (`hero-portrait.jpg`), at least 2400px wide for full-bleed.
- Render with `<Picture>` and a `?responsive` import. The build generates AVIF/WebP and a blur placeholder.

```tsx
import hero from "@/shared/assets/images/hero-portrait.jpg?responsive";

<Picture image={hero} alt="..." sizes="100vw" priority />;
```

- Plain `<img>` only for SVG and logos. `public/` is for OG image, favicons and manifest.

## Precedence

- The CTO's `.agents/*` win on structure and tooling: FSD layers, copy in `pages/<page>/config/*.content.ts`, `vp`, commits, SEO.
- Iridel rules win on design and process: no eyebrow above a heading, the single footer credit `<a href="https://iridel.com">Demo by iridel.com</a>`, hero-first, verification honesty.
- Iridel RULES §3's `src/app/_sections` structure does not apply here. Sections live in `apps/web/src/pages/<page>/ui/*-section.tsx`.
- Two CTO docs are out of date in this fork. `__root.tsx` mounts `GsapSmoothScroll`, not the `SmoothScroll` that `.agents/animations.md` describes (`smooth-scroll.tsx` stays, unmounted, for clean merges). Images use `<Picture>` with a `?responsive` import, not the plain `<img>` in `.agents/ui.md`.

## Verify

`vp check --fix` → `vp run test:unit:run` → `vp run build` → `vp run test:breakpoints`

`test:breakpoints` needs `vp exec playwright install chromium` once, in `apps/web`.

## Delivery checklist

These replace RULES §29's npm commands for this stack.

- `vp check && vp run build && vp run test:e2e:run`
- `grep -rni "lab-gsap-hero\|lab-hero\|/lab/\|LAB_HERO" apps/web/src` and `find apps/web/src -iname "*lab*"` are both empty: the lab page, the route, the sitemap exclusion and `shared/assets/images/lab-hero.jpg` are all deleted. The image-pipeline unit test uses its own fixture, so deleting the lab doesn't break it.
- `grep -rn "TODO" apps/web/src` reviewed.
- `grep -rn "uppercase" apps/web/src/pages`: no eyebrow.
- Every `<Link hash>` and `#id` resolves.
- Footer credit present once.
- `public/og/default.png`, favicons and `site.config.ts` replaced.

## Upstream

- `git fetch upstream && git merge upstream/main`. Never push to `upstream`.
- Iridel-owned paths (everything else is the CTO's; keep edits to it minimal):
  - `.agents/iridel.md`, `docs/templates/*`, `scripts/new-demo.ts`, `README.md`
  - `packages/ui/{lib/gsap.ts, hooks/use-gsap-scene.hook.ts, components/gsap-smooth-scroll.tsx, components/picture.tsx}`
  - `apps/web/vite/responsive-images.ts`, `apps/web/src/responsive-images.d.ts`
  - `apps/web/src/pages/lab-gsap-hero/**`, `apps/web/src/routes/(root-layout)/lab/**`
  - `apps/web/__e2e__/breakpoints.spec.ts`
- Small additive edits to CTO files: `AGENTS.md` (one line), `__root.tsx`, `vite.config.ts`, `sitemap[.]xml.ts`, and the manifests.
