import { type SeoImage, type SeoMetaTag, type SeoRobots, type SeoSite } from "#@/types";

export function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

export function toAbsoluteUrl(path: string | URL, baseUrl: string | URL): string {
  return new URL(path, baseUrl).toString();
}

const LEADING_SLASHES_REGEX = /^\/+/;
const TRAILING_SLASHES_REGEX = /\/+$/;

/** "/about/" → "/about". Keeps "/" as is. Matches TanStack Router's default `trailingSlash: "never"`. */
export function normalizePath(path: `/${string}`): `/${string}` {
  const trimmed = path.replace(LEADING_SLASHES_REGEX, "").replace(TRAILING_SLASHES_REGEX, "");
  return `/${trimmed}`;
}

export function formatTitle({ site, title }: { site: SeoSite; title: string }): string {
  if (!site.titleTemplate) {
    return title;
  }

  return site.titleTemplate.includes("%s")
    ? site.titleTemplate.replace("%s", title)
    : `${title} ${site.titleTemplate}`;
}

export function formatRobots({
  follow = true,
  index = true,
  maxImagePreview,
  noarchive = false,
  noimageindex = false,
  nosnippet = false
}: SeoRobots): string {
  return [
    index ? "index" : "noindex",
    follow ? "follow" : "nofollow",
    noarchive ? "noarchive" : undefined,
    noimageindex ? "noimageindex" : undefined,
    nosnippet ? "nosnippet" : undefined,
    maxImagePreview ? `max-image-preview:${maxImagePreview}` : undefined
  ]
    .filter(isDefined)
    .join(", ");
}

export function buildOpenGraphImageMeta({
  baseUrl,
  images
}: {
  baseUrl: string;
  images?: SeoImage[];
}): SeoMetaTag[] {
  if (!images?.length) {
    return [];
  }

  return images.flatMap((image) =>
    [
      { content: toAbsoluteUrl(image.url, baseUrl), property: "og:image" },
      image.alt ? { content: image.alt, property: "og:image:alt" } : undefined,
      image.width ? { content: `${image.width}`, property: "og:image:width" } : undefined,
      image.height ? { content: `${image.height}`, property: "og:image:height" } : undefined,
      image.type ? { content: image.type, property: "og:image:type" } : undefined
    ].filter(isDefined)
  );
}
