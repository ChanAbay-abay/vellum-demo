import { createFileRoute } from "@tanstack/react-router";

import { generateSitemapXml } from "@zo-stack/seo";

import { siteConfig } from "@/config/site.config";
import { type FileRouteTypes, routeTree } from "@/routeTree.gen";

/**
 * Pages to leave out of the sitemap. Also give them `robots: { index: false }` in their head().
 * Every other static page is included automatically.
 */
const EXCLUDED_PATHS: ReadonlyArray<FileRouteTypes["fullPaths"]> = [];

// Prerendered to /sitemap.xml at build time (see `pages` in vite.config.ts).
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () => {
        const xml = generateSitemapXml({
          baseUrl: siteConfig.url,
          entries: getPagePaths().map((path) => {
            return { path };
          })
        });

        return new Response(xml, {
          headers: { "Content-Type": "application/xml; charset=utf-8" }
        });
      }
    }
  }
});

type RouteNode = {
  children?: unknown;
  fullPath?: string;
};

/**
 * Walks the generated route tree and returns the URL of every page.
 * Only leaf routes are pages (layouts have children). Skips dynamic
 * ($param) routes, files like /robots.txt, and /api routes.
 */
function getPagePaths(): `/${string}`[] {
  const excluded = new Set<string>(EXCLUDED_PATHS);
  const paths = new Set<`/${string}`>();

  const visit = (node: RouteNode) => {
    // The generated tree stores children as an object keyed by route name
    const children = node.children ? Object.values(node.children as Record<string, RouteNode>) : [];

    if (children.length > 0) {
      for (const child of children) visit(child);
      return;
    }

    const path = node.fullPath;
    if (
      !path?.startsWith("/") ||
      excluded.has(path) ||
      path.includes("$") ||
      path.includes(".") ||
      path.startsWith("/api")
    ) {
      return;
    }

    paths.add(path as `/${string}`);
  };

  visit(routeTree);
  return [...paths];
}
