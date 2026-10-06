import { cn } from "@zo-stack/ui/lib/utils";

import { buttonVariants } from "@/shared/ui/button";
import { ArrowRightIcon } from "@/shared/ui/icons";
import { InquireLink } from "@/shared/ui/inquire-link";
import { Reveal } from "@/shared/ui/reveal";
import { WarrantyBadge } from "@/shared/ui/warranty-badge";

import { WARRANTY } from "@/config/warranty.content";

/**
 * The frame warranty, shared by the /models index and every model page (one source of truth in
 * config/warranty.content.ts). The warranty badge (striped "5", YEARS lockup, outline echo,
 * rotating seal) anchors the left columns; the terms sit beside it grouped as Covered /
 * Not covered (an equal pair, one body size) and the four claim steps in one row, with the
 * claim link under them (design/model-summary-direction.md §2, reworked in round 3).
 *
 * Separation is whitespace only, no rules (RULES §4), and no decorative numbering.
 */
export function Warranty({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="warranty-heading"
      className={cn("px-(--gutter) py-[5rem] lg:py-[8rem]", className)}
      id={WARRANTY.id}
    >
      {/*
        One row. The left column (4 of 12) stretches to the row's height and centres the badge
        on both axes, so the seal's centre is the column's centre; the terms are vertically
        centred too, so the two blocks share a centre line. The terms start one gutter after
        the column (DESIGN.md §4 grid).
      */}
      <div className="grid gap-y-[3rem] lg:grid-cols-12 lg:gap-x-[1.5rem]">
        <div
          className="flex items-center justify-center lg:col-span-4"
          data-testid="warranty-badge-column"
        >
          <WarrantyBadge className="w-[18rem] max-w-full lg:w-[min(100%,24rem)]" />
        </div>

        {/* One spacing scale: heading 2.5rem > groups 2rem > label to items 0.75rem. */}
        <Reveal
          className="flex flex-col gap-[2.5rem] lg:col-span-8 lg:col-start-5 lg:self-center"
          data-testid="warranty-terms"
          delay={0.15}
        >
          <h2 className="text-heading lg:text-heading text-[2rem]" id="warranty-heading">
            {WARRANTY.heading}
          </h2>

          <div className="flex flex-col items-start gap-[2rem]">
            <div className="grid w-full gap-[2rem] sm:grid-cols-2 sm:gap-x-[1.5rem]">
              {[WARRANTY.covered, WARRANTY.notCovered].map((group) => (
                <div className="flex flex-col gap-[0.75rem]" key={group.heading}>
                  <h3
                    className={cn(
                      "text-label",
                      group === WARRANTY.notCovered && "text-muted-foreground"
                    )}
                  >
                    {group.heading}
                  </h3>
                  {group.terms.map((term) => (
                    <p className="max-w-[46ch]" key={term}>
                      {term}
                    </p>
                  ))}
                </div>
              ))}
            </div>

            <div className="flex w-full flex-col gap-[0.75rem]">
              <h3 className="text-label">{WARRANTY.toClaim.heading}</h3>
              <ul className="grid gap-x-[1.5rem] gap-y-[1.25rem] sm:grid-cols-2 lg:grid-cols-4">
                {WARRANTY.toClaim.terms.map((term) => (
                  <li key={term}>{term}</li>
                ))}
              </ul>
            </div>

            <InquireLink className={buttonVariants({ variant: "link" })}>
              {WARRANTY.cta.label}
              <ArrowRightIcon className="w-[0.8rem]" />
            </InquireLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
