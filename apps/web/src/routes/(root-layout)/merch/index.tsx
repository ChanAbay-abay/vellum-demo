import { createFileRoute } from "@tanstack/react-router";

import { generateAppSeo } from "@/shared/lib/seo";

import { MerchPage } from "@/pages/merch";

export const Route = createFileRoute("/(root-layout)/merch/")({
  head: () =>
    generateAppSeo({
      description:
        "Vellum Retro jerseys, hoodies, tees, caps, bottles and stickers. Message us to order.",
      title: "Merch"
    }),
  component: MerchPage
});
