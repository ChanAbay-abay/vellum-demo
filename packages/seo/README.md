# @zo-stack/seo

Small, pure SEO helpers for TanStack Start. No env, router, or data fetching: the app passes its site config in.

```ts
import {
  breadcrumbListJsonLd,
  faqPageJsonLd,
  generateRobotsTxt,
  generateSitemapXml,
  generateTanStackStartSeo
} from "@zo-stack/seo";
```

| Export                                                | Returns                                                                                                                                                           |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `generateTanStackStartSeo(params)`                    | A route `head()` object: title (with template), description, canonical + `og:url`, Open Graph, Twitter card, robots, and JSON-LD scripts (escaped for inline use) |
| `faqPageJsonLd(items)`                                | `FAQPage` structured data                                                                                                                                         |
| `breadcrumbListJsonLd({ baseUrl, items })`            | `BreadcrumbList` structured data                                                                                                                                  |
| `generateSitemapXml({ baseUrl, entries })`            | `sitemap.xml` string (absolute, de-duplicated, escaped URLs)                                                                                                      |
| `generateRobotsTxt({ baseUrl, disallow, indexable })` | `robots.txt` string                                                                                                                                               |

JSON-LD params are typed with [`schema-dts`](https://github.com/google/schema-dts), so any schema.org type gets autocomplete:

```ts
import { type Product, type WithContext } from "schema-dts";

const product: WithContext<Product> = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Ensaymada Box"
};
generateTanStackStartSeo({ site, title: "Ensaymada Box", jsonLd: [product] });
```

In the app, use the `generateAppSeo` wrapper in `apps/web/src/shared/lib/seo.ts` instead of calling this directly. See `.agents/seo.md`.

Tests: `vp test` in this folder.
