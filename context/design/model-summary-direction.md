# Model page close: recap, warranty, CTA. Design direction

> `designer` · 2026-10-07 · Fuerza first; Edge and Terreno inherit (see §4).
> Binding with DESIGN.md. Only the items marked **EXCEPTION** go beyond it; Chan approves them.
> RULES §4 wins over DESIGN.md §4: no eyebrows, no hairlines. All separation comes from ground, space, tonal fill and type.

## 0. The problem and the fix in one line

Today all three are the same block: a heading on the left, a text list on the right, one color per ground. They read like a form after the 3D tour and the gallery.
**Fix: give each section its own composition, alternating where the image sits.**

| #   | Section  | Ground | Composition                                                                                               | Image             |
| --- | -------- | ------ | --------------------------------------------------------------------------------------------------------- | ----------------- |
| 1   | Recap    | bone   | Spec sheet: sticky photo on the left, data on the right                                                   | left, sticky      |
| 2   | Warranty | paper  | Poster: one giant striped "5" next to grouped terms                                                       | none (type only)  |
| 3   | CTA      | sand   | Closing frame: big line on the left, photo bleeding off the right and bottom edges into the footer stripe | right, full bleed |

Stripe budget for the page bottom: the "5" in the warranty, plus the footer's existing flat band. Nothing else.

---

## 1. Recap ("The Fuerza, in short.")

**Intent:** turn everything the tour showed into one sheet the founders can scan in 10 seconds: what it is, what comes in the box, what a build looks like.

**Layout at 1440:** `section.bg-bone.px-(--gutter).py-[8rem]`, 12-col grid, `gap-x-[1.5rem]`.

```
| c1 ─────── c5 |   | c7 ───────────────────────────── c12 |
| [frame-tubes  |   | h2 The Fuerza, in short.              |
|  photo, 4:5,  |   | 01 Carbon frameset, designed in Cebu… |  7 numbered lines
|  sticky top   |   | …  07 22 years of Vellum…             |
|  6rem]        |   |                ↓ 4rem                 |
|               |   | FRAMESET INCLUDES | SIZES  | BUILT OR BARE |  facts row, 3 cols
|               |   | Frame, fork, …    | XS·S·M·L | Frameset only… |
|               |   |                ↓ 5rem                 |
|               |   | h3 Two example builds + note          |
|               |   |        | SPECTRUM SILVER·105 | WHITE HAZE·105 Di2 |
|               |   | GROUPSET | …R7020 11-speed  | …Di2 12-speed   |
|               |   | COCKPIT  |      Carbon cockpit (spans both)   |
```

- Photo: `lg:col-span-5`, reuse the home Showroom sticky pattern verbatim (`pages/home/ui/showroom-section.tsx`): `lg:sticky lg:top-[6rem] lg:h-[min(40rem,calc(100svh-9rem))]`, `object-cover`.
- Data column: `lg:col-span-6 lg:col-start-7`. Spacing: h2 → `2rem` → list → `4rem` → facts → `5rem` → builds.

**Content mapping (all from `fuerza.content.ts` / the PRD):**

- h2 is `summary.recapHeading`. Nothing goes above it.
- List: `tour.beats[].recap`, in order, prefixed `01`–`07` (order matches the tour).
- Facts row: `summary.specs` as a `<dl>` with 3 equal columns (`grid-cols-3 gap-x-[1.5rem]`). The `dt` is `text-label text-muted-foreground`; the `dd` sits `0.75rem` below in `text-subheading`.
- Builds: h3 is `builds.heading`, the note is `builds.note`, then a **comparison table** (see Detail moves).
- **PROPOSED** row labels (category names only, no new specs): `Groupset`, `Gearing`, `Wheels`, `Cockpit`, `Saddle`. This changes `ModelBuild.parts` from `string[]` to `{ label, value }[]`. The values stay exactly as they are now.
- Photo: `shared/assets/images/fuerza/details/fuerza-frame-tubes.jpg` (1220×1440, the stacked bare frames in silver, black and red). It's the one "engineering" image we have and it isn't used anywhere else. Alt **PROPOSED**: "Fuerza frames in three finishes, stacked in the studio".

**Detail moves:**

1. **The builds become a real comparison sheet.** Use a `<table>` with 3 columns (`grid-cols-[9rem_1fr_1fr]` if built as a grid). Each build column gets a tonal fill, `bg-paper`, with no border. The fill defines the column, the bone gaps between columns separate them, and the cells use `px-[1.25rem] py-[0.875rem]`. Row labels go in `text-label text-muted-foreground`; values in `text-caption` ink. **Where both builds share a value** ("Carbon cockpit"), render it once with `colSpan={2}` across both columns. That way the eye goes straight to what differs. Build names go in the header row, `text-label` ink, `pt-[1.5rem]`.
2. **Numerals:** `01`–`07` in `text-caption tabular-nums text-muted-foreground w-[2rem]`, aligned to the first baseline of each line. The line itself is `text-body`, gap `0.875rem`. No rule between items.
3. **Size values set as type, not prose.** "XS · S · M · L" in `text-subheading` with `tracking-[0.04em]` and the dots in `text-muted-foreground`.

**Motion:** the existing `Reveal` (§5 scroll reveal: y 24 to 0, 0.7s, `[0.22,1,0.36,1]`, once). The photo, the list block, the facts row and the table are four separate `Reveal`s. The list lines stagger by `delay={i * 0.05}`. Reduced motion: `MotionProvider` already reduces this to a fade, so nothing extra.

**Mobile:** photo on top (4:5, not sticky), then the list. Facts become 1 column. The table keeps its 3 columns with a `7rem` label column, or the coder flags it if it overflows.

---

## 2. Warranty ("Five years on every frame.")

**Intent:** a confidence moment. One number the CEO remembers, then the rules, grouped so the conditions read as fair rather than as fine print.

**Layout at 1440:** `section.bg-paper.px-(--gutter).py-[8rem]`, 12-col grid.

```
| c1 ────────── c5 |  | c6 ───────────────────────────── c12 |
|                  |  | h2 Five years on every frame.          |
|   ███            |  |              ↓ 3rem                    |
|   █   5  (28rem, |  | h3 Covered    | h3 Not covered          |
|   ███  striped,  |  | term 1        | term 3                  |
|     █  skewed)   |  |              ↓ 3rem                    |
|   ███            |  | h3 To claim (numbered 1–4)              |
|                  |  | terms 2, 4, 5, 6     → Start a warranty claim |
```

- Numeral: `lg:col-span-5 self-center`. Heading and terms: `lg:col-span-7 lg:col-start-6`.

**Content mapping:**

- h2 is `WARRANTY.heading`. Everything else comes from `WARRANTY.terms` (verbatim), regrouped in `warranty.content.ts`:
  - **PROPOSED** h3s: `Covered` holds term 1 (rendered in `text-subheading`, since it's the promise). `Not covered` holds term 3. `To claim` holds terms 2, 4, 5, 6, numbered 1–4.
  - This is still one source of truth, so the `/models` index picks it up too. That's intended.
- CTA: `WARRANTY.cta.label` as the existing `link` button, placed under the `To claim` list (where the reader is when they need it), `mt-[2rem]`.
- The numeral "5" is `aria-hidden`. The h2 carries the meaning.

**Detail moves:**

1. **The striped "5".** A Jost 600 glyph at `text-[28rem] leading-[0.8] tracking-[-0.04em]`, `skewX(-12deg)` (the logo slant), filled with the 3 bands clipped to the letterform. This is the same idea as the hero wordmark (DESIGN.md §6 D), so the page opens and closes on the same move. CSS: `bg-clip-text text-transparent` with `background-image: linear-gradient(162deg, var(--stripe-orange) 0 33.34%, var(--stripe-red) 33.34% 66.67%, var(--stripe-burgundy) 66.67%)`. 162deg = bands at −18°; check against the hero's stripe angle by eye.
   **EXCEPTION:** DESIGN.md §3 reserves the skew for model names. This extends it to this one numeral.
2. **Grouped terms:** h3 in `text-label` ink. The two-column `Covered | Not covered` pair (`grid-cols-2 gap-x-[1.5rem]`) gives a visual balance that a flat list of 6 doesn't. Term text is `text-body max-w-[46ch]`. The `To claim` numerals reuse the recap numeral style, so the two sections rhyme.
3. Separation comes only from whitespace between groups, `3rem`. No rules, no boxes.

**Motion:** the numeral reveals with `clip-path: inset(0 100% 0 0)` going to `inset(0 0 0 0)`, 0.9s, `[0.22,1,0.36,1]`, once at 40% in view, on Motion `whileInView`. It sweeps left to right like the hero's stripe draw. The text column uses the standard `Reveal` with `delay={0.15}`.
**EXCEPTION:** §5 lists clip-path only for the hero intro. This is a single, once-only reuse of it. Reduced motion: numeral static at its final state; text fade only.

**Mobile:** the numeral drops to `text-[12rem]` above the h2, left-aligned, and the groups stack.

---

## 3. CTA ("Find your Fuerza.")

**Intent:** the one action on the page, made concrete: the photo shows built Fuerzas in the showroom, so "Check availability" feels like walking in.

**Layout at 1440:** `section.bg-sand.text-ink.grid.grid-cols-12.gap-x-[1.5rem].pl-(--gutter)`. No right padding and no bottom padding, so the photo bleeds into the footer's stripe.

```
| c1 ────────── c6 |  | c7 ────────────────────────── c12 (bleeds) |
|   ↓ 8rem         |  |                                            |
| h2 Find your     |  |   fuerza-built-pair.jpg                   |
|    Fuerza.       |  |   h-[44rem], object-cover                 |
| microcopy        |  |   object-[50%_60%]                        |
| [CHECK AVAIL ↗]  |  |                                            |
| or Messenger     |  |                                            |
|   ↓ 8rem         |  |                                            |
═══════════ footer stripe (0.25rem, existing) ═══════════════════════
```

- Copy column: `lg:col-span-5 self-center py-[8rem]`. Photo: `lg:col-span-6 lg:col-start-7 h-[44rem]`, flush to the right and bottom edges.

**Content mapping:**

- h2 is `cta.heading`, in `lg:text-title` (5rem, 600, -0.03em). Then `cta.microcopy` in `text-body max-w-[36ch]`, `2rem` below.
- Primary: `cta.label` as the `default` (ink) button, `3rem` below.
- Secondary: `<InquireLink channel="messenger">`, the PRD's secondary channel, as a `link` button `ml-[2rem]`. Label **PROPOSED**: "Or Messenger"; alternatively reuse the home `SHOWROOM.messenger.label` "Messenger".
- Photo: `details/fuerza-built-pair.jpg` (1556×1945, built Fuerzas in the white-panelled showroom). Alt **PROPOSED**: "Built Fuerzas lined up in the Vellum showroom".

**Detail moves:**

1. **The bleed.** The photo touches the right edge and sits directly on the footer's flat stripe, so the stripe reads as the photo's floor, not a separator. This is the transition into the footer.
2. **Button-to-photo link.** Hovering the primary button scales the photo from 1 to 1.04 (§5 card/link hover: 0.4s, `[0.22,1,0.36,1]`, retarget). Implement with `group` on the section and `group-has-[a:hover]:scale-[1.04]` on the `<img>` inside an `overflow-hidden` frame. Gate it behind `@media (hover: hover)`.
3. The heading is the largest type in the bottom half of the page: recap h2 is `text-heading`, warranty is `text-heading` plus the numeral, CTA is `text-title`. The type scale climbs toward the action.

**Motion:** copy column uses `Reveal`. Photo: `Reveal` with `delay={0.1}`. Reduced motion: fade only, and the hover keeps no scale.

**Mobile:** photo at full width, 4:5, under the copy, still touching the footer stripe.

---

## 4. Edge and Terreno

| Slot              | Fuerza                                 | Edge                                       | Terreno                                       |
| ----------------- | -------------------------------------- | ------------------------------------------ | --------------------------------------------- |
| Recap photo       | `fuerza-frame-tubes.jpg`               | none                                       | none                                          |
| Recap list        | 7 beats                                | its beats                                  | its beats                                     |
| Facts row         | 3 specs                                | 3 specs (2007 · Gen 1 · Gen 2 · Ride)      | 4 specs, so the row becomes `grid-cols-2` × 2 |
| Builds table      | yes                                    | omitted                                    | omitted                                       |
| Warranty          | shared, identical                      | identical                                  | identical                                     |
| CTA heading/label | Find your Fuerza. / Check availability | Where it started. 2007. / Be first to know | Built for the dirt. / Ask about Terreno       |
| CTA microcopy     | PRD line                               | none in PRD, omit                          | none in PRD, omit                             |
| CTA photo         | `fuerza-built-pair.jpg`                | `edge-two-decades-cover.jpg`               | `terreno-showroom-ugc.jpg` (ASK, see Q3)      |

- **Recap without a photo:** the left `col-span-5` holds the h2 plus the facts, sticky (`lg:sticky lg:top-[6rem]`). The right column holds the numbered list. Same grid, no empty hole.
- **Content shape:** add `summary.recapImage?: ModelImage` and `cta.image?: ModelImage`. Without `cta.image`, the CTA becomes copy-only, `col-span-8`, with the heading at `lg:text-display` so the section still lands.

## 5. Checklist for the coder

- No element above any h2/h3. Run `grep -rniE "eyebrow|kicker|border-t|divide-y|h-px"` on the touched files and get no new hits.
- Accent appears only in the "5" and the existing footer band.
- Do the content-shape changes (`parts` → `{label,value}`, warranty groups, `recapImage`, `cta.image`) in the content files and `model-content.ts`. Components read from content; no copy goes in the TSX.
