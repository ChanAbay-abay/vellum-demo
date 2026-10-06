import { useEffect, useState } from "react";

import { cn } from "@zo-stack/ui/lib/utils";

type Section = { id: string; label: string };

/**
 * Fixed vertical dots, one per section, marking where you are on the page.
 * The section crossing the middle of the screen is active. Dots are plain #anchor
 * links, so Lenis smooth-scrolls to them. Position it with `className`.
 */
export function SectionDots({
  className,
  sections
}: {
  className?: string;
  /** Pass a module-level constant so the observer isn't recreated each render */
  sections: ReadonlyArray<Section>;
}) {
  const [activeId, setActiveId] = useState(sections[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );

    for (const { id } of sections) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav
      aria-label="Page sections"
      className={cn("fixed z-50 text-white mix-blend-difference", className)}
    >
      <ul className="flex flex-col items-end">
        {sections.map((section) => {
          const isActive = section.id === activeId;
          return (
            <li key={section.id}>
              <a
                aria-current={isActive ? "true" : undefined}
                aria-label={`Go to ${section.label}`}
                className="flex items-center py-[0.375rem]"
                href={`#${section.id}`}
              >
                <span
                  className={cn(
                    "shrink-0 rounded-full transition-all duration-300",
                    isActive
                      ? "size-[0.4375rem] border border-current bg-transparent"
                      : "size-[0.3125rem] bg-current"
                  )}
                />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
