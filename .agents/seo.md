# SEO

Every page is prerendered to static HTML at build time, so crawlers (including AI crawlers that don't run JavaScript) get full content.

## What's automatic

- Canonical URL and `og:url`: set once in `routes/__root.tsx` from the current path. Routes never set them. 404s get none and are `noindex`.
- Document meta, default title/description, Open Graph and Twitter tags, theme color, icons, manifest: root route.
- `sitemap.xml`: every static page, discovered from the route tree (`routes/sitemap[.]xml.ts`). Exclude a page with `EXCLUDED_PATHS` there and `robots: { index: false }` in its head.
- `robots.txt`: allows everything except `/api/`, links the sitemap.
- Prerendering: all static routes plus crawled links (`apps/web/vite.config.ts`).

## Per route

Use `generateAppSeo` from `@/shared/lib/seo` in the route's `head()`:

```ts
head: () => generateAppSeo({ title: "Services", description: "What we offer in Cebu City." });
```

- `title` is wrapped by the template (`Services | zo-stack`). Omit it on the home page to use `siteConfig.title` as is.
- Override `images` only for a better page-specific share image.
- Internal pages: `robots: { index: false, follow: false }`.

## Structured data (JSON-LD)

Pass typed schema.org objects (from `schema-dts`) via `jsonLd`:

- `localBusinessJsonLd` (from site config: name, address, phone, hours, socials). On the home page. Keep it identical to the Google Business Profile.
- `websiteJsonLd`. On the home page.
- `faqPageJsonLd(items)` from `@zo-stack/seo`. Only for FAQs visible on that page (Google requires a match). Render and mark up from the same array.
- `breadcrumbListJsonLd(...)` for nested pages.
- Anything else (Product, Event, Service, Review): write a typed object, e.g. `const event: WithContext<Event> = { ... }`.

`@zo-stack/seo` escapes JSON-LD for safe inline `<script>` output.

## `@zo-stack/seo` package rules

- Pure functions, no env or router imports. The app passes site config in.
- Keep it small. Add a builder only when its shape is fiddly to write by hand.
- Unit tests live in `packages/seo/src/__tests__`.

## Checklist for new pages

1. Route `head()` with a unique title and description.
2. One `<h1>` per page. On the home page it's the descriptive hero intro (what the business does and where), not the display headline.
3. Meaningful `alt` text on content images.
4. Run `vp run build` and check the page appears in `.output/public/sitemap.xml`.
