import { ArrowRightIcon } from "@/shared/ui/icons";

const pad = (n: number) => String(n).padStart(2, "0");

// Touch layouts get a real 44px button; on desktop the after: layer widens the hit area to 44px
// around the 2.25rem visual button.
const ARROW =
  "relative flex size-[2.75rem] lg:size-[2.25rem] after:absolute after:top-1/2 after:left-1/2 after:size-[44px] after:-translate-x-1/2 after:-translate-y-1/2 after:content-[''] cursor-pointer items-center justify-center rounded-full transition-[background-color,opacity] duration-300 hover:bg-paper/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent";

/**
 * The tour's step controls: `← 02 / 07 →`. From md up they sit centred under the cycling beat
 * copy; on phones the tour docks them bottom-left, opposite the summary pill (so the counter is
 * narrower there, to leave the pill room).
 * Presentational: the tour owns the beat index, the start state and the stepping. It lives
 * inside the pinned stage, so it scrolls away with the tour.
 */
export function TourControls({
  index,
  count,
  atStart,
  atEnd,
  onPrev,
  onNext
}: {
  index: number;
  count: number;
  /** At or before the first beat's hold point: nothing to step back to */
  atStart: boolean;
  /** On the last beat → leaves the tour for the summary, and says so */
  atEnd: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <nav aria-label="Feature tour" className="flex items-center" data-testid="tour-controls">
      <div className="flex items-center gap-[0.25rem]">
        <button
          aria-label="Previous feature"
          className={ARROW}
          disabled={atStart}
          onClick={onPrev}
          type="button"
        >
          <ArrowRightIcon className="w-[0.8rem] rotate-180" />
        </button>
        <p
          className="text-label w-[4rem] text-center whitespace-nowrap tabular-nums md:w-[6rem]"
          data-testid="tour-counter"
        >
          <span aria-hidden>
            {pad(index + 1)} / {pad(count)}
          </span>
          <span aria-live="polite" className="sr-only">
            Feature {index + 1} of {count}
          </span>
        </p>
        <button
          aria-label={atEnd ? "Go to summary" : "Next feature"}
          className={ARROW}
          onClick={onNext}
          type="button"
        >
          <ArrowRightIcon className="w-[0.8rem]" />
        </button>
      </div>
    </nav>
  );
}
