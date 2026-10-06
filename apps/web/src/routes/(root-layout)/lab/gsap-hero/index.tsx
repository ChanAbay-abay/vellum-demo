import { createFileRoute } from "@tanstack/react-router";

import { generateAppSeo } from "@/shared/lib/seo";

import { LabGsapHeroPage } from "@/pages/lab-gsap-hero";

// Throwaway lab route: noindex here, and listed in EXCLUDED_PATHS in sitemap[.]xml.ts.
// Delete both (and pages/lab-gsap-hero) before a demo ships.
export const Route = createFileRoute("/(root-layout)/lab/gsap-hero/")({
  head: () => generateAppSeo({ robots: { index: false }, title: "GSAP hero lab" }),
  component: LabGsapHeroPage
});
