import { createFileRoute } from "@tanstack/react-router";

import { generateRobotsTxt } from "@zo-stack/seo";

import { siteConfig } from "@/config/site.config";

// Prerendered to /robots.txt at build time (see `pages` in vite.config.ts).
export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () =>
        new Response(generateRobotsTxt({ baseUrl: siteConfig.url, disallow: ["/api/"] }), {
          headers: { "Content-Type": "text/plain; charset=utf-8" }
        })
    }
  }
});
