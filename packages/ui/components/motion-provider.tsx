import { LazyMotion, MotionConfig, domAnimation } from "motion/react";

/**
 * Put this once at the app root.
 *
 * LazyMotion loads only the DOM animation features (~15kb gzip instead of ~34kb), so
 * use `m.div` instead of `motion.div` to keep the bundle small. `motion.div` still
 * works, it just pulls in the full bundle.
 *
 * `reducedMotion="user"` turns off transform/layout animations for people who
 * ask their OS for reduced motion. Opacity fades still run.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
