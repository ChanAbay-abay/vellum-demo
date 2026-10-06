import { ClosingCta } from "@/shared/ui/closing-cta";

import { CLOSING } from "@/pages/about/config/about.content";
import { AboutHero } from "@/pages/about/ui/about-hero-section";
import { AboutShowroom } from "@/pages/about/ui/about-showroom-section";
import { Founders } from "@/pages/about/ui/founders-section";
import { Philosophy } from "@/pages/about/ui/philosophy-section";
import { Socials } from "@/pages/about/ui/socials-section";
import { Timeline } from "@/pages/about/ui/timeline-section";

/**
 * About, in PRD order (story, founders, philosophy, timeline, socials, showroom), closing on the
 * shared photo CTA. SiteNav and SiteFooter are mounted around every page by RootLayout.
 * Grounds: bone → paper → ink → paper → bone → paper → photo closing CTA → ink footer.
 */
export function AboutPage() {
  return (
    <>
      <AboutHero />
      <Founders />
      <Philosophy />
      <Timeline />
      <Socials />
      <AboutShowroom />
      <ClosingCta {...CLOSING} />
    </>
  );
}
