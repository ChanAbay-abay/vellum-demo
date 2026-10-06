import { Link } from "@tanstack/react-router";
import { useRef } from "react";

import { Picture } from "@zo-stack/ui/components/picture";
import { MOTION_QUERIES, gsap, useGSAP } from "@zo-stack/ui/lib/gsap";

import { buttonVariants } from "@/shared/ui/button";
import { ArrowRightIcon, ArrowUpRightIcon } from "@/shared/ui/icons";
import { Reveal } from "@/shared/ui/reveal";

import { HERITAGE } from "@/pages/home/config/home.content";

import { siteConfig } from "@/config/site.config";

/** Wide screens with motion allowed get the scrubbed strip; everything else is a plain scroller. */
const SCRUB_QUERY = `(min-width: 64rem) and ${MOTION_QUERIES.motion}`;

/** Share of the scroll spent travelling; the rest holds on the last frame so it lands before release. */
const TRAVEL_SHARE = 0.85;

/**
 * Heritage strip on paper: four full-colour frames. On desktop the section is tall and its
 * stage is `sticky`; ScrollTrigger scrubs the track sideways across that scroll (never `pin`).
 * On mobile and under reduced motion the stage is a normal page-height block and the frames sit
 * in a native horizontal scroller with snap, so the page reads with every effect removed.
 */
export function HeritageStrip() {
  const root = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(SCRUB_QUERY, () => {
        const clip = viewport.current;
        const strip = track.current;
        if (!clip || !strip) return;

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            invalidateOnRefresh: true
          }
        });
        tl.to(strip, {
          x: () => -Math.max(0, strip.offsetWidth - clip.clientWidth),
          duration: TRAVEL_SHARE
        });
        tl.to({}, { duration: 1 - TRAVEL_SHARE });
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section
      aria-labelledby="heritage-heading"
      className="bg-paper relative motion-safe:lg:h-[600svh]"
      id={HERITAGE.id}
      ref={root}
    >
      <div className="flex flex-col justify-center gap-[3rem] py-[5rem] motion-safe:lg:sticky motion-safe:lg:top-0 motion-safe:lg:h-svh motion-safe:lg:gap-[2.5rem] motion-safe:lg:pt-[7rem] motion-safe:lg:pb-[4.5rem]">
        <div className="flex flex-col items-start gap-[2rem] px-(--gutter) lg:flex-row lg:items-end lg:justify-between">
          <Reveal>
            <h2
              className="text-heading lg:text-heading max-w-[20ch] text-[2rem]"
              id="heritage-heading"
            >
              {HERITAGE.heading}
            </h2>
          </Reveal>
          <Link className={buttonVariants({ variant: "link" })} to={HERITAGE.cta.to}>
            {HERITAGE.cta.label}
            <ArrowRightIcon className="w-[0.8rem]" />
          </Link>
        </div>

        {/* The clip is this untransformed ancestor; the track inside is what GSAP translates.
            Frames are capped by viewport height too, or on short screens the stage overflows and
            this clip cuts the captions' descenders. 30rem is everything in the stage but the photo, plus slack. */}
        <section
          className="snap-x snap-mandatory overflow-x-auto motion-safe:lg:snap-none motion-safe:lg:overflow-hidden"
          ref={viewport}
          aria-label="Vellum timeline, scroll sideways"
        >
          <ul
            className="flex w-max gap-[1.25rem] px-(--gutter) pb-[0.5rem] lg:gap-[2.5rem]"
            ref={track}
          >
            {HERITAGE.frames.map((frame) => (
              <li
                className="flex w-[72vw] shrink-0 snap-start scroll-ml-(--gutter) flex-col gap-[1rem] sm:w-[22rem] lg:w-[min(38vw,calc((100svh-30rem)*4/3))]"
                key={`${frame.year}-${frame.caption}`}
              >
                <p className="lg:text-title text-[3.5rem] leading-none font-semibold tracking-[-0.04em]">
                  {frame.year}
                </p>
                <div className="bg-bone relative aspect-4/5 overflow-hidden lg:aspect-4/3">
                  <Picture
                    alt={frame.alt}
                    className="block size-full"
                    image={frame.image}
                    imgClassName="size-full object-cover"
                    sizes="(min-width: 1024px) 38vw, 72vw"
                  />
                  <Grain />
                </div>
                <p className="text-caption text-muted-foreground">{frame.caption}</p>
              </li>
            ))}
            <li className="flex w-[72vw] shrink-0 snap-start scroll-ml-(--gutter) flex-col gap-[1rem] sm:w-[22rem] lg:w-[min(38vw,calc((100svh-30rem)*4/3))]">
              <p className="lg:text-title text-[3.5rem] leading-none font-semibold tracking-[-0.04em] text-muted-foreground">
                {HERITAGE.closing.year}
              </p>
              <div className="flex aspect-4/5 flex-col justify-end gap-[1.5rem] border-t border-border lg:aspect-4/3">
                <p className="text-heading lg:text-heading max-w-[14ch] text-[2rem]">
                  {HERITAGE.closing.heading}
                </p>
                <p className="max-w-[32ch] text-muted-foreground">{HERITAGE.closing.body}</p>
                <a
                  className={buttonVariants({ variant: "link", className: "self-start" })}
                  href={siteConfig.socials.instagram}
                  rel="noreferrer"
                  target="_blank"
                >
                  {HERITAGE.closing.cta.label}
                  <ArrowUpRightIcon className="w-[0.8rem]" />
                </a>
              </div>
            </li>
          </ul>
        </section>
      </div>
    </section>
  );
}

/** Static film grain over the photo (DESIGN.md §9): one SVG noise tile, multiplied in. */
function Grain() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full opacity-[0.22] mix-blend-multiply"
    >
      <filter id="heritage-grain">
        <feTurbulence baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" type="fractalNoise" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect filter="url(#heritage-grain)" height="100%" width="100%" />
    </svg>
  );
}
