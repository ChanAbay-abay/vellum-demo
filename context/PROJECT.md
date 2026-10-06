# Vellum Cycles Demo

> Context file. Update as work progresses.

## Status

- [x] Planned
- [x] In Progress
- [ ] Tested
- [ ] Complete

## Goal

Premium catalogue-only redesign demo for Vellum Cycles (inbound request, current Squarespace site is down). Home, About, Models (Fuerza, Edge, Terreno + warranty), Merch. Every CTA goes to IG DM / Messenger.

## Stack

- TypeScript · TanStack Start (prerendered) · Vite+ (`vp`) · Tailwind v4 + shadcn/ui · GSAP + Motion + Lenis · frontend-only

## Verify

`vp check --fix` · `vp run test:unit:run` · `vp run build` · `vp run test:breakpoints`

## Plan

1. Copy template, set slug `vellum-cycles`, install `@fontsource-variable/jost`
2. Paste tokens from DESIGN.md §2 into `theme.css`; set every shadcn var
3. Move `images/**` and `brand/logos/**` into the app (see PRD Assets)
4. Build shared pieces: Nav, Footer, Stripe, Button skins, InquireLink (IG DM + Messenger)
5. Home: Hero (Direction A) → Intro → Models split → Merch row → Heritage strip → Showroom
6. `/models` index + warranty; `/models/fuerza` with colorway switcher and builds; `/models/edge`; `/models/terreno`
7. `/about`: story, founders, timeline, socials, showroom
8. `/merch` grid
9. Content in `home.content.ts` and per-route content files; mark `*` placeholders
10. Reduced-motion pass, breakpoint tests, Lighthouse, deploy to Vercel preview

## Progress Log

### 2026-10-07

- Scraped 216 IG posts with captions, curated 83 images into job-named folders
- Traced mark, wordmark, lockup and Edge wordmark to SVG
- Sampled brand colors, verified contrast
- PRD.md and DESIGN.md written
- Foundation (coder): site config + SEO meta, Jost (only font), DESIGN §2 tokens + §3 type scale, images in `shared/assets/images/` (folders kept), logos in `public/brand/`, square favicons from the mark, shared `Stripe`/`Button`/`InquireLink`/`Reveal`/logos, `home.content.ts` + `config/layout.content.ts`, stub sections for every home section, stub routes for /about /models /models/{fuerza,edge,terreno} /merch, placeholder `hero-rider.png` (rembg cut-out, grayscale). `cn` taught the custom text sizes (it was dropping `text-label` next to a color). `vp check` + `vp run build` pass
- Model pages (coder): shared template `widgets/model-page` (one typed `ModelContent` + `<ModelPage>`), filled for Fuerza, Edge and Terreno from `pages/model-<slug>/config/<slug>.content.ts`. Sand hero → pinned ink 3D tour (GSAP scrub over native sticky; camera zoom/pull-back/spin/orbit all as plain data per beat; giant model title behind the transparent canvas, drifting and lifting out at release) → `#summary` gallery (Fuerza: segmented colorway pill + crossfading photos + past colorways; Edge/Terreno: gallery only) → recap/specs/builds → shared warranty (`config/warranty.content.ts` + `shared/ui/warranty.tsx`, ready for `/models`) → sand CTA (IG DM). Fixed "Jump to summary" pill (plain `#summary` anchor). Reduced motion: no pin, static wide pose, stacked beats. 3D consumed read-only via `entities/bike-models` registry (models as of fuerza 02:28, edge 02:11, terreno 02:08). Verified at 1440×900 with Playwright: camera values change per beat, z-order title<canvas<copy, jump lands at summary top 0, pill aria-pressed + keyboard, no console errors, one canvas after route changes. Screens: `screens/model-page/`. `vp check` + `vp run build` pass
- Model pages round 2 (coder, Fuerza only): page opens on the pinned 3D tour (hero removed for Fuerza via optional `hero`; beat 1 is an `intro` h1 with a wide pose and a full spin into beat 2). Arrow controls `← 02 / 08 →` centred under the beat copy, stepping from the real scroll position to the next/previous hold point through Lenis (chained double-clicks, ←/→ keys only while pinned); "Jump to summary" at the bottom centre of the pinned stage. Poster never paints on the normal path (mounted only on WebGL failure, `<noscript>` otherwise); filmstrip cold and 4x CPU shows no poster/hero img. Colorway pill: `featured` Rudy Project with pulsing stripe-red ring (stops after any pick) + tag; hover/focus line bike (`shared/ui/bike-icon.tsx`) tinted per colorway, one instance re-targeting. Optional `sample` flag on photos (chip + alt suffix; tested with a temporary flag, reverted). Recap/warranty/CTA rebuilt from `design/model-summary-direction.md` (builds comparison table, grouped warranty with striped "5" clip wipe, CTA photo bleed + Messenger secondary). Edge/Terreno keep their hero and still render with 0 errors. Screens: `screens/model-page/r2/`. `vp check` + `vp run build` pass
- Model pages round 3 (coder): recap is one spec sheet (8 PRD rows from `summary.specs`, alternating tone, full-height photo) plus two equal build cards (subgrid rows, 271/271px); beat `recap` field removed. Warranty: badge (striped 5 + YEARS lockup + outline echo + rotating seal, `shared/ui/warranty-badge.tsx`), ring centred on its column (0/0px delta), terms on one spacing scale, claim steps 4-up, no decorative numbering; heading PROPOSED "Covered for five years.". Closing CTA extracted to `shared/ui/closing-cta.tsx` (`ClosingCta`, also used on home by a peer): full-bleed 90svh photo/ink block, 12vw slanted heading over the stripe, photo scrub 1.1→1.0, text contrast ≥8:1 measured on pixels. Screens: `screens/model-page/r3/`. `vp check` + `vp run build` pass
- `/models` index (coder): "The lineup." h1 on paper, then three full-bleed alternating rows (photo half edge to edge, slanted display name / Edge SVG wordmark, line, "View" button): Fuerza on sand (Retro Greige 3/4 studio shot), Edge on ink (archive, B&W), Terreno on bone (showroom UGC, zoom-cropped past the shop wall and desaturated), then the shared `<Warranty>` on paper, whose "Start a warranty claim" IG DM link closes the page. Names/lines/routes read from `NAV.models.items` (FSD forbids importing home/model-page content); photos in `pages/models/config/models.content.ts`. First row CSS entrance + priority image, rows 2–3 `Reveal`, hover scales the photo 1.04. Verified at 1440×900 with Playwright: 0 console errors, all three View links route, image links are `tabIndex=-1` (4 tab stops in main), warranty wipe 0 → 0.72 → 1, reduced motion renders it at its final state, 390px no horizontal overflow (not polished). Screens: `screens/models-index/`. `vp check` + `vp run build` pass
- `/merch` (coder): paper top with the two-line h1 "Retro, down to what you wear." over a stripe sized to its longest line, body line right; 3×2 grid of PRD products (4:5 on bone, name, note/variants in caption, "Inquire ↗"; whole card is one IG DM link like the home merch row; no prices). `*` ASK sizes render "Sizes on request" (hoodie, tee); bottles render no meta line. Sticker set is a bone callout ("Free with any purchase.") not a card. Closes on a sand CTA (slanted display heading + stripe, ink IG DM button, Messenger link, jersey stripe macro right; GSAP rise like `ClosingCta`, built locally because `ClosingCta` is ink-only). First row CSS entrance + priority images, rest `Reveal`. Content in `pages/merch/config/merch.content.ts`. `InquireLink` has no prefill, left unchanged. Verified at 1440×900 with Playwright: 0 console errors (normal and reduced), 9 inquiry links all `ig.me/m/vellumcycles` or `m.me/vellumcycles`, `_blank` + `noopener noreferrer`; no element left under 0.15 opacity after a wheel pass; CLS 0 from page content (≤0.003 from nav text on font swap); card hover img scale 1.04 + underline; orange focus ring. Screens: `screens/merch/`. `vp check` + `vp run build` pass
- `/merch` CTA round 2 (coder): custom sand CTA (`merch-cta-section.tsx`) deleted; page closes on the shared `<ClosingCta>` as-is (full-bleed ink, kit flatlay photo, IG DM primary + Messenger secondary, copy in `merch.content.ts` `CTA`). Grounds now paper → bone → ink CTA → ink footer, joined by the footer stripe exactly as on home. 0 console errors, links `ig.me`/`m.me`, reduced motion static. Screens: `screens/merch/r2/`. `vp check` + `vp run build` pass

## Deferred

- 3D viewer on every model page, styled like the template watch (`instrument.tsx`). See PRD "Deferred: 3D frame viewer". **Models done 2026-10-07** (viewer not wired yet):
  - Complete bikes, procedural (img2threejs), in `apps/web/src/entities/bike-models/{fuerza,edge,terreno}/`; 7 named groups each (frame, fork, wheel-front, wheel-rear, drivetrain, cockpit, seatpost-saddle) for a later exploded view.
  - Colorways: Fuerza Retro Greige (ref `fuerza-retro-greige-bike.jpg`), Edge Gen 2 white/black (ref `edge-gen2-archive.jpg`, rider-occluded: drive side + geometry inferred), Terreno black UD carbon (ref `terreno-showroom-ugc.jpg`).
  - The `/lab/bikes` preview page was deleted 2026-10-07; the models stay in `entities/bike-models/` for the viewer.
  - img2threejs workdirs (specs, renders, evidence): `context/3d/<bike>/`, excluded from `vp check`.
  - Open: per-part selectable meshes vs merged groups (draw calls); clean Edge photo from client.

## Known Issues

- Logos are traced, not client masters
- Photos max 2048px; none are true full-bleed resolution
- No founder photos, no geometry data, Terreno imagery weak

## Lessons from this session

- [Add before closing]

## On Session End

- Add lessons learned to `../../tasks/lessons.md`
- Update Status at the top of this file
