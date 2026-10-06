import { Picture } from "@zo-stack/ui/components/picture";

import { Reveal } from "@/shared/ui/reveal";

import { PHILOSOPHY } from "@/pages/about/config/about.content";

/**
 * Philosophy on ink: a frame-tube close-up on the left, the heading and the four principles
 * (PRD wording) on the right, each principle rising in on its own. Separated by space, not rules.
 */
export function Philosophy() {
  return (
    <section
      aria-labelledby="philosophy-heading"
      className="bg-ink text-paper px-(--gutter) py-[5rem] lg:py-[8rem]"
      id={PHILOSOPHY.id}
    >
      <div className="grid gap-[3rem] lg:grid-cols-12 lg:items-center lg:gap-x-[1.5rem]">
        <Reveal className="bg-graphite relative aspect-4/5 min-h-[20rem] lg:col-span-5">
          <Picture
            alt={PHILOSOPHY.image.alt}
            className="absolute inset-0 block size-full"
            image={PHILOSOPHY.image.image}
            imgClassName="size-full object-cover"
            sizes="(min-width: 1024px) 40vw, 100vw"
          />
        </Reveal>
        <div className="lg:col-span-6 lg:col-start-7">
          <Reveal>
            <h2
              className="lg:text-title text-[3rem] leading-[0.95] font-semibold tracking-[-0.03em] text-balance"
              id="philosophy-heading"
            >
              {PHILOSOPHY.heading}
            </h2>
          </Reveal>
          <ol className="mt-[3rem] flex flex-col gap-[2rem] lg:mt-[4rem] lg:gap-[2.5rem]">
            {PHILOSOPHY.principles.map((principle, i) => (
              <li key={principle}>
                <Reveal
                  className="grid grid-cols-[3rem_1fr] items-baseline gap-x-[1rem] lg:grid-cols-[4.5rem_1fr]"
                  delay={i * 0.08}
                >
                  <span aria-hidden className="text-label text-muted-on-dark">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-heading lg:text-heading text-[1.75rem]">{principle}</span>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
