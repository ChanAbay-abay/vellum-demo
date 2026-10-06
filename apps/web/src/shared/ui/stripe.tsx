import { cn } from "@zo-stack/ui/lib/utils";

/**
 * The Retro 3-band stripe, the site's only accent (DESIGN.md §2): orange, red, burgundy,
 * always in that order, equal heights, angled at the logo slant. Decorative only.
 *
 * Each band carries `data-stripe-band` so a GSAP scene can draw them in (e.g. scaleX from
 * `origin-left`) without touching the container's rotation.
 */
export function Stripe({
  angle = -18,
  bandHeight = "2.25rem",
  className
}: {
  /** Degrees. 0 for a flat stripe. */
  angle?: number;
  /** Height of one band, any CSS length (`"1.25rem"`, `"2vw"`) */
  bandHeight?: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none flex flex-col",
        angle !== 0 && "rotate-(--angle)",
        className
      )}
      // Per-instance values, so they ride CSS variables rather than generated class names.
      style={{ "--angle": `${angle}deg`, "--band": bandHeight } as React.CSSProperties}
    >
      <span className="bg-stripe-orange block h-(--band)" data-stripe-band="" />
      <span className="bg-stripe-red block h-(--band)" data-stripe-band="" />
      <span className="bg-stripe-burgundy block h-(--band)" data-stripe-band="" />
    </div>
  );
}
