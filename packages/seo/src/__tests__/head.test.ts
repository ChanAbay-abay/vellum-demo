import { describe, expect, it } from "vite-plus/test";

import { generateTanStackStartSeo } from "#@/head";
import { type GenerateSeoParams, type SeoMetaTag, type SeoSite } from "#@/types";

const baseSite = {
  applicationName: "Example App",
  baseUrl: "https://example-app.example",
  defaultDescription: "Explore guides, builds, and featured articles.",
  defaultImages: [
    {
      alt: "Example App default social card",
      height: 630,
      type: "image/png",
      url: "/og/default.png",
      width: 1200
    }
  ],
  defaultTitle: "Example App",
  defaultTwitterCard: "summary_large_image",
  locale: "en_US",
  siteName: "Example App",
  titleTemplate: "%s | Example App",
  twitterCreator: "@example_creator",
  twitterSite: "@exampleapp"
} satisfies SeoSite;

function createSubject(overrides: Partial<GenerateSeoParams> = {}) {
  return generateTanStackStartSeo({ site: baseSite, ...overrides });
}

function getMetaByName(meta: SeoMetaTag[] | undefined, name: string) {
  return meta?.find((tag) => "name" in tag && tag.name === name);
}

function getMetaByProperty(meta: SeoMetaTag[] | undefined, property: string) {
  return meta?.find((tag) => "property" in tag && tag.property === property);
}

function getTitle(meta: SeoMetaTag[] | undefined) {
  return meta?.find((tag): tag is Extract<SeoMetaTag, { title: string }> => "title" in tag);
}

describe("generateTanStackStartSeo", () => {
  it("builds templated titles, canonical, social meta, and robots tags", () => {
    const result = createSubject({
      canonicalPath: "/articles/legendary-builds/",
      description: "Legendary routes, builds, and pull planning.",
      images: [{ alt: "Banner", url: "/og/articles/legendary-builds.webp" }],
      openGraphType: "article",
      robots: { follow: false, index: false, maxImagePreview: "large", noarchive: true },
      title: "Legendary Builds"
    });

    expect(getTitle(result.meta)).toEqual({ title: "Legendary Builds | Example App" });
    expect(result.links).toEqual([
      { href: "https://example-app.example/articles/legendary-builds", rel: "canonical" }
    ]);
    expect(getMetaByProperty(result.meta, "og:url")).toEqual({
      content: "https://example-app.example/articles/legendary-builds",
      property: "og:url"
    });
    expect(getMetaByProperty(result.meta, "og:type")).toEqual({
      content: "article",
      property: "og:type"
    });
    expect(getMetaByProperty(result.meta, "og:locale")).toEqual({
      content: "en_US",
      property: "og:locale"
    });
    expect(getMetaByProperty(result.meta, "og:image")).toEqual({
      content: "https://example-app.example/og/articles/legendary-builds.webp",
      property: "og:image"
    });
    expect(getMetaByName(result.meta, "twitter:image")).toEqual({
      content: "https://example-app.example/og/articles/legendary-builds.webp",
      name: "twitter:image"
    });
    expect(getMetaByName(result.meta, "robots")).toEqual({
      content: "noindex, nofollow, noarchive, max-image-preview:large",
      name: "robots"
    });
  });

  it.each([
    { expected: "https://example-app.example/", path: "/" },
    { expected: "https://example-app.example/guides", path: "/guides/" },
    { expected: "https://example-app.example/a/b", path: "//a/b//" }
  ] as const)("normalizes canonical path $path", ({ expected, path }) => {
    const result = createSubject({ canonicalPath: path });

    expect(result.links?.[0]).toEqual({ href: expected, rel: "canonical" });
  });

  it("omits canonical and og:url when no canonical path is given", () => {
    const result = createSubject();

    expect(result.links).toBeUndefined();
    expect(getMetaByProperty(result.meta, "og:url")).toBeUndefined();
  });

  it("falls back to site defaults, including when images is an empty array", () => {
    const result = createSubject({ images: [] });

    expect(getTitle(result.meta)).toEqual({ title: "Example App" });
    expect(getMetaByName(result.meta, "description")).toEqual({
      content: "Explore guides, builds, and featured articles.",
      name: "description"
    });
    expect(getMetaByProperty(result.meta, "og:image")).toEqual({
      content: "https://example-app.example/og/default.png",
      property: "og:image"
    });
  });

  it("appends title templates that have no %s placeholder", () => {
    const result = generateTanStackStartSeo({
      site: {
        baseUrl: "https://example-app.example",
        defaultTitle: "Example App",
        titleTemplate: "| Example App"
      },
      title: "Profile"
    });

    expect(getTitle(result.meta)).toEqual({ title: "Profile | Example App" });
    expect(getMetaByName(result.meta, "description")).toBeUndefined();
  });

  it("adds document meta only when requested", () => {
    const root = createSubject({ includeDocumentMeta: true });
    const page = createSubject();

    expect(root.meta).toEqual(
      expect.arrayContaining([
        { charSet: "utf-8" },
        { content: "width=device-width, initial-scale=1", name: "viewport" },
        { content: "Example App", name: "application-name" }
      ])
    );
    expect(page.meta).not.toEqual(expect.arrayContaining([{ charSet: "utf-8" }]));
  });

  it("renders JSON-LD as escaped head scripts", () => {
    const organization = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "</script><script>alert(1)</script> & co"
    } as const;
    const result = createSubject({ jsonLd: [organization] });
    const script = result.scripts?.[0];

    expect(script?.type).toBe("application/ld+json");
    expect(script?.children).not.toMatch(/[<>&]/);
    expect(JSON.parse(script?.children ?? "")).toEqual(organization);
  });

  it("omits scripts when there is no JSON-LD", () => {
    expect(createSubject().scripts).toBeUndefined();
  });

  it("keeps title, og:title, and twitter:title aligned", () => {
    const result = createSubject({ title: "Pricing" });

    expect(getTitle(result.meta)?.title).toBe("Pricing | Example App");
    expect(getMetaByProperty(result.meta, "og:title")).toEqual({
      content: "Pricing | Example App",
      property: "og:title"
    });
    expect(getMetaByName(result.meta, "twitter:title")).toEqual({
      content: "Pricing | Example App",
      name: "twitter:title"
    });
  });
});
