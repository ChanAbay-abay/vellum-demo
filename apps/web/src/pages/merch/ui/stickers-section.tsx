import { Picture } from "@zo-stack/ui/components/picture";

import { Reveal } from "@/shared/ui/reveal";

import { STICKERS } from "@/pages/merch/config/merch.content";

/**
 * The Retro sticker set on bone. It is free with any purchase (PRD), so it is a callout beside
 * the grid rather than a product card: no Inquire of its own, the CTA band below covers it.
 * The heading carries the offer; the set's name follows it as a sub-line, never above it (RULES §4).
 */
export function StickersSection() {
  return (
    <section
      aria-labelledby="stickers-heading"
      className="bg-bone text-ink px-(--gutter) py-[5rem] lg:py-[8rem]"
    >
      <div className="grid items-center gap-[3rem] lg:grid-cols-12 lg:gap-x-[1.5rem]">
        <Reveal className="bg-paper relative aspect-square min-h-[18rem] overflow-hidden lg:col-span-6">
          <Picture
            alt={STICKERS.alt}
            className="absolute inset-0 block size-full"
            image={STICKERS.image}
            imgClassName="size-full object-cover"
            sizes="(min-width: 1024px) 48vw, 100vw"
          />
        </Reveal>
        <Reveal className="flex flex-col gap-[1.5rem] lg:col-span-5 lg:col-start-8" delay={0.1}>
          <h2
            className="text-heading lg:text-title text-[2.5rem] text-balance"
            id="stickers-heading"
          >
            {STICKERS.heading}
          </h2>
          <p className="text-subheading">{STICKERS.name}</p>
          <p className="text-body max-w-[40ch] text-muted-foreground">{STICKERS.body}</p>
        </Reveal>
      </div>
    </section>
  );
}
