import { BikeIcon } from "@/shared/ui/bike-icon";
import { ClosingCta } from "@/shared/ui/closing-cta";
import { Stripe } from "@/shared/ui/stripe";
import { Warranty } from "@/shared/ui/warranty";

import { CLOSING, LINEUP } from "@/pages/models/config/models.content";
import { LineupRow } from "@/pages/models/ui/lineup-row";

/**
 * /models index (PRD "Models (index)"): the slanted heading over the Retro stripe and line bike
 * (the closing CTA's lockup, smaller) with the intro and model count beside it, the three models as large alternating rows,
 * the shared frame warranty, then the closing CTA (IG DM).
 * Grounds: paper heading → sand Fuerza → ink Edge → bone Terreno → paper warranty → photo closing CTA → footer.
 * Photos only, no 3D here.
 */
export function ModelsPage() {
  return (
    <>
      <section className="bg-paper text-ink px-(--gutter) pt-[10rem] pb-[4rem] lg:pt-[11rem] lg:pb-[5rem]">
        <div className="grid animate-in gap-[2rem] duration-1000 fade-in slide-in-from-bottom-4 motion-reduce:animate-none lg:grid-cols-12 lg:items-end lg:gap-x-[1.5rem]">
          <div className="lg:col-span-8">
            <div className="inline-flex origin-bottom-left -skew-x-12 flex-col">
              <h1 className="font-display text-[4rem] leading-[0.88] font-semibold tracking-[-0.04em] whitespace-nowrap lg:text-[9vw]">
                {LINEUP.heading}
              </h1>
              <div aria-hidden className="mt-[1.25rem] flex w-full items-center">
                <Stripe angle={0} bandHeight="0.35vw" className="min-w-0 flex-1" />
                <BikeIcon className="text-ink block h-[1.05vw] w-auto shrink-0" />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-[1.5rem] lg:col-span-4 lg:col-start-9 lg:items-end lg:text-right">
            <p className="text-label text-muted-foreground">
              {String(LINEUP.items.length).padStart(2, "0")} Models
            </p>
            <p className="text-subheading max-w-[30ch]">{LINEUP.intro}</p>
          </div>
        </div>
      </section>

      {LINEUP.items.map((item, i) => (
        <LineupRow first={i === 0} flip={i % 2 === 1} item={item} key={item.to} />
      ))}

      <Warranty className="bg-paper text-ink" />

      <ClosingCta {...CLOSING} />
    </>
  );
}
