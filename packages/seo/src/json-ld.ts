import { type BreadcrumbList, type FAQPage, type WithContext } from "schema-dts";

import { normalizePath, toAbsoluteUrl } from "#@/utils";

/**
 * Builders for structured data whose shape is fiddly to write by hand.
 * For anything else (Organization, Product, LocalBusiness, Event, ...) write a typed object:
 *
 * @example
 * const product: WithContext<Product> = { "@context": "https://schema.org", "@type": "Product", name: "Acme" };
 */

export function faqPageJsonLd(
  items: ReadonlyArray<{ answer: string; question: string }>
): WithContext<FAQPage> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => {
      return {
        "@type": "Question",
        acceptedAnswer: { "@type": "Answer", text: item.answer },
        name: item.question
      };
    })
  };
}

export function breadcrumbListJsonLd({
  baseUrl,
  items
}: {
  baseUrl: string;
  items: ReadonlyArray<{ name: string; path: `/${string}` }>;
}): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => {
      return {
        "@type": "ListItem",
        item: toAbsoluteUrl(normalizePath(item.path), baseUrl),
        name: item.name,
        position: index + 1
      };
    })
  };
}
