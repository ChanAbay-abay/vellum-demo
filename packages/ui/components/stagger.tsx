import { type HTMLMotionProps, m } from "motion/react";

const EASE_OUT = [0.21, 0.47, 0.32, 0.98] as const;

type StaggerProps = Omit<
  HTMLMotionProps<"div">,
  "initial" | "whileInView" | "viewport" | "variants"
> & {
  /** Seconds to wait before the first item */
  delay?: number;
  /** Seconds between each item */
  interval?: number;
  once?: boolean;
  amount?: number;
};

/**
 * Reveals each <StaggerItem> inside it one after another when the group scrolls into view.
 *
 * @example
 * <Stagger className="grid gap-4 md:grid-cols-3">
 *   {features.map((f) => <StaggerItem key={f.title}>...</StaggerItem>)}
 * </Stagger>
 */
export function Stagger({
  amount = 0.2,
  delay = 0,
  interval = 0.08,
  once = true,
  ...props
}: StaggerProps) {
  return (
    <m.div
      initial="hidden"
      whileInView="visible"
      viewport={{ amount, once }}
      variants={{
        hidden: {},
        visible: { transition: { delayChildren: delay, staggerChildren: interval } }
      }}
      {...props}
    />
  );
}

type StaggerItemProps = Omit<HTMLMotionProps<"div">, "variants"> & {
  distance?: number;
  duration?: number;
};

export function StaggerItem({ distance = 16, duration = 0.5, ...props }: StaggerItemProps) {
  return (
    <m.div
      data-reveal=""
      variants={{
        hidden: { opacity: 0, y: distance },
        visible: { opacity: 1, transition: { duration, ease: EASE_OUT }, y: 0 }
      }}
      {...props}
    />
  );
}
