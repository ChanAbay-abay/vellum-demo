import { createFileRoute } from "@tanstack/react-router";

import { generateAppSeo } from "@/shared/lib/seo";

import { FuerzaPage } from "@/pages/model-fuerza";

export const Route = createFileRoute("/(root-layout)/models/fuerza/")({
  head: () =>
    generateAppSeo({
      description:
        "Fuerza Disc carbon road frameset by Vellum Cycles. Colorways, framesets and complete builds. Availability changes weekly, message us.",
      title: "Fuerza Disc"
    }),
  component: FuerzaPage
});
