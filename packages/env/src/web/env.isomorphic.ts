import { createEnv } from "@t3-oss/env-core";
import { isProduction } from "std-env";
import { z } from "zod";

/**
 * Safe to import anywhere (browser, server, vite.config.ts).
 * Only `VITE_*` vars belong here. Vite inlines them at build time.
 */
export const ENV_WEB_ISOMORPHIC = createEnv({
  client: {
    // Public origin of the site, e.g. https://example.com. Used for canonical URLs, OG images, and the sitemap.
    VITE_SITE_URL: isProduction ? z.url() : z.url().default("http://localhost:3000")
  },
  clientPrefix: "VITE_",
  emptyStringAsUndefined: true,
  runtimeEnv: import.meta.env ?? process.env
});
