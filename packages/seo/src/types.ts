import { type Thing, type WithContext } from "schema-dts";

/** Any typed schema.org object, e.g. `{ "@context": "https://schema.org", "@type": "Product", ... }` */
export type JsonLd = WithContext<Thing>;

export type SeoMetaTag =
  | { title: string }
  | { charSet: string }
  | { content: string; httpEquiv: string }
  | { content: string; name: string }
  | { content: string; property: string };

export type SeoLinkTag = {
  as?: string;
  crossOrigin?: "" | "anonymous" | "use-credentials";
  href: string;
  rel: string;
  sizes?: string;
  type?: string;
};

export type SeoScriptTag = {
  children: string;
  type: "application/ld+json";
};

export type SeoHead = {
  links?: SeoLinkTag[];
  meta?: SeoMetaTag[];
  /** TanStack renders head() scripts inside <head> */
  scripts?: SeoScriptTag[];
};

export type SeoImage = {
  alt?: string;
  height?: number;
  type?:
    | "image/apng"
    | "image/avif"
    | "image/gif"
    | "image/jpeg"
    | "image/png"
    | "image/svg+xml"
    | "image/webp";
  url: string;
  width?: number;
};

export type SeoRobots = {
  follow?: boolean;
  index?: boolean;
  maxImagePreview?: "large" | "none" | "standard";
  noarchive?: boolean;
  noimageindex?: boolean;
  nosnippet?: boolean;
};

export type SeoSite = {
  applicationName?: string;
  /** Site origin, e.g. https://example.com */
  baseUrl: string;
  defaultDescription?: string;
  defaultImages?: SeoImage[];
  /** Used as is (no template) when a route has no title, e.g. the home page. */
  defaultTitle: string;
  defaultTwitterCard?: "app" | "player" | "summary" | "summary_large_image";
  /** Open Graph locale, e.g. en_US */
  locale?: string;
  siteName?: string;
  /** Use %s for the page title, e.g. "%s | Acme" */
  titleTemplate?: string;
  twitterCreator?: string;
  twitterSite?: string;
};

export type GenerateSeoParams = {
  /** Route path without the origin, e.g. "/pricing". Adds the canonical link and og:url. */
  canonicalPath?: `/${string}`;
  description?: string;
  images?: SeoImage[];
  /** Root route only: adds charset, viewport, and application-name. */
  includeDocumentMeta?: boolean;
  /** Structured data for rich results. Use the builders in json-ld.ts or write typed objects. */
  jsonLd?: ReadonlyArray<JsonLd>;
  openGraphType?: "article" | "profile" | "website";
  robots?: SeoRobots;
  site: SeoSite;
  title?: string;
};
