import { createFileRoute } from "@tanstack/react-router";

import { generateAppSeo } from "@/shared/lib/seo";

import { EdgePage } from "@/pages/model-edge";

export const Route = createFileRoute("/(root-layout)/models/edge/")({
  head: () =>
    generateAppSeo({
      description:
        "Edge, the first-generation Vellum race frame from 2007, and two decades of Edge since.",
      title: "Edge"
    }),
  component: EdgePage
});
