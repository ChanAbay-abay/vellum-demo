import { Picture } from "@zo-stack/ui/components/picture";

import { buttonVariants } from "@/shared/ui/button";
import { ArrowUpRightIcon } from "@/shared/ui/icons";
import { Reveal } from "@/shared/ui/reveal";

import { SOCIALS } from "@/pages/about/config/about.content";

import { siteConfig } from "@/config/site.config";

/**
 * Socials on bone: heading, handle and the two follow buttons (Instagram primary, Facebook as a
 * text link; TikTok and Strava stay hidden until the client confirms them) beside a static 3×2
 * grid of lifestyle photos. The photos are not links: one follow button says it once.
 */
export function Socials() {
  return (
    <section
      aria-labelledby="socials-heading"
      className="bg-bone text-ink px-(--gutter) py-[5rem] lg:py-[8rem]"
      id={SOCIALS.id}
    >
      <div className="grid gap-[3rem] lg:grid-cols-12 lg:gap-x-[1.5rem]">
        <Reveal className="flex flex-col items-start lg:sticky lg:top-[7rem] lg:col-span-4 lg:self-start">
          <h2
            className="lg:text-title text-[3rem] leading-[0.95] font-semibold tracking-[-0.03em]"
            id="socials-heading"
          >
            {SOCIALS.heading}
          </h2>
          <p className="text-body mt-[2rem] max-w-[36ch]">{SOCIALS.body}</p>
          <p className="text-label mt-[1.5rem] text-muted-foreground">{SOCIALS.handle}</p>
          <div className="mt-[2.5rem] flex flex-wrap items-center gap-x-[2.5rem] gap-y-[0.5rem]">
            <a
              className={buttonVariants()}
              href={siteConfig.socials.instagram}
              rel="noopener noreferrer"
              target="_blank"
            >
              {SOCIALS.instagram.label}
              <ArrowUpRightIcon className="w-[0.7rem]" />
              <span className="sr-only"> (opens Instagram in a new tab)</span>
            </a>
            <a
              className={buttonVariants({ variant: "link" })}
              href={siteConfig.socials.facebook}
              rel="noopener noreferrer"
              target="_blank"
            >
              {SOCIALS.facebook.label}
              <ArrowUpRightIcon className="w-[0.7rem]" />
              <span className="sr-only"> (opens Facebook in a new tab)</span>
            </a>
          </div>
        </Reveal>

        <ul className="grid grid-cols-2 gap-[0.75rem] sm:grid-cols-3 lg:col-span-8">
          {SOCIALS.photos.map((photo, i) => (
            <li key={photo.alt}>
              <Reveal
                className="bg-paper relative aspect-square min-h-[8rem] overflow-hidden"
                delay={(i % 3) * 0.08}
              >
                <Picture
                  alt={photo.alt}
                  className="absolute inset-0 block size-full"
                  image={photo.image}
                  imgClassName="size-full object-cover"
                  sizes="(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 50vw"
                />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
