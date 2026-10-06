import { useEffect, useState } from "react";

import { type OpenStatus, getOpenStatus } from "@/shared/lib/open-status";
import { buttonVariants } from "@/shared/ui/button";
import { ArrowUpRightIcon } from "@/shared/ui/icons";
import { InquireLink } from "@/shared/ui/inquire-link";
import { Reveal } from "@/shared/ui/reveal";

import { SHOWROOM } from "@/pages/about/config/about.content";

import { siteConfig } from "@/config/site.config";

const { address, hours, hoursLabel, mapsUrl } = siteConfig.contact;

/**
 * Open/closed in Manila time. Null on the server and first paint (prerendered), so the static
 * hours label shows until mount; then it re-evaluates every minute. Same behaviour as the home
 * showroom, which can't be imported across pages.
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

/**
 * Showroom on paper: visit details, the two actions and the dealer list on the left, an
 * embedded Google Map on the right. The map is lazy (`loading="lazy"`), grayscale so it sits in
 * the palette, titled for screen readers, and backed by a plain "Open in Google Maps" link for
 * anyone who can't use the embed.
 */
export function AboutShowroom() {
  const status = useOpenStatus();

  return (
    <section
      aria-labelledby="showroom-heading"
      className="bg-paper text-ink px-(--gutter) py-[5rem] lg:py-[8rem]"
      id={SHOWROOM.id}
    >
      <div className="grid grid-cols-1 gap-[3rem] lg:grid-cols-12 lg:gap-x-[1.5rem]">
        <Reveal className="flex flex-col items-start lg:col-span-5">
          <h2
            className="lg:text-title max-w-[12ch] text-[3rem] leading-[0.95] font-semibold tracking-[-0.03em] text-balance"
            id="showroom-heading"
          >
            {SHOWROOM.heading}
          </h2>
          <p className="text-body mt-[2rem] max-w-[44ch]">{SHOWROOM.body}</p>
          <p className="text-label mt-[1.5rem]">{status ? status.label : hoursLabel}</p>
          <address className="text-caption mt-[0.5rem] text-muted-foreground not-italic">
            {address.street}, {address.city}
          </address>
          <div className="mt-[2rem] flex flex-wrap items-center gap-x-[2.5rem] gap-y-[0.5rem]">
            <a
              className={buttonVariants()}
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
          </div>

          <h3 className="text-label mt-[4rem] text-muted-foreground">{SHOWROOM.dealersHeading}</h3>
          <dl className="mt-[1.25rem] grid w-full grid-cols-[7rem_1fr] gap-x-[1.5rem] gap-y-[0.75rem]">
            {SHOWROOM.dealers.map((dealer) => (
              <div className="contents" key={dealer.city}>
                <dt className="text-label pt-[0.3rem]">{dealer.city}</dt>
                <dd className="text-body">{dealer.names}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal className="lg:col-span-7">
          <div className="bg-bone relative aspect-4/3 w-full overflow-hidden lg:min-h-[20rem]">
            <iframe
              allowFullScreen
              className="absolute inset-0 size-full grayscale"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={SHOWROOM.map.src}
              title={SHOWROOM.map.title}
            />
          </div>
          <a
            className={buttonVariants({ variant: "link", className: "mt-[0.5rem]" })}
            href={mapsUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            {SHOWROOM.map.openLabel}
            <ArrowUpRightIcon className="w-[0.7rem]" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
