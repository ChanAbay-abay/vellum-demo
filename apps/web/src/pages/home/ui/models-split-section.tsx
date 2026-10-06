import { Link } from "@tanstack/react-router";
import { m, useReducedMotion } from "motion/react";
import { useState } from "react";

import { Picture } from "@zo-stack/ui/components/picture";

import { EdgeWordmark } from "@/shared/ui/logo";

import { MODELS } from "@/pages/home/config/home.content";

const EASE = [0.22, 1, 0.36, 1] as const;
const TRANSITION = { duration: 0.6, ease: EASE };

/**
 * Three-column models split on ink (DESIGN.md §4, §7). The hovered or focused column widens
 * and the others' images dim; the whole column is the link. Stacked on mobile, where there is
 * no free space for flex-grow to spread, so only the dim remains (and only for keyboard focus).
 * Reduced motion: opacity only, no widening.
 */
export function ModelsSplit() {
  const [active, setActive] = useState<string | null>(null);
  const reduce = useReducedMotion();

  return (
    <section className="bg-ink text-paper relative z-20" id={MODELS.id}>
      <h2 className="sr-only">{MODELS.heading}</h2>
      <ul className="flex flex-col lg:h-[90svh] lg:flex-row" onPointerLeave={() => setActive(null)}>
        {MODELS.items.map((item) => {
          const isActive = active === item.slug;
          const dimmed = active !== null && !isActive;
          return (
            <m.li
              animate={{ flexGrow: isActive && !reduce ? 1.8 : 1 }}
              className="relative h-[26rem] overflow-hidden lg:h-auto lg:flex-1 lg:basis-0"
              key={item.slug}
              transition={TRANSITION}
            >
              <Link
                className="block h-full focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-ring"
                onBlur={() => setActive(null)}
                onFocus={() => setActive(item.slug)}
                onPointerEnter={(e) => e.pointerType === "mouse" && setActive(item.slug)}
                to={item.to}
              >
                <m.div
                  animate={{ opacity: dimmed ? 0.4 : 0.7 }}
                  className="absolute inset-0"
                  initial={false}
                  transition={TRANSITION}
                >
                  <Picture
                    alt={item.alt}
                    className="block h-full w-full"
                    image={item.image}
                    imgClassName="h-full w-full object-cover"
                    sizes="(min-width: 1024px) 40vw, 100vw"
                  />
                </m.div>
                {/* Scrim: the Edge archive photo has a white border that would swallow the label */}
                <div className="from-ink/80 absolute inset-x-0 bottom-0 h-[45%] bg-linear-to-t to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-[0.75rem] p-(--gutter) pb-[2rem] lg:pb-[2.5rem]">
                  {item.slug === "edge" ? (
                    <EdgeWordmark className="w-[15rem] lg:w-[min(22rem,85%)]" tone="white" />
                  ) : (
                    <span className="model-name font-display lg:text-title origin-left text-[3rem] leading-[0.95] font-semibold tracking-[-0.03em]">
                      {item.name}
                    </span>
                  )}
                  <span className="text-caption text-paper/90">{item.line}</span>
                </div>
              </Link>
            </m.li>
          );
        })}
      </ul>
    </section>
  );
}
