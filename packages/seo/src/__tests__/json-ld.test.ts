import { describe, expect, it } from "vite-plus/test";

import { breadcrumbListJsonLd, faqPageJsonLd } from "#@/json-ld";

describe("faqPageJsonLd", () => {
  it("maps question/answer pairs to FAQPage entities", () => {
    expect(faqPageJsonLd([{ answer: "Yes.", question: "Is it fast?" }])).toEqual({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          acceptedAnswer: { "@type": "Answer", text: "Yes." },
          name: "Is it fast?"
        }
      ]
    });
  });
});

describe("breadcrumbListJsonLd", () => {
  it("builds absolute, 1-indexed breadcrumb items", () => {
    const result = breadcrumbListJsonLd({
      baseUrl: "https://example.com",
      items: [
        { name: "Home", path: "/" },
        { name: "Pricing", path: "/pricing/" }
      ]
    });

    expect(result.itemListElement).toEqual([
      { "@type": "ListItem", item: "https://example.com/", name: "Home", position: 1 },
      { "@type": "ListItem", item: "https://example.com/pricing", name: "Pricing", position: 2 }
    ]);
  });
});
