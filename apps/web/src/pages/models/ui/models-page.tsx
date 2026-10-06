import { ClosingCta } from "@/shared/ui/closing-cta";
import { Warranty } from "@/shared/ui/warranty";

import { CLOSING, LINEUP } from "@/pages/models/config/models.content";
import { LineupRow } from "@/pages/models/ui/lineup-row";

/**
 * /models index (PRD "Models (index)"): the heading, the three models as large alternating rows,
 * the shared frame warranty, then the closing CTA (IG DM).
 * Grounds: paper heading → sand Fuerza → ink Edge → bone Terreno → paper warranty → ink closing CTA → footer.
 * Photos only, no 3D here.
 */
export function ModelsPage() {
  return (
    <>
      <section className="bg-paper text-ink px-(--gutter) pt-[10rem] pb-[4rem] lg:pb-[5rem]">
        <h1 className="lg:text-title animate-in text-[3rem] leading-[0.95] font-semibold tracking-[-0.03em] duration-1000 fade-in slide-in-from-bottom-4">
          {LINEUP.heading}
        </h1>
      </section>

      {LINEUP.items.map((item, i) => (
        <LineupRow first={i === 0} flip={i % 2 === 1} item={item} key={item.to} />
      ))}

      <Warranty className="bg-paper text-ink" />

      <ClosingCta {...CLOSING} />
    </>
  );
}
