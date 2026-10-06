# Vellum Cycles — Brand Board & Design Direction

> Binding on the coder. If a value is here, use it verbatim.

---

## 0. Brand intake

| Input            | What we have                                                                                                                                  | Source                   |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| Logo files       | No vectors from client. We traced mark, "vellum" wordmark and "edge" wordmark to clean polygon SVGs: `brand/logos/`                           | traced from JPG/IG story |
| Brand colors     | None given. Sampled from Retro jersey print, 22-year poster and studio shoots (see §2)                                                        | scraped                  |
| Fonts named      | None. Story graphics use a Futura-style geometric sans, wide-tracked caps                                                                     | IG stories               |
| Existing site    | vellum-cycles.com (Squarespace, down)                                                                                                         |                          |
| Brand deck       | none                                                                                                                                          |                          |
| Photography      | Strong studio sets for Retro (sand backdrop), Spectrum Silver/Ghost (graphite), Champagne (sage), Rudy Project (red). Lots of UGC. Max 2048px | IG                       |
| Hard constraints | Logo is always solid black or solid white. Never put the stripe on the logo.                                                                  | observed                 |

**Missing and needed:** founder portraits, official vectors, geometry data. Logos are traced and must be replaced with client masters before handoff.

---

## 1. Direction

**Feels like:** a gallery catalogue for race machines: white space, black type, and one hot stripe that does all the talking.
**Reference system:** editorial product sites in the Apple/Porsche Design vein. Took scale contrast, very large product imagery, long quiet sections. Left out glossy gradients and glassmorphism.
**Took:** oversized display type, generous whitespace, ink/paper section alternation, single signature graphic (the 3-band stripe).
**Deliberately left:** card grids for marketing content, rounded corners, drop shadows.

**Visual references from client's own feed:** the "Retro is the New Look" poster (ig-035): stripe running edge to edge through the layout; the About Us stories: wide-tracked uppercase small text under heavy headings.

**Anti-goals:**

- Centered hero with badge eyebrow and two pill buttons
- Generic "bike shop" red/black aggression
- Accent colors as section backgrounds
- shadcn default blue anywhere

**AI-slop test:** without the stripe and the sharp-angled logo this could drift generic. The stripe system (§2, §6) is mandatory, not decoration.

---

## 2. Tokens

Sampled values: jersey print orange `#E77517`, red `#BC323F`, burgundy `#5D3840`; poster red `#BA3F3B`, burgundy `#5B2B2F`; studio backdrop `#D3C2AE`. Final screen values below are averaged and nudged for consistency.

```css
:root {
  --ink: #0b0b0a; /* logo black */
  --paper: #ffffff;
  --bone: #f4f1ec; /* warm off-white, alt light sections */
  --sand: #d3c2ae; /* Retro studio backdrop */
  --graphite: #1a1a19; /* dark section alt */
  --rule: #e2ded7; /* hairlines on light */
  --rule-dark: #2a2a28; /* hairlines on dark */
  --stripe-orange: #e5761d;
  --stripe-red: #be3440;
  --stripe-burgundy: #5c3340;
  --brand: var(--ink);
  --brand-foreground: var(--paper);
  --radius: 0rem;
}
```

| Var                                | Value                 | Notes                         |
| ---------------------------------- | --------------------- | ----------------------------- |
| `--background`                     | `#FFFFFF`             |                               |
| `--foreground`                     | `#0B0B0A`             |                               |
| `--primary`                        | `#0B0B0A`             | buttons are ink, not orange   |
| `--primary-foreground`             | `#FFFFFF`             |                               |
| `--muted` / `--muted-foreground`   | `#F4F1EC` / `#6B6864` |                               |
| `--accent` / `--accent-foreground` | `#BE3440` / `#FFFFFF` |                               |
| `--border`                         | `#E2DED7`             |                               |
| `--input`                          | `#E2DED7`             |                               |
| `--ring`                           | `#E5761D`             | 2px, offset 2px, every ground |
| `--destructive`                    | `#BE3440`             |                               |

**Accent allowed in exactly 3 places:**

1. The 3-band stripe graphic (orange / red / burgundy, always in that order, equal heights, diagonal at the logo angle ≈ 18°)
2. Active nav underline and focus ring (orange)
3. "Limited" tag on Retro colorways (red text)

**Forbidden:** section backgrounds, body text, icons, buttons.

**Contrast (computed):**

| Pair                     | Ratio | Use                                                           |
| ------------------------ | ----- | ------------------------------------------------------------- |
| ink on paper             | 19.69 | body                                                          |
| ink on bone              | 17.48 | body                                                          |
| muted `#6B6864` on paper | 5.54  | captions                                                      |
| muted `#6B6864` on bone  | 4.92  | captions                                                      |
| `#9A968F` on ink         | 6.69  | muted text on dark                                            |
| ink on sand              | 11.34 | text over sand backdrop                                       |
| red on paper             | 5.59  | Limited tag                                                   |
| orange on ink            | 6.51  | ring on dark                                                  |
| orange on paper          | 3.03  | ring on light (non-text, ≥3:1 OK); never orange text on white |

---

## 3. Type

| Role    | Family | Source                      | CSS var          |
| ------- | ------ | --------------------------- | ---------------- |
| Display | Jost   | `@fontsource-variable/jost` | `--font-display` |
| Body    | Jost   | same                        | `--font-sans`    |

| Token             | Size (rem) | Weight | Line-height | Tracking          |
| ----------------- | ---------- | ------ | ----------- | ----------------- |
| `text-display`    | 9.0        | 600    | 0.9         | -0.04em           |
| `text-title`      | 5.0        | 600    | 0.95        | -0.03em           |
| `text-heading`    | 2.75       | 500    | 1.05        | -0.02em           |
| `text-subheading` | 1.5        | 400    | 1.25        | -0.01em           |
| `text-body`       | 1.0625     | 400    | 1.6         | 0                 |
| `text-label`      | 0.75       | 500    | 1.2         | 0.22em, uppercase |
| `text-caption`    | 0.8125     | 400    | 1.4         | 0.02em            |

**Rules:** model names (FUERZA, TERRENO) in display, uppercase, weight 600, italic skew `-12deg` via `transform: skewX(-12deg)` to echo the logo slant. "edge" always uses the SVG wordmark. Labels are wide-tracked uppercase like their story graphics. Max line length 62ch. No weight above 600.

**Approved exception (Chan, 2026-10-07):** the warranty numeral "5" is set slanted (`skewX(-12deg)`), filled with the 3-band stripe, and wipes in once via clip-path; see `design/model-summary-direction.md` §2. Round 3 (Chan, 2026-10-07) adds, as one badge: a rotating text seal, a slanted "YEARS / on every frame" lockup, an offset ink-outline echo, and a scroll-driven slide of the stripe bands inside the 5 (`shared/ui/warranty-badge.tsx`). The model-page closing CTA also uses the 3-band stripe under its heading (`shared/ui/closing-cta.tsx`).

---

## 4. Spacing, rhythm, layout

- Section padding: `py-[8rem]` desktop, `py-[5rem]` mobile
- Gutter: `p-[var(--gutter)]`
- Grid: 12 columns, gap `1.5rem`
- Inside a section: label → `1.5rem` → heading → `2rem` → body → `3rem` → CTA
- Radii: 0 everywhere
- Borders: hairline `--rule` only for spec tables and the warranty list
- Shadows: none. Separation by ground (paper / bone / ink / sand)
- Section ground sequence (home): ink (hero) → paper → ink (models split) → sand (merch) → paper (heritage) → bone (showroom) → ink (footer)

---

## 5. Motion

| Interaction        | Library | Property                            | Duration   | Easing            | Interrupt  |
| ------------------ | ------- | ----------------------------------- | ---------- | ----------------- | ---------- |
| Hero intro         | GSAP    | stripe scaleX, clip-path, SplitText | 1.4s total | `expo.out`        | n/a (once) |
| Models split hover | Motion  | flex-grow, opacity                  | 0.6s       | `[0.22,1,0.36,1]` | retarget   |
| Card/link hover    | Motion  | image scale 1→1.04, underline       | 0.4s       | `[0.22,1,0.36,1]` | retarget   |
| Nav / route change | CSS     | opacity                             | 0.25s      | ease-out          | cut        |
| Scroll reveal      | Motion  | y 24px→0, opacity                   | 0.7s       | `[0.22,1,0.36,1]` | none       |
| Colorway switch    | Motion  | crossfade + stripe slide            | 0.5s       | `[0.22,1,0.36,1]` | retarget   |
| Heritage strip     | GSAP    | horizontal scrub (sticky)           | scroll     | none              | scrub      |

- Pinning: native sticky + GSAP `scrub`, never `pin: true`.
- Reduced motion: stripe appears at full width, no SplitText, heritage strip becomes a normal horizontal overflow scroller, hovers keep color change only.
- Page must read fully with all scroll effects removed.

---

## 6. Hero direction

### Direction A — The Stripe (recommended)

- **Composition:** ink ground. Right 60%: `hero-retro-black-frame.jpg` (frame on sand), cropped tight, full height. Left 40%: type. The 3-band stripe enters from the left edge at 18°, passes behind the type and runs under the photo, echoing the frame paint.
- **Type:** "two decades of" in `text-subheading` label style over the `edge` SVG wordmark at ~40vw wide, white. Body line and two CTAs below.
- **Motion:** stripe bands draw in one after another (orange, red, burgundy, 120ms stagger), photo clip-reveals from left, wordmark slides in on X with the stripe.
- **Assets:** existing hero photo, edge wordmark SVG.
- **Risk:** photo is 1536px wide. Keep it inside 60% column so it never upscales past ~1.3x.

### Direction B — Vellum Paper

- **Composition:** white. Full-bleed `fuerza-retro-greige-bike.jpg` sits behind a translucent "vellum" layer (white at 85% with backdrop blur). On scroll the layer lifts away like tracing paper, revealing the bike.
- **Type:** huge "SET THE PACE." ink on the paper layer; campaign line below.
- **Motion:** GSAP scrub on the overlay opacity and translateY.
- **Risk:** blur cost on low-end mobiles; needs a static fallback.

### Direction C — Graphite Studio

- **Composition:** dark graphite ground, `fuerza-spectrum-silver-bike.jpg` centered large, a soft light sweep crossing the frame.
- **Type:** "FUERZA" display behind the bike (bike overlaps type).
- **Risk:** needs a clean cutout of the bike, which we don't have. Most generic of the three.

### Direction D — Rider over wordmark (CHOSEN by Chan, 2026-10-07 — supersedes A–C)

Reference: "Veloform" e-bike hero (giant condensed brand word behind a centred rider cut-out).
Chan explicitly overrode the "centered hero" anti-goal in §1 for this hero only.

- **Ground:** bone `#F4F1EC` full viewport (`h-svh`), not ink. Nav is a floating pill over it.
- **Wordmark:** the full "vellum" wordmark (`brand/logos/vellum-wordmark-black.svg`) spans the
  viewport width edge to edge (gutter-inset), vertically centred ~45% from top, BEHIND the rider.
  Fill is ink; the 3-band stripe (orange/red/burgundy, equal bands, -18°) is clipped INSIDE the
  letterforms only (SVG `clipPath`/`mask` from the wordmark paths) — so the accent lives in the
  letters, never on the ground. This replaces the free-floating stripe of Direction A.
  §0 "never put the stripe on the logo" is relaxed for this hero wordmark only (Chan's choice); the nav lockup stays solid.
- **Rider:** transparent PNG/WebP cut-out of a rider on a Fuerza, grayscale, centred, bottom-anchored,
  ~85svh tall, overlapping the wordmark (z above). Source: Chan generates a studio shot in Google
  Flow; until then a placeholder cut-out at `hero-rider.(png|webp)`. Swap = replace the file only.
- **Bottom-left:** two-line statement in display caps, ink + muted grey split like the reference:
  "SET THE PACE." / "TWO DECADES OF EDGE." (second phrase muted `#6B6864`). Primary CTA below
  (Explore Fuerza → /models/fuerza).
- **Bottom-right:** one stat with a left hairline: "2004" big + "Designed in Cebu. Built for those
  who set the pace." caption. Secondary link "Our story →" /about.
- **Motion (GSAP, 1.4s, expo.out, once):** wordmark letters rise from y 30% with clip reveal
  (60ms stagger) → stripe inside letters sweeps scaleX 0→1 (bands staggered 120ms) → rider fades/
  rises 40px → corner copy fades up. Subtle scroll scrub: rider moves up faster than the wordmark
  (parallax, ≤80px). Reduced motion: everything static, final state.
- **Mobile:** wordmark still full-width (it's short), rider ~70svh, corner blocks stack under.

### Nav (CHOSEN by Chan, 2026-10-07 — supersedes §8 Nav row)

Reference: "Onglatco" floating pill. Fixed, inset `top-4 inset-x-4` (max-w 1440 centred), height
~4rem, **fully rounded pill** (the one radius exception), bone/white 80% + backdrop-blur, hairline
`--rule` border. Left: vellum lockup (black). Right: "Models ▾" (dropdown listing Fuerza / Edge /
Terreno, each with a small thumb) and "Menu ≡" (opens full-screen ink overlay with large display
links Models · About · Merch, IG/FB links, and the Inquire CTA → IG DM). Pill stays light on every
ground. Hides on scroll down, shows on scroll up (after 80px).

**Recommendation:** A. (superseded by D) It turns the brand's own Retro stripe into the hero and puts the campaign line front and centre.

**Build rule:** build one. Alternates go on `hero-explorations`.

---

## 7. Worked example

**Hero (A):**
`section.h-svh.bg-ink.text-paper.grid.grid-cols-12.overflow-hidden.relative`

- Stripe: absolutely positioned `div` with 3 children, each `h-[2.25rem]` desktop / `h-[1.25rem]` mobile, colors orange/red/burgundy, container `rotate-[-18deg]`, spans `-10vw` to `110vw`, `top-[58%]`, `z-0`.
- Type column `col-span-5 self-end pb-[6rem] z-10`: label "TWO DECADES OF" `text-label text-[#9A968F]` → edge wordmark `w-full max-w-[42rem]` → body `text-subheading text-paper/80 max-w-[28ch]` → CTAs.
- Image `col-span-7 h-full` `<Picture>` `object-cover object-[60%_50%]`.

**Models split:**
`section.bg-ink.flex.h-[90svh]` (mobile `flex-col h-auto`). Each column `flex-1 relative overflow-hidden` with image `absolute inset-0 object-cover opacity-70`, bottom-left label in display skewed, line in `text-caption`. Hover sets `flex-grow: 1.8` on target and `opacity-40` on siblings' images. Edge column shows the SVG wordmark instead of text.

**Merch row:**
`section.bg-sand.h-[60svh]` with `merch-retro-jersey-print.jpg` cropped to the stripe, right half. Left: label, heading, CTA. Single row, no grid.

---

## 8. Component direction

| Component         | Variants                                             | Skin notes                                                                                                    |
| ----------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Button            | default (ink), inverse (paper), link                 | Square, `h-[3rem] px-[1.75rem]`, `text-label`. Hover: background slides in from left. One primary per section |
| Card              | product (merch, colorway)                            | No border, no shadow. Image 4:5, name, meta in caption, "Inquire →" link                                      |
| Nav               | transparent over hero, solid paper after 80px scroll | Logo swaps white/black by ground                                                                              |
| Colorway switcher | swatch buttons                                       | 1.5rem squares filled with the colorway's dominant tone; active gets orange 2px underline                     |
| Spec table        | hairline rows                                        | label left `text-label`, value right `text-body`                                                              |

All interactive elements define hover, focus-visible (orange ring), active, disabled.

---

## 9. Imagery

- **Direction:** studio product shots for product pages; UGC only in lifestyle/social blocks.
- **Treatment:** heritage images in full colour with slight grain (Chan, 2026-10-07; was grayscale). Product images untouched.
- **Format rule:** source JPG in `apps/web/src/shared/assets/images/`, rendered via `<Picture>`.
- **Needed and missing:** founder portraits; a clean Terreno studio shot; a cutout of Fuerza for future use; OG image.

---

## 10. Reusable for the next client

The "signature graphic as the only accent" pattern and the hover-expanding split section are reusable in `demo-template`. Polygon tracing script for sharp-edged logos (OpenCV `approxPolyDP`) is worth adding to tooling.

---

## Written by

`designer` · 2026-10-07
