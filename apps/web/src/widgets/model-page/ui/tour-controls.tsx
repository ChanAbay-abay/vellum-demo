import { ArrowRightIcon } from "@/shared/ui/icons";

const pad = (n: number) => String(n).padStart(2, "0");

const ARROW =
  "flex size-[2.25rem] cursor-pointer items-center justify-center rounded-full transition-[background-color,opacity] duration-300 hover:bg-paper/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent";

/**
 * The tour's step controls, centred directly under the cycling beat copy: `← 02 / 07 →`.
 * Presentational: the tour owns the beat index, the start state and the stepping. It lives
 * inside the pinned stage, so it scrolls away with the tour.
 */
export function TourControls({
  index,
  count,
  atStart,
  onPrev,
  onNext
}: {
  index: number;
  count: number;
  /** At or before the first beat's hold point: nothing to step back to */
  atStart: boolean;
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
          className="text-label w-[6rem] text-center whitespace-nowrap tabular-nums"
          data-testid="tour-counter"
        >
          <span aria-hidden>
            {pad(index + 1)} / {pad(count)}
          </span>
          <span aria-live="polite" className="sr-only">
            Feature {index + 1} of {count}
          </span>
        </p>
        <button aria-label="Next feature" className={ARROW} onClick={onNext} type="button">
          <ArrowRightIcon className="w-[0.8rem]" />
        </button>
      </div>
    </nav>
  );
}
