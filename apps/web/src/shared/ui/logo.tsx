import { cn } from "@zo-stack/ui/lib/utils";

/**
 * Traced Vellum marks served from /public/brand (plain <img>: SVG logos skip the image
 * pipeline). `tone` picks the solid file for the ground: black on light, white on dark.
 * The `*-currentColor` variants (no suffix) exist in /public/brand for inline use.
 * "edge" is always this wordmark, never typed (DESIGN.md §3).
 */
type Tone = "black" | "white";

export function VellumLockup({ tone = "black", className }: { tone?: Tone; className?: string }) {
  return (
    <img
      alt="Vellum Cycles"
      className={cn("h-auto", className)}
      height={100}
      src={`/brand/vellum-lockup-${tone}.svg`}
      width={734}
    />
  );
}

export function VellumMark({ tone = "black", className }: { tone?: Tone; className?: string }) {
  return (
    <img
      alt="Vellum"
      className={cn("h-auto", className)}
      height={356}
      src={`/brand/vellum-mark-${tone}.svg`}
      width={660}
    />
  );
}

export function EdgeWordmark({
  tone = "black",
  className,
  alt = "Edge"
}: {
  tone?: Tone;
  className?: string;
  /** Pass "" when a visible label already names the model */
  alt?: string;
}) {
  return (
    <img
      alt={alt}
      className={cn("h-auto", className)}
      height={210}
      src={`/brand/edge-wordmark-${tone}.svg`}
      width={1027}
    />
  );
}
