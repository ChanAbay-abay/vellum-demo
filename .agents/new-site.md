# New Site Checklist

Use this when starting a landing page for a new client. Most work is content, not code.

## 1. Business details

Edit `apps/web/src/config/site.config.ts`:

- `name`, `title` (50-60 chars: what + where), `description` (140-160 chars)
- `contact`: email, phone (local and `+63` E.164), Messenger link, address, hours
- `socials`: leave unused ones as `""` to hide them
- `businessType`: closest schema.org type (drives Google local results)
- `priceRange`, `legal.*` (company name, effective dates)

Keep name, address, and phone identical to the client's Google Business Profile.

## 2. Page content

Edit `apps/web/src/pages/home/config/home.content.ts`. Every section reads from it. Keep the brand voice: few words, calm, no jargon.

To remove a section, delete it from `apps/web/src/pages/home/ui/home-page.tsx`. To add one, follow [UI guidelines](./ui.md).

## 3. Images and brand

- Replace the rendered placeholders in `apps/web/public/images/` with real photography (compressed JPG/WebP; ~2400px wide for gallery slides, ~1200x1600 for journal cards). Update paths in `home.content.ts`. This layout lives or dies by its photos.
- Replace the 3D centerpiece (`pages/home/ui/instrument.tsx`, used in the hero, collection cards, and film box) with the client's product, or keep it as an emblem. See [Animations](./animations.md#the-3d-centerpiece).
- Replace `public/og/default.png` (1200x630), `public/favicon.ico`, `public/logo192.png`, `public/logo512.png`.
- Replace `Wordmark`/`Emblem` in `apps/web/src/shared/ui/logo.tsx` with the client's logo.
- Adjust `--ink`, `--paper`, and `--rule` in `apps/web/src/shared/styles/theme.css`. Update `themeColor` in site config and `public/manifest.json`.
- Optional font swap: `apps/web/src/shared/styles/fonts.css` plus the preloads in `apps/web/src/routes/__root.tsx`.

## 4. Legal pages

Review `pages/privacy-policy` and `pages/terms-of-service` MDX. The privacy notice covers the Data Privacy Act of 2012 (RA 10173); adjust for what the client actually collects.

## 5. Ship

1. `vp check --fix` and `vp run build`.
2. Deploy: [Deployment](./deployment.md). Set `VITE_SITE_URL` to the real domain.
3. After launch: submit `https://<domain>/sitemap.xml` in Google Search Console and test the home page in Google's Rich Results Test.

Need a contact form, bookings, or accounts? See [Routes and data](./data-flow.md), [Database](./database.md), and [Auth](./auth.md).
