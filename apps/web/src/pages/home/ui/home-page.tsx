import { SectionDots } from "@zo-stack/ui/components/section-dots";

import { CollectionSection } from "@/pages/home/ui/collection-section";
import { GallerySection } from "@/pages/home/ui/gallery-section";
import { HeroSection } from "@/pages/home/ui/hero-section";
import { JournalSection } from "@/pages/home/ui/journal-section";
import { StudioSection } from "@/pages/home/ui/studio-section";

/** Ids must match each section's `id`. Drives the dots on the right edge. */
const SECTIONS = [
  { id: "top", label: "the top" },
  { id: "studio", label: "the studio" },
  { id: "collection", label: "the collection" },
  { id: "work", label: "our work" },
  { id: "journal", label: "the journal" }
];

/** Sections are plain components: reorder, delete, or duplicate them freely. */
export function HomePage() {
  return (
    <>
      <SectionDots
        className="top-1/2 right-[1.875rem] hidden -translate-y-1/2 lg:block"
        sections={SECTIONS}
      />
      <HeroSection />
      <StudioSection />
      <CollectionSection />
      <GallerySection />
      <JournalSection />
    </>
  );
}
