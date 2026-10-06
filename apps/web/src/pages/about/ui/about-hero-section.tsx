import { Picture } from "@zo-stack/ui/components/picture";

import { Stripe } from "@/shared/ui/stripe";

import { HERO } from "@/pages/about/config/about.content";

/**
 * About hero on bone: the h1 and the founding story bottom-left, a Retro head-tube shot on the
 * right with the 3-band stripe running behind it at the logo slant (DESIGN.md §6 A's stripe
 * gesture). Above the fold, so the entrance is CSS only (`animate-in`): no JS holds back the
 * LCP photo, and reduced motion (global CSS reset) shows the final state at once.
 */
export function AboutHero() {
  return (
    <section
      aria-labelledby="about-heading"
      className="bg-bone text-ink relative isolate overflow-hidden"
    >
      {/* Slides in along its own slant: the enter translate composes with the `rotate` property. */}
      <Stripe
        bandHeight="2.25rem"
        className="absolute top-[74%] left-[48%] -z-10 hidden w-[70vw] animate-in duration-1400 ease-[cubic-bezier(0.22,1,0.36,1)] slide-in-from-left motion-reduce:animate-none lg:flex"
      />
      <div className="grid min-h-svh items-end gap-[3rem] px-(--gutter) pt-[8rem] pb-[4rem] lg:grid-cols-12 lg:gap-x-[1.5rem] lg:pt-[7rem] lg:pb-[5rem]">
        <div className="flex animate-in flex-col items-start duration-1000 fade-in slide-in-from-bottom-4 motion-reduce:animate-none lg:col-span-7">
          <h1
            className="text-[3.25rem] leading-[0.92] font-semibold tracking-[-0.04em] text-balance lg:text-[7.5rem]"
            id="about-heading"
          >
            {HERO.heading.map((line) => (
              <span className="block" key={line}>
                {line}
              </span>
            ))}
          </h1>
          <p className="text-subheading mt-[2.5rem] max-w-[46ch]">{HERO.story}</p>
          <p className="text-label mt-[2rem] text-muted-foreground">{HERO.established}</p>
        </div>
        <div className="relative aspect-4/5 max-h-[78svh] min-h-[20rem] w-full animate-in duration-1000 fade-in motion-reduce:animate-none lg:col-span-4 lg:col-start-9 lg:justify-self-end">
          <Picture
            alt={HERO.image.alt}
            className="block size-full"
            image={HERO.image.image}
            imgClassName="size-full object-cover"
            priority
            sizes="(min-width: 1024px) 33vw, 100vw"
          />
        </div>
      </div>
    </section>
  );
}
