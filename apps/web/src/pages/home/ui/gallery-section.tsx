import { ClipStack } from "@zo-stack/ui/components/clip-stack";
import { SplitReveal } from "@zo-stack/ui/components/split-reveal";

import { GALLERY } from "@/pages/home/config/home.content";

/** Full-screen slides that wipe over one another as you scroll. */
export function GallerySection() {
  return (
    <section id={GALLERY.id} className="relative bg-black text-white">
      <ClipStack>
        {[
          <div key="feature" className="relative size-full">
            <img
              alt={GALLERY.feature.image.alt}
              className="size-full object-cover"
              loading="lazy"
              src={GALLERY.feature.image.src}
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-linear-to-b from-transparent from-[74%] to-black to-[92%]"
            />
            <div className="absolute inset-x-0 bottom-[4rem] text-center">
              <SplitReveal
                as="h3"
                className="font-display text-title md:text-display uppercase"
                text={GALLERY.feature.title}
              />
              <p className="text-body md:text-subheading font-medium uppercase">
                {GALLERY.feature.subtitle}
              </p>
            </div>
          </div>,
          ...GALLERY.slides.map((slide) => (
            <img
              key={slide.src}
              alt={slide.alt}
              className="size-full object-cover"
              loading="lazy"
              src={slide.src}
            />
          ))
        ]}
      </ClipStack>
    </section>
  );
}
