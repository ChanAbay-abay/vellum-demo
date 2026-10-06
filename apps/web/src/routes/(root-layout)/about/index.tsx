import { createFileRoute } from "@tanstack/react-router";

import { generateAppSeo } from "@/shared/lib/seo";

import { AboutPage } from "@/pages/about";

export const Route = createFileRoute("/(root-layout)/about/")({
  head: () =>
    generateAppSeo({
      description:
        "Founded in Cebu in 2004 by Chris Aldeguer and Michael Flores. The Vellum story, heritage timeline, showroom and socials.",
      title: "About"
    }),
  component: AboutPage
});
