import { describe, expect, it } from "vite-plus/test";

import { generateRobotsTxt } from "#@/robots";

describe("generateRobotsTxt", () => {
  it("allows crawling, lists disallowed paths, and links the sitemap", () => {
    expect(generateRobotsTxt({ baseUrl: "https://example.com", disallow: ["/api/"] })).toBe(
      "User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: https://example.com/sitemap.xml\n"
    );
  });

  it("blocks everything when the site is not indexable", () => {
    const txt = generateRobotsTxt({
      baseUrl: "https://staging.example.com",
      disallow: ["/api/"],
      indexable: false
    });

    expect(txt).toContain("Disallow: /\n");
    expect(txt).not.toContain("Allow: /");
    expect(txt).not.toContain("/api/");
  });
});
