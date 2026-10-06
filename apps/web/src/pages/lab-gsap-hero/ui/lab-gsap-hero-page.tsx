import { Reveal } from "@zo-stack/ui/components/reveal";

import { LAB_NEXT } from "@/pages/lab-gsap-hero/config/lab-gsap-hero.content";
import { HeroScene } from "@/pages/lab-gsap-hero/ui/hero-scene";

/**
 * The GSAP reference scene that demos port from. The section below the hero uses Motion's
 * `Reveal`, proving the two libraries coexist on one page (on different elements).
 */
export function LabGsapHeroPage() {
  return (
    <>
      <HeroScene />
      <section
        className="bg-paper text-ink grid min-h-svh place-items-center px-(--gutter)"
        id={LAB_NEXT.id}
      >
        <Reveal className="max-w-[32rem]">
          <p className="text-subheading">{LAB_NEXT.paragraph}</p>
        </Reveal>
      </section>
    </>
  );
}
