import interLatin from "@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url";
import tomorrowLatin from "@fontsource/tomorrow/files/tomorrow-latin-400-normal.woff2?url";
import { a11yDevtoolsPlugin } from "@tanstack/devtools-a11y/react";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import { GsapSmoothScroll } from "@zo-stack/ui/components/gsap-smooth-scroll";
import { MotionProvider } from "@zo-stack/ui/components/motion-provider";

import { generateRootSeo } from "@/shared/lib/seo";
import appCss from "@/shared/styles/app.css?url";
import { HashScroll } from "@/shared/ui/hash-scroll";

import { DefaultErrorPage } from "@/pages/default-error";

import { siteConfig } from "@/config/site.config";

/**
 * Shows <Reveal>/<StaggerItem> content when JavaScript is off.
 * They start hidden and only animate in once JS runs.
 */
const NO_SCRIPT_STYLES =
  "[data-reveal]{opacity:1!important;transform:none!important;visibility:visible!important;clip-path:none!important}";

export const Route = createRootRoute({
  errorComponent: DefaultErrorPage,
  shellComponent: RootDocument,
  head: ({ matches }) => {
    // Canonical URL for whichever page is rendering. Routes don't need to set it themselves.
    // 404s get none (they're also marked noindex).
    const isNotFound = matches.some(
      (match) => match._notFound === true || match.status === "notFound"
    );
    const pathname = matches.at(-1)?.pathname as `/${string}` | undefined;
    const rootSeo = generateRootSeo(isNotFound ? undefined : pathname);

    return {
      links: [
        ...(rootSeo.links ?? []),
        { href: "/favicon.ico", rel: "icon", sizes: "32x32" },
        { href: "/logo192.png", rel: "apple-touch-icon" },
        { href: "/manifest.json", rel: "manifest" },
        { href: "/sitemap.xml", rel: "sitemap", type: "application/xml" },
        /**
         * Preload only the fonts used above the fold, latin subset only.
         * Other subsets and Geist Mono still load on demand through @font-face in fonts.css.
         */
        {
          as: "font",
          crossOrigin: "anonymous",
          href: interLatin,
          rel: "preload",
          type: "font/woff2"
        },
        {
          as: "font",
          crossOrigin: "anonymous",
          href: tomorrowLatin,
          rel: "preload",
          type: "font/woff2"
        },
        { href: appCss, rel: "stylesheet" }
      ],
      meta: [...(rootSeo.meta ?? []), { content: siteConfig.themeColor, name: "theme-color" }]
    };
  }
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang={siteConfig.lang}>
      <head>
        <HeadContent />
        <noscript>
          <style>{NO_SCRIPT_STYLES}</style>
        </noscript>
      </head>
      <body className="bg-paper text-ink min-h-dvh font-sans antialiased">
        <MotionProvider>
          <GsapSmoothScroll />
          <HashScroll />
          {children}
        </MotionProvider>
        <TanStackDevtools
          config={{ position: "bottom-right", triggerMode: "fixed" }}
          plugins={[
            { name: "TanStack Router", render: <TanStackRouterDevtoolsPanel /> },
            a11yDevtoolsPlugin()
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
