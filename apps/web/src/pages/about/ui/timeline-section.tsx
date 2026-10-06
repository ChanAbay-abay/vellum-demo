import { useRef } from "react";

import { Picture } from "@zo-stack/ui/components/picture";
import { useGsapScene } from "@zo-stack/ui/hooks/use-gsap-scene.hook";
import { gsap } from "@zo-stack/ui/lib/gsap";
import { cn } from "@zo-stack/ui/lib/utils";

import { Reveal } from "@/shared/ui/reveal";
import { Stripe } from "@/shared/ui/stripe";

import { TIMELINE } from "@/pages/about/config/about.content";

type Entry = (typeof TIMELINE.entries)[number];

/**
 * Timeline on paper: one row per PRD moment, year left (sticky while its row passes), copy in
 * the middle, photo right. A vertical 3-band stripe down the left edge draws itself with the
 * scroll (GSAP scrub on `scaleY`, desktop only); reduced motion leaves it fully drawn.
 * Archive photos carry grain (DESIGN.md §9), the low-res Edge archive is also black and white.
 * The row with no photo (2012, Uno TT) gets a typographic panel in the photo's place.
 */
export function Timeline() {
  const ref = useRef<HTMLElement>(null);

  useGsapScene(ref, ({ reduce }) => {
    if (reduce) return;
    gsap.fromTo(
      "[data-timeline-beam]",
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: "[data-timeline-list]",
          start: "top 70%",
          end: "bottom 70%",
          scrub: 0.6
        }
      }
    );
  });

  return (
    <section
      aria-labelledby="timeline-heading"
      className="bg-paper text-ink px-(--gutter) py-[5rem] lg:py-[8rem]"
      id={TIMELINE.id}
      ref={ref}
    >
      <GrainFilter />
      <Reveal className="grid gap-[1.5rem] lg:grid-cols-12 lg:items-end lg:gap-x-[1.5rem]">
        <h2
          className="lg:text-title text-[3rem] leading-[0.95] font-semibold tracking-[-0.03em] lg:col-span-7"
          id="timeline-heading"
        >
          {TIMELINE.heading}
        </h2>
        <p className="text-body max-w-[44ch] lg:col-span-4 lg:col-start-9">{TIMELINE.intro}</p>
      </Reveal>

      <div className="relative mt-[4rem] lg:mt-[6rem]" data-timeline-list="">
        {/* The beam: the stripe on its side, outside the content column in the gutter. */}
        <div
          aria-hidden
          className="absolute inset-y-0 -left-[calc(var(--gutter)-0.375rem)] hidden w-[0.5625rem] origin-top lg:flex"
          data-timeline-beam=""
        >
          <span className="bg-stripe-orange block w-1/3" />
          <span className="bg-stripe-red block w-1/3" />
          <span className="bg-stripe-burgundy block w-1/3" />
        </div>
        <ol className="flex flex-col gap-[4rem] lg:gap-[2rem]">
          {TIMELINE.entries.map((entry) => (
            <li
              className="grid gap-[1.5rem] lg:grid-cols-12 lg:gap-x-[1.5rem] lg:py-[2rem]"
              key={`${entry.year}-${entry.title}`}
            >
              <p className="lg:text-title self-start text-[3.5rem] leading-none font-semibold tracking-[-0.04em] lg:sticky lg:top-[6.5rem] lg:col-span-3">
                <time dateTime={entry.year}>{entry.year}</time>
              </p>
              <Reveal className="flex flex-col gap-[1rem] lg:col-span-4 lg:pt-[1rem]">
                <h3 className="max-w-[18ch] text-[1.75rem] leading-[1.1] font-medium tracking-[-0.02em] text-balance lg:text-[2.25rem]">
                  {entry.title}
                </h3>
                {entry.detail ? (
                  <p className="text-body text-muted-foreground">{entry.detail}</p>
                ) : null}
              </Reveal>
              <Reveal className="lg:col-span-5 lg:col-start-8">
                <Media entry={entry} />
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Media({ entry }: { entry: Entry }) {
  if (entry.photos.length === 0 && entry.panel) {
    return (
      <div className="bg-sand flex aspect-4/3 min-h-[16rem] flex-col justify-end overflow-hidden pt-[2rem]">
        <p
          aria-hidden
          className="model-name font-display origin-bottom-left px-[1.75rem] text-[4rem] leading-[0.9] font-semibold tracking-[-0.04em] lg:text-[6rem]"
        >
          {entry.panel.name}
        </p>
        <Stripe angle={0} bandHeight="0.5rem" className="mt-[1.25rem] w-full" />
        <p className="text-label px-[1.75rem] py-[1.25rem]">{entry.panel.meta}</p>
      </div>
    );
  }

  const pair = entry.photos.length > 1;
  return (
    <div className={cn("grid gap-[0.75rem]", pair && "grid-cols-2")}>
      {entry.photos.map((photo) => (
        <div
          className={cn(
            "bg-bone relative min-h-[12rem] overflow-hidden",
            pair ? "aspect-3/4" : "aspect-4/3"
          )}
          key={photo.alt}
          // Per-photo crop anchor: a runtime value, so it rides a CSS variable.
          style={{ "--crop": photo.position ?? "50% 50%" } as React.CSSProperties}
        >
          <Picture
            alt={photo.alt}
            className="absolute inset-0 block size-full"
            image={photo.image}
            // Not cn(): tailwind-merge can read object-(--crop) as clashing with object-cover.
            imgClassName={`size-full object-cover object-(--crop) ${photo.mono ? "grayscale" : ""}`}
            sizes={pair ? "(min-width: 1024px) 20vw, 50vw" : "(min-width: 1024px) 40vw, 100vw"}
          />
          {photo.grain || photo.mono ? <Grain /> : null}
        </div>
      ))}
    </div>
  );
}

/** One shared SVG noise filter for every grained photo in the section (ids must be unique). */
function GrainFilter() {
  return (
    <svg aria-hidden className="absolute size-0">
      <filter id="about-grain">
        <feTurbulence baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" type="fractalNoise" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
    </svg>
  );
}

/** Static film grain over an archive photo (DESIGN.md §9), multiplied in like the home strip. */
function Grain() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full opacity-[0.22] mix-blend-multiply"
    >
      <rect filter="url(#about-grain)" height="100%" width="100%" />
    </svg>
  );
}
