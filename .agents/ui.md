# UI Guidelines

Use this when changing page sections, layout, or components.

## Where things live

- Section components: `apps/web/src/pages/home/ui/*-section.tsx`. Composed in `home-page.tsx`.
- Section copy and images: `apps/web/src/pages/home/config/home.content.ts`. Keep copy out of components so each client only edits this file.
- Business details (name, contact, socials): `apps/web/src/config/site.config.ts`.
- App-level helpers: `apps/web/src/shared/ui` (`ActionLink`, `Wordmark`/`Emblem`, `HashScroll`).
- Reusable, app-agnostic components: `packages/ui/components`.
- Layout: header and footer in `apps/web/src/features`, `RootLayout` in `apps/web/src/widgets/layouts`.

`apps/web` follows Feature-Sliced Design (routes → pages → widgets → features → shared), enforced by lint. Import only downward and through each slice's `index.ts`.

## Look and feel

A quiet, editorial luxury layout modeled closely on high-end product sites (fleming.watch is the reference). Not a SaaS page.

- **Fluid scale.** On desktop the root font size grows with the viewport (`calc(0.3556rem + 0.537vw)`: 11px at 1024, 12.5px at 1280, 16px at 1900). Everything is in rem, so the layout keeps its proportions on any screen. Mobile is fixed at 16px. Size things in rem (`p-[2rem]`), not px.
- **Type scale** (all 1.5 line height): `text-caption` .75rem, `text-label` .875rem, `text-body` 1rem, `text-subheading` 1.125rem, `text-heading` 1.625rem, `text-title` 2.125rem, `text-display` 3.375rem.
- **Fonts:** `font-display` (Tomorrow, squared) for the wordmark, headings, and dates, always uppercase; `font-sans` (Inter) for everything else. UI labels: `text-caption font-semibold tracking-[0.1em] uppercase opacity-70`.
- **Palette:** `ink` #0b0b0b, `paper` #d8d8d8, `rule` #848484 (card borders). Text tints with opacity (`text-ink/50`, `text-white/40`). Color comes from imagery.
- Square corners, 1px rules, generous empty space, thin arrows from `shared/ui/icons.tsx`.
- No gradients on text, glows, badges, emoji, or feature checklists. No marketing or technical jargon in copy.

## Page structure

1. Hero (`hero-section.tsx`): black, pinned for 260svh. A 3D centerpiece (`instrument.tsx`) inside a ring larger than the screen. Scrolling fades the interface, then tilts and explodes the object in depth while pushing in, then washes to gray. Two dots on the left switch finishes. Bottom row: h1 intro + Discover, display headline, film box.
2. Studio (`studio-section.tsx`): gray. The title holds center while a ring draws itself, then scrolls away; two paragraphs rise in word by word on either side.
3. Collection (`collection-section.tsx`): tall bordered cards; the object turns to follow the pointer.
4. Gallery (`gallery-section.tsx`): full-screen slides that wipe over each other (`ClipStack`); the first carries a title.
5. Journal (`journal-section.tsx`): three 3:4 article cards.
6. Footer: animated film grain, emblem, "Keep in touch", four link columns, a rule that draws itself.
7. `SectionDots` on the right edge (ring = current section).

## Conventions

- Section ids (`top`, `studio`, `collection`, `work`, `journal`) are link targets; keep `SECTIONS` in `home-page.tsx` in sync.
- Link to sections with `<Link to="/" hash="work">` (works from any page). Use `ActionLink` for config-driven CTAs: with `hash` it scrolls, without it opens Messenger (or email).
- The header is fixed and transparent with `mix-blend-difference`, so it reads on ink and paper alike. Pages without a hero need top padding (`pt-28`).
- Headings reveal with `SplitReveal`. Keep motion slow and eased (`[0.16, 1, 0.3, 1]`).
- The site is light/dark by section, not by theme. Don't add `dark:` styles or a theme toggle.
- Images: plain `<img>` with `loading="lazy"`; always set `alt` (`""` for decorative).
- The base theme strips Tailwind's default palette. Use theme tokens (`ink`, `paper`, `rule`, `muted`...) or an arbitrary value.

## shadcn/ui

- Style `radix-maia`, Radix primitives, CSS variables, Lucide icons.
- Add components with `vp run ui add <name>` (into `packages/ui`). Fix the generated `cn` import to `@zo-stack/ui/lib/utils`, then run `vp check --fix`.
- `packages/ui` must not import from `apps/*`, the router, or env. Inject app-specific pieces (links, images) as props.
- Keep a component app-local until a second real use appears.

## Copy

Brand voice: short, calm, confident. Few words per section. Speak about the business, its craft, and its customers. Messenger and phone stay the primary contact channels (Inquire, Keep in touch).
