# Vellum Cycles — Demo PRD

> Project context file for the build session. Placeholder values are marked `*` and must be replaced before delivery.
> Brand values live in `DESIGN.md`. Asset paths are relative to this folder.

---

## Client

| Field    | Value                                                                              |
| -------- | ---------------------------------------------------------------------------------- |
| Name     | Vellum Cycles                                                                      |
| Slug     | vellum-cycles                                                                      |
| Industry | Premium carbon road bicycle brand (framesets, builds, apparel)                     |
| Website  | vellum-cycles.com (Squarespace, currently unreachable)                             |
| Socials  | IG `@vellumcycles` (6.6k) · FB `/vellumcycles` (25k) · TikTok `ASK` · Strava `ASK` |
| Email    | info@vellumcycles.com                                                              |
| Phone    | `*` 032-232-2054 (from a 2017 FB post, confirm)                                    |
| Showroom | ML Quezon St, Cabancalan, Cebu City 6000 · Mon–Sat 10:00–17:00                     |
| Est.     | March 2004, Cebu                                                                   |
| Tagline  | Set the Pace. · Campaign line: **two decades of Edge**                             |

---

## Brand

| Field        | Value                                                                                                      |
| ------------ | ---------------------------------------------------------------------------------------------------------- |
| Primary      | Ink `#0B0B0A` on white. Accents from the Retro stripe: orange `#E5761D`, red `#BE3440`, burgundy `#5C3340` |
| Secondary    | Studio sand `#D3C2AE` (their product shoot backdrop)                                                       |
| Tone         | Premium, restrained, confident. Short lines. "Set the pace, not follow the pack."                          |
| Display font | Jost (geometric, Futura-like, matches their About/Warranty story graphics)                                 |
| Body font    | Jost                                                                                                       |
| Notes        | Logos traced by us (no client vectors). The 3-band stripe is the signature graphic. See DESIGN.md          |

---

## Context

**What they do:**
Cebu-born brand designing performance carbon road framesets (built in Taiwan, finished and sold from Cebu) for serious amateur and competitive riders. Sold as framesets or complete builds through their showroom and dealers nationwide.

**Why this demo:**
Inbound redesign request. Their Squarespace site is down, so their 22-year story and current lineup live only in IG stories and posts. The demo proves a premium, catalogue-only site can carry the brand and route every inquiry to their DMs. Creative freedom: full. Goal is to wow.

**Audience:**
Founders Chris Aldeguer (CEO) and Michael Flores (President, Chief Designer, architect and industrial designer). Design-literate. They will judge craft and restraint first.

---

## Story

**The one thing this demo must communicate:**
Twenty-two years of Cebu-designed race bikes, presented with the precision of the bikes themselves.

**Scope rules:**

- Catalogue only. No cart, no checkout, no prices shown.
- Every "form" or CTA deep-links to socials. Primary: IG DM `https://ig.me/m/vellumcycles`. Secondary: Messenger `https://m.me/vellumcycles`.
- Availability is never listed. Copy: "Availability changes weekly. Message us."

**Routes:**

| Route             | Purpose                                                    |
| ----------------- | ---------------------------------------------------------- |
| `/`               | Home                                                       |
| `/about`          | Story, founders, heritage timeline, showroom, socials      |
| `/models`         | Lineup index (Fuerza, Edge, Terreno) + warranty            |
| `/models/fuerza`  | Fuerza Disc detail, colorway switcher, framesets vs builds |
| `/models/edge`    | Edge heritage + next chapter                               |
| `/models/terreno` | Terreno XC (archive/by inquiry)                            |
| `/merch`          | Apparel and accessories grid                               |

**Home section flow:** Hero → Intro statement → Models split (3 columns) → Merch row (full width) → Heritage strip → Showroom + dealers → Footer

---

## Content

### Global nav

**Items:** Models · About · Merch · [Inquire] (button → IG DM)
**Logo:** `brand/logos/vellum-lockup-black.svg` (white variant over dark hero)

### Home / Hero

**Heading:** two decades of Edge.
**Body:** Designed in Cebu since 2004. Built for those who set the pace.
**CTA label:** Explore Fuerza → `/models/fuerza` · secondary: Our story → `/about`
**Image:** `images/hero/hero-retro-black-frame.jpg` (direction in DESIGN.md §6)

### Home / Intro statement

**Heading:** Made by cyclists. For cyclists.
**Body:** Vellum takes its name from a paper known for being light and strong. Two decades on, every frame is still drawn the same way: straight, sharp-edged, and built to win.
**CTA label:** n/a

### Home / Models split (3 equal columns, full viewport height on desktop, stacked on mobile)

| Column | Label   | Line                           | Image                                                     | Link              |
| ------ | ------- | ------------------------------ | --------------------------------------------------------- | ----------------- |
| 1      | FUERZA  | The all-rounder, now in Retro. | `images/fuerza/retro-greige/fuerza-retro-greige-bike.jpg` | `/models/fuerza`  |
| 2      | EDGE    | Where it started. 2007.        | `images/edge/edge-gen2-archive.jpg`                       | `/models/edge`    |
| 3      | TERRENO | Built for the dirt.            | `images/terreno/terreno-mtb-ugc.jpg` `*` weak photo       | `/models/terreno` |

Hover on desktop: hovered column widens (flex-grow), others dim. Label uses display type.

### Home / Merch row (one full-width band)

**Heading:** Retro, down to what you wear.
**Body:** Jerseys, hoodies, caps and more.
**CTA label:** Shop the look → `/merch`
**Image:** `images/merch/merch-retro-jersey-print.jpg` as full-bleed background (stripe crop)

### Home / Heritage strip

Horizontal scroll of 8 frames, full colour with grain (Chan, 2026-10-07: colour, and more frames from the About timeline):
2004 Founded in Cebu · 2006 Interbike, Las Vegas · 2006 EMC² team, California · 2007 First-generation Edge · 2023 Fuerza Disc · 2024 Fuerza Champagne · 2025 Fuerza Spectrum Silver · 2026 Retro (images in `home.content.ts`)
**CTA label:** Our story → `/about`

### Home / Showroom + dealers

**Heading:** Ride one before you decide.
**Body:** Visit the Vellum showroom in Cabancalan, Cebu, or find an authorized dealer near you.
**Image:** `images/showroom/showroom-cebu.jpg`
**Dealers:**

| City     | Dealer              |
| -------- | ------------------- |
| Manila   | Ross Cycle Center   |
| Manila   | Crankmasters        |
| La Union | Wattstop            |
| Cebu     | Vellum Showroom     |
| Iloilo   | El Capitan          |
| Davao    | Barney's Bikeshop   |
| Online   | Brick Bike Boutique |
| Online   | Ride Vellum         |

**CTA label:** Get directions (Google Maps link to showroom) · Message us (IG DM)

### Footer

Lockup, "Set the Pace. Est. 2004", nav, address, hours, email, social icons (IG, FB, TikTok `*`, Strava `*`), "Site by Iridel".

---

### About

**Hero heading:** Born from passion. Built for global performance.
**Body (story):** In 2004, design entrepreneur and triathlete Chris Aldeguer and architect, industrial designer and cyclist Michael Flores founded Vellum Cycles. Their partnership unites an instinctive compulsion for speed with the fundamentals and aesthetic values needed to achieve it. Vellum reflects their personalities: simple and straightforward, with an unyielding commitment to performance.
**Philosophy:** Performance with style. Straight, sharp-edged lines. Aerodynamic efficiency, aggressive geometry, precise attention to ergonomics.

**Founders (2 cards):**

| Name           | Role                                                                             | Photo               |
| -------------- | -------------------------------------------------------------------------------- | ------------------- |
| Chris Aldeguer | Co-founder & CEO · design entrepreneur, triathlete                               | `*` none found, ASK |
| Michael Flores | Co-founder, President & Chief Designer · architect, industrial designer, cyclist | `*` none found, ASK |

Fallback if no photos: typographic cards (name in display type over a stripe band), no silhouettes.

**Timeline (verified unless `*`):**

| Year | Moment                                                        | Image                                                           |
| ---- | ------------------------------------------------------------- | --------------------------------------------------------------- |
| 2004 | Vellum Cycles founded in Cebu                                 | `heritage-22-years-poster.jpg`                                  |
| 2006 | Interbike, Las Vegas. EMC² and Arete Racing teams ride Vellum | `heritage-interbike-2006.jpg`, `heritage-arete-racing-2006.jpg` |
| 2006 | EMC² team with Vellum, California                             | `heritage-emc2-team-california.jpg`                             |
| 2007 | First-generation Edge. "The ride that brought victories."     | `edge-2007-collage.jpg`                                         |
| 2012 | Uno TT launched for Ironman and XTERRA in Cebu                | none                                                            |
| 2023 | Fuerza Disc (Ghost, Silver Freeze)                            | `fuerza-ghost-frameset.jpg`                                     |
| 2024 | Fuerza Champagne                                              | `fuerza-champagne-studio.jpg`                                   |
| 2025 | Fuerza Spectrum Silver                                        | `fuerza-spectrum-silver-bike.jpg`                               |
| 2026 | Retro. Limited Fuerza Retro Black and Greige, 22 years on     | `fuerza-retro-black-frameset.jpg`                               |

**Socials block:** large IG grid (6 latest from `images/lifestyle/`, static) + follow buttons for IG, FB, TikTok `*`, Strava `*`.
**Showroom block:** same as home, with embedded map (static image or iframe).

---

### Models (index)

**Heading:** The lineup.
3 large rows (image + name + one line + "View"). Below: warranty section.

**Warranty (verbatim from client, tidied):**

- Framesets are covered against defects for five (5) years from the date of purchase.
- The owner must present a warranty card filled out by a local accredited dealer.
- Paint scratches, discoloration, small parts (headset, bolts, seat clamp) and maintenance issues are not covered.
- Claims are processed through the official Vellum dealer or distributor where the frame was purchased.
- Only the original owner (the name on the warranty card) is eligible.
- Frames are sent to Vellum Cycles headquarters for inspection.

**CTA label:** Start a warranty claim → IG DM

### Fuerza Disc

**Heading:** FUERZA
**Line:** An all-rounder frameset designed for those who set the pace.
**Body:** A quick-accelerating, stable aero platform. Aero seatpost with zero offset for a tucked position, curved tapered aero fork, massive bottom bracket and oversized chainstays for clean power transfer. Fully internal routing.
**Frameset includes:** Frame, fork, headset, seatpost
**Sizes:** XS · S · M · L
**Options:** "Built or bare." Frameset only, or a complete build to your spec.

**Colorway switcher (current):**

| Colorway        | Tag                   | Images (folder `images/fuerza/…`) |
| --------------- | --------------------- | --------------------------------- |
| Retro Black     | Limited · 2026        | `retro-black/`                    |
| Retro Greige    | Limited · 2026        | `retro-greige/`                   |
| Spectrum Silver | 2025                  | `spectrum-silver/`                |
| White Haze      |                       | `white-haze/`                     |
| Phantom         |                       | `phantom/`                        |
| Champagne       | 2024                  | `champagne/`                      |
| Rudy Project    | Rudy Project × Vellum | `rudy-project/`                   |

Past colorways strip (smaller): Ghost (2023), Silver Freeze (2023). Folders `ghost/`, `silver-freeze/`.

**Example builds (show components, no price):**

| Build                 | Spec                                                                                                                 |
| --------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Spectrum Silver · 105 | Shimano 105 R7020 11-speed hydraulic, 50-34t 170mm, 11-34T, Meroca 38mm alloy wheels, carbon cockpit, Prologo saddle |
| White Haze · 105 Di2  | Shimano 105 Di2 12-speed hydraulic, 52-36t 170mm, 11-34T, Meroca 42mm carbon wheels, carbon cockpit, PRO saddle      |

**Specs table:** frame weight, geometry chart `*` ASK (not published anywhere we found).
**CTA:** Check availability → IG DM. Microcopy: "Availability changes weekly. Message us for sizes and builds."
**Detail gallery:** `images/fuerza/details/`

> Reference only, do not render: SRP ₱69,950 / cash ₱65,000 frameset; ₱130k and ₱155k builds; installment via BDO/Metrobank.

### Edge

**Heading:** EDGE (use `brand/logos/edge-wordmark-*.svg`, not type)
**Line:** Two decades of Edge.
**Body:** 2007. The first-generation Edge. The ride that brought victories, and the bike that put a Cebu brand in the international peloton. Light, stiff and tuned toward performance without being nervous.
**Sections:** Gen 1 (`edge-gen1-archive.jpg`) · Gen 2 (`edge-gen2-archive.jpg`) · 2007 collage · "The next chapter" teaser `*` (ASK: is a new Edge launching?)
**CTA:** Be first to know → IG DM

### Terreno

**Heading:** TERRENO
**Line:** XC race frame.
**Body:** Cross-country race-specific carbon frame. Diamond-profile tubes for lateral stiffness with vertical compliance, unidirectional carbon finish, FSA integrated headset. `*` confirm current status (only 2 rider photos found, older model).
**CTA:** Ask about Terreno → IG DM

### Merch

**Heading:** Retro, down to what you wear.
Grid of cards (image, name, sizes, "Inquire" → IG DM). No prices.

| Item                            | Sizes / variants              | Image                          |
| ------------------------------- | ----------------------------- | ------------------------------ |
| Retro Jersey                    | XS–XL                         | `merch-retro-jersey.jpg`       |
| Retro Hoodie (with sticker set) | `*` sizes ASK                 | `merch-retro-hoodie.jpg`       |
| Retro Tee                       | `*` sizes ASK                 | `merch-retro-tee.jpg`          |
| Retro Sticker Set               | Free with any purchase        | `merch-retro-stickers.jpg`     |
| Linear Jersey                   | Light grey, dark grey · XS–XL | `merch-linear-jersey-grey.jpg` |
| Vellum × 18Myles Strapback Cap  | Black, grey, khaki            | `merch-caps-18myles.jpg`       |
| Bottles                         | `*` ASK                       | `merch-bottles.jpg`            |

---

## Assets

Copy `images/**` into `apps/web/src/shared/assets/images/` keeping filenames (flatten folders or keep, coder's call). Logos and favicons into `apps/web/public/`. All photos are pulled from their IG at 1080–2048px, so **none meet the 2400px full-bleed target**. Use `object-cover` and avoid upscaling past ~1.3x.

| Filename                                 | Used in                 | Status                                  |
| ---------------------------------------- | ----------------------- | --------------------------------------- |
| `brand/logos/vellum-lockup-*.svg`        | Nav, footer             | [x] ready (traced)                      |
| `brand/logos/vellum-mark-*.svg`          | Favicon, loader, badges | [x] ready (traced)                      |
| `brand/logos/edge-wordmark-*.svg`        | Edge page, hero         | [x] ready (traced)                      |
| `images/hero/hero-retro-black-frame.jpg` | Home hero               | [x] ready (1536×1920)                   |
| `images/fuerza/**`                       | Fuerza page             | [x] ready                               |
| `images/edge/**`                         | Edge page, timeline     | [x] ready (archive, low-res, B&W treat) |
| `images/terreno/**`                      | Terreno                 | [ ] placeholder (UGC)                   |
| `images/merch/**`                        | Merch                   | [x] ready                               |
| `images/heritage/**`                     | About timeline          | [x] ready                               |
| `images/showroom/**`                     | Showroom block          | [x] ready                               |
| Founder portraits                        | About                   | [ ] missing                             |
| OG image 1200×630                        | Meta                    | [ ] generate from hero                  |

Full scrape with captions: `raw/instagram/manifest.tsv` (216 posts).

### Deferred: 3D frame viewer (all model pages)

Each frame page (`/models/fuerza`, `/models/edge`, `/models/terreno`) gets a 3D render of the frame as its centerpiece, displayed the way the template's watch is (`apps/web/src/pages/home/ui/instrument.tsx`: tilt to show depth, exploded-layer view on scroll). Chan will produce the models with **img2threejs**. Not started; build the pages with photos for now and leave room for the viewer.

---

## Open questions for Chan

1. TikTok and Strava handles?
2. Founder photos: can the client send any? Otherwise typographic cards.
3. Edge: is a new Edge launching (new wordmark + "two decades" campaign)? Changes the Edge page from archive to teaser.
4. Terreno: still sold, or archive only?
5. Phone number: still 032-232-2054?

---

## Delivery

| Field  | Value                                                                |
| ------ | -------------------------------------------------------------------- |
| Format | Vercel preview URL (Root Directory `apps/web`)                       |
| Notes  | Frontend only. No forms, no backend. All CTAs are social deep links. |
