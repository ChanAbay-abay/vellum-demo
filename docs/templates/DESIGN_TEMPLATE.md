# [Client Name] — Brand Board & Design Direction

> Copy to `demos/<slug>/DESIGN.md`. Written by the `designer` agent **before** the first
> component exists; binding on the `coder` from then on.
>
> **PRD.md answers "what are we saying." DESIGN.md answers "what does it look like, exactly."**
> If a value is in here, the coder uses it verbatim and does not re-decide it.
>
> Every field is either a **concrete value** or the literal word `ASK` — never a vibe.
> "Warmer and more premium" is not a value. `oklch(0.42 0.11 38)` is.

---

## 0. Brand intake — what the client actually gave us

Source of truth for anything the client supplied. Never invent a row here.

| Input            | What we have                                                    | Source                      |
| ---------------- | --------------------------------------------------------------- | --------------------------- |
| Logo files       | [e.g. `AD Logo - Black.svg`, opaque white bg — needs stripping] | [client / scraped / none]   |
| Brand colors     | [hexes exactly as given]                                        | [deck / site / logo / none] |
| Fonts named      | [e.g. The Seasons, Red Hat Display]                             | [deck / site / none]        |
| Existing site    | [url, or "none — cold pitch"]                                   |                             |
| Brand deck       | [file path, or none]                                            |                             |
| Photography      | [what exists, what's missing]                                   |                             |
| Hard constraints | [e.g. "never put the logo on maroon"]                           |                             |

**Missing and needed:** [list — these become questions for Chan, not guesses]

> **The logo hex is not always the screen accent.** A logo color mixed for print/vinyl often
> reads muddy or glaring as a UI accent. If it needs adjusting, put the adjusted value in §2
> and say here what you changed and why.

---

## 1. Direction — the call, in three sentences

**Feels like:** [one sentence — the character, not a mood board word salad]
**Reference system:** [system from `awesome-design-md` INDEX.md] — [one line: why it fits _this_ client]
**Took:** [scale / rhythm / restraint / contrast — what you lifted]
**Deliberately left:** [what you did not lift, and why]

**Visual references Chan supplied:** [pinterest links, competitor sites, screenshots — with one
line each on _what specifically_ to take from it. "I like this" is not usable; "the way the type
sits over the full-bleed photo with no card" is.]

**Anti-goals — the generic defaults this project must not drift into:**

- [e.g. centered hero, badge eyebrow, three icon cards, gradient blob]
- [e.g. shadcn `--primary` blue leaking through anywhere]

**The AI-slop test:** if you swapped the colors, could this be any other company's site?
[Answer honestly. If yes, the direction isn't done.]

---

## 2. Tokens — paste-ready for `apps/web/src/shared/styles/theme.css`

> **Fast route:** `mcp__magic__get_theme` returns a 21st.dev theme's full token CSS. Find one whose character matches, take its structure, swap in the client's real brand
> color, then verify contrast below. Faster than deriving a full token set by hand, and the
> values are real rather than invented.

Values may be hex or OKLCH. No dark theme: this stack is light/dark _by section_
(`.agents/ui.md`). Specify the ink-section and paper-section pairs instead.

```css
:root {
  --ink: [value]; /* dark sections */
  --paper: [value]; /* light sections */
  --rule: [value]; /* hairlines */
  --brand: [value]; /* [hex it came from] */
  --brand-foreground: [value]; /* text on --brand — verify AA */
  /* ...shadcn vars, set from the table below */
  --radius: [Xrem]; /* square (0) by default */
}
```

The `@theme inline` color mappings in that file already exist and only change if a token is added.

**shadcn variables — set every one of these so shadcn defaults never leak through:**

| Var                                | Value | Notes                                        |
| ---------------------------------- | ----- | -------------------------------------------- |
| `--background`                     |       |                                              |
| `--foreground`                     |       |                                              |
| `--primary`                        |       | usually `--brand`                            |
| `--primary-foreground`             |       |                                              |
| `--muted` / `--muted-foreground`   |       |                                              |
| `--accent` / `--accent-foreground` |       |                                              |
| `--border`                         |       |                                              |
| `--input`                          |       |                                              |
| `--ring`                           |       | focus ring — must be visible on every ground |
| `--destructive`                    |       |                                              |

**Where the accent is allowed to appear** (pick ~3 — restraint is the call most often blown):

1. [e.g. primary CTA button]
2. [e.g. active nav underline]
3. [e.g. stat figures]

**Where it is forbidden:** [e.g. section backgrounds, body copy, icons]

**Contrast check:** [list the pairs you verified and the ratio — brand-on-bg, fg-on-muted,
ring-on-every-ground. AA minimum. State the numbers; don't assert compliance.]

---

## 3. Type

| Role    | Family | Source                                                                  | CSS var → Tailwind                |
| ------- | ------ | ----------------------------------------------------------------------- | --------------------------------- |
| Display |        | `@fontsource/<family>` or `@fontsource-variable/<family>` (via catalog) | `--font-display` → `font-display` |
| Body    |        | same                                                                    | `--font-sans` → `font-sans`       |

`@font-face` goes in `apps/web/src/shared/styles/fonts.css`; the preload goes in `apps/web/src/routes/__root.tsx`.

> Commercial faces: note here that the installed woff2 are demo copies and must be swapped for
> licensed files before handoff.

**Scale** — every step used on this project, with real values:

| Token             | Size (rem) | Weight | Line-height | Tracking                             |
| ----------------- | ---------- | ------ | ----------- | ------------------------------------ |
| `text-display`    |            |        |             | [negative tracking on display sizes] |
| `text-title`      |            |        |             |                                      |
| `text-heading`    |            |        |             |                                      |
| `text-subheading` |            |        |             |                                      |
| `text-body`       |            |        |             |                                      |
| `text-label`      |            |        |             |                                      |
| `text-caption`    |            |        |             |                                      |

Rem values scale with the fluid root (`apps/web/src/shared/styles/app.css`).

**Rules:** [e.g. "serif on figures and pull quotes only"; "no font-weight above 600 on body";
"max line length 68ch"]

---

## 4. Spacing, rhythm, layout

- Section padding: [rem values, e.g. `py-[6rem]`]
- Gutter: `p-[var(--gutter)]`; sizes in rem, never px
- Grid gaps: [rem values]
- Vertical rhythm between elements inside a section: [the pattern, not one-offs]
- Radii: square by default (`--radius: 0`); say where any exception applies
- Borders: [when a border is allowed at all — prefer `bg-muted/40` for separation]
- Shadows / elevation: [the exact steps, or "none — this project separates with ground, not shadow"]

---

## 5. Motion

| Effect                                                                              | Library    | Primitive                                                   |
| ----------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------- |
| Hero intro timeline, pinned/scrubbed scroll scenes, multi-step timelines, SplitText | **GSAP**   | `useGsapScene` and `revealSplit` from `@zo-stack/ui`        |
| Component micro-motion: hover, press, presence, layout, simple in-view reveals      | **Motion** | `m.*`, `Reveal`, `Stagger`, `SplitReveal`, `ClipStack` etc. |
| Above-the-fold mount entrance with no JS dependency                                 | **CSS**    | `animate-in fade-in` (tw-animate-css)                       |
| Smooth scroll                                                                       | **Lenis**  | `GsapSmoothScroll` (root, already mounted)                  |

One library per element and property: never GSAP and Motion on the same node.

| Interaction                 | Library | Property | Duration | Easing | Interrupt behavior |
| --------------------------- | ------- | -------- | -------- | ------ | ------------------ |
| Mount reveal                |         |          |          |        |                    |
| Hover (card / link)         |         |          |          |        |                    |
| Nav / route change          |         |          |          |        |                    |
| Scroll reveal               |         |          |          |        |                    |
| Scroll-pin / scrub (if any) |         |          |          |        |                    |

- **Hero and scroll scenes:** GSAP via `useGsapScene` and `revealSplit` from `@zo-stack/ui`; port from `/lab/gsap-hero`.
- **Pinning:** native sticky + GSAP `scrub`, never `pin: true`.
- **Reduced motion:** handled inside `gsap.matchMedia` (GSAP) and `MotionConfig reducedMotion="user"` (Motion); scroll scaffolding collapses with `motion-reduce:h-svh`. Say what specifically degrades to what. Never render-branch on
  `useReducedMotion()` — gate values, not JSX, or you get a hydration crash.
- **Mount-time reveals belong in CSS**, not in a JS motion library.
- **Scroll timelines are an enhancement layer** — the page must be complete and readable
  with every scroll effect removed.

---

## 6. Hero direction — the one that decides the demo

> This is where the time goes, so it gets decided here in writing, not discovered in code.
> Give **three** directions. Chan picks one with a single word.

### Direction A — [name]

- **Composition:** [full-bleed photo + overlaid type / editorial split / scroll-pinned two-stage / …]
- **Type treatment:** [exact — size, family, where it sits, what it overlaps]
- **Motion:** [what moves, when, driven by what]
- **Assets it needs:** [e.g. transparent subject cutout 1080×1720 + B&W background plate]
- **Risk / cost:** [what could eat a day]

### Direction B — [name]

[same fields]

### Direction C — [name]

[same fields]

**Recommendation:** [A/B/C] — [one line why]

**Build rule:** build **one** hero direction. If Chan wants to see more than one live, they go
on a `hero-explorations` branch — never three half-heroes on `main`.

---

## 7. Worked example — the hero and one section, concretely

Real values, so the coder has an example rather than a rulebook.

**Hero (chosen direction):**
[section-by-section: element, class-level values, copy slot, image slot, motion]

**[Second section name]:**
[same]

---

## 8. Component direction

How the shadcn/Radix primitives get skinned on this project.

| Component    | Variants that exist here            | Skin notes                                                               |
| ------------ | ----------------------------------- | ------------------------------------------------------------------------ |
| Button       | [default / brand / outline / ghost] | [brand = primary CTA only, 1 per section, 2 per page]                    |
| Card         |                                     | [Card is for dashboard widgets, tables, forms — never marketing content] |
| Input / Form |                                     |                                                                          |
| Nav          |                                     | [transparent over hero? contrast-adaptive?]                              |

**Every interactive element needs all of these defined, not just default:**
`hover` · `focus-visible` · `active` · `disabled` · `loading` · `empty` · `error`

---

## 9. Imagery

- **Direction:** [photographic / render / illustration; warm or cool grade; crop philosophy]
- **Treatment:** [grayscale, duotone, cutout-on-plate, full-bleed]
- **Format rule:** source JPG/PNG goes in `apps/web/src/shared/assets/images/`. Render with
  `<Picture image={…?responsive}>`, which generates AVIF/WebP and a blur placeholder at build.
  Never hand-export WebP. Name a placeholder for its **final job** (`hero-portrait.jpg`),
  never `placeholder-1.png`.
- **Needed and missing:** [list — each becomes a Canva/Flow Labs task for Chan]

---

## 10. Reusable for the next client?

[What in here is client-specific vs. what is a pattern worth lifting into `demo-template`.
This is the line that makes the _next_ demo faster.]

---

## Written by

`designer` · [date] · skills used: [which, and what each contributed]
