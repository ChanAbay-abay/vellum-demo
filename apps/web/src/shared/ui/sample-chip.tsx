import { cn } from "@zo-stack/ui/lib/utils";

/** A non-Vellum stand-in photo: the credit, when there is one. */
export type SamplePhoto = { credit?: string };

/** Alt text for a photo that may be a sample: the suffix says so to screen readers too. */
export function sampleAlt(alt: string, sample?: SamplePhoto) {
  return sample ? `${alt} (sample photo)` : alt;
}

/**
 * The "Sample photo" chip for non-Vellum stand-in photos (gallery tiles, the closing CTA).
 * Position it with `className` (it is absolutely positioned, above the image, outside any hover
 * treatment so it is never hidden). `aria-hidden`: the alt text carries the same fact.
 */
export function SampleChip({ sample, className }: { sample: SamplePhoto; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "bg-ink/70 text-paper pointer-events-none absolute z-10 flex max-w-[calc(100%-1.5rem)] flex-col gap-[0.15rem] rounded-[0.75rem] px-[0.75rem] py-[0.45rem] backdrop-blur-sm",
        className
      )}
      data-testid="sample-label"
    >
      <span className="text-label">Sample photo</span>
      {/* The credit in sentence case, so a long name never wraps the tracked label. */}
      {sample.credit ? (
        <span className="text-caption text-paper/80 truncate">{sample.credit}</span>
      ) : null}
    </span>
  );
}
