import { createFileRoute } from "@tanstack/react-router";

import { generateAppSeo, localBusinessJsonLd, websiteJsonLd } from "@/shared/lib/seo";

import { HomePage } from "@/pages/home";

export const Route = createFileRoute("/(root-layout)/")({
  // No title: the home page uses siteConfig.title as is.
  head: () => generateAppSeo({ jsonLd: [localBusinessJsonLd, websiteJsonLd] }),
  component: HomePage
});
