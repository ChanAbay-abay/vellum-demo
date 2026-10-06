import { type GenerateSeoParams, type JsonLd, type SeoHead, type SeoMetaTag } from "#@/types";
import {
  buildOpenGraphImageMeta,
  formatRobots,
  formatTitle,
  isDefined,
  normalizePath,
  toAbsoluteUrl
} from "#@/utils";

/**
 * Builds a TanStack Start route `head()` object: title, description, canonical,
 * Open Graph, Twitter card, robots, and JSON-LD structured data.
 */
export function generateTanStackStartSeo({
  canonicalPath,
  description,
  images,
  includeDocumentMeta = false,
  jsonLd = [],
  openGraphType = "website",
  robots,
  site,
  title
}: GenerateSeoParams): SeoHead {
  const resolvedDescription = description ?? site.defaultDescription;
  const resolvedImages = images?.length ? images : site.defaultImages;
  // The template only wraps page titles. The default (home) title is used as is.
  const formattedTitle = title ? formatTitle({ site, title }) : site.defaultTitle;
  const canonicalUrl = canonicalPath
    ? toAbsoluteUrl(normalizePath(canonicalPath), site.baseUrl)
    : undefined;
  const robotsContent = robots ? formatRobots(robots) : undefined;
  const primaryImage = resolvedImages?.[0];

  const meta: SeoMetaTag[] = [
    includeDocumentMeta ? { charSet: "utf-8" } : undefined,
    includeDocumentMeta
      ? { content: "width=device-width, initial-scale=1", name: "viewport" }
      : undefined,
    includeDocumentMeta && site.applicationName
      ? { content: site.applicationName, name: "application-name" }
      : undefined,
    { title: formattedTitle },
    resolvedDescription ? { content: resolvedDescription, name: "description" } : undefined,
    { content: formattedTitle, property: "og:title" },
    resolvedDescription ? { content: resolvedDescription, property: "og:description" } : undefined,
    site.siteName ? { content: site.siteName, property: "og:site_name" } : undefined,
    site.locale ? { content: site.locale, property: "og:locale" } : undefined,
    canonicalUrl ? { content: canonicalUrl, property: "og:url" } : undefined,
    { content: openGraphType, property: "og:type" },
    ...buildOpenGraphImageMeta({ baseUrl: site.baseUrl, images: resolvedImages }),
    { content: site.defaultTwitterCard ?? "summary_large_image", name: "twitter:card" },
    { content: formattedTitle, name: "twitter:title" },
    resolvedDescription ? { content: resolvedDescription, name: "twitter:description" } : undefined,
    primaryImage
      ? { content: toAbsoluteUrl(primaryImage.url, site.baseUrl), name: "twitter:image" }
      : undefined,
    primaryImage?.alt ? { content: primaryImage.alt, name: "twitter:image:alt" } : undefined,
    site.twitterSite ? { content: site.twitterSite, name: "twitter:site" } : undefined,
    site.twitterCreator ? { content: site.twitterCreator, name: "twitter:creator" } : undefined,
    robotsContent ? { content: robotsContent, name: "robots" } : undefined
  ].filter(isDefined);

  return {
    links: canonicalUrl ? [{ href: canonicalUrl, rel: "canonical" }] : undefined,
    meta,
    scripts:
      jsonLd.length > 0
        ? jsonLd.map((data) => {
            return { children: serializeJsonLd(data), type: "application/ld+json" };
          })
        : undefined
  };
}

// < > & plus the two JS line separators (U+2028, U+2029)
const UNSAFE_SCRIPT_CHARS_REGEX = new RegExp(`[<>&${String.fromCodePoint(0x20_28, 0x20_29)}]`, "g");

/**
 * TanStack injects script children as raw HTML, so escape anything that could
 * close the <script> tag early. The unicode escapes it uses are still valid JSON.
 */
function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(
    UNSAFE_SCRIPT_CHARS_REGEX,
    (char) => `\\u${char.codePointAt(0)?.toString(16).padStart(4, "0")}`
  );
}
