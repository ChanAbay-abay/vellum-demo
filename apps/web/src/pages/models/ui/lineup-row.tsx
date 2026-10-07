import { Link } from "@tanstack/react-router";

import { Picture } from "@zo-stack/ui/components/picture";
import { cn } from "@zo-stack/ui/lib/utils";

import { buttonVariants } from "@/shared/ui/button";
import { ArrowRightIcon } from "@/shared/ui/icons";
import { EdgeWordmark } from "@/shared/ui/logo";
import { Reveal } from "@/shared/ui/reveal";

import { LINEUP } from "@/pages/models/config/models.content";

type LineupItem = (typeof LINEUP.items)[number];

const GROUND = {
  sand: "bg-sand text-ink",
  bone: "bg-bone text-ink",
  ink: "bg-ink text-paper"
} as const;

const TREATMENT = {
  none: "",
  archive: "grayscale contrast-[1.05]",
  ugc: "saturate-[0.55] brightness-[0.95]"
} as const;

/**
 * One model of the lineup as a full-bleed row: the photo fills half the row edge to edge, the
 * slanted model name (Edge: its SVG wordmark, DESIGN.md §3), its line and "View" fill the other
 * half. Rows alternate sides (`flip`) and ground. The whole photo is a pointer target for the
 * same route, hidden from keyboard and screen readers so each row has one link stop.
 * Hovering anywhere on the row scales the photo 1 → 1.04 (DESIGN.md §5 card/link hover).
 *
 * `first` is above the fold: its photo loads with priority and the copy enters with CSS, not
 * `Reveal`, so nothing in the first screen waits on JS (template animations rules).
 */
export function LineupRow({
  item,
  flip = false,
  first = false
}: {
  item: LineupItem;
  flip?: boolean;
  first?: boolean;
}) {
  const headingId = `lineup-${item.label.toLowerCase()}`;
  const onInk = item.ground === "ink";
  const isEdge = item.to === "/models/edge";

  const copy = (
    <>
      <h2 id={headingId}>
        {isEdge ? (
          <EdgeWordmark
            alt={item.label}
            className="w-[16rem] lg:w-[30rem]"
            tone={onInk ? "white" : "black"}
          />
        ) : (
          <span className="model-name font-display lg:text-display block origin-bottom-left text-[4.5rem] leading-[0.9] font-semibold tracking-[-0.04em] whitespace-nowrap max-[22.5rem]:text-[3.5rem]">
            {item.label}
          </span>
        )}
      </h2>
      <p className={cn("text-subheading max-w-[24ch]", onInk && "text-paper/90")}>{item.line}</p>
      <Link className={buttonVariants({ variant: onInk ? "inverse" : "default" })} to={item.to}>
        {LINEUP.viewLabel}
        <span className="sr-only"> {item.label}</span>
        <ArrowRightIcon className="w-[0.8rem]" />
      </Link>
    </>
  );

  const copyClass = cn("flex flex-col gap-[2rem]", isEdge ? "items-end text-right" : "items-start");

  return (
    <article
      aria-labelledby={headingId}
      className={cn(
        "group/row grid lg:h-[52rem] lg:grid-cols-12 lg:gap-x-[1.5rem]",
        GROUND[item.ground]
      )}
      data-testid="lineup-row"
    >
      <Link
        aria-hidden
        className={cn(
          "relative block h-[26rem] overflow-hidden lg:col-span-6 lg:row-start-1 lg:h-full",
          flip && "lg:col-start-7"
        )}
        tabIndex={-1}
        to={item.to}
      >
        <Picture
          alt={item.alt}
          className={cn("block size-full", item.zoom)}
          image={item.image}
          imgClassName={cn(
            "size-full object-cover transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/row:scale-[1.04] motion-reduce:transition-none",
            item.position,
            TREATMENT[item.treatment]
          )}
          priority={first}
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
      </Link>

      <div
        className={cn(
          "flex items-center px-(--gutter) py-[4rem] lg:col-span-6 lg:row-start-1 lg:py-[6rem]",
          isEdge && "justify-end",
          flip ? "lg:col-start-1" : "lg:col-start-7 lg:pl-[calc(var(--gutter)*2)]"
        )}
      >
        {first ? (
          <div className={cn(copyClass, "animate-in duration-1000 fade-in slide-in-from-bottom-4")}>
            {copy}
          </div>
        ) : (
          <Reveal className={copyClass}>{copy}</Reveal>
        )}
      </div>
    </article>
  );
}
