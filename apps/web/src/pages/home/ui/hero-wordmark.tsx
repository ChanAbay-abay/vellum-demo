import { useId } from "react";

/**
 * The "vellum" wordmark (public/brand/vellum-wordmark.svg) inlined so the Retro stripe can be
 * clipped inside the letterforms (DESIGN.md §6 Direction D). One path per letter so the hero
 * intro can stagger them; the `e` keeps its counter as an evenodd subpath.
 *
 * The svg clips to its viewBox, so letters rising from below are masked by the baseline.
 * The stripe sits in one group clipped by every letter at its resting position: it only
 * sweeps in after the letters have landed, so it never needs to follow them.
 */
const LETTERS = [
  // v
  "M98.38 14.25 L77.50 14.75 L35.25 39.62 L20.50 14.12 L0.00 15.12 L17.75 48.62 L38.00 49.25Z",
  // e
  "M84.50 48.62 L184.62 49.12 L190.38 39.00 L109.38 37.50 L193.75 34.75 L205.88 14.88 L105.88 14.12ZM117.62 26.25 L118.88 23.25 L120.62 22.38 L173.62 22.25 L178.75 22.38 L180.62 23.62 L180.25 25.25 L177.38 27.00 L119.62 27.12Z",
  // l
  "M244.00 0.38 L226.25 0.00 L224.38 1.12 L196.62 49.00 L216.12 48.38Z",
  // l
  "M272.88 0.38 L253.25 1.12 L225.62 48.88 L245.12 48.50Z",
  // u
  "M254.88 48.62 L356.12 48.88 L376.00 14.75 L357.25 14.00 L341.25 38.88 L282.50 38.88 L294.88 14.75 L276.50 13.88Z",
  // m
  "M366.38 48.75 L386.12 48.50 L402.25 23.12 L430.88 23.38 L417.38 48.62 L435.75 49.25 L452.75 23.38 L480.38 23.12 L468.25 48.50 L486.88 49.12 L508.00 14.75 L387.75 14.12Z"
];

const VIEW_W = 508;
const VIEW_H = 49.25;

/** Stripe geometry in viewBox units: three equal bands at the logo slant, crossing the `e`/`l`s. */
const STRIPE = { angle: -18, cx: 150, cy: VIEW_H / 2, band: 7 };
const STRIPE_COLORS = ["var(--stripe-orange)", "var(--stripe-red)", "var(--stripe-burgundy)"];

/** Glint points in viewBox units: the top tip of the second `l`, and a smaller echo off its right. */
const SPARKLES = [
  { x: 272.9, y: 0.4, size: "4.8%" },
  { x: 286, y: 8, size: "2.4%" }
];
/** Four-point star, 24-unit box, concave sides so it reads as a glint rather than a diamond. */
const STAR =
  "M12 0 C12.9 7.6 16.4 11.1 24 12 C16.4 12.9 12.9 16.4 12 24 C11.1 16.4 7.6 12.9 0 12 C7.6 11.1 11.1 7.6 12 0Z";

export function HeroWordmark({ label, className }: { label: string; className?: string }) {
  const clipId = useId();
  const top = STRIPE.cy - (STRIPE.band * 3) / 2;

  return (
    <span className="relative block">
      <span className="sr-only">{label}</span>
      {/* Outside the wordmark svg, which clips to its viewBox and would cut the glint at the tip */}
      {SPARKLES.map(({ x, y, size }) => (
        <svg
          key={x}
          aria-hidden
          className="invisible absolute aspect-square -translate-1/2"
          data-hero-sparkle=""
          fill="var(--stripe-orange)"
          style={{ left: `${(x / VIEW_W) * 100}%`, top: `${(y / VIEW_H) * 100}%`, width: size }}
          viewBox="0 0 24 24"
        >
          <path d={STAR} />
        </svg>
      ))}
      <svg aria-hidden className={className} overflow="hidden" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}>
        <defs>
          <clipPath id={clipId}>
            {LETTERS.map((d) => (
              <path key={d} clipRule="evenodd" d={d} />
            ))}
          </clipPath>
        </defs>

        {/* Start state (hidden) is CSS so the prerender never paints the final state first */}
        <g
          className="invisible motion-reduce:visible"
          data-hero-letters=""
          data-reveal=""
          fill="currentColor"
        >
          {LETTERS.map((d) => (
            <path key={d} d={d} data-hero-letter="" fillRule="evenodd" />
          ))}
        </g>

        {/* data-reveal (whose no-script reset forces transform:none) stays off the rotated group */}
        <g
          className="invisible motion-reduce:visible"
          clipPath={`url(#${clipId})`}
          data-hero-stripe=""
          data-reveal=""
        >
          <g transform={`rotate(${STRIPE.angle} ${STRIPE.cx} ${STRIPE.cy})`}>
            {STRIPE_COLORS.map((fill, i) => (
              <rect
                key={fill}
                data-hero-band=""
                fill={fill}
                height={STRIPE.band + 0.2 /* overlap so no hairline gap shows between bands */}
                width={VIEW_W * 1.6}
                x={STRIPE.cx - VIEW_W * 0.8}
                y={top + i * STRIPE.band}
              />
            ))}
          </g>
        </g>
      </svg>
    </span>
  );
}
