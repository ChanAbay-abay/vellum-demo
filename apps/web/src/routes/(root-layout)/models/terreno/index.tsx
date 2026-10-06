import { createFileRoute } from "@tanstack/react-router";

import { generateAppSeo } from "@/shared/lib/seo";

import { TerrenoPage } from "@/pages/model-terreno";

export const Route = createFileRoute("/(root-layout)/models/terreno/")({
  head: () =>
    generateAppSeo({
      description: "Terreno, the Vellum cross-country race carbon frame. Ask about availability.",
      title: "Terreno"
    }),
  component: TerrenoPage
});
