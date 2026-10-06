import { createFileRoute } from "@tanstack/react-router";

import { generateAppSeo } from "@/shared/lib/seo";

import { PrivacyPolicyPage } from "@/pages/privacy-policy";

import { siteConfig } from "@/config/site.config";

export const Route = createFileRoute("/(root-layout)/privacy-policy/")({
  head: () =>
    generateAppSeo({
      description: `How ${siteConfig.legal.companyName} collects, uses, and protects your information.`,
      title: "Privacy Notice"
    }),
  component: PrivacyPolicyPage
});
