import { Link } from "@tanstack/react-router";

import { Picture } from "@zo-stack/ui/components/picture";

import { buttonVariants } from "@/shared/ui/button";
import { Reveal } from "@/shared/ui/reveal";

import { MERCH } from "@/pages/home/config/home.content";

/**
 * Merch band on sand (DESIGN.md §4, §7): heading left and CTA right over a four-up product strip.
 * No label above the heading (RULES §4, no eyebrows). Two-up on mobile.
 */
export function MerchRow() {
  return (
    <section className="bg-sand text-ink px-(--gutter) py-[5rem] lg:py-[7rem]" id={MERCH.id}>
      <Reveal className="mb-[3rem] flex flex-col items-start gap-[1.5rem] lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-[1rem]">
          <h2 className="text-heading max-w-[14ch] text-balance">{MERCH.heading}</h2>
          <p className="text-body max-w-[40ch]">{MERCH.body}</p>
        </div>
        <Link className={buttonVariants()} to={MERCH.cta.to}>
          {MERCH.cta.label}
        </Link>
      </Reveal>
      <ul className="grid grid-cols-2 gap-x-[1rem] gap-y-[2rem] lg:grid-cols-4 lg:gap-x-[1.5rem]">
        {MERCH.items.map((item, i) => (
          <li key={item.name}>
            <Reveal delay={i * 0.08}>
              <Link className="group block" to={MERCH.cta.to}>
                <div className="bg-bone aspect-[4/5] overflow-hidden">
                  <Picture
                    alt={item.alt}
                    className="block h-full w-full"
                    image={item.image}
                    imgClassName="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] motion-reduce:transition-none"
                    sizes="(min-width: 1024px) 25vw, 50vw"
                  />
                </div>
                <span className="text-body mt-[0.75rem] block">{item.name}</span>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
