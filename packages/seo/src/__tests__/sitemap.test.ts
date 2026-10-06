import { describe, expect, it } from "vite-plus/test";

import { generateSitemapXml } from "#@/sitemap";

describe("generateSitemapXml", () => {
  it("builds absolute, de-duplicated, escaped URLs", () => {
    const xml = generateSitemapXml({
      baseUrl: "https://example.com",
      entries: [
        { changefreq: "weekly", lastmod: "2026-01-31", path: "/", priority: 1 },
        { path: "/pricing" },
        { path: "/pricing/" },
        { path: "/a&b" }
      ]
    });

    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain("<loc>https://example.com/</loc>");
    expect(xml).toContain("<lastmod>2026-01-31</lastmod>");
    expect(xml).toContain("<changefreq>weekly</changefreq>");
    expect(xml).toContain("<priority>1.0</priority>");
    expect(xml.match(/<loc>https:\/\/example\.com\/pricing<\/loc>/g)).toHaveLength(1);
    expect(xml).toContain("<loc>https://example.com/a&amp;b</loc>");
  });

  it("returns a valid empty urlset when there are no entries", () => {
    const xml = generateSitemapXml({ baseUrl: "https://example.com", entries: [] });

    expect(xml).toContain("<urlset");
    expect(xml).not.toContain("<url>");
  });
});
