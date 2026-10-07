import { Picture } from "@zo-stack/ui/components/picture";
import { cn } from "@zo-stack/ui/lib/utils";

import { ClosingCta } from "@/shared/ui/closing-cta";
import { Reveal } from "@/shared/ui/reveal";

import { type ModelBuild, type ModelContent } from "@/widgets/model-page/model/model-content";
import { ColorwayGallery, PhotoGallery } from "@/widgets/model-page/ui/model-gallery";
import { SUMMARY_ID } from "@/widgets/model-page/ui/model-hero";

/**
 * `#summary` (paper), the gallery right after the tour: the colorway pill and its photos, or a
 * plain photo gallery for models without colorways (Edge, Terreno). The jump links land here.
 */
export function ModelSummary({ content }: { content: ModelContent }) {
  const { summary } = content;

  return (
    <section
      aria-labelledby="summary-heading"
      className="bg-paper px-(--gutter) py-[5rem] lg:py-[8rem]"
      id={SUMMARY_ID}
    >
      <h2
        className="text-heading lg:text-title mb-[0.5rem] max-w-[18ch] text-[2.5rem] md:mb-[3rem] lg:mb-[4rem]"
        id="summary-heading"
      >
        {typeof summary.heading === "string"
          ? summary.heading
          : summary.heading.map((line, i) => (
              <span className="block" key={i}>
                {line}
              </span>
            ))}
      </h2>
      {summary.colorways ? (
        <ColorwayGallery colorways={summary.colorways} />
      ) : summary.gallery?.length ? (
        <PhotoGallery photos={summary.gallery} />
      ) : null}
    </section>
  );
}

/**
 * Recap on bone: one spec sheet (Chan, round 3). A label/value list in one value size and one
 * label style, rows separated by alternating tone (no rules, RULES §4), then the example builds
 * as two equal cards listing the same labels in the same order. The cards share their row
 * tracks (CSS subgrid), so matching rows line up across both. Components only, never prices.
 *
 * With `recapImage` the photo takes the left five columns and stretches to the section's full
 * height (`object-cover`), so there is no dead column beside the builds. Without it (Edge,
 * Terreno) the sheet runs alone.
 */
export function ModelRecap({ content }: { content: ModelContent }) {
  const { summary } = content;
  const image = summary.recapImage;

  return (
    <section
      aria-labelledby="recap-heading"
      className="bg-bone px-(--gutter) py-[5rem] lg:py-[8rem]"
      data-testid="model-recap"
    >
      <div className="grid gap-y-[3rem] lg:grid-cols-12 lg:gap-x-[1.5rem]">
        {image ? (
          <Reveal
            className="bg-paper relative min-h-[24rem] lg:col-span-5 lg:min-h-0"
            data-testid="recap-photo"
          >
            <Picture
              alt={image.alt}
              className="absolute inset-0 block size-full"
              image={image.image}
              imgClassName="size-full object-cover"
              sizes="(min-width: 1024px) 40vw, 100vw"
            />
          </Reveal>
        ) : null}

        <div
          className={cn("flex flex-col", image ? "lg:col-span-6 lg:col-start-7" : "lg:col-span-8")}
          data-testid="recap-content"
        >
          <h2 className="text-heading lg:text-heading text-[2rem]" id="recap-heading">
            {summary.recapHeading}
          </h2>

          <Reveal className="mt-[2rem]">
            <dl data-testid="spec-sheet">
              {summary.specs.map((spec) => (
                <div
                  className="odd:bg-paper/70 grid gap-y-[0.25rem] px-[1.25rem] py-[0.875rem] sm:grid-cols-[11rem_1fr] sm:gap-x-[1.5rem]"
                  key={spec.label}
                >
                  <dt className="text-label text-muted-foreground sm:pt-[0.3rem]">{spec.label}</dt>
                  <dd>{spec.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          {summary.builds ? (
            <Reveal className="mt-[4rem] flex flex-col gap-[1.5rem]">
              <div className="flex flex-col gap-[0.5rem]">
                <h3 className="text-subheading">{summary.builds.heading}</h3>
                <p className="max-w-[50ch] text-muted-foreground">{summary.builds.note}</p>
              </div>
              <BuildCards items={summary.builds.items} />
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/**
 * Example builds as two equal cards. Each card spans the parent's row tracks through subgrid
 * (one track for the name, one per part), so both cards are the same height and a part that
 * wraps in one card keeps its neighbour row aligned in the other.
 */
function BuildCards({ items }: { items: readonly ModelBuild[] }) {
  const rows = Math.max(...items.map((b) => b.parts.length)) + 1;

  return (
    <div
      className="grid gap-[0.75rem] sm:grid-cols-2"
      data-testid="build-cards"
      style={{ "--rows": rows } as React.CSSProperties}
    >
      {items.map((build) => (
        <div
          className="bg-paper row-span-(--rows) grid grid-rows-subgrid gap-y-[0.75rem] p-[1.5rem]"
          data-testid="build-card"
          key={build.name}
        >
          <h4 className="text-label pb-[0.5rem]">{build.name}</h4>
          <dl className="contents">
            {build.parts.map((part) => (
              <div className="grid grid-cols-[6.5rem_1fr] gap-x-[1rem]" key={part.label}>
                <dt className="text-label pt-[0.3rem] text-muted-foreground">{part.label}</dt>
                <dd>{part.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}

/** The model's closing CTA: the shared `ClosingCta` fed from the content file. */
export function ModelCta({ cta }: { cta: ModelContent["cta"] }) {
  return (
    <ClosingCta
      align={cta.align}
      body={cta.microcopy}
      heading={cta.heading}
      image={cta.image}
      primary={{ label: cta.label, channel: "instagram" }}
      secondary={
        cta.messengerLabel ? { label: cta.messengerLabel, channel: "messenger" } : undefined
      }
    />
  );
}
