import { type HTMLMotionProps, m } from "motion/react";

/** DESIGN.md §5 scroll reveal: y 24px → 0 with opacity, 0.7s, once. */
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Fades and rises its children in when they scroll into view. Below the fold only: it starts
 * hidden, so wrapping hero content would delay Largest Contentful Paint.
 *
 * Reduced motion: MotionProvider (`reducedMotion="user"`) drops the rise, leaving a short fade.
 * `data-reveal` un-hides it when JavaScript is off (see __root.tsx).
 */
export function Reveal({
  delay = 0,
  ...props
}: Omit<HTMLMotionProps<"div">, "initial" | "whileInView" | "viewport" | "transition"> & {
  /** Seconds, for staggering siblings */
  delay?: number;
}) {
  return (
    <m.div
      data-reveal=""
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ amount: 0.3, once: true }}
      transition={{ delay, duration: 0.7, ease: EASE }}
      {...props}
    />
  );
}
