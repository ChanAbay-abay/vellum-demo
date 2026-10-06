import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

import { Button } from "@zo-stack/ui/components/button";
import { cn } from "@zo-stack/ui/lib/utils";

/**
 * Horizontal, swipeable row of cards using native CSS scroll snapping (no carousel library).
 * Wrap each card in <ScrollCarouselItem>.
 */
export function ScrollCarousel({
  children,
  className,
  label
}: {
  children: React.ReactNode;
  className?: string;
  /** Accessible name, e.g. "Services" */
  label: string;
}) {
  const trackRef = useRef<HTMLElement>(null);

  const scrollByPage = (direction: 1 | -1) => {
    const track = trackRef.current;
    track?.scrollBy({ behavior: "smooth", left: direction * track.clientWidth * 0.8 });
  };

  return (
    <div className={className}>
      <section
        ref={trackRef}
        aria-label={label}
        className="flex snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </section>
      <div className="mt-6 flex justify-end gap-2">
        <Button
          aria-label="Previous"
          onClick={() => scrollByPage(-1)}
          radius="full"
          size="icon"
          variant="outline"
        >
          <ChevronLeft />
        </Button>
        <Button
          aria-label="Next"
          onClick={() => scrollByPage(1)}
          radius="full"
          size="icon"
          variant="outline"
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}

export function ScrollCarouselItem({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[31%]", className)}>
      {children}
    </div>
  );
}
