import { type MotionValue, m, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

import { cn } from "@zo-stack/ui/lib/utils";

type ScrollHighlightTextProps = {
  /** Wrap words in *asterisks* to color them with `emphasisClassName`. */
  text: string;
  className?: string;
  emphasisClassName?: string;
  /**
   * Scroll progress (0 to 1) that drives the highlight. Pass one from a parent
   * `useScroll()` to sync with a pinned section. Defaults to the text's own
   * position as it crosses the viewport.
   */
  progress?: MotionValue<number>;
};

/**
 * Big statement text that lights up word by word as you scroll.
 * Words start faded and reach full opacity in reading order. The text exists once
 * in the HTML, so crawlers and screen readers read it normally.
 */
export function ScrollHighlightText({
  className,
  emphasisClassName = "text-brand",
  progress,
  text
}: ScrollHighlightTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ offset: ["start 0.85", "end 0.45"], target: ref });
  const words = parseWords(text);

  return (
    <p ref={ref} className={cn("flex flex-wrap gap-x-[0.25em]", className)}>
      {words.map((word, index) => (
        <Word
          key={`${word.text}-${index}`}
          className={word.emphasis ? emphasisClassName : undefined}
          progress={progress ?? scrollYProgress}
          range={[index / words.length, (index + 1) / words.length]}
        >
          {word.text}
        </Word>
      ))}
    </p>
  );
}

function Word({
  children,
  className,
  progress,
  range
}: {
  children: string;
  className?: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.2, 1]);

  return (
    <m.span data-reveal="" className={className} style={{ opacity }}>
      {children}
    </m.span>
  );
}

// "*Better people,* lead" → [{ text: "Better", emphasis: true }, { text: "people,", emphasis: true }, { text: "lead" }]
function parseWords(text: string) {
  let emphasis = false;

  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((raw) => {
      const opens = raw.startsWith("*");
      const closes = raw.endsWith("*") && (raw.length > 1 || !opens);
      if (opens) emphasis = true;
      const word = { emphasis, text: raw.replaceAll("*", "") };
      if (closes) emphasis = false;
      return word;
    });
}
