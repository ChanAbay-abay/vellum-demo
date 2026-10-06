import { type HTMLMotionProps, m } from "motion/react";

const EASE_OUT = [0.21, 0.47, 0.32, 0.98] as const;

// Where the element starts, as a multiple of `distance`. "up" means it rises into place.
const OFFSETS = {
  down: [0, -1],
  left: [1, 0],
  none: [0, 0],
  right: [-1, 0],
  up: [0, 1]
} as const;

type RevealProps = Omit<
  HTMLMotionProps<"div">,
  "initial" | "whileInView" | "viewport" | "transition"
> & {
  /** Seconds to wait before starting */
  delay?: number;
  direction?: keyof typeof OFFSETS;
  /** Pixels to travel */
  distance?: number;
  /** Seconds */
  duration?: number;
  /** Animate only the first time it enters the viewport */
  once?: boolean;
  /** How much of the element must be visible before it animates (0-1) */
  amount?: number;
};

/**
 * Fades and slides its children in when they scroll into view.
 *
 * Don't wrap the hero heading/image with this: it starts hidden, which delays
 * Largest Contentful Paint. Use it for content below the fold.
 */
export function Reveal({
  amount = 0.3,
  delay = 0,
  direction = "up",
  distance = 24,
  duration = 0.6,
  once = true,
  ...props
}: RevealProps) {
  const [x, y] = OFFSETS[direction];

  return (
    <m.div
      data-reveal=""
      initial={{ opacity: 0, x: x * distance, y: y * distance }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ amount, once }}
      transition={{ delay, duration, ease: EASE_OUT }}
      {...props}
    />
  );
}
