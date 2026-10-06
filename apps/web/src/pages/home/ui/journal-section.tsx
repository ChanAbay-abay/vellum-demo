import { SplitReveal } from "@zo-stack/ui/components/split-reveal";
import { Stagger, StaggerItem } from "@zo-stack/ui/components/stagger";

import { ArrowRightIcon } from "@/shared/ui/icons";

import { JOURNAL } from "@/pages/home/config/home.content";

export function JournalSection() {
  return (
    <section
      id={JOURNAL.id}
      className="bg-paper relative px-[1.875rem] pt-[6.25rem] pb-[2rem] text-[#1a1a1a]"
    >
      <div className="flex items-end justify-between gap-[1.5rem]">
        <SplitReveal as="h2" className="font-display text-title uppercase" text={JOURNAL.title} />
        {JOURNAL.more.href ? (
          <a
            className="group font-display text-label flex items-center gap-[0.625rem] uppercase opacity-70 transition-opacity hover:opacity-100"
            href={JOURNAL.more.href}
          >
            {JOURNAL.more.label}
            <ArrowRightIcon className="h-[0.5rem] w-[0.6875rem] transition-transform group-hover:translate-x-[0.25rem]" />
          </a>
        ) : null}
      </div>

      <Stagger className="mt-[3.5rem] grid gap-[2rem] md:grid-cols-3" interval={0.12}>
        {JOURNAL.items.map((item) => (
          <StaggerItem key={item.title} distance={24} duration={0.9}>
            <article className="group cursor-pointer">
              <div className="bg-ink/10 aspect-[3/4] overflow-hidden">
                <img
                  alt={item.image.alt}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  src={item.image.src}
                />
              </div>
              <p className="mt-[1rem] flex items-baseline gap-[1rem]">
                <time className="font-display text-label shrink-0 uppercase">{item.date}</time>
                <span className="text-body opacity-50">{item.category}</span>
              </p>
              <h3 className="text-body mt-[0.75rem] opacity-80">{item.title}</h3>
            </article>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
