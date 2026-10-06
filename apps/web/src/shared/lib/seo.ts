import { type LocalBusiness, type WebSite, type WithContext } from "schema-dts";

import { type GenerateSeoParams, type SeoSite, generateTanStackStartSeo } from "@zo-stack/seo";

import { siteConfig } from "@/config/site.config";

const site = {
  applicationName: siteConfig.name,
  baseUrl: siteConfig.url,
  defaultDescription: siteConfig.description,
  defaultImages: [{ ...siteConfig.ogImage, type: "image/png" }],
  defaultTitle: siteConfig.title,
  locale: siteConfig.locale,
  siteName: siteConfig.name,
  titleTemplate: `%s | ${siteConfig.name}`
} satisfies SeoSite;

/**
 * Use in every route's `head()`. The canonical URL and og:url are added once in
 * `__root.tsx` from the current path, so routes only pass page-specific values.
 *
 * @example head: () => generateAppSeo({ title: "Pricing", description: "Plans for every team." })
 */
export function generateAppSeo(options: Omit<GenerateSeoParams, "site" | "canonicalPath"> = {}) {
  return generateTanStackStartSeo({ ...options, site });
}

/** Root-only: document meta plus the canonical link for the current path. */
export function generateRootSeo(canonicalPath: `/${string}` | undefined) {
  return generateTanStackStartSeo({ canonicalPath, includeDocumentMeta: true, site });
}

const absoluteUrl = (path: string) => new URL(path, siteConfig.url).toString();
const { address, hours } = siteConfig.contact;

const DAY_NAMES = {
  Fr: "Friday",
  Mo: "Monday",
  Sa: "Saturday",
  Su: "Sunday",
  Th: "Thursday",
  Tu: "Tuesday",
  We: "Wednesday"
} as const;

/**
 * The business itself, for Google's local results and knowledge panel
 * (name, logo, address, phone, hours). Keep it matching the Google Business Profile.
 */
export const localBusinessJsonLd: WithContext<LocalBusiness> = {
  "@context": "https://schema.org",
  "@type": siteConfig.businessType,
  address: {
    "@type": "PostalAddress",
    addressCountry: address.country,
    addressLocality: address.city,
    addressRegion: address.region,
    postalCode: address.postalCode,
    streetAddress: address.street
  },
  email: siteConfig.contact.email,
  image: absoluteUrl(siteConfig.ogImage.url),
  logo: absoluteUrl(siteConfig.logo),
  name: siteConfig.name,
  openingHoursSpecification: hours.map((slot) => {
    return {
      "@type": "OpeningHoursSpecification",
      closes: slot.closes,
      dayOfWeek: slot.days.map((day) => `https://schema.org/${DAY_NAMES[day]}` as const),
      opens: slot.opens
    };
  }),
  ...(siteConfig.priceRange ? { priceRange: siteConfig.priceRange } : {}),
  sameAs: Object.values(siteConfig.socials).filter(Boolean),
  telephone: siteConfig.contact.phoneE164,
  url: siteConfig.url
};

/** The site itself. Google uses it for the site name shown in results. */
export const websiteJsonLd: WithContext<WebSite> = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteConfig.url
};
