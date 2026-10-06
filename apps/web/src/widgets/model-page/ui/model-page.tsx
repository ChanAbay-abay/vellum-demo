import { Warranty } from "@/shared/ui/warranty";

import { type ModelContent } from "@/widgets/model-page/model/model-content";
import { JumpToSummary } from "@/widgets/model-page/ui/jump-to-summary";
import { ModelHero } from "@/widgets/model-page/ui/model-hero";
import { ModelCta, ModelRecap, ModelSummary } from "@/widgets/model-page/ui/model-summary";
import { ModelTour } from "@/widgets/model-page/ui/model-tour";

/**
 * The shared individual-model page (Fuerza, Edge, Terreno), rendered entirely from one typed
 * content object. Grounds: (optional sand hero →) ink tour → paper gallery (#summary) → bone
 * recap → paper warranty → sand CTA → ink footer. Without a hero the page opens on the tour and
 * the tour's control bar replaces the fixed jump pill (Fuerza; Edge and Terreno keep the hero
 * until Chan approves rolling the tour-first layout out to them).
 */
export function ModelPage({ content }: { content: ModelContent }) {
  return (
    <>
      {content.hero ? <ModelHero hero={content.hero} content={content} /> : null}
      <ModelTour content={content} controls={!content.hero} />
      <ModelSummary content={content} />
      <ModelRecap content={content} />
      <Warranty className="bg-paper" />
      <ModelCta cta={content.cta} />
      {content.hero ? <JumpToSummary label={content.hero.summaryLabel} /> : null}
    </>
  );
}
