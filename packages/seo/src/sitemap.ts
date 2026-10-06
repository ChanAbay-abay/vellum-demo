import { normalizePath, toAbsoluteUrl } from "#@/utils";

export type SitemapEntry = {
  path: `/${string}`;
  /** ISO date, e.g. 2026-01-31 */
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
};

const XML_ESCAPES: Record<string, string> = {
  '"': "&quot;",
  "&": "&amp;",
  "'": "&apos;",
  "<": "&lt;",
  ">": "&gt;"
};
const XML_ESCAPE_REGEX = /[&<>"']/g;

function escapeXml(value: string): string {
  return value.replace(XML_ESCAPE_REGEX, (char) => XML_ESCAPES[char] ?? char);
}

export function generateSitemapXml({
  baseUrl,
  entries
}: {
  baseUrl: string;
  entries: ReadonlyArray<SitemapEntry>;
}): string {
  const seen = new Set<string>();
  const urls: string[] = [];

  for (const entry of entries) {
    const loc = toAbsoluteUrl(normalizePath(entry.path), baseUrl);
    if (seen.has(loc)) continue;
    seen.add(loc);

    urls.push(
      [
        "  <url>",
        `    <loc>${escapeXml(loc)}</loc>`,
        entry.lastmod ? `    <lastmod>${escapeXml(entry.lastmod)}</lastmod>` : undefined,
        entry.changefreq ? `    <changefreq>${entry.changefreq}</changefreq>` : undefined,
        entry.priority === undefined
          ? undefined
          : `    <priority>${entry.priority.toFixed(1)}</priority>`,
        "  </url>"
      ]
        .filter((line) => line !== undefined)
        .join("\n")
    );
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;
}
