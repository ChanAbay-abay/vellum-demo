# Vellum: mobile view and optimization plan

Architect, 2026-10-07. Desktop is signed off; this pass is phones (390×844) and tablets (768×1024).
Chan's decisions are already made (not re-asked): the 3D tours stay on phones but lighter (DPR about 1.5,
portrait reflow, controls and pill reflowed, poster as fallback); the scope is load performance, touch and a11y,
and animation smoothness.

**Not in this plan.** Other agents own these: `apps/web/src/features/site-nav/**` (logo + MENU overlay),
`pages/home/ui/hero-section.tsx`, and `pages/home/ui/hero-wordmark.tsx`. No task below touches them. Where
the audit found something in their files, it is listed under "Handed to peers".

Rules that bind every task: `Iridel/tasks/RULES.md`, plus `rules/05-responsive.md` §19 and `rules/06-accessibility.md` §20.
In particular:

- **Mobile-first edits only.** Change the base class and restate the signed-off desktop value at `sm:`/`lg:`.
  Never alter an existing `lg:`/`xl:` value.
- **Never restructure shared JSX for a mobile-only bug.** Add a separate `lg:hidden` sibling instead.
- **One library per element.**
- **Prove desktop is unchanged by the numbers** (see T0 and T11).

Read `context/DESIGN.md` §3–§5 only for the sections a task names.

---

## 1. Audit: method and evidence

**Dev audit.** Run on a dev server on port 3103 with Playwright 1.63 Chromium, using `isMobile`, `hasTouch` and an iPhone UA:

- 390×844 @3x and 768×1024 @2x
- Every route: `/`, `/models`, `/models/fuerza`, `/models/edge`, `/models/terreno`, `/about`, `/merch`. The footer is covered on every route.
- Viewport frames at stepped scroll positions, which fire ScrollTrigger. A `fullPage` capture does not (RULES §28).
- Computed values on every frame:
  - `scrollWidth` vs `clientWidth`
  - elements whose box leaves the viewport
  - interactive elements smaller than 44px
  - text under 12px
  - fixed and sticky boxes
  - the `layout-shift` observer
  - each `<img>`'s `currentSrc` and natural vs rendered width

**Tour measurement.** A separate script measured the tour on `/models/fuerza` and `/models/edge` at 390×844, 768×1024 and 844×390 landscape. It recorded:

- the rects of the controls, arrows, pill, beat copy and canvas
- the canvas DPR (`canvas.width / clientWidth`)

**Lighthouse.** Lighthouse 13.5 mobile (simulated throttling) ran against a production build (`vp run build`) on 3103, in two setups:

- (a) nitro `node .output/server/index.mjs`, which serves **uncompressed** files
- (b) the same `public/` from a static server with **brotli and immutable caching** on `/assets`. This approximates Vercel. Use (b) as the real number.

**Profiling.** CDP CPU profile with 4× throttle, plus a WebGL draw-call and shader-program counter.

**Evidence.** It lives in `context/screens/mobile/audit/`:

- `390/`, `768/` — `<route>-NN.png` stepped frames (00 = top)
- `tour/` — `{390,768,844l}-models-{fuerza,edge}-{0.02,0.35,0.7}.png` (pinned tour at 2%/35%/70%)
- `detail/390-768-844l-tour-controls-overlap.png` — the controls/pill overlap, side by side at three sizes
- `detail/390-colorway-pill-and-showroom-actions.png`
- `data/summary-{390,768}-a.json` — every measured value per route
- `data/lhbr-{home,fuerza,models,about}.json` — Lighthouse, brotli. `lh-home-1.json` and `lh-fuerza-1.json` are the uncompressed runs.

**Concurrency caveat.** Peers were editing the nav, the home hero and the model tour during the audit:

- The home frames show the hero mid-change.
- `model-tour.tsx` and `tour-controls.tsx` were modified at 05:28–05:33, after the measurements. That was a peer's Fuerza tester-fix pass.

The tour numbers below are from before that pass. The defects they show are layout defects that pass does not address; check its diff before starting T1.

### Lighthouse mobile (real numbers, read from the JSON)

| Route            | Setup                 | Perf    | A11y | BP  | SEO | FCP   | LCP   | TBT        | CLS   | Weight    |
| ---------------- | --------------------- | ------- | ---- | --- | --- | ----- | ----- | ---------- | ----- | --------- |
| `/`              | uncompressed (2 runs) | 58 / 59 | 100  | 100 | 100 | 6.5 s | 8.3 s | 20 ms      | 0     | 5,336 KiB |
| `/models/fuerza` | uncompressed (2 runs) | 32 / 32 | 94   | 100 | 100 | 6.2 s | 6.5 s | 11.2 s     | 0     | 1,651 KiB |
| `/`              | **brotli**            | **98**  | 100  | 100 | 100 | 1.1 s | 1.9 s | 30 ms      | 0     | 4,580 KiB |
| `/models/fuerza` | **brotli**            | **67**  | 94   | 100 | 100 | 1.6 s | 1.6 s | **10.2 s** | 0.005 | 429 KiB   |
| `/models`        | brotli                | 88      | 100  | 100 | 100 | 2.5 s | 3.3 s | 0          | 0     | 455 KiB   |
| `/about`         | brotli                | 89      | 100  | 100 | 100 | 1.3 s | 3.6 s | 0          | 0     | 609 KiB   |

How to read these:

- **The uncompressed numbers are not the deploy.** The 671 KiB main chunk ships raw from nitro's preview, which inflates FCP. Brotli brings it to 195 KiB.
- **Fuerza TBT 10.2 s is mostly SwiftShader.**
  - The CPU profile shows ~0.45 s of JS for stage setup and ~0.18 s for the first render at 4× throttle.
  - Everything else is native "(program)" time, which is SwiftShader rasterising WebGL on the CPU.
  - Per frame the bike is only ~22 draw calls and ~75k triangles, with 10 shader programs (8 on Edge, 12 on Terreno).
  - So on a real phone GPU the costs are fill rate (canvas pixels × DPR) and shader compile. That is what T2 targets.
  - Real-device TBT is **reasoned, not measured**. Headless cannot measure GPU cost (RULES §25, §28).

Top opportunities (brotli runs):

| #   | Route            | Opportunity                                                                                                              | Owner                                              |
| --- | ---------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| 1   | `/models/fuerza` | Main-thread work 12.1 s (WebGL, see above); bootup 2.0 s. A11y 94: `heading-order` and `target-size`                     | T1, T2 (the peer pass already fixes heading-order) |
| 2   | `/about`         | Image delivery −227 KiB. 1080w files served for ~380 CSS px slots, because the pipeline has no step between 640 and 1080 | T9                                                 |
| 3   | `/models`        | Image delivery −122 KiB, same cause. LCP is the first-row AVIF (1.3 s load)                                              | T9                                                 |
| 4   | `/`              | Hero frame sequence: 45 requests, 4,049 KiB of the 4,580 KiB page                                                        | **Peer (home hero)**                               |
| 5   | All              | Unused JS ~95–99 KiB of the 195 KiB main chunk; render-blocking CSS 18 KiB br (est. 150 ms)                              | **Deferred to v2** (see §5)                        |

Fonts are already self-hosted with the latin subset preloaded and `font-display: swap`; Lighthouse raises no font audit. CLS is 0 on every route at load.

---

## 2. Defect list (with evidence)

Severity: **Major** = visibly broken or unusable on a phone; **Minor** = degraded; **Nit**.

| ID  | Sev       | Where                             | Defect                                                                                                                                                                                                                                                                                                                                          | Evidence (measured)                                                                                                                                                                                                              |
| --- | --------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | **Major** | Tour, all 3 model pages, < 1024px | **Chan's report.** The beat controls `← 01 / 08 →` and the "Jump to summary" pill overlap: the pill covers the counter.                                                                                                                                                                                                                         | 390×844: controls y 757–793, pill y 776–820, **17 px overlap**, both centred at x 195. 320×640 (peer tester): the pill overlaps the beat copy (copy y 451–602, pill from y 572). `detail/390-768-844l-tour-controls-overlap.png` |
| D2  | Minor     | Tour, 768                         | Controls and pill are not on one axis. The controls centre in the 30rem copy column (x 255), while the pill centres on the viewport (x 384).                                                                                                                                                                                                    | `tour/768-models-fuerza-0.02.png`: controls x 167–343, pill x 275–492                                                                                                                                                            |
| D3  | **Major** | Tour, < 1024                      | The canvas is cut to the top 62% (`bottom-[38%]`). Close-up beats get a hard horizontal crop line through the bike at y≈523 (390) / 635 (768). This violates RULES §25 (canvas full-bleed, offset the projection).                                                                                                                              | canvas rect 390×523 at a 390×844 viewport; `390/models-fuerza-04.png`, `-05.png`; 768 sheet frames 3–6                                                                                                                           |
| D4  | Minor     | Tour, phones                      | The canvas renders at DPR 2 on 3× phones (`MAX_DPR = 2`), where Chan asked for ~1.5.                                                                                                                                                                                                                                                            | `canvas.width/clientWidth = 2.00` at 390@3x and 768@2x                                                                                                                                                                           |
| D5  | Minor     | Tour arrows                       | Arrow buttons are 36×36. **Peer pass in flight** adds a 44px `after:` hit layer; the visual stays 36px.                                                                                                                                                                                                                                         | `smallTargets`: "Previous/Next feature" 36×36; LH `target-size` fail                                                                                                                                                             |
| D6  | Minor     | Tour landscape phone (844×390)    | Broken. The controls sit at y 375–411, **off-screen** (viewport 390). The pill (y 322–366) overlaps the beat copy (y 242–355), which overlaps the giant title. The canvas is 242 px tall.                                                                                                                                                       | `tour/844l-models-fuerza-0.02.png`                                                                                                                                                                                               |
| D7  | Minor     | Fuerza colorway pill (390)        | (a) Buttons are 40px tall. (b) The featured **Rudy Project** pill is last in a scroller (`scrollWidth 916 / clientWidth 360`), off-screen on load. Its "Rudy Project × Vellum" tag (top 177) is clipped by the scroller (fieldset top 199, `overflow: auto`). (c) The `mt-[4.75rem]` room reserved for that tag is a 76px empty band on phones. | `detail/390-colorway-pill-and-showroom-actions.png` (left)                                                                                                                                                                       |
| D8  | Minor     | Model galleries (390)             | Photos stack one per row at 100vw. The Fuerza colorway block is **1,398 px tall**; Edge has 8 photos and Terreno 5, all full width. RULES §19 says a long vertical stack becomes a snap rail on mobile.                                                                                                                                         | `390/models-fuerza-07…08.png`, `390/models-edge-08.png`                                                                                                                                                                          |
| D9  | Minor     | Home showroom (390)               | The three actions wrap badly. "GET DIRECTIONS" and "MESSAGE US" share a row, and "MESSENGER" sits orphaned on its own line.                                                                                                                                                                                                                     | `detail/390-colorway-pill-and-showroom-actions.png` (right)                                                                                                                                                                      |
| D10 | Minor     | Home showroom dealers             | Dealer names (Ross Cycle Center, Crankmasters, …) are links whose only affordance is a **hover-only** arrow (`opacity-0` → `group-hover/name:opacity-100`), so on touch they read as plain text. They are also 27px tall.                                                                                                                       | `smallTargets`: 61–130 × 27 at y≈6094–6382                                                                                                                                                                                       |
| D11 | Minor     | Footer (every route)              | Small tap targets: Models / About / Merch / email / Instagram / Facebook are 27px tall, the credit is 16px, the logo link is 35px.                                                                                                                                                                                                              | `smallTargets` on every route                                                                                                                                                                                                    |
| D12 | Minor     | `<head>`                          | The viewport meta is `width=device-width, initial-scale=1` with **no `viewport-fit=cover`**, so every `env(safe-area-inset-*)` resolves to 0 on iPhone. That includes the peers' nav and hero (`site-nav.tsx`, `site-menu.tsx`, `hero-section.tsx` already use it).                                                                             | `viewportMeta` in `data/summary-390-a.json`; from `packages/seo/src/head.ts:39`                                                                                                                                                  |
| D13 | Minor     | `/merch` (390)                    | Products in one column, 6 cards ≈ 3,000 px. RULES §19 says product grids are `grid-cols-2` on mobile.                                                                                                                                                                                                                                           | `390/merch-01…05.png`                                                                                                                                                                                                            |
| D14 | Nit       | `/about` hero (390)               | The story paragraph is `text-subheading` (24px) and runs ~13 lines, so the first viewport is all text and the photo starts below the fold.                                                                                                                                                                                                      | `390/about-00.png`                                                                                                                                                                                                               |
| D15 | Minor     | Image pipeline                    | Widths are `640;1080;1600;2400`. A 380–420 CSS px slot at DPR 1.75–2 needs ~700–840 px but gets 1080. This drives opportunities 2–3.                                                                                                                                                                                                            | LH `image-delivery-insight` (above)                                                                                                                                                                                              |
| D16 | Nit       | Tour (dev)                        | A cumulative 0.028 layout-shift during a stepped scroll, attributed to the beat `ol` and the controls row. **Possibly HMR from the peer's edit at that moment.** Reasoned, not reproduced; LH on the build shows 0.005.                                                                                                                         | `data/summary-390-a.json` → `/models/fuerza.endCls`                                                                                                                                                                              |

**Checked and fine.** These are recorded so nobody "fixes" them:

- No horizontal overflow on any route at 390 or 768 (`scrollWidth === clientWidth` on every frame; the peer tester also checked 320 and 375).
- The `warranty-seal` box reported at −18…411 is the axis-aligned bbox of a _rotated_ `<g>`. The ring is visually inside, so this is not a defect.
- The heritage strip is already a native snap rail below `lg`.
- No hover-only UI besides D10. The models split, gallery hover-bike and CTA zoom are gated on `pointerType === "mouse"` or `(hover:hover)`, and the merch hover underline is decoration only.
- No text under 12px.
- No console or page errors on any route.
- The `'07` glyph clipped in the About timeline collage is the same at 768 and desktop. It is a deliberate crop, not a mobile defect.
- The palm-tree button bottom-right in the screenshots is TanStack devtools (dev only), not in the prod build.

**Handed to peers** (their files; the orchestrator relays these):

- **Nav:**
  - MENU and CATALOGUE are 40px tall at **768**, because `max-md:min-h-11` stops below `md`.
  - The nav logo link is 13–16px tall.
  - Both need a coarse-pointer rule (`pointer-coarse:min-h-11` or a `lg:` restate), not a width rule (RULES §14).
- **Home hero:** the frame sequence loads 45 frames / ~4.0 MB on Lighthouse mobile. This is the single biggest weight on the site.
- **Both:** their `env(safe-area-inset-*)` paddings only work once T6 lands.

---

## 3. Tasks

Every task below is finishable without a design call. Values marked **ASSUMED** are defaults I chose; Chan can overturn them in §4.

The **mobile query** used in JS is `(max-width: 63.98rem)`, which is the complement of `lg` (64rem).

**Finishing any task requires:**

1. `vp check --fix` is clean.
2. The task's acceptance checks are measured in Playwright with `isMobile: true, hasTouch: true`, real wheel or stepped scroll (RULES §28), on **your own** dev server port.
3. The desktop check: `document.body.scrollHeight` at 1440×900 and 1280×800 for the routes you touched is **byte-identical** to the T0 baseline.
4. You close every browser and kill your server by PID, and confirm the port is free.

### T0 — Desktop baseline (Sonnet tester, ~10 min, runs FIRST)

- **Files:** none in `src`. Writes `context/screens/mobile/baseline-desktop.json`.
- **Do:** on a fresh dev server, after the peer tour pass (gate G1) has landed and **before** any Wave 1 coder starts, record:
  1. at 1440×900, 1280×800 and 1170×800: `document.body.scrollHeight` per route (all 7)
  2. on `/models/fuerza`, `/models/edge` and `/models/terreno` at 1440×900: `[data-testid=model-canvas]`'s `dataset.camera` and `canvas.width/clientWidth` at tour progress 0.02, 0.25, 0.5, 0.75 and 0.98. Settle 1.5s per position.
- **Accept:** the JSON exists, with 21 heights and 15 camera strings per page.

### T1 — Tour controls and pill: separate, 44px, safe-area (Chan's defect D1, plus D2 and D5) — **Opus**

- **Files (owner):**
  - `apps/web/src/widgets/model-page/ui/model-tour.tsx`
  - `apps/web/src/widgets/model-page/ui/tour-controls.tsx`
- **Gate G1:** a peer's Fuerza tester-fix pass is editing both files (mtime 05:28–05:33). Its diff adds `atEnd`, the 44px `after:` hit layer, h3→h2 and `data-tour-*` attributes. Start only after the orchestrator confirms that pass is done, re-read both files, and keep everything it added.
- **Exact changes.** Desktop (`lg:` and up) must be pixel-identical. Every base change restates the desktop value at `lg:`.
  1. **Pill** (the in-stage `<a data-testid="jump-to-summary">` in `model-tour.tsx`):
     - `bottom-[1.5rem]` → `bottom-[calc(1rem+env(safe-area-inset-bottom))] lg:bottom-[1.5rem]`
     - Keep `h-[2.75rem]` (44px).
  2. **Copy column** (the pinned branch of the `z-20` copy wrapper, currently `absolute inset-x-0 bottom-0 flex h-[38%] flex-col justify-center gap-[1.25rem] px-(--gutter) lg:top-0 lg:h-auto lg:w-[34%]`) →
     `absolute inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] flex flex-col justify-end gap-[1rem] px-(--gutter) lg:top-0 lg:bottom-0 lg:h-auto lg:w-[34%] lg:justify-center lg:gap-[1.25rem]`.
     The 5rem is 1rem (pill to the screen edge) + 2.75rem (pill) + **1.25rem gap** between the arrows and the pill. The copy now bottom-anchors above the dock instead of centring in a 38% band.
  3. **Controls wrapper** (`flex w-full max-w-[30rem] justify-center`) → `flex w-full justify-center lg:max-w-[30rem]`. Below `lg` the arrows centre on the viewport, on the same axis as the pill. Desktop keeps the 30rem column.
  4. **Arrow size** (`ARROW` in `tour-controls.tsx`): `size-[2.25rem]` → `size-[2.75rem] lg:size-[2.25rem]`. The visual button is a real 44×44 on touch, and the peer's `after:` 44px layer still serves desktop. The control row is then 44 + 4 + 96 + 4 + 44 = **192 × 44 px**.
- **Resulting geometry at 390×844 with inset 0.** These are the numbers the tester checks:
  - pill y 784–828
  - arrow row y 720–764
  - **gap 20 px**
  - both centred at x 195 ±1
  - With the iPhone home-indicator inset of 34px, everything rises 34px.
- **Accept** (measure `getBoundingClientRect`, not screenshots):
  - **Separation.** At 390×844, 375×667, 320×640, 768×1024 and 1000×800, on all 3 model pages and at tour progress 0.02, 0.5 and 0.98:
    - pill ∩ controls = ∅
    - `pill.top − controls.bottom` ≥ 16 px
    - the visible beat (opacity > 0.5) ∩ controls = ∅, and beat ∩ pill = ∅
  - **Targets and alignment:**
    - each arrow is ≥ 44×44
    - pill height = 44
    - pill and controls centre-x within 1px of each other and of `innerWidth/2`
  - **Safe area:**
    - the pill's computed `bottom` = 16px at inset 0
    - the source class contains `env(safe-area-inset-bottom)`
    - Report the non-zero inset as **reasoned, not verified**: headless has no safe area (RULES §30). It goes on Chan's device checklist (T12).
  - **Desktop:** at 1440×900 the controls, pill and copy rects equal the T0-time values (re-measure them in T0 or before your edit). The T0 scrollHeights are identical.
  - **No layout shift:** no `layout-shift` entries attributed to `[data-beat]`, the `ol` or the controls during a 10-step wheel pass through the tour (closes D16, or proves it was HMR).

### T2 — Tour lighter on phones: full-bleed canvas, lifted framing, DPR 1.5, async shader compile (D3, D4) — **Opus**, serial after T1

- **Files (owner):**
  - `apps/web/src/widgets/model-page/lib/bike-stage.ts`
  - `apps/web/src/widgets/model-page/ui/model-tour.tsx` (same owner as T1, done after it)
- **Do not touch** `apps/web/src/entities/bike-models/**`. It is read-only; the profile shows the factory is not the bottleneck.
- **Exact changes:**
  1. **Canvas wrapper** (pinned branch: `inset-x-0 top-0 bottom-[38%] lg:bottom-0`) → `inset-0`. Desktop was already `bottom-0`, so it is unchanged. This removes the hard crop line.
  2. **`bike-stage.ts`: vertical framing.** Add the option `lift?: () => number` (default `() => 0`), the fraction of the canvas height to move the subject **up**.
     - In `applyPose`: `const dy = lift() * h;` then `if ((dx || dy) && w && h) camera.setViewOffset(w, h, -dx, dy, w, h); else camera.clearViewOffset();`
     - The distance back-off `Math.max(1, 1/aspect)` is unchanged. The bike keeps the same on-screen width (horizontal world extent ∝ distance × aspect), so beats keep their authored size.
  3. **`model-tour.tsx`: framing constants.**
     - Add `const LIFT = 0.19;`. This puts the subject centre at 31% from the top, the centre of the old 62% canvas.
     - Add ``const LIFT_QUERY = `(max-width: 63.98rem) and ${MOTION_QUERIES.motion}`;``
     - Pass `lift: () => (window.matchMedia(LIFT_QUERY).matches ? LIFT : 0)` next to `shift`.
  4. **Mobile scrim** (new sibling, mobile-only, next to the existing desktop scrim inside `pinned ? …`):
     `<div aria-hidden className="from-ink via-ink/85 pointer-events-none absolute inset-x-0 bottom-0 z-[15] h-[45%] bg-linear-to-t to-transparent lg:hidden" />`
     Close-ups now pass behind the copy, and the scrim keeps the copy readable, mirroring the desktop left scrim.
  5. **DPR:** replace the module constant `MAX_DPR = 2` with, inside `createBikeStage`, `const maxDpr = window.matchMedia("(pointer: coarse)").matches ? 1.5 : 2;`. That gives about 56% of the pixels per frame on phones. The canvas is now taller (390×844 instead of 390×523), so the net is ~0.9× today's fill cost on a phone, versus 1.6× if the DPR stayed at 2.
  6. **Async shader compile:**
     - Add `let compiled = false;`
     - After the scene is built, call `renderer.compileAsync(scene, camera).catch(() => {}).finally(() => { compiled = true; dirty = true; });` (three 0.186 has `compileAsync`)
     - In `tick`, return early while `!compiled`.
     - The canvas stays at `opacity-0` until the first frame (`onReady`), so nothing visible changes. It just avoids a synchronous program-link stall on the first `render()`.
  7. **Phone tour length (only if Chan answers Q2 = 70):**
     - Replace the inline `"--beat-h": \`${BEAT_SVH}svh\``with the classes`[--beat-h:70svh] lg:[--beat-h:90svh]` on the section.
     - Remove `BEAT_SVH` if it is unused after that.
     - The ScrollTrigger range and the arrow hold points derive from the section's real height, so nothing else changes. ASSUMED default if unanswered: **keep 90svh**, no change.
- **Accept:**
  - **Canvas:** at 390×844, the canvas rect = `0,0,390,844`. The poster still mounts when WebGL fails: launch with `--disable-webgl` and assert `[data-testid=tour-poster]` exists and the copy is readable.
  - **DPR:** `canvas.width / canvas.clientWidth` = **1.5** at 390@3x and 768@2x with `hasTouch`. Confirm in-page that `matchMedia("(pointer: coarse)").matches === true` in that context, or the test lies. It = **2** at 1440×900@2x without touch.
  - **Framing:** at the intro beat (progress 0.02) on all 3 bikes, take the screenshot's non-ink pixel bbox above the copy column. Its centre y must sit between 22% and 40% of `innerHeight`. No bike pixel may be clipped by the canvas edge except at the viewport edges.
  - **Desktop unchanged:** at 1440×900, `dataset.camera` at the five T0 positions is **byte-identical** to T0 on all 3 pages. This proves `lift` is 0 and the framing is untouched. The T0 scrollHeights are identical.
  - **Long tasks:** with a CDP 4× CPU throttle at 390, record the `longtask` entries from navigation to `onReady` before and after. Report both lists. State plainly that they are SwiftShader numbers and that real-GPU cost goes to T12.
  - **Lighthouse:** re-run mobile on `/models/fuerza` (brotli static on your port, method §1) and record the score. Do not claim a TBT win as real-device truth.

### T3 — Model gallery on phones: 44px pill, featured visible, photo rails (D7, D8) — **Sonnet**

- **Files (owner):** `apps/web/src/widgets/model-page/ui/model-gallery.tsx`
- **Gate G1:** it was modified by the same peer pass (mtime 05:11). Re-read it after the gate.
- **Exact changes:**
  1. **Colorway fieldset:** `mt-[4.75rem]` → `mt-[1rem] lg:mt-[4.75rem]`. Add `[scrollbar-width:none]` and the right-edge swipe hint `[mask-image:linear-gradient(to_right,black_85%,transparent)] lg:[mask-image:none]`.
  2. **Pill buttons** (`h-[2.5rem]` in the segment button class) → `h-[2.75rem] lg:h-[2.5rem]`.
  3. **Featured tag** (`data-testid="featured-tag"`): add `hidden lg:block`. It cannot render inside a horizontal scroller without being clipped. The pulsing ring stays.
  4. **Featured position on phones (per Q3, ASSUMED A):** on the featured segment button (`data-featured`), add `order-first lg:order-none`. This is CSS only; the JSX order is untouched. If Chan answers B, skip this step.
  5. **Colorway photo grid** (`grid gap-[1.5rem] [grid-area:1/1] sm:grid-cols-3`) →
     `flex gap-[0.75rem] overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] -mx-(--gutter) px-(--gutter) scroll-px-(--gutter) [grid-area:1/1] sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-[1.5rem] sm:overflow-visible sm:px-0 sm:snap-none`
     - Its `<li>`: add `w-[78vw] shrink-0 snap-start sm:w-auto sm:shrink`.
     - Photo `sizes`: `"(min-width: 640px) 31vw, 78vw"`.
  6. **Generic gallery grid** (Edge/Terreno, `grid gap-[1.5rem] sm:grid-cols-2` + `lg:grid-cols-3|4`): the same rail classes as step 5, with `sm:grid-cols-2` restated and the `lg:` classes untouched.
     - `<li>` as in step 5.
     - In `sizes`, replace the trailing `100vw` with `78vw`.
  7. Leave "Past colorways" (`w-[11rem]` wrap) as is.
- **Accept:**
  - **Featured pill:** at 390, every pill button is ≥ 44 tall. On Fuerza, the featured "Rudy Project" button is fully inside the fieldset's visible box on load (Q3 = A). The band between the "Seven Colorways." heading block and the pill is ≤ 24px of empty space.
  - **Rails:**
    - each active rail has `scrollWidth > clientWidth`, and document `scrollWidth === 390`
    - the Fuerza colorway block is ≤ 560 px tall (was 1,398)
    - the Edge gallery block is ≤ 560 px tall
    - a swipe (CDP `Input.dispatchTouchEvent` drag, right to left) on the active rail advances it to the next snap point, and `document.elementFromPoint` at the rail centre is inside the **active** colorway's list (inactive lists are `pointer-events-none`)
  - **Colorway switch:** tapping a colorway still crossfades, and `aria-pressed` updates.
  - **640 and up:** identical to before (T0 scrollHeights). A screenshot at 768 matches the pre-change audit frame `768/models-fuerza-09.png` region.
  - **Reduced motion:** with `reducedMotion: "reduce"` there are no errors and the rails still scroll.

### T4 — Home showroom: actions row and dealer links on touch (D9, D10) — **Sonnet**

- **Files (owner):** `apps/web/src/pages/home/ui/showroom-section.tsx`
- **Exact changes:**
  1. **Action row** (`mt-[2rem] flex flex-wrap items-center gap-x-[2.5rem] gap-y-[0.5rem]`) →
     `mt-[2rem] grid grid-cols-2 items-center gap-x-[1.5rem] gap-y-[0.5rem] sm:flex sm:flex-wrap sm:gap-x-[2.5rem]`
     On the first child (the Get directions `<a>`), add `col-span-2 sm:col-auto`. Phones get a full-width primary, then Message us | Messenger side by side.
  2. **Dealer name links** (`group/name relative inline-block …`): add the hit extension
     `after:absolute after:inset-x-0 after:-inset-y-[0.625rem] after:content-['']` (27 → 47px).
  3. **Their arrow icon:** replace `-translate-x-[0.35rem] opacity-0` with `pointer-fine:-translate-x-[0.35rem] pointer-fine:opacity-0`. On touch the arrow is always visible: the touch state is the default and the hover state is hidden under the capability variant (RULES §14). Keep the `group-hover/name:` and `group-focus-visible/name:` classes.
- **Accept:**
  - **Action row:** at 390 there are exactly two action rows. Directions width = the column width. Message us and Messenger share one `top`. Nothing is orphaned.
  - **Arrows on touch:** the dealer arrow's computed opacity is `1` at rest with `hasTouch`.
  - **Arrows on desktop:** the arrow's computed opacity is `0` at rest and `1` on hover. **Verify the cascade order** with a real `mouse.move` (not `page.hover`), because `pointer-fine:` and `group-hover/name:` are both media-wrapped. If hover loses, report `ESCALATE` rather than adding `!important`.
  - **Tap targets:** each dealer link's effective tap height is ≥ 44. Measure the `::after` via the link's rect plus 2 × 10px, or with `elementFromPoint` 20px above and below the text centre.
  - **Desktop:** T0 heights identical for `/`.

### T5 — Footer tap targets (D11) — **Sonnet**

- **Files (owner):** `apps/web/src/features/site-footer/ui/site-footer.tsx`
- **Exact changes:**
  1. `LINK` const: append `inline-flex min-h-11 items-center lg:min-h-0`.
  2. Explore `<nav>` and the Contact `<div>` (`flex flex-col gap-[0.75rem]`) → `flex flex-col gap-[0.25rem] lg:gap-[0.75rem]`. This keeps the mobile column from ballooning.
  3. Credit `<a>`: add `inline-flex min-h-11 items-center lg:min-h-0`.
  4. Logo `<Link>`: add `inline-block py-[0.375rem] lg:inline lg:py-0`. Restate `inline` at `lg`, so the desktop line box is unchanged.
- **Accept:**
  - At 390 and 768, every footer link is ≥ 44 tall: Models, About, Merch, email, Message us, Instagram, Facebook, the credit and the logo.
  - The credit appears once.
  - At 1440, the footer's `getBoundingClientRect().height` and the T0 scrollHeights are identical.

### T6 — `viewport-fit=cover` (D12) — **Sonnet**, batch with T4 and T5

- **Files (owner):** `apps/web/src/routes/__root.tsx`. Do not edit `packages/seo` (the CTO's).
- **Change:** in `head()`, map `rootSeo.meta`. Replace the entry whose `name === "viewport"` with
  `{ name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" }` and keep its position.
- **Accept:**
  - After `vp run build`, `grep -o '<meta[^>]*name="viewport"[^>]*>'` on `.output/public/index.html` and `.output/public/models/fuerza/index.html` returns **exactly one** tag on each page, containing `viewport-fit=cover`.
  - Unit tests pass.
  - Tell the orchestrator so the nav and hero peers know their `env()` paddings are now live.
  - **Risk:** in iPhone landscape, content may now sit under the notch. That is covered by Q1/T10, and T12 checks it.

### T7 — Merch grid two-up on phones (D13) — **Sonnet**

- **Files (owner):** `apps/web/src/pages/merch/ui/products-section.tsx`
- **Exact changes:**
  1. Products `<ul>`: `mt-[3.5rem] grid gap-x-[1.5rem] gap-y-[3.5rem] sm:grid-cols-2 …` →
     `mt-[3.5rem] grid grid-cols-2 gap-x-[0.75rem] gap-y-[2.5rem] sm:gap-x-[1.5rem] sm:gap-y-[3.5rem] sm:grid-cols-2 …`. The `lg:` classes are untouched.
  2. Card image box: `min-h-[16rem]` → `min-h-[12rem] sm:min-h-[16rem]`.
  3. Card name: `text-subheading` → `text-[1.125rem] leading-[1.3] sm:text-subheading`.
  4. Image `sizes`: change the final `100vw` to `50vw`.
- **Accept:**
  - At 390, cards 1 and 2 share the same `top`.
  - Each card's `scrollWidth ≤ clientWidth`.
  - The longest name ("Vellum × 18Myles Strapback Cap") wraps to ≤ 3 lines.
  - Every card is a single IG DM link ≥ 44 tall.
  - The page height drops.
  - T0 heights are identical at 1440, 1280 and 1170.

### T8 — About hero story size (D14) — **Sonnet**

- **Files (owner):** `apps/web/src/pages/about/ui/about-hero-section.tsx`. `git status` showed it modified since session start, so re-read it and confirm no live peer before editing.
- **Change:** story `<p className="text-subheading mt-[2.5rem] max-w-[46ch]">` → `text-[1.125rem] leading-[1.55] mt-[2rem] max-w-[46ch] sm:text-subheading sm:mt-[2.5rem]` (ASSUMED size).
- **Accept:**
  - At 390 the paragraph is ≤ 10 lines (was ~13).
  - The hero photo's top is ≤ 1.15 × `innerHeight`.
  - T0 heights are identical for `/about`.

### T9 — Responsive image widths (D15) — **Sonnet**, batch with T7 and T8

- **Files (owner):**
  - `apps/web/vite/responsive-images.ts` (Iridel-owned)
  - `apps/web/src/__tests__/responsive-image.test.ts`, only if it asserts the width list
- **Change:** `w: "640;1080;1600;2400"` → `w: "480;640;828;1080;1600;2400"`.
- **Accept:**
  - `vp run test:unit:run` and `vp run build` pass. Report the build time and the size of `.output/public/assets` before and after.
  - Lighthouse mobile (brotli static, §1 method) on `/about` and `/models`: `image-delivery-insight` savings drop from 227 / 122 KiB.
  - Report the new numbers and scores. No desktop visual change is expected, because desktop slots still pick ≥ 1080.

### T10 — Landscape phones (D6) — **Opus**, Wave 2, serial after T2, **only if Q1 = fix**

- **Files (owner):**
  - `apps/web/src/widgets/model-page/ui/model-tour.tsx`
  - `apps/web/src/shared/styles/app.css` (one line)
- **Changes:**
  1. In `app.css`, add `@custom-variant landscape-short (@media (orientation: landscape) and (max-height: 32rem));`.
  2. In the tour, under `landscape-short:` reuse the desktop arrangement:
     - copy column `landscape-short:top-0 landscape-short:bottom-0 landscape-short:w-[44%] landscape-short:justify-center landscape-short:gap-[0.75rem]`
     - desktop scrim `landscape-short:block`, mobile scrim `landscape-short:hidden`
     - `SHIFT_QUERY` extended with `, (orientation: landscape) and (max-height: 32rem)`, so `shift` applies
     - `LIFT_QUERY` excludes landscape (`and (orientation: portrait)`)
     - pill `landscape-short:bottom-[calc(0.75rem+env(safe-area-inset-bottom))] landscape-short:left-auto landscape-short:right-[max(var(--gutter),env(safe-area-inset-right))] landscape-short:translate-x-0`
     - copy padding-left `landscape-short:pl-[max(var(--gutter),env(safe-area-inset-left))]`
- **Accept:**
  - At 844×390 and 667×375, all of these are fully inside the viewport and pairwise non-overlapping: the beat copy, the controls (≥ 44px arrows) and the pill.
  - The bike is not under the copy.
  - Portrait and desktop numbers from T1 and T2 are unchanged.

### T11 — Verification pass (tester) — Wave 3

- **Model pages:** **Opus** (the first pass on complex scroll and 3D UI).
- **Home, models, about, merch and footer:** **Sonnet**.
- **Re-run** this audit's method at:
  - 390×844, 375×667, 320×640 and 768×1024
  - 844×390, if T10 ran
  - 1440×900 and 1280×800 for the desktop proof
- **Check:**
  - every acceptance check above
  - reduced motion (`reducedMotion: "reduce"`, with `pageerror` and console errors collected) on every route
  - the T0 baseline diff
- Lighthouse mobile, brotli static, on `/`, `/models`, `/models/fuerza` and `/about`. Record the scores next to §1's table in this file.
- The §29 grep checks: no eyebrow, marquee or new decorative border. The `[mask-image]` and `after:` hit layers are fine; a new `border` is not.
- Save the screens to `context/screens/mobile/after/`.

### T12 — Real-device check (Chan, 10 minutes, after deploy to a Vercel preview)

On an iPhone (Safari) and, if available, a mid-range Android (Chrome):

1. Every model page: the tour scrolls without stutter, and the bike looks sharp enough at DPR 1.5.
2. The arrows and the pill sit clearly apart **above the home indicator**.
3. Rotate to landscape: the copy and controls are reachable, and nothing is under the notch.
4. The colorway rail and the gallery rails swipe sideways without hijacking vertical scroll.
5. Dealer and footer links are easy to tap.
6. Report any jank with an **uncropped** screenshot, including the browser UI (RULES §28).

---

## Waves and ownership

**One owner per file.** No file appears in two tasks running at the same time.

| File                                                   | Task(s)                | Agent           |
| ------------------------------------------------------ | ---------------------- | --------------- |
| `widgets/model-page/ui/model-tour.tsx`                 | T1 → T2 → T10 (serial) | **A (Opus)**    |
| `widgets/model-page/ui/tour-controls.tsx`              | T1                     | A               |
| `widgets/model-page/lib/bike-stage.ts`                 | T2                     | A               |
| `shared/styles/app.css`                                | T10                    | A               |
| `widgets/model-page/ui/model-gallery.tsx`              | T3                     | **B (Sonnet)**  |
| `pages/home/ui/showroom-section.tsx`                   | T4                     | **C (Sonnet)**  |
| `features/site-footer/ui/site-footer.tsx`              | T5                     | C               |
| `routes/__root.tsx`                                    | T6                     | C               |
| `pages/merch/ui/products-section.tsx`                  | T7                     | **D (Sonnet)**  |
| `pages/about/ui/about-hero-section.tsx`                | T8                     | D               |
| `apps/web/vite/responsive-images.ts` (+ its unit test) | T9                     | D               |
| `context/screens/mobile/baseline-desktop.json`         | T0                     | tester (Sonnet) |

- **Gate G1, before anything else:** the peer's Fuerza tester-fix pass on `model-tour.tsx`, `tour-controls.tsx` and `model-gallery.tsx` must be finished. A and B depend on it directly, and T0's desktop baseline is meaningless while desktop is still changing.
- **Wave 0:** T0 (~10 min).
- **Wave 1, launched together:**
  - A runs T1, then T2. Serial, because both edit `model-tour.tsx` and T2's full-bleed canvas assumes T1's bottom-anchored copy.
  - B runs T3.
  - C runs T4, T5 and T6.
  - D runs T7, T8 and T9.
  - These are four agents. Only A and B drive heavy browser and WebGL work, which keeps the machine-load ceiling in check.
- **Wave 2:** T10 (A, only if Q1 = fix), after T2.
- **Wave 3:** T11. It needs every Wave 1/2 file to be final.
- **Then:** Chan does T12 on a preview deploy.
- **Serial, and why:**
  - T1 → T2 → T10 share `model-tour.tsx`.
  - T0 must precede every edit, because it is the desktop baseline.
  - T11 needs the others' output.
  - D's T9 build and A's and B's dev servers must use **different ports**. Never 3103 for two agents at once (RULES §28 port collisions).

## Assumed if Chan doesn't answer

- **Q1:** landscape phones get fixed (T10 runs).
- **Q2:** the phone tour keeps 90svh per beat. T2 step 7 is skipped.
- **Q3:** the featured Rudy Project pill moves first in the row on phones only (T3 step 4).
- **Other ASSUMED values:**
  - lift 0.19
  - mobile scrim 45%
  - a 1.25rem arrow-to-pill gap
  - rails at 78vw
  - merch name 1.125rem
  - about story 1.125rem
  - image widths 480/828 added
- Each is a single number in one file, so it is cheap to retune after T12.

---

## 4. Questions for Chan (one word each)

1. **Landscape phones**: the tour is broken sideways (controls off-screen). Fix now or defer? A) fix (T10, one Opus task) B) defer to v2 → **I'd pick A**. Rotating a phone is common on a product page, and the fix reuses the desktop layout.
2. **Phone tour length**: 8 beats at 90svh is ~7,000px of thumb-scrolling. A) keep 90svh B) 70svh (~5,600px) → **I'd pick B**. Pacing on a phone is driven by flicks, and the arrows and pill remain for jumping.
3. **Rudy Project pill on phones**: it is last in a sideways-scrolling row, off-screen, and its tag can't show. A) move it first on phones only B) leave it last → **I'd pick A**. You asked for it to be featured, and off-screen isn't featured.

## 5. Cut from this pass (said out loud)

These are deferred to v2, with the reasons:

- **Main-chunk split** (Lighthouse: ~99 KiB unused of 195 KiB br; est. −0.45 s FCP on `/models`). It means restructuring how GSAP, Motion and Lenis load across the CTO's template packages. The gain is moderate, and every page is already 88–98 with compression.
- **Render-blocking CSS** (18 KiB br, est. 150 ms). The same reasoning applies.
- **Building bike geometry in a Worker.** Profiled at ~0.45 s JS on a 4×-throttled CPU. It would mean changing the read-only `entities/bike-models`, and the bigger costs are fill rate and shader compile (T2).
- **About LCP render delay** (1.6 s "element render delay" on the hero paragraph). The cause is not established; the fade-in alone doesn't explain it under Chrome's LCP rules. Do not patch it blind. T11 re-measures it after T8 changes the paragraph.
- **Home hero weight** (4 MB frames) is the peer's. It is listed under "Handed to peers".

## Written by

architect (Opus), 2026-10-07. Audit servers, browsers and Lighthouse runs were all stopped by PID, and port 3103 was confirmed free.
