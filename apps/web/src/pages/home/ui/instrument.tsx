import { type MotionValue, m, motionValue, useTransform } from "motion/react";
import { useId } from "react";

/**
 * Placeholder centerpiece: a watch-like instrument built from flat SVG layers
 * stacked in real CSS 3D. Tilting the stack shows the case thickness, and
 * `explode` (0 → 1) pulls the layers apart in depth like an exploded render.
 *
 * Replace it with the client's own product (photo, render, or video) per project.
 */

export type Finish = {
  /** Metal gradient: light → mid → dark → light */
  metal: readonly [string, string, string, string];
  /** Dial: center → edge */
  dial: readonly [string, string];
  /** Strap: highlight → base */
  strap: readonly [string, string];
  /** Printing and indices on the dial */
  ink: string;
};

export const FINISHES = {
  rose: {
    dial: ["#a0794f", "#2b1b10"],
    ink: "#f4dcc0",
    metal: ["#f7dcc2", "#c08a5f", "#6a3d25", "#ecbc93"],
    strap: ["#3a3632", "#151413"]
  },
  steel: {
    dial: ["#3f6e64", "#0c1d1a"],
    ink: "#e8eef0",
    metal: ["#f4f7f8", "#a9b1b7", "#4c565e", "#e2e7ea"],
    strap: ["#2c2e30", "#111213"]
  },
  shadow: {
    dial: ["#2a2c2f", "#060607"],
    ink: "#9aa0a6",
    metal: ["#8e959b", "#3a3f44", "#121416", "#666c72"],
    strap: ["#1e1f20", "#0a0a0a"]
  }
} as const satisfies Record<string, Finish>;

type InstrumentProps = {
  finish?: Finish;
  /** Degrees. Pass numbers or scroll-driven MotionValues. */
  rotateX?: number | MotionValue<number>;
  rotateY?: number | MotionValue<number>;
  rotateZ?: number | MotionValue<number>;
  /** 0 = assembled, 1 = fully exploded */
  explode?: MotionValue<number>;
  /** How many hinged panels each strap has (shorter straps fit tighter frames) */
  strapPanels?: number;
  className?: string;
};

// Depth of each layer, in % of the object's width (cqw), assembled and exploded
const DEPTH = {
  bezel: [5, 34],
  caseBack: [-3.2, -16],
  crystal: [4.2, 26],
  dial: [0.6, 4],
  hands: [2.4, 14],
  strap: [-4.5, -22]
} as const;

const CASE_SLICES = 9; // stacked rings that read as the case band when tilted
const STILL = motionValue(0);

export function Instrument({
  className,
  explode,
  finish = FINISHES.rose,
  rotateX = 28,
  rotateY = -34,
  rotateZ = -6,
  strapPanels = STRAP_BENDS.length
}: InstrumentProps) {
  const id = useId().replaceAll(":", "");
  const ids = {
    dial: `${id}-dial`,
    metal: `${id}-metal`,
    metalDark: `${id}-metal-dark`
  };

  return (
    // container-type lets everything inside use cqw units, so depth and perspective scale with the object
    <div className={className} style={{ containerType: "size" }}>
      <div className="size-full" style={{ perspective: "260cqw" }}>
        <m.div
          className="relative size-full"
          style={{ rotateX, rotateY, rotateZ, transformStyle: "preserve-3d" }}
        >
          <svg aria-hidden className="absolute size-0">
            <defs>
              <linearGradient
                gradientUnits="userSpaceOnUse"
                id={ids.metal}
                x1="60"
                x2="340"
                y1="40"
                y2="360"
              >
                {finish.metal.map((color, index) => (
                  <stop key={index} offset={[0, 0.38, 0.66, 1][index]} stopColor={color} />
                ))}
              </linearGradient>
              <linearGradient
                gradientUnits="userSpaceOnUse"
                id={ids.metalDark}
                x1="60"
                x2="340"
                y1="360"
                y2="40"
              >
                <stop offset="0" stopColor={finish.metal[2]} />
                <stop offset="1" stopColor={finish.metal[1]} />
              </linearGradient>
              <radialGradient cx="0.42" cy="0.36" id={ids.dial} r="0.72">
                <stop offset="0" stopColor={finish.dial[0]} />
                <stop offset="1" stopColor={finish.dial[1]} />
              </radialGradient>
            </defs>
          </svg>

          <StrapCurve direction="up" explode={explode} finish={finish} panels={strapPanels} />
          <StrapCurve direction="down" explode={explode} finish={finish} panels={strapPanels} />

          <Layer depth={DEPTH.caseBack} explode={explode}>
            <circle cx="200" cy="200" fill={finish.metal[2]} r="146" />
          </Layer>

          {/* Case band: thin rings stacked in depth, darker toward the back */}
          {Array.from({ length: CASE_SLICES }, (_, slice) => (
            <Layer
              key={slice}
              depth={[-3 + (slice / (CASE_SLICES - 1)) * 3, -14 + (slice / (CASE_SLICES - 1)) * 14]}
              explode={explode}
            >
              <Annulus
                fill={slice === CASE_SLICES - 1 ? `url(#${ids.metal})` : `url(#${ids.metalDark})`}
                inner={136}
                outer={152}
              />
              {slice === CASE_SLICES - 1 ? <Lugs fill={`url(#${ids.metal})`} /> : null}
            </Layer>
          ))}

          <Layer depth={[0, 0]} explode={explode}>
            <Crown fill={`url(#${ids.metal})`} shade={finish.metal[2]} />
          </Layer>

          <Layer depth={DEPTH.dial} explode={explode}>
            <Dial
              dialFill={`url(#${ids.dial})`}
              ink={finish.ink}
              metalFill={`url(#${ids.metal})`}
            />
          </Layer>

          <Layer depth={DEPTH.hands} explode={explode}>
            <Hands ink={finish.ink} metalFill={`url(#${ids.metal})`} />
          </Layer>

          <Layer depth={DEPTH.crystal} explode={explode}>
            <circle cx="200" cy="200" fill="#ffffff" fillOpacity="0.035" r="136" />
            <path
              d="M 92 128 A 128 128 0 0 1 226 74"
              fill="none"
              stroke="#ffffff"
              strokeLinecap="round"
              strokeOpacity="0.22"
              strokeWidth="7"
            />
          </Layer>

          <Layer depth={DEPTH.bezel} explode={explode}>
            <Annulus fill={`url(#${ids.metal})`} inner={136} outer={147} />
          </Layer>
        </m.div>
      </div>
    </div>
  );
}

// Each strap is a chain of short leather panels hinged to one another, every hinge
// bending a little further back, so the strap curls away behind the case in true 3D.
const STRAP_BENDS = [4, 10, 16, 22, 26] as const;

function StrapCurve({
  direction,
  explode,
  finish,
  panels
}: {
  direction: "up" | "down";
  explode?: MotionValue<number>;
  finish: Finish;
  panels: number;
}) {
  const up = direction === "up";
  const fallbackZ = `${DEPTH.strap[0]}cqw`;
  const leather = `linear-gradient(90deg, ${finish.strap[1]}, ${finish.strap[0]} 45%, ${finish.strap[1]})`;

  const renderPanel = (index: number): React.ReactNode => {
    if (index >= panels) return null;
    const isEnd = index === panels - 1;
    return (
      <div
        className="absolute inset-x-0 h-full"
        style={{
          [up ? "bottom" : "top"]: index === 0 ? 0 : "100%",
          background: leather,
          // Rounded tip on the last panel
          borderRadius: isEnd
            ? up
              ? "45% 45% 0 0 / 60% 60% 0 0"
              : "0 0 45% 45% / 0 0 60% 60%"
            : undefined,
          transform: `rotateX(${(up ? 1 : -1) * (STRAP_BENDS[index] ?? 0)}deg)`,
          transformOrigin: up ? "bottom" : "top",
          transformStyle: "preserve-3d"
        }}
      >
        {/* Panels further from the case fall into shadow */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-[inherit] bg-black"
          style={{ opacity: index * 0.11 }}
        />
        {/* Stitching along both edges */}
        <div
          aria-hidden
          className="absolute inset-y-0 right-[6%] left-[6%] border-x border-dashed"
          style={{ borderColor: "rgb(255 255 255 / 0.1)" }}
        />
        {renderPanel(index + 1)}
      </div>
    );
  };

  return (
    <StrapRoot explode={explode} fallbackZ={fallbackZ} up={up}>
      {renderPanel(0)}
    </StrapRoot>
  );
}

function StrapRoot({
  children,
  explode,
  fallbackZ,
  up
}: {
  children: React.ReactNode;
  explode?: MotionValue<number>;
  fallbackZ: string;
  up: boolean;
}) {
  const z = useTransform(
    explode ?? STILL,
    [0, 1],
    [`${DEPTH.strap[0]}cqw`, `${DEPTH.strap[1]}cqw`]
  );
  return (
    <m.div
      className="absolute left-[33%] w-[34%]"
      style={{
        [up ? "bottom" : "top"]: "82%",
        height: "11cqw",
        transformStyle: "preserve-3d",
        z: explode ? z : fallbackZ
      }}
    >
      {children}
    </m.div>
  );
}

function Layer({
  children,
  depth,
  explode
}: {
  children: React.ReactNode;
  depth: readonly [number, number];
  explode?: MotionValue<number>;
}) {
  return explode ? (
    <ExplodingLayer depth={depth} explode={explode}>
      {children}
    </ExplodingLayer>
  ) : (
    <div className="absolute inset-0" style={{ transform: `translateZ(${depth[0]}cqw)` }}>
      <LayerSvg>{children}</LayerSvg>
    </div>
  );
}

function ExplodingLayer({
  children,
  depth,
  explode
}: {
  children: React.ReactNode;
  depth: readonly [number, number];
  explode: MotionValue<number>;
}) {
  const z = useTransform(explode, [0, 1], [`${depth[0]}cqw`, `${depth[1]}cqw`]);
  return (
    <m.div className="absolute inset-0" style={{ z }}>
      <LayerSvg>{children}</LayerSvg>
    </m.div>
  );
}

function LayerSvg({ children }: { children: React.ReactNode }) {
  return (
    <svg aria-hidden className="size-full overflow-visible" viewBox="0 0 400 400">
      {children}
    </svg>
  );
}

function Annulus({ fill, inner, outer }: { fill: string; inner: number; outer: number }) {
  return (
    <path
      d={`M ${200 - outer} 200 a ${outer} ${outer} 0 1 0 ${outer * 2} 0 a ${outer} ${outer} 0 1 0 ${-outer * 2} 0 Z M ${200 - inner} 200 a ${inner} ${inner} 0 1 1 ${inner * 2} 0 a ${inner} ${inner} 0 1 1 ${-inner * 2} 0 Z`}
      fill={fill}
      fillRule="evenodd"
    />
  );
}

function Lugs({ fill }: { fill: string }) {
  return (
    <g fill={fill}>
      <path d="M 120 82 L 132 40 L 158 44 L 156 64 Z" />
      <path d="M 280 82 L 268 40 L 242 44 L 244 64 Z" />
      <path d="M 120 318 L 132 360 L 158 356 L 156 336 Z" />
      <path d="M 280 318 L 268 360 L 242 356 L 244 336 Z" />
    </g>
  );
}

function Crown({ fill, shade }: { fill: string; shade: string }) {
  return (
    <g>
      <rect fill={fill} height="16" width="14" x="350" y="192" />
      <rect fill={fill} height="34" rx="4" width="20" x="362" y="183" />
      {[188, 194, 200, 206, 212].map((y) => (
        <line key={y} stroke={shade} strokeOpacity="0.6" x1="362" x2="382" y1={y} y2={y} />
      ))}
    </g>
  );
}

const HOURS = Array.from({ length: 12 }, (_, hour) => hour);
const MINUTES = Array.from({ length: 60 }, (_, minute) => minute);

function Dial({ dialFill, ink, metalFill }: { dialFill: string; ink: string; metalFill: string }) {
  return (
    <g>
      <circle cx="200" cy="200" fill={dialFill} r="137" />
      {/* Sunburst brushing */}
      {Array.from({ length: 90 }, (_, ray) => (
        <line
          key={ray}
          stroke={ink}
          strokeOpacity="0.035"
          transform={`rotate(${ray * 4} 200 200)`}
          x1="200"
          x2="200"
          y1="200"
          y2="64"
        />
      ))}
      {/* Chapter ring */}
      <circle cx="200" cy="200" fill="none" r="122" stroke={ink} strokeOpacity="0.18" />
      {MINUTES.map((minute) => (
        <line
          key={minute}
          stroke={ink}
          strokeOpacity={minute % 5 === 0 ? 0.85 : 0.4}
          strokeWidth={minute % 5 === 0 ? 1.6 : 0.8}
          transform={`rotate(${minute * 6} 200 200)`}
          x1="200"
          x2="200"
          y1="70"
          y2={minute % 5 === 0 ? 79 : 75}
        />
      ))}
      {/* Applied indices */}
      {HOURS.map((hour) => (
        <rect
          key={hour}
          fill={metalFill}
          height={hour % 3 === 0 ? 30 : 22}
          transform={`rotate(${hour * 30} 200 200)`}
          width={hour % 3 === 0 ? 8 : 5}
          x={hour % 3 === 0 ? 196 : 197.5}
          y="86"
        />
      ))}
      {/* Small seconds */}
      <circle cx="200" cy="270" fill="#000000" fillOpacity="0.28" r="30" />
      <circle cx="200" cy="270" fill="none" r="30" stroke={metalFill} strokeWidth="1.5" />
      {MINUTES.filter((minute) => minute % 5 === 0).map((minute) => (
        <line
          key={minute}
          stroke={ink}
          strokeOpacity="0.6"
          transform={`rotate(${minute * 6} 200 270)`}
          x1="200"
          x2="200"
          y1="243"
          y2="248"
        />
      ))}
      <text
        fill={ink}
        fillOpacity="0.85"
        fontFamily="Tomorrow, sans-serif"
        fontSize="13"
        letterSpacing="3"
        textAnchor="middle"
        x="200"
        y="150"
      >
        ZO
      </text>
    </g>
  );
}

function Hands({ ink, metalFill }: { ink: string; metalFill: string }) {
  return (
    <g>
      {/* Seconds hand sweeps once a minute (off for reduced motion via the global CSS rule) */}
      <g className="origin-[200px_270px] animate-[spin_60s_linear_infinite]">
        <line stroke={ink} strokeWidth="1.4" x1="200" x2="200" y1="276" y2="246" />
      </g>
      <polygon
        fill={metalFill}
        points="200,98 206,200 200,214 194,200"
        transform="rotate(52 200 200)"
      />
      <polygon
        fill={metalFill}
        points="200,134 208,200 200,212 192,200"
        transform="rotate(-58 200 200)"
      />
      <circle cx="200" cy="200" fill={metalFill} r="7" />
      <circle cx="200" cy="200" fill={ink} fillOpacity="0.4" r="2.5" />
    </g>
  );
}
