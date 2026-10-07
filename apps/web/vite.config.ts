import { resolve } from "node:path";

import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { imagetools } from "vite-imagetools";
import { defineConfig } from "vite-plus";

import { ENV_WEB_ISOMORPHIC } from "@zo-stack/env/web/env.isomorphic";

import { defaultDirectives, responsiveImages } from "./vite/responsive-images";

// Vercel production builds take the project's own production domain: the dashboard's VITE_SITE_URL
// named vellum-demo.vercel.app, which belongs to an unrelated project, so OG/canonical URLs pointed there
const siteUrl =
  process.env.VERCEL_ENV === "production" && process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : ENV_WEB_ISOMORPHIC.VITE_SITE_URL;

export default defineConfig({
  build: {
    rolldownOptions: {
      output: {
        banner: '"use client";'
      },
      onwarn(warning, defaultHandler) {
        // framer-motion ships "use client" directives. They only matter for React Server Components.
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
        defaultHandler(warning);
      }
    }
  },
  /**
   * Env is validated here, at build time, so a bad VITE_SITE_URL fails the build instead of shipping
   * wrong canonical URLs. The validated value is then inlined, which keeps zod out of the client bundle.
   */
  define: {
    "import.meta.env.VITE_SITE_URL": JSON.stringify(siteUrl)
  },
  // Restart the dev server when env files in this directory change
  envDir: resolve(import.meta.dirname, "../../packages/env"),
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "./src")
    },
    tsconfigPaths: true
  },
  server: {
    port: 3000
  },
  plugins: [
    devtools({
      consolePiping: { enabled: false }
    }),
    mdx(),
    // Iridel: `?responsive` image imports -> AVIF/WebP/JPG srcsets + blur placeholder, built by sharp at build time
    responsiveImages(),
    imagetools({ defaultDirectives }),
    tanstackStart({
      /**
       * Landing pages are prerendered to static HTML at build time and served from the CDN.
       * Every static route is discovered automatically, and links found in the HTML are crawled.
       * Server routes (sitemap.xml, robots.txt) are not linked from pages, so list them here.
       */
      pages: [{ path: "/sitemap.xml" }, { path: "/robots.txt" }],
      prerender: {
        enabled: true,
        crawlLinks: true,
        // In-page anchors (`/#services`) are the same document; crawling them only re-renders "/".
        filter: (page) => !page.path.includes("#")
      },
      server: {
        build: {
          // Don't allow changing of process.env.NODE_ENV at runtime
          staticNodeEnv: true
        }
      }
    }),
    viteReact({ compiler: true }),
    /**
     * Picks the deploy target from the environment:
     * - Vercel: detected automatically on Vercel builds.
     * - Cloudflare Workers: `vp run build:cloudflare` (sets NITRO_PRESET=cloudflare_module).
     * - Anything else: a Node server in `.output/` (used by `vp preview` and e2e tests).
     * @see {@link https://tanstack.com/start/latest/docs/framework/react/guide/hosting}
     */
    nitro({
      // FIXME: Remove this when Nitro/Rolldown preserves initialization order across server chunks, see https://github.com/rolldown/rolldown/issues/10747
      inlineDynamicImports: true,
      /**
       * We need to add this or else we will get `Error: Cannot find module 'react'` during prod.
       * @see {@link https://github.com/nuxt/nuxt/issues/20773}
       */
      traceDeps: ["react", "react-dom"]
    }),
    tailwindcss()
  ]
});
