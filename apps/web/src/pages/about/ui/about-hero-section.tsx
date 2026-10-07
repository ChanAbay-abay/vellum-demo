import { useEffect, useState } from "react";

import { Picture } from "@zo-stack/ui/components/picture";
import { cn } from "@zo-stack/ui/lib/utils";

import { Stripe } from "@/shared/ui/stripe";

import { HERO } from "@/pages/about/config/about.content";

/**
 * About hero on bone: the h1 and the founding story bottom-left, a vertical cycle of model photos
 * (opening on the Retro head tube) on the right with the 3-band stripe running behind it at the logo slant (DESIGN.md §6 A's stripe
 * gesture). Above the fold, so the entrance is CSS only (`animate-in`): no JS holds back the
 * LCP photo, and reduced motion (global CSS reset) shows the final state at once.
 */
export function AboutHero() {
  return (
    <section
      aria-labelledby="about-heading"
      className="bg-bone text-ink relative isolate overflow-hidden"
    >
      {/* Slides in along its own slant: the enter translate composes with the `rotate` property.
          Anchored from the bottom: at -18deg the left end drops ~11vw below the box, so the
          offset scales with width and the low end never clips on the section's overflow. */}
      <Stripe
        bandHeight="2.25rem"
        className="absolute bottom-[calc(11vw+1.5rem)] left-[48%] -z-10 hidden w-[70vw] animate-in duration-1400 ease-[cubic-bezier(0.22,1,0.36,1)] slide-in-from-left motion-reduce:animate-none lg:flex"
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
          <p className="sm:text-subheading mt-[2rem] max-w-[46ch] text-[1.125rem] leading-[1.55] sm:mt-[2.5rem] sm:leading-[1.25]">
            {HERO.story}
          </p>
          <p className="text-label mt-[2rem] text-muted-foreground">{HERO.established}</p>
        </div>
        <div className="relative aspect-4/5 max-h-[78svh] min-h-[20rem] w-full animate-in overflow-hidden duration-1000 fade-in motion-reduce:animate-none lg:col-span-4 lg:col-start-9 lg:justify-self-end">
          <PhotoCycle />
        </div>
      </div>
    </section>
  );
}

/** Hold time per photo, including the 900ms slide */
const HOLD_MS = 4000;

/**
 * Step-and-hold vertical cycle: the active photo slides up and out while the next rises from
 * below. Every frame is stacked absolutely, so only the outgoing and incoming frames carry a
 * transition; the rest jump back below unseen, which makes the loop seamless without clones.
 * Reduced motion keeps the first photo and never starts the timer.
 */
function PhotoCycle() {
  const [active, setActive] = useState(0);
  const count = HERO.images.length;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setActive((i) => (i + 1) % count), HOLD_MS);
    return () => window.clearInterval(id);
  }, [count]);

  const previous = (active - 1 + count) % count;

  return HERO.images.map((photo, i) => (
    <div
      aria-hidden={i !== active}
      className={cn(
        "absolute inset-0",
        i === active ? "translate-y-0" : i === previous ? "-translate-y-full" : "translate-y-full",
        (i === active || i === previous) &&
          "transition-transform duration-900 ease-[cubic-bezier(0.65,0,0.35,1)]"
      )}
      key={photo.alt}
    >
      <Picture
        alt={photo.alt}
        className="block size-full"
        image={photo.image}
        imgClassName="size-full object-cover"
        priority={i === 0}
        sizes="(min-width: 1024px) 33vw, 100vw"
      />
    </div>
  ));
}
