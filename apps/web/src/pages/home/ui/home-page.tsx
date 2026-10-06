import { ClosingCta } from "@/shared/ui/closing-cta";

import { CLOSING } from "@/pages/home/config/home.content";
import { HeritageStrip } from "@/pages/home/ui/heritage-strip-section";
import { Hero } from "@/pages/home/ui/hero-section";
import { Intro } from "@/pages/home/ui/intro-section";
import { MerchRow } from "@/pages/home/ui/merch-row-section";
import { ModelsSplit } from "@/pages/home/ui/models-split-section";
import { Showroom } from "@/pages/home/ui/showroom-section";

/**
 * Home, in PRD order. SiteNav and SiteFooter are mounted around every page by RootLayout.
 * Grounds (DESIGN.md §4, hero per §6 D): bone → paper → ink → sand → paper → bone → photo closing CTA → ink footer.
 */
export function HomePage() {
  return (
    <>
      <Hero />
      <Intro />
      <ModelsSplit />
      <MerchRow />
      <HeritageStrip />
      <Showroom />
      <ClosingCta {...CLOSING} />
    </>
  );
}
