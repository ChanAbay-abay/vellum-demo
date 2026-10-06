# Animations

Motion (`motion/react`) for component animation, Lenis for smooth scrolling. Primitives live in `packages/ui/components`.

## Setup (already wired in `__root.tsx`)

- `MotionProvider`: `LazyMotion` with `domAnimation` and `reducedMotion="user"`. Use `m.div`, not `motion.div` (the latter pulls the full bundle).
- `SmoothScroll`: Lenis in root mode with `anchors: true`. Lenis disables itself for reduced-motion users.
- `HashScroll` (app): scrolls to `#section` after navigation, so section links work across pages. The router's own hash scrolling is off (`defaultHashScrollIntoView: false`) because its instant jump cancels Lenis.

## Primitives

| Component                                                     | Use for                                                                                |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `SplitReveal`                                                 | Headings and paragraphs that rise in word by word from behind a mask                   |
| `ClipStack`                                                   | Full-screen slides pinned on top of each other, each revealed by a bottom-up clip wipe |
| `GrainCanvas`                                                 | Animated film grain on dark sections (pauses off-screen)                               |
| `SectionDots`                                                 | Fixed dot navigation; a ring marks the current section                                 |
| `Reveal`, `Stagger`                                           | Simple fade/slide-in for blocks and card rows                                          |
| `ScrollHighlightText`, `CountUp`, `Marquee`, `ScrollCarousel` | Available for client pages that need them                                              |

## Pinned scroll scenes

Hero and studio are "scenes": a tall section with a `sticky top-0 h-svh` child, driven by
`useScroll({ target: ref, offset: ["start start", "end end"] })` and `useTransform`.
Choreography in the hero: interface fades in the first 8%, the object tilts/explodes/zooms through ~75%, a paper-colored overlay washes in at the end so the next (gray) section continues seamlessly.

## The 3D centerpiece

`pages/home/ui/instrument.tsx` builds a watch-like object from flat SVG layers stacked with CSS 3D (`preserve-3d`, depths in `cqw` so they scale with the object):
case slices for thickness, dial, hands, crystal, bezel, and hinged strap panels that curl back.
Props: `rotateX/Y/Z` (numbers or MotionValues), `explode` (0 → 1), `finish` (`FINISHES.rose | steel | shadow`), `strapPanels`.
It's placeholder art: for a client, replace it with their product photo/render (an `<m.img>` scaled and rotated by the same progress) or keep it as an emblem.
Don't put `filter`, `overflow: hidden`, or `opacity < 1` on elements inside the 3D stack; they flatten it.

## Rules

- Never hide above-the-fold content behind `Reveal` (it delays Largest Contentful Paint). The hero uses a CSS entrance (`animate-in fade-in`) instead.
- Keep motion slow and sparse. One idea per scene; no bouncing or flashy cursor effects.
- Elements that start hidden get `data-reveal`, which a `<noscript>` style in `__root.tsx` un-hides when JS is off.
- Respect reduced motion: Motion and Lenis do it automatically; CSS animations are disabled globally in `packages/ui/styles/globals.css`.
- Animate `opacity` and `transform` only. Avoid animating layout properties.
- Elements that need native scrolling inside Lenis (menus, modals, scroll areas) need `data-lenis-prevent`.
- Marquee duplicates its children and hides the copy from screen readers. Don't put links or buttons in a marquee.
