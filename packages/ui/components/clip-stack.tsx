import { type MotionValue, m, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

import { cn } from "@zo-stack/ui/lib/utils";

/**
 * Full-screen slides pinned on top of each other. As you scroll, each next slide
 * is revealed from the bottom by a clip mask (the image itself stays still) while
 * it settles from a slight zoom. Each child is one slide.
 */
export function ClipStack({
  children,
  className
}: {
  children: React.ReactNode[];
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ offset: ["start start", "end end"], target: ref });
  const count = children.length;

  return (
    <div ref={ref} className={cn("relative", className)} style={{ height: `${count * 100}svh` }}>
      <div className="sticky top-0 h-svh overflow-hidden">
        {children.map((child, index) => (
          <Slide key={index} count={count} index={index} progress={scrollYProgress}>
            {child}
          </Slide>
        ))}
      </div>
    </div>
  );
}

function Slide({
  children,
  count,
  index,
  progress
}: {
  children: React.ReactNode;
  count: number;
  index: number;
  progress: MotionValue<number>;
}) {
  // Slide n is revealed while overall progress moves through its segment
  const start = (index - 1) / (count - 1);
  const end = index / (count - 1);
  const reveal = useTransform(progress, [start, end], [100, 0], { clamp: true });
  const clipPath = useTransform(reveal, (inset) => `inset(${inset}% 0 0 0)`);
  const scale = useTransform(reveal, [100, 0], [1.15, 1]);

  if (index === 0) {
    return <div className="absolute inset-0">{children}</div>;
  }

  return (
    <m.div
      className="absolute inset-0 overflow-hidden will-change-[clip-path]"
      style={{ clipPath }}
    >
      <m.div className="size-full" style={{ scale }}>
        {children}
      </m.div>
    </m.div>
  );
}
