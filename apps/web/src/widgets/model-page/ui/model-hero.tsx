import { Picture } from "@zo-stack/ui/components/picture";

import { buttonVariants } from "@/shared/ui/button";
import { ArrowDownIcon } from "@/shared/ui/icons";

import { type ModelContent } from "@/widgets/model-page/model/model-content";
import { ModelTitle } from "@/widgets/model-page/ui/model-title";

/** `#summary` is the summary section's id; the jump links are plain anchors so they work with no JS. */
export const SUMMARY_ID = "summary";

/**
 * Model hero on sand: the slanted model name (or the Edge SVG wordmark) and its line on the
 * left, the studio shot on the right (the Fuerza studio backdrop is the same sand, so the photo
 * sits in the ground). Mount entrance is CSS only, so the LCP photo is never held back by JS.
 */
export function ModelHero({
  hero,
  content
}: {
  hero: NonNullable<ModelContent["hero"]>;
  content: ModelContent;
}) {
  return (
    <section className="bg-sand text-ink relative overflow-hidden">
      <div className="grid min-h-svh items-end gap-[3rem] px-(--gutter) pt-[7.5rem] pb-[3rem] lg:grid-cols-12 lg:items-center lg:gap-x-[1.5rem] lg:pt-[6rem] lg:pb-[4rem]">
        <div className="flex animate-in flex-col items-start gap-[2rem] duration-1000 fade-in slide-in-from-bottom-4 lg:col-span-6">
          <h1>
            <ModelTitle content={content} />
          </h1>
          <p className="text-subheading max-w-[24ch]">{content.line}</p>
          <a className={buttonVariants({ variant: "link" })} href={`#${SUMMARY_ID}`}>
            {hero.summaryLabel}
            <ArrowDownIcon className="w-[0.8rem]" />
          </a>
        </div>
        <div className="relative aspect-4/5 max-h-[80svh] min-h-[20rem] w-full animate-in duration-1000 fade-in lg:col-span-5 lg:col-start-8 lg:justify-self-end">
          <Picture
            alt={hero.image.alt}
            className="block size-full"
            image={hero.image.image}
            imgClassName="size-full object-cover"
            priority
            sizes="(min-width: 1024px) 40vw, 100vw"
          />
        </div>
      </div>
    </section>
  );
}
