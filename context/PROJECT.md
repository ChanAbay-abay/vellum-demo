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
- `/about` (coder): `pages/about/**` only, copy in `config/about.content.ts` (`*` = our placeholder lines). Bone hero (two-line h1 + PRD story, Retro head-tube photo, 3-band stripe at the logo slant sliding in behind it; CSS entrance, `motion-reduce:animate-none`) → paper founders (two bone typographic cards, name in display type over a stripe band that draws in on view) → ink philosophy (frame-tube photo + four PRD principles) → paper timeline (9 PRD rows, year sticky per row, vertical stripe beam scrubbed with GSAP `scaleY`; archive photos grained, Edge 2007 collage grayscale; 2012 Uno TT gets a sand typographic panel) → bone socials (IG primary + FB link only, static 3×2 lifestyle grid) → paper showroom (visit info, open/closed status, dealer list, grayscale lazy Google Maps iframe + "Open in Google Maps") → shared `<ClosingCta>`. Home `Showroom` not reused: pages can't import pages (FSD), so About has a smaller local version; suggest moving `Showroom` to `widgets/` later. Verified at 1440×900 with Playwright: 0 console/page errors (motion + reduced), every reveal settled after a wheel pass, beam 0 → 0.67 → 1, map iframe body loads, `filter: grayscale(1)`. Mobile not polished; only checked for no horizontal overflow (fixed one: map box `min-h` forced 442px). Screens: `context/screens/about/`. `vp check` + `vp run build` pass

- Edge rollout (coder, round 4): Edge opens on the tour (hero dropped; intro beat "Two decades of Edge." over the Edge wordmark, full spin into "2007."; last beat retitled "Gen 1, then Gen 2." so the h1 line isn't repeated). Spec sheet 4 PRD rows. Gallery 4 archive + 4 Pexels samples (`shared/assets/images/edge/samples/`, chips with credits), 4-up grid, heading "From the archive." / "Two decades on." (PROPOSED). CTA right-aligned (`ClosingCta align`). Beats/gallery/heading lines now keyed by index (duplicate-key warning fixed). Screens `vellum-cycles-demo/screens/model-page/r4/`
- 2026-10-07 Hero scrim + mobile (coder): a static bone scrim sits between the rider and the copy (radial from the bottom-left on desktop, linear from the bottom on phones and tablets). frameRect and the poster CSS now have a portrait branch, keyed on the container query `orientation: portrait` so the poster matches the canvas on first paint. On phones the copy stacks with full-width 48px CTAs and the stage is `h-svh`. On coarse or narrow screens the canvas DPR is capped at 1.5, with 3 requests in flight and every other frame (45 requests instead of 89). Worst measured contrast, before → after: ink 1.0 → 8.6, burgundy 1.0 → 6.5, the red end of "EDGE." 1.0 → 3.6. The orange end is 2.0, and only 2.69 even on clean bone (a token limit, not fixable by a scrim). CLS 0 and 0 console errors at 390/430/768/1440. Screens: `context/screens/mobile/hero/`. `vp check` is clean on the hero (its 4 errors are in model-tour.tsx, owned by another session), and `vp run build` passes
- 2026-10-07 Mobile nav (coder, `features/site-nav/**` only): below `md` (768) the pill is lockup + MENU (Catalogue hidden: under 430px it squashed the lockup); ≥768 pill measured pixel-identical to before at 768/1024/1440. Existing ink overlay (Radix Dialog) gains Lenis stop/start, close on any route change (router `onResolved`, covers back/forward), 44px tap targets, safe-area insets, a phone-only CSS staggered rise (none under reduced motion). Playwright 390/430/768/1440 × / /models/fuerza /about, normal + reduced motion: open/close by click and Esc, focus trap over 14 Tabs, focus returns to toggle, aria-expanded/controls, body locked, 0 console errors. Screens: `context/screens/mobile/nav/`.
- 2026-10-07 Model gallery on phones (coder, T3, `model-gallery.tsx` only): colorway pills 44px on phones (40 at lg), featured Rudy Project pill first on phones (CSS `order-first`, Q3 = yes) and in view at 390, featured tag hidden below lg (clipped by the scroller), pill row has a right-edge fade and no scrollbar, `mt` 4.75rem to 1rem below lg. Fuerza, Edge and Terreno photos are 78vw snap rails below `sm` (gallery blocks 1398/3768/2346 to 380px each, doc width 390); `sm` and up unchanged (1440 gallery screenshots pixel-identical for Edge and Terreno; Fuerza differs only in the pulsing ring). Playwright 390 (touch swipe advances the rail, `elementFromPoint` hits the active list, `aria-pressed` follows tap and Enter), normal and reduced motion: 0 console errors. Screens: `context/screens/mobile/gallery/`. Remaining: the heading-to-pill gap at 390 is 64px (48px section spacing outside this file, plus the 16px margin), not the plan's 24px

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
- 2026-10-07: wave1-c (T4 showroom actions/dealer arrows, T5 footer 44px targets, T6 viewport-fit=cover, hero EDGE gradient orange->burgundy). Desktop scrollHeight/footer identical to HEAD; screens in context/screens/mobile/wave1-c/.
- 2026-10-07: wave1-d (T7 merch 2-up on phones, T8 about story 1.125rem, T9 image widths + 480/828). Desktop heights identical (merch 3952, about 10395; needed sm:leading-[1.25] restate, since leading-* sets --tw-leading that text-subheading reads). 390: merch 6439 to 3950px tall, about story 12 to 9 lines. Assets dir 77.5 to 99.1 MB. Screens: context/screens/mobile/wave1-d/.
- 2026-10-07: tour A (T1 per Chan's revised spec, T2, T10, reduced-motion fix; model-tour, tour-controls, bike-stage, app.css). Phones (<md): arrows bottom-left, pill bottom-right, one row, 15px inset, bottom 1rem+safe-area; 44px arrows; gap 32/62/31px at 360/390/430; label "Summary" below 26.5rem (full label collides up to ~415px). 768: stacked, centred, 20px gap. Canvas full-bleed, lift 0.19, DPR 1.5 on coarse (2 at 1440@2x), compileAsync, 70svh beats below lg. Landscape-short (<lg) uses the desktop column. Reduced motion no longer loads scrolled (hydration swap was replayed as a live toggle). 1440/1280 rects and scrollHeights identical; 2/30 baseline camera strings were stale captures. Screens: context/screens/mobile/tour/.
- 2026-10-07: T11 minors fixed (below lg/md only). 320 overflow: /models h1 + lineup name shrink at <=22.5rem, /about timeline li grid minmax(0,1fr) + panel w-full (aspect+min-h forced 341px col); tour counter/pill tightened at <=22.5rem (gap 20px, 44px targets); nav triggers max-lg:min-h-11 (44 at 768, 34 at 1440 unchanged); summary h2 mb 0.5rem below md (gallery gap 64 to 24px). scrollWidth 320 at 320; 0 console errors.
- 2026-10-07: home perf "regression" 98 -> 81 is a measurement artefact, not code. Lighthouse simulate on localhost is bimodal: the audit's 98 ran on a cold brotli server (on-demand q11 compression delayed the 195 KiB main chunk to 1.8 s, after observed FCP 0.8 s, so Lantern left it out of FCP); T11 ran warm (everything in <100 ms, all JS counted). Same-condition A/B: 868a87b vs HEAD warm 75 vs 81 (FCP 2.55/2.70 s, LCP 5.8/4.3 s); devtools throttling 81 vs 93 (FCP 1.70/1.71 s). No perf change made. Hero scrim gets `h-[max(50%,25rem)] sm:h-[50%]`: 320x640 contrast ink 2.52->7.19, burgundy 2.59->5.77, EDGE 2.52->3.75 (red end on pure bone, same as 390); 390/430 and >=sm unchanged.
