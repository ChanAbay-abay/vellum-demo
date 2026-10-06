import { toAbsoluteUrl } from "#@/utils";

export function generateRobotsTxt({
  baseUrl,
  disallow = [],
  indexable = true,
  sitemapPath = "/sitemap.xml"
}: {
  baseUrl: string;
  /** Paths crawlers should skip, e.g. ["/api/"] */
  disallow?: ReadonlyArray<string>;
  /** false blocks every crawler, e.g. for staging sites */
  indexable?: boolean;
  sitemapPath?: `/${string}`;
}): string {
  const rules = indexable
    ? ["Allow: /", ...disallow.map((path) => `Disallow: ${path}`)]
    : ["Disallow: /"];

  return [
    "User-agent: *",
    ...rules,
    "",
    `Sitemap: ${toAbsoluteUrl(sitemapPath, baseUrl)}`,
    ""
  ].join("\n");
}
