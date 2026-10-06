import { m } from "motion/react";

import { cn } from "@zo-stack/ui/lib/utils";

const TAGS = { div: m.div, h2: m.h2, h3: m.h3, p: m.p } as const;
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

type SplitRevealProps = {
  text: string;
  as?: keyof typeof TAGS;
  className?: string;
  /** Seconds before the first word */
  delay?: number;
  /** Seconds between words */
  stagger?: number;
};

/**
 * Text that rises into place word by word, each word sliding up from behind a
 * mask, the first time it scrolls into view. The text stays real, selectable,
 * and readable by crawlers and screen readers.
 */
export function SplitReveal({
  as = "p",
  className,
  delay = 0,
  stagger = 0.025,
  text
}: SplitRevealProps) {
  const Tag = TAGS[as];
  const words = text.split(/\s+/).filter(Boolean);

  return (
    <Tag
      className={className}
      initial="hidden"
      variants={{
        hidden: {},
        visible: { transition: { delayChildren: delay, staggerChildren: stagger } }
      }}
      viewport={{ amount: 0.5, once: true }}
      whileInView="visible"
    >
      {words.map((word, index) => (
        <span key={`${word}-${index}`}>
          <span className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-bottom">
            <m.span
              data-reveal=""
              className={cn("inline-block")}
              variants={{
                hidden: { opacity: 0, y: "110%" },
                visible: { opacity: 1, transition: { duration: 0.9, ease: EASE_OUT_EXPO }, y: "0%" }
              }}
            >
              {word}
            </m.span>
          </span>
          {index < words.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
