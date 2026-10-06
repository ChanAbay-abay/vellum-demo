import { Reveal } from "@/shared/ui/reveal";

import { INTRO } from "@/pages/home/config/home.content";

/**
 * Intro statement on paper (DESIGN.md §4): big heading, body offset to the right on desktop.
 * Pulled up 70svh so it slides over the hero's pinned stage as the rider rides off, instead of
 * waiting for the pin to release (timing in hero-section SPARKLE_AT). No overlap under reduced
 * motion, where the hero is a plain one-screen section.
 */
export function Intro() {
  return (
    <section
      className="bg-paper text-ink relative z-20 px-(--gutter) py-[5rem] motion-safe:mt-[-70svh] lg:py-[8rem]"
      id={INTRO.id}
    >
      <Reveal className="grid grid-cols-1 gap-[2rem] lg:grid-cols-12 lg:gap-x-[1.5rem]">
        <h2 className="lg:text-title text-[3rem] leading-[0.95] font-semibold tracking-[-0.03em] text-balance lg:col-span-9">
          {INTRO.heading}
        </h2>
        <p className="text-body max-w-[62ch] lg:col-span-5 lg:col-start-8">{INTRO.body}</p>
      </Reveal>
    </section>
  );
}
