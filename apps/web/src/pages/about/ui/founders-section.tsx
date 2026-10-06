import { m } from "motion/react";

import { Reveal } from "@/shared/ui/reveal";
import { Stripe } from "@/shared/ui/stripe";

import { FOUNDERS } from "@/pages/about/config/about.content";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Founders on paper: two typographic cards on bone (no photos exist, Chan 2026-10-07). Each
 * name is set in display type over a full-width stripe band, which draws in from the left as
 * the card enters. The in-view trigger sits on the card, never on the scaled band.
 * Reduced motion: MotionProvider drops the transforms, so the band is simply there.
 */
export function Founders() {
  return (
    <section
      aria-labelledby="founders-heading"
      className="bg-paper text-ink px-(--gutter) py-[5rem] lg:py-[8rem]"
      id={FOUNDERS.id}
    >
      <Reveal className="grid gap-[2rem] lg:grid-cols-12 lg:items-end lg:gap-x-[1.5rem]">
        <h2
          className="lg:text-title text-[3rem] leading-[0.95] font-semibold tracking-[-0.03em] text-balance lg:col-span-7"
          id="founders-heading"
        >
          {FOUNDERS.heading}
        </h2>
        <p className="text-body max-w-[44ch] lg:col-span-4 lg:col-start-9">{FOUNDERS.intro}</p>
      </Reveal>

      <ul className="mt-[4rem] grid gap-[1.5rem] lg:mt-[5rem] lg:grid-cols-2">
        {FOUNDERS.people.map((person, i) => (
          <m.li
            className="bg-bone flex min-h-[30rem] flex-col justify-between gap-[3rem] overflow-hidden pt-[2rem] lg:min-h-[38rem] lg:pt-[2.5rem]"
            data-reveal=""
            initial="hidden"
            key={person.role}
            transition={{ delay: i * 0.12, duration: 0.7, ease: EASE }}
            variants={{ hidden: { opacity: 0, y: 24 }, shown: { opacity: 1, y: 0 } }}
            viewport={{ amount: 0.3, once: true }}
            whileInView="shown"
          >
            <p className="text-label px-[1.5rem] text-muted-foreground lg:px-[2.5rem]">
              {person.role}
            </p>
            <div>
              <h3 className="px-[1.5rem] text-[4rem] leading-[0.86] font-semibold tracking-[-0.04em] lg:px-[2.5rem] lg:text-[7.5rem]">
                {person.name.map((part) => (
                  <span className="block" key={part}>
                    {part}
                  </span>
                ))}
              </h3>
              <m.div
                className="mt-[1.5rem] origin-left"
                transition={{ delay: 0.25 + i * 0.12, duration: 0.9, ease: EASE }}
                variants={{ hidden: { scaleX: 0 }, shown: { scaleX: 1 } }}
              >
                <Stripe angle={0} bandHeight="0.75rem" className="w-full" />
              </m.div>
              <p className="text-body px-[1.5rem] pt-[1.5rem] pb-[2rem] lg:px-[2.5rem] lg:pb-[2.5rem]">
                {person.about}
              </p>
            </div>
          </m.li>
        ))}
      </ul>
    </section>
  );
}
