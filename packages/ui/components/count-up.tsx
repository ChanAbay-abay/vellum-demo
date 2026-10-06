import {
  animate,
  m,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform
} from "motion/react";
import { useEffect, useRef } from "react";

type CountUpProps = {
  value: number;
  /** Seconds */
  duration?: number;
  className?: string;
};

/**
 * Counts from 0 to `value` the first time it scrolls into view.
 * The server renders the final number, so crawlers and no-JS visitors see the real value.
 */
export function CountUp({ className, duration = 2, value }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { amount: 0.6, once: true });
  const prefersReducedMotion = useReducedMotion();
  const count = useMotionValue(value);
  const display = useTransform(count, (latest) => Math.round(latest).toLocaleString("en-US"));

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (!inView) {
      count.jump(0);
      return;
    }
    const controls = animate(count, value, { duration, ease: "easeOut" });
    return () => controls.stop();
  }, [count, duration, inView, prefersReducedMotion, value]);

  return (
    <m.span ref={ref} className={className}>
      {display}
    </m.span>
  );
}
