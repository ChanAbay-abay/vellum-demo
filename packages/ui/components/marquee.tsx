import { cn } from "@zo-stack/ui/lib/utils";

type MarqueeProps = React.ComponentProps<"div"> & {
  /** Seconds for one full loop. Higher is slower. */
  duration?: number;
  pauseOnHover?: boolean;
  reverse?: boolean;
  vertical?: boolean;
};

/**
 * Infinite scrolling row (or column) of items, pure CSS.
 * Children are rendered twice so the loop is seamless; the copy is hidden from screen readers.
 * Set the gap with the `--gap` CSS variable, e.g. className="[--gap:2rem]".
 *
 * @example <Marquee>{logos.map((logo) => <img key={logo.name} ... />)}</Marquee>
 */
export function Marquee({
  children,
  className,
  duration = 40,
  pauseOnHover = true,
  reverse = false,
  style,
  vertical = false,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn(
        "group flex gap-(--gap) overflow-hidden [--gap:--spacing(6)]",
        vertical ? "flex-col" : "flex-row",
        className
      )}
      style={{ "--duration": `${duration}s`, ...style } as React.CSSProperties}
    >
      {[0, 1].map((copy) => (
        <div
          key={copy}
          aria-hidden={copy === 1 || undefined}
          className={cn(
            "flex shrink-0 justify-around gap-(--gap)",
            vertical ? "animate-marquee-y flex-col" : "animate-marquee-x flex-row",
            reverse && "[animation-direction:reverse]",
            pauseOnHover && "group-hover:[animation-play-state:paused]"
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
