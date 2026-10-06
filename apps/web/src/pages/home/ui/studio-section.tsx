import { m, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

import { SplitReveal } from "@zo-stack/ui/components/split-reveal";

import { STUDIO } from "@/pages/home/config/home.content";

/**
 * Gray philosophy section. The title holds the center of the screen while a thin
 * ring draws itself around it; then the title scrolls away and the two paragraphs
 * rise in, word by word, on either side of the ring.
 */
export function StudioSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ offset: ["start start", "end end"], target: ref });
  const ringLength = useTransform(scrollYProgress, [0.08, 0.38], [0, 1]);
  const [first, second] = STUDIO.paragraphs;

  return (
    <section ref={ref} id={STUDIO.id} className="bg-paper text-ink relative">
      {/* The ring stays fixed behind the content for the whole section */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="sticky top-0 grid h-svh place-items-center">
          <svg className="size-[min(76svh,90vw)] -rotate-90" viewBox="0 0 100 100">
            <m.circle
              cx="50"
              cy="50"
              fill="none"
              r="49.8"
              stroke="var(--color-ink)"
              strokeOpacity="0.1"
              strokeWidth="0.2"
              style={{ pathLength: ringLength }}
            />
          </svg>
        </div>
      </div>

      <div className="relative h-[200svh]">
        <div className="sticky top-0 grid h-svh place-items-center px-(--gutter)">
          <SplitReveal
            as="h2"
            className="font-display text-title w-full text-center uppercase"
            text={STUDIO.title}
          />
        </div>
      </div>

      <div className="relative h-[130svh] px-[2rem]">
        <div className="absolute top-[calc(50%-19rem)] right-[2rem] left-[2rem] md:top-[calc(50%-14rem)] md:right-auto">
          <SplitReveal
            className="text-subheading max-w-[22.6875rem] font-medium"
            stagger={0.018}
            text={first ?? ""}
          />
        </div>
        <div className="absolute right-[2rem] bottom-[calc(50%-17rem)] left-[2rem] md:bottom-[calc(50%-8rem)] md:left-auto">
          <SplitReveal
            className="text-subheading text-ink/60 max-w-[22.6875rem] font-medium"
            stagger={0.018}
            text={second ?? ""}
          />
        </div>
      </div>
    </section>
  );
}
