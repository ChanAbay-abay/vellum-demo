import { createFileRoute } from "@tanstack/react-router";

import { generateAppSeo } from "@/shared/lib/seo";

import { TermsOfServicePage } from "@/pages/terms-of-service";

import { siteConfig } from "@/config/site.config";

export const Route = createFileRoute("/(root-layout)/terms-of-service/")({
  head: () =>
    generateAppSeo({
      description: `The terms that apply when you use ${siteConfig.name}.`,
      title: "Terms of Service"
    }),
  component: TermsOfServicePage
});
