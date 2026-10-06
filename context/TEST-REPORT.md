# Vellum Cycles home — desktop test report

Tester pass, 2026-10-07. Production build (`apps/web/.output`, `node server/index.mjs`) on port 4317, Playwright-core headless Chromium, 1440x900 and 1280x800, plus a `reducedMotion: reduce` context. Mobile and tablet are out of scope (deferred by Chan). Screenshots and test scripts are in:
`/private/tmp/claude-501/-Users-chanchan-Programming-Iridel-demos-vellum-demo/5f2da215-199a-4b1f-813c-47051829e79e/scratchpad/` (scripts `t1`..`t17.cjs`, shared `lib.cjs`).

## Verdict

**FIX FIRST.** The hero, nav logic, models split, heritage scrub and reduced-motion behaviour all hold up. Keyboard focus rings are invisible on almost every interactive element (verified live), the hero statement collides with the rider's wheel, and every CTA from the home page lands on a stub page.

## What I ran

- Served the build on 127.0.0.1:4317 (not 3000). Server killed by PID afterwards, port confirmed free. Every browser closed in `finally`. The only "headless"-matching process left is a VS Code copilot SDK, which is not mine.
- Intro timeline sampled per animation frame (letters, stripe group, bands, copy, rider) with a layout-shift observer. CLS = 0.
- Wheel-driven scroll for nav hide/show, parallax, heritage scrub and sticky showroom, with computed-style and `getBoundingClientRect` assertions, not just screenshots.
- Keyboard: full Tab walk of the page, Models dropdown (Enter, Space, ArrowDown/Up, Home/End, Esc, outside click), Menu overlay (trap, Shift+Tab, Esc, scroll lock, focus return).
- Contrast calculated over every text node. Accent-colour audit over every element. Every internal CTA clicked through. Image load check. Console, pageerror and failed-request capture. Reduced-motion context.

## Defects

### [Major] Focus ring is invisible on almost every interactive element

- **Where:** site-wide. Nav logo, Models, Menu, hero CTA, "Our story", all three models columns, Shop the look, Get directions, Message us, footer links, the Menu overlay links (spot-check `site-nav.tsx:67`, `site-menu.tsx` `FOCUS`, `models-split-section.tsx:42`).
- **Repro:** 1. Load `/`. 2. Press Tab repeatedly. 3. Read `getComputedStyle(document.activeElement)`.
- **Expected:** a visible 2px orange ring with a 2px offset (DESIGN §2 `--ring`: "2px, offset 2px, every ground").
- **Actual:** computed `outline-style: none` with `outline-width: 2px; outline-color: rgb(229,118,29)`. Nothing is drawn. Screenshots show no ring on the logo, Models and Explore Fuerza (`focus-logo.png`, `focus-models.png`, `focus-cta.png`). Probable cause (code reading, unverified): Tailwind v4 `outline-none` sets `--tw-outline-style: none`, so `focus-visible:outline-2` never gets a style. `outline-hidden` is the v4 idiom. Only the footer logo and the iridel link show a faint 1px default ring (`outline-style: auto`, orange at 50%).
- **Why it matters:** a keyboard user cannot see where they are. DESIGN §8 requires a focus-visible orange ring on all interactive elements.
- **Confidence:** verified live.

### [Major] Hero statement overlaps the rider's rear wheel and spokes

- **Where:** hero, bottom-left h1 "TWO DECADES OF EDGE." (muted `#6B6864`). `hero-section.tsx`, `hero-rider.png`.
- **Repro:** 1. Open `/` at 1440x900 or 1280x800. 2. Look at the second h1 line.
- **Expected:** statement readable on bone ground (DESIGN §6D: bottom-left, clear of the rider).
- **Actual:** the h1 sits at z-10 over the rear wheel. "OF EDGE." is crossed by the tyre and spokes at 1440; at 1280 "DECADES OF EDGE." and the full stop collide with the wheel. The muted grey over dark tyre pixels is hard to read. Screenshots `hero-1440.png`, `hero-1280.png`.
- **Why it matters:** this is the first thing the client sees and it is the page's h1.
- **Confidence:** verified live.

### [Major] Every home CTA lands on a stub page; /about shows template placeholder copy

- **Where:** `/models/fuerza`, `/models/edge`, `/models/terreno`, `/models`, `/merch`, `/about`.
- **Repro:** click Explore Fuerza, Our story, a models column, Shop the look.
- **Expected:** real destination pages (PRD routes).
- **Actual:** each page renders only an h1 plus nav and footer, about 320-370 characters of text. `/about` h1 reads "Born from passion. Built for global performance." (template copy). `/models/fuerza` title is "Fuerza Disc | Vellum Cycles". The destinations resolve with no console error.
- **Why it matters:** the home page is a dead end on every click. This may simply be phase scope, since I was told to test the home page. Confirm it is intended.
- **Confidence:** verified live.

### [Minor] Footer "Demo by iridel.com" credit is effectively invisible

- **Where:** footer bottom-right, `text-muted-foreground/40` on ink.
- **Repro:** scroll to the footer. Measured contrast is 1.5:1 at about 10px (`footer-bottom.png`).
- **Expected:** subtle but readable. RULES.md:146 asks for a subtle credit, not an unreadable one.
- **Actual:** barely visible. The hover state `/70` is the only legible state.
- **Confidence:** verified live.

### [Minor] Root font size is fluid (13.4px at 1440, 12.6px at 1280), so small text gets very small

- **Where:** `app.css:16`, `font-size: calc(0.3556rem + 0.537vw)`.
- **Actual:** `text-label` is about 10px at 1440 and 9.4px at 1280. `text-caption` is about 10.9px / 10.2px. Hero stat caption, dealers heading, heritage captions and button labels are all that size. Muted text is 4.92:1 on bone, which passes, but the size makes it hard to read. Body is 14.3px.
- **Confidence:** verified live (measured). Whether this is intentional zo-stack fluid scaling is Chan's call.

### [Minor] Messenger link appears nowhere on the home page

- **Where:** `inquire-link.tsx` supports `channel="messenger"` (`https://m.me/vellumcycles`), but no home element uses it. PRD line 59 names Messenger as the secondary channel.
- **Actual:** all inquiry links use the Instagram DM (`https://ig.me/m/vellumcycles`, `_blank`, `rel="noopener noreferrer"`, verified). The Messenger link is not exercised or reachable.
- **Confidence:** verified live (no such `href` in the DOM).

### [Minor] "Models" trigger text greys out while the dropdown is open

- **Where:** nav pill (`nav-models-click.png`).
- **Actual:** "MODELS ^" turns muted grey on open, while "MENU" stays ink. This looks like a disabled state on the trigger that opened the menu. The Edge thumbnail also renders narrower than the 72px thumb box, because the archive photo has a white border and the box shows the bone fill beside it.
- **Confidence:** verified live (visual).

### [Minor] Edge column in the models split reads as a flat grey panel

- **Where:** `models-split-section.tsx`, Edge archive photo (`scroll-1440-04.png`).
- **Actual:** the white-bordered archive photo at 0.7 opacity gives a large grey frame. It breaks the ink/graphite rhythm of the other two columns, and the photo's own "edge" logo sits next to the white edge wordmark overlay. This is an asset issue noted in a code comment as a known compromise.
- **Confidence:** verified live (visual).

### [Nit] The "white rounded bar" in the "e" is the e's counter (not a bug)

- **Where:** hero wordmark, `hero-wordmark.tsx`, "e" path (evenodd subpath).
- **Findings:** pixel sample at the bar is (244,241,236), the bone ground, not white. It is the e's eye hole. The original `vellum-wordmark-black.svg` has the same counter (compared against `orig-wordmark.png`). It reads as a floating white bar only because the stripe now surrounds it. There is also a thin bone sliver under the e's stripe, matching the original logo's lower cut.
- **Suggestion:** nothing is broken. If it bothers the client, have the designer decide whether the e's eye should stay open when the stripe fills the letter.

### [Nit] Template leftovers still routable

- **Where:** `/lab/gsap-hero` renders a template hero ("MADE WITH CARE / BUILT TO LAST"). `sitemap.xml` emits `http://localhost:3000/...` absolute URLs (env `VITE_SITE_URL` at build), and lacks `/models/*` entries.
- **Confidence:** verified live.

### [Nit] Small hit targets

- Nav logo link is 107x15. Footer text links are about 23px tall. Hero "Our story" and CTAs are 40px, which is fine.

## Held up under attack

- **Hero intro:** letters rise with stagger, bands sweep scaleX 0 to 1, copy fades up, and the rider eases its last 40px. Everything ends in the final state (all `matrix(1,0,0,1,0,0)`, visibility visible, opacity 1) at about 1.7s after navigation. Frame samples show no flash of the final state before the start state. CLS = 0. The rider is never hidden, so it is a valid LCP.
- **Reduced motion:** everything is in its final state from the first frame (no transforms, copy and letters visible), CLS = 0. The heritage strip becomes a native `overflow-x:auto` scroller with snap, `position: static`, and `scrollLeft` moves on a horizontal wheel. It is keyboard-focusable (a Tab stop). The models split no longer widens (equal widths) and keeps the opacity dim. No page errors.
- **Rider PNG:** genuinely RGBA. Corner alpha is 0, with a soft semi-transparent edge, and there is no halo when composited on bone or magenta. Spokes are faint but present.
- **Stripe clipping:** the stripe renders only inside the letterforms. Bands are in the right order (orange, red, burgundy). No bleed onto the ground (sampled).
- **Scroll parallax:** rider moves 0 to -80px and wordmark 0 to -30px, linear with scroll.
- **Nav pill:**
  - Hides on scroll down (translated off-screen from 80px) and returns on scroll up.
  - The pill never overlaps the sticky showroom image (pill bottom 67px vs image top 81px at 1440, 63 vs 75 at 1280).
  - Models dropdown: opens on click, Enter, Space and ArrowDown; Arrow/Home/End move focus; Esc closes and returns focus to the trigger; outside click closes.
  - Menu overlay: focus lands on Close; Tab cycles inside the overlay (Models, About, Merch, IG, FB, Inquire, logo, Close); Shift+Tab works; body scroll is locked (wheel does nothing); Esc closes and focus returns to the Menu button; scroll is restored.
  - Menu links close the overlay and navigate.
  - Browser Back returns to `/` with the hero intact.
- **Models split:** hover widens the column to about 682px (flex-grow 1.8) with the others at 379px. Siblings dim from 0.7 to 0.4. Retargeting mid-animation interpolates cleanly. Rapid pointer sweeps settle on the right column. Leaving the section or blurring resets to 480/480/480. Keyboard focus widens the focused column.
- **Heritage sticky scrub:** the track travels 0 to -900px over the first 85% of the section's scroll. The last frame's right edge sits exactly on the gutter (1415px) from f=0.9 onward and holds until the section releases. Release is clean, with no jump (just-before and after-release positions match).
- **Showroom:** sticky image works at both widths. Dealer list shows all 8 rows with hairline borders.
- **External links:** Instagram DM, Facebook, Google Maps and the Instagram links in the Menu and footer all have `target="_blank"` and `rel="noopener noreferrer"`, with sr-only "opens in new tab" text. The IG DM is `https://ig.me/m/vellumcycles`.
- **Everything else:** h1 count is exactly 1 on `/` (and 1 on each sub-page). No console errors, warnings, failed requests or 4xx on `/` (the only 404 was my deliberate `/nonexistent` probe, which renders a proper 404 page). No broken images (every `img` has a nonzero `naturalWidth` and alt text, except the lazy ones that load on scroll). No horizontal overflow at 1440 or 1280. A hard reload mid-page (scroll 3497) restores scroll and a correct hero state.
- **Accent audit:** orange/red/burgundy appear only in the hero wordmark stripe rects and the footer 3-band stripe (graphic). No accent used on text, buttons, icons or section backgrounds. The "Limited" tag is not on the home page.
- **Contrast:** muted `#6B6864` on bone is 4.92, on paper 5.54, muted on ink 6.69. All text passes 4.5:1 except the footer credit (1.5:1, reported above).
- **Stripe-on-logo rule:** the nav lockup stays solid black, and the hero wordmark is the allowed exception.

## Not tested

- Mobile and tablet (explicitly deferred).
- Real touch, WebKit and Firefox. Headless Chromium only. CPU-throttle and slow-network decode-race tests were not run.
- CDP screencast frame capture. I used per-rAF computed-style sampling instead, which is stronger for state but not a pixel record.
- The inner pages beyond confirming that CTAs resolve (they are stubs).
- Dark mode, print, and an actual Lighthouse run.
- `vp check`, `vp run test:unit:run` and `vp run build`: I used the existing build output as instructed and did not run the toolchain checks.
- Whether the 3-band footer stripe is meant as a signature graphic (DESIGN §2 item 1). I treated it as allowed.

## Fixed (coder pass, desktop only)

- **Focus rings (Major):** root cause confirmed in the built CSS. Tailwind v4 `outline-none` AND `outline-hidden` both emit `--tw-outline-style: none; outline-style: none`, and `focus-visible:outline-2` reads `outline-style: var(--tw-outline-style)`, so the ring never got a style. Removed the redundant `outline-none` (browsers only outline on `:focus-visible` anyway) from the shared button base, nav trigger, nav logo, menu overlay `FOCUS`, footer links and models columns; added rings to the footer logo and credit, which had the faint UA ring. Only the Models dropdown item keeps `outline-hidden` (it signals focus with a bone fill). Verified live: full Tab walk shows `outline-style: solid`, 2px, rgb(229,118,29) on every stop.
- **Footer credit:** `text-muted-on-dark` (#9A968F, ~6.7:1 on ink), hover `text-paper`.
- **Models trigger:** `data-[state=open]:opacity-100` on the shared nav trigger, stays ink while open.
- **Nav logo hit target:** `::after` extends the clickable area to about 107x48; visual and focus ring unchanged.
- **Label/caption size:** `text-label` and `--text-caption` floor at 12px (`max(0.75rem, 12px)`); fluid root untouched. Computed 12px at 1440.
- **Messenger:** "Messenger" link-style action added next to "Message us" in the showroom (`https://m.me/vellumcycles`).
