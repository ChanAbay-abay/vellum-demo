import { useRef } from "react";

import { useGsapScene } from "@zo-stack/ui/hooks/use-gsap-scene.hook";
import { gsap } from "@zo-stack/ui/lib/gsap";
import { cn } from "@zo-stack/ui/lib/utils";

import { WARRANTY } from "@/config/warranty.content";

const { badge } = WARRANTY;

/** Badge geometry, in 400×400 units around the seal's centre (200, 200). */
const C = 200;
const RING_R = 176;
const RING = `M${C},${C} m-${RING_R},0 a${RING_R},${RING_R} 0 1,1 ${RING_R * 2},0 a${RING_R},${RING_R} 0 1,1 -${RING_R * 2},0`;
/** Crop to the seal's outer edge (its glyph tops sit at r ≈ 186), so the box edge is the seal edge. */
const VIEWBOX = "14 14 372 372";
/**
 * The seal text runs twice around the ring. Its natural length at 13px with 2.9 tracking is
 * 607.5 units for 62 characters (measured with `getComputedTextLength`), so the tracking is set
 * to make two runs fill the circumference exactly. Chromium ignores `textLength` on <textPath>.
 */
const SEAL_TRACKING = 2.9 - (607.5 - Math.PI * RING_R) / 62;

/**
 * The "5" is Jost 600 at font-size 1000 (ink box x 38.6–579.7, y -700–12.1, measured with
 * canvas `measureText`), slanted like the logo and scaled to 178 units tall, its baseline origin
 * at the group's (0, 0). YEARS sits at the 5's lower right, inside the seal.
 */
const FIVE = "skewX(-12) scale(0.25)";
const YEARS_AT = "translate(158 -26) skewX(-12)";
/**
 * Moves the 5 + YEARS group so its ink centre sits on the seal's centre. Ink bounds of the group
 * in its own space: x 9.0–252.3 (the 5's slanted tail to the end of YEARS, from the glyph
 * metrics above and YEARS' measured 90.7-unit length), y -175–3, so the centre is (130.7, -86).
 * Then an optical nudge of (-2, +2): the slanted top bar and YEARS put the mass up and to the
 * right of the box centre, so the box goes slightly left and down.
 */
const GROUP = `translate(${C - 130.7 - 2} ${C + 86 + 2})`;
/** The echo's resting offset (≈14px at 1440) and where it starts on enter. */
const ECHO_REST = 14;
const ECHO_START = 40;
/** Stripe fill: three bands repeating every 712 font units (the glyph's height), slanted -18deg. */
const BAND_PERIOD = 712;
/** How far the bands slide across the section: half a band, so the move stays subtle. */
const BAND_SLIDE = BAND_PERIOD / 6;
const gradientAt = (shift: number) => `rotate(-18 290 -344) translate(0 ${shift})`;

/**
 * The warranty badge, one closed circular unit: the striped, slanted "5" with "YEARS / on every
 * frame" at its lower right, a thin ink outline of the same 5 offset behind it, and a seal of
 * text running around them. One SVG, so the layers compose as one mark and scale together.
 * Decorative (`aria-hidden`): the section heading and terms say all of it.
 *
 * Motion (GSAP, one scene): on enter, the 5 wipes in left to right (a clip rect in the glyph's
 * own slanted space) while the outline echo drifts into its resting offset. Scrubbed across the
 * section: the seal turns ~105deg, and once the wipe is done the stripe bands slide by half a
 * band inside the 5 (the fill repeats every three bands, so the edges stay seamless). Reduced
 * motion: nothing runs; the markup is the settled state. No-JS: same, since GSAP sets the start
 * states. SVG ids are fixed: the warranty renders once per page.
 */
export function WarrantyBadge({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGsapScene(ref, ({ reduce }) => {
    if (reduce) return;
    const section = ref.current?.closest("section");

    gsap
      .timeline({ scrollTrigger: { trigger: ref.current, start: "top 75%", once: true } })
      .fromTo(
        "[data-badge-wipe]",
        { attr: { width: 0 } },
        { attr: { width: 1 }, duration: 0.9, ease: "power3.out" },
        0
      )
      .fromTo(
        "[data-badge-echo]",
        { x: ECHO_START, y: ECHO_START, opacity: 0 },
        { x: ECHO_REST, y: ECHO_REST, opacity: 1, duration: 1.2, ease: "power3.out" },
        0
      );

    gsap
      .timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 0.6 }
      })
      .fromTo(
        "[data-badge-seal]",
        { rotation: 0 },
        { rotation: 105, svgOrigin: `${C} ${C}`, duration: 1 },
        0
      )
      .fromTo(
        "[data-badge-gradient]",
        { attr: { gradientTransform: gradientAt(0) } },
        { attr: { gradientTransform: gradientAt(BAND_SLIDE) }, duration: 0.6 },
        0.4
      );
  });

  return (
    <div
      aria-hidden
      className={cn("aspect-square", className)}
      data-testid="warranty-badge"
      ref={ref}
    >
      <svg className="block size-full overflow-visible" viewBox={VIEWBOX}>
        <defs>
          <path d={RING} id="warranty-seal-path" />
          <linearGradient
            data-badge-gradient=""
            gradientTransform={gradientAt(0)}
            gradientUnits="userSpaceOnUse"
            id="warranty-five-fill"
            spreadMethod="repeat"
            x1="0"
            x2="0"
            y1="-700"
            y2={-700 + BAND_PERIOD}
          >
            <stop offset="0" stopColor="var(--stripe-orange)" />
            <stop offset="0.3334" stopColor="var(--stripe-orange)" />
            <stop offset="0.3334" stopColor="var(--stripe-red)" />
            <stop offset="0.6667" stopColor="var(--stripe-red)" />
            <stop offset="0.6667" stopColor="var(--stripe-burgundy)" />
            <stop offset="1" stopColor="var(--stripe-burgundy)" />
          </linearGradient>
          <clipPath clipPathUnits="objectBoundingBox" id="warranty-five-wipe">
            <rect data-badge-wipe="" height="1.2" width="1" x="0" y="-0.1" />
          </clipPath>
        </defs>

        {/* The seal's geometry, unpainted: what layout checks measure the ring centre from. */}
        <circle cx={C} cy={C} data-testid="seal-ring" fill="none" r={RING_R} />

        <g data-badge-seal="" data-testid="warranty-seal">
          <text
            className="font-sans"
            fill="var(--ink)"
            fillOpacity="0.55"
            fontSize="13"
            fontWeight="500"
            letterSpacing={SEAL_TRACKING}
          >
            <textPath href="#warranty-seal-path">{badge.seal.toUpperCase().repeat(2)}</textPath>
          </text>
        </g>

        <g data-testid="warranty-group" transform={GROUP}>
          {/* Outline echo, behind the filled 5 */}
          <g data-badge-echo="" transform={`translate(${ECHO_REST} ${ECHO_REST})`}>
            <g transform={FIVE}>
              <text
                className="font-display"
                fill="none"
                fontSize="1000"
                fontWeight="600"
                stroke="var(--ink)"
                strokeOpacity="0.7"
                strokeWidth="1.25"
                vectorEffect="non-scaling-stroke"
              >
                {badge.numeral}
              </text>
            </g>
          </g>

          <g data-testid="warranty-numeral" transform={FIVE}>
            <text
              className="font-display"
              clipPath="url(#warranty-five-wipe)"
              fill="url(#warranty-five-fill)"
              fontSize="1000"
              fontWeight="600"
            >
              {badge.numeral}
            </text>
          </g>

          <g data-testid="warranty-years" transform={YEARS_AT}>
            <text
              className="font-display"
              fill="var(--ink)"
              fontSize="24"
              fontWeight="600"
              letterSpacing="3"
            >
              {badge.unit.toUpperCase()}
            </text>
            <text className="font-sans" fill="var(--muted-foreground)" fontSize="13" y="22">
              {badge.line}
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}
