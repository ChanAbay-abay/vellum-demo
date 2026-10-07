import { useEffect, useRef, useState } from "react";

import { Picture } from "@zo-stack/ui/components/picture";

import { type OpenStatus, getOpenStatus } from "@/shared/lib/open-status";
import { buttonVariants } from "@/shared/ui/button";
import { ArrowUpRightIcon } from "@/shared/ui/icons";
import { InquireLink } from "@/shared/ui/inquire-link";
import { Reveal } from "@/shared/ui/reveal";
import { Stripe } from "@/shared/ui/stripe";

import { SHOWROOM } from "@/pages/home/config/home.content";

import { siteConfig } from "@/config/site.config";

const { address, hours, hoursLabel, mapsUrl } = siteConfig.contact;

// Logo slant (stripe.tsx): over a 4:5 panel the edge leans 5/4 * tan(18deg) = 40.6% of the width.
const WIPE_CLOSED = "polygon(0 0, 0% 0, -40.6% 100%, 0 100%)";
const WIPE_OPEN = "polygon(0 0, 140.6% 0, 100% 100%, 0 100%)";

const mapsSearch = (name: string, city: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${city}, Philippines`)}`;

/**
 * Open/closed in Manila time. Null on the server and first paint (prerendered), so the static
 * hours label shows until mount; then it re-evaluates every minute.
 */
function useOpenStatus() {
  const [status, setStatus] = useState<OpenStatus | null>(null);
  useEffect(() => {
    const tick = () => setStatus(getOpenStatus(hours, new Date()));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);
  return status;
}

const ROW =
  "relative grid min-h-[5.5rem] items-center gap-x-[1.5rem] overflow-hidden px-[1.5rem] py-[1rem] lg:grid-cols-[14rem_minmax(0,1fr)_16rem]";

/**
 * Showroom + dealers on bone: a header band, then an index list (one row per city) beside a sticky
 * photo panel. The active row (hover or focus, row 01 by default) inverts to ink and draws the
 * stripe along its bottom edge while the panel wipes (at the logo angle) to its photo.
 * The photos are Vellum's own, not the dealers' shops; captions say what they show.
 */
export function Showroom() {
  const [active, setActive] = useState(0);
  const current = SHOWROOM.locations[active];
  const status = useOpenStatus();
  const layers = useRef<(HTMLDivElement | null)[]>([]);
  const stack = useRef(1);
  const first = useRef(true);

  // Wipe the newly active photo in over the others. Each activation takes the top z-index, so the
  // last-requested photo always wins; an interrupted wipe just finishes unseen underneath.
  useEffect(() => {
    const el = layers.current[active];
    if (!el) return;
    el.style.zIndex = String(++stack.current);
    if (first.current) {
      first.current = false;
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.animate([{ clipPath: WIPE_CLOSED }, { clipPath: WIPE_OPEN }], {
      duration: 450,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)"
    });
  }, [active]);

  return (
    <section
      aria-labelledby="showroom-heading"
      className="bg-bone relative px-(--gutter) pt-[5rem] pb-[7rem] lg:pt-[8rem] lg:pb-[10rem]"
      id={SHOWROOM.id}
    >
      <Reveal className="grid gap-[2.5rem] lg:grid-cols-12 lg:items-end lg:gap-x-[1.5rem]">
        <h2
          className="lg:text-title max-w-[12ch] text-[3rem] leading-[0.95] font-semibold tracking-[-0.03em] text-balance lg:col-span-7"
          id="showroom-heading"
        >
          {SHOWROOM.heading}
        </h2>
        <div className="lg:col-span-5">
          <p className="text-body max-w-[62ch]">{SHOWROOM.body}</p>
          <p className="text-label mt-[1.5rem]">{status ? status.label : hoursLabel}</p>
          <p className="text-caption mt-[0.5rem] text-muted-foreground">
            {address.street}, {address.city}
          </p>
          <div className="mt-[2rem] grid grid-cols-2 items-center gap-x-[1.5rem] gap-y-[0.5rem] sm:flex sm:flex-wrap sm:gap-x-[2.5rem]">
            <a
              className={buttonVariants({ className: "col-span-2 sm:col-auto" })}
              href={mapsUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              {SHOWROOM.directions.label}
              <ArrowUpRightIcon className="w-[0.7rem]" />
              <span className="sr-only"> (opens Google Maps in a new tab)</span>
            </a>
            <InquireLink className={buttonVariants({ variant: "link" })}>
              {SHOWROOM.message.label}
            </InquireLink>
            <InquireLink channel="messenger" className={buttonVariants({ variant: "link" })}>
              {SHOWROOM.messenger.label}
            </InquireLink>
          </div>
        </div>
      </Reveal>

      <Reveal className="mt-[4rem] grid gap-[3rem] lg:mt-[6rem] lg:grid-cols-12 lg:gap-x-[1.5rem]">
        <div className="lg:col-span-8">
          <h3 className="text-label mb-[1.25rem] text-muted-foreground">
            {SHOWROOM.dealersHeading}
          </h3>
          {/* Hairline rows (DESIGN.md §2 --rule). Hover/focus only change the preview, nothing navigates. */}
          <ul className="border-rule border-y">
            {SHOWROOM.locations.map((loc, i) => {
              const isActive = i === active;
              const isFlagship = i === 0;
              const isOnline = "online" in loc;
              const rowClass = `${ROW} focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring motion-safe:transition-colors motion-safe:duration-200 motion-safe:ease-out ${isActive ? "bg-ink text-paper" : ""}`;
              const markerClass = `text-label mt-[0.5rem] flex items-center justify-end gap-[0.75rem] whitespace-nowrap transition-colors duration-200 ease-out lg:mt-0 ${isActive ? "text-paper/70" : "text-muted-foreground"}`;
              const city = (
                <span className="text-[1.75rem] leading-none font-medium tracking-[0.12em] uppercase lg:text-[2.25rem]">
                  {loc.city}
                </span>
              );
              const stripe = <RowStripe active={isActive} />;
              return (
                // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                <li
                  className="border-rule border-t first:border-t-0"
                  data-active={isActive}
                  key={loc.city}
                  onFocus={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                >
                  {isFlagship ? (
                    <a
                      className={rowClass}
                      href={mapsUrl}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {city}
                      <span className="text-body mt-[0.5rem] block lg:mt-0">
                        {loc.names.join(" · ")}
                      </span>
                      <span className={markerClass}>
                        Flagship
                        <ArrowUpRightIcon className="w-[0.8rem]" />
                      </span>
                      <span className="sr-only"> (opens Google Maps in a new tab)</span>
                      {stripe}
                    </a>
                  ) : isOnline ? (
                    // No known URLs for the online shops: plain text, focusable so keyboard users can drive the preview.
                    <div
                      className={rowClass}
                      // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                      tabIndex={0}
                    >
                      {city}
                      <span className="text-body mt-[0.5rem] block lg:mt-0">
                        {loc.names.join(" · ")}
                      </span>
                      <span className={markerClass}>{loc.marker}</span>
                      {stripe}
                    </div>
                  ) : (
                    <div className={rowClass}>
                      {city}
                      <span className="text-body mt-[0.5rem] block lg:mt-0">
                        {loc.names.map((name, n) => (
                          <span key={name}>
                            {n > 0 && " · "}
                            <a
                              className="group/name relative inline-block after:absolute after:inset-x-0 after:-inset-y-[0.625rem] after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                              href={mapsSearch(name, loc.city)}
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              {name}
                              <ArrowUpRightIcon className="absolute top-1/2 left-full ml-[0.35rem] w-[0.6rem] -translate-y-1/2 group-hover/name:translate-x-0 group-hover/name:opacity-100 group-focus-visible/name:translate-x-0 group-focus-visible/name:opacity-100 motion-safe:transition-[opacity,translate] motion-safe:duration-200 motion-safe:ease-out pointer-fine:-translate-x-[0.35rem] pointer-fine:opacity-0" />
                              <span className="sr-only"> (opens Google Maps in a new tab)</span>
                            </a>
                          </span>
                        ))}
                      </span>
                      {stripe}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="hidden lg:col-span-4 lg:block">
          <figure className="sticky top-[6rem]">
            <div className="bg-sand relative aspect-4/5 overflow-hidden">
              {SHOWROOM.locations.map((loc, i) => (
                <div
                  aria-hidden={i !== active}
                  className="absolute inset-0"
                  key={loc.city}
                  ref={(el) => {
                    layers.current[i] = el;
                  }}
                  style={i === 0 ? { zIndex: 1 } : undefined}
                >
                  <Picture
                    alt={loc.alt}
                    className="block size-full"
                    image={loc.image}
                    imgClassName="size-full object-cover"
                    sizes="(min-width: 1024px) 28vw, 0px"
                  />
                </div>
              ))}
            </div>
            <figcaption className="text-caption mt-[0.75rem] text-muted-foreground">
              {current.caption}
            </figcaption>
          </figure>
        </div>
      </Reveal>
    </section>
  );
}

/** Orange / red / burgundy bands drawn along the row's bottom edge, ending on the logo slant. */
function RowStripe({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 bottom-0 block h-[0.75rem] motion-safe:transition-[clip-path] motion-safe:duration-300 motion-safe:ease-out ${active ? "[clip-path:inset(0_0_0_0)]" : "[clip-path:inset(0_100%_0_0)]"}`}
    >
      <Stripe
        angle={0}
        bandHeight="0.25rem"
        className="size-full [clip-path:polygon(0_0,100%_0,calc(100%-0.75rem)_100%,0_100%)]"
      />
    </span>
  );
}
