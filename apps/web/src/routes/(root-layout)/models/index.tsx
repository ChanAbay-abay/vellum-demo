import { createFileRoute } from "@tanstack/react-router";

import { generateAppSeo } from "@/shared/lib/seo";

import { ModelsPage } from "@/pages/models";

export const Route = createFileRoute("/(root-layout)/models/")({
  head: () =>
    generateAppSeo({
      description:
        "The Vellum lineup: Fuerza, Edge and Terreno carbon frames, designed in Cebu. Plus the five-year frameset warranty.",
      title: "Models"
    }),
  component: ModelsPage
});
