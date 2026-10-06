import { AnimatePresence, m, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";

import { ActionLink } from "@/shared/ui/action-link";
import { ArrowDownIcon } from "@/shared/ui/icons";

import { HERO } from "@/pages/home/config/home.content";
import { FINISHES, Instrument } from "@/pages/home/ui/instrument";

const VARIANTS = [
  { finish: FINISHES.rose, label: "Rose gold" },
  { finish: FINISHES.steel, label: "Steel" }
] as const;

/**
 * Black hero pinned for 260svh. In the first moments of scrolling the interface
 * fades away; then the centerpiece tilts, comes apart in depth, and pushes toward
 * the camera before the screen washes to gray for the next section.
 * Text uses a CSS entrance (not scroll reveals) so it shows on first paint.
 */
export function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const [variant, setVariant] = useState(0);
  const { scrollYProgress } = useScroll({ offset: ["start start", "end end"], target: ref });

  const chrome = useTransform(scrollYProgress, [0, 0.08], [1, 0]);
  const rotateX = useTransform(scrollYProgress, [0, 0.75], [26, 58]);
  const rotateY = useTransform(scrollYProgress, [0, 0.75], [-32, -58]);
  const rotateZ = useTransform(scrollYProgress, [0, 0.75], [-6, -22]);
  const explode = useTransform(scrollYProgress, [0.06, 0.7], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 0.8], [1, 2.3]);
  const y = useTransform(scrollYProgress, [0, 0.8], ["0%", "8%"]);
  const wash = useTransform(scrollYProgress, [0.78, 0.96], [0, 1]);

  return (
    <section ref={ref} id="top" className="relative h-[260svh] bg-black text-white">
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* Thin ring, larger than the screen */}
        <m.svg
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 size-[128svh] max-w-none -translate-1/2"
          style={{ opacity: chrome }}
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            fill="none"
            r="49.9"
            stroke="white"
            strokeOpacity="0.18"
            strokeWidth="0.08"
          />
        </m.svg>

        <div className="absolute inset-0 grid place-items-center">
          <m.div className="size-[min(86vw,54svh)]" style={{ scale, y }}>
            <AnimatePresence initial={false} mode="popLayout">
              <m.div
                key={variant}
                animate={{ opacity: 1 }}
                className="size-full animate-in duration-[1600ms] zoom-in-90 fade-in"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Instrument
                  className="size-full"
                  explode={explode}
                  finish={VARIANTS[variant]?.finish}
                  rotateX={rotateX}
                  rotateY={rotateY}
                  rotateZ={rotateZ}
                />
              </m.div>
            </AnimatePresence>
          </m.div>
        </div>

        <m.div
          className="absolute inset-0 animate-in duration-1000 fade-in"
          style={{ opacity: chrome }}
        >
          <p className="text-caption absolute top-1/2 left-1/2 flex -translate-1/2 flex-col items-center gap-[0.5rem] uppercase">
            <ArrowDownIcon className="size-[0.625rem]" />
            {HERO.scrollHint}
          </p>

          {/* Finish switcher */}
          <div className="absolute top-1/2 left-[2rem] hidden -translate-y-1/2 gap-[0.5rem] lg:flex">
            {VARIANTS.map((item, index) => (
              <button
                key={item.label}
                aria-label={`Show ${item.label}`}
                aria-pressed={variant === index}
                className="p-[0.25rem]"
                onClick={() => setVariant(index)}
                type="button"
              >
                <span
                  className={`block size-[0.3125rem] rounded-full transition-opacity ${variant === index ? "bg-white" : "bg-white/35"}`}
                />
              </button>
            ))}
          </div>

          <div className="absolute inset-x-0 bottom-0 grid grid-cols-1 items-end gap-[1.5rem] px-(--gutter) pb-[1.875rem] text-center lg:grid-cols-12 lg:text-left">
            <div className="order-2 lg:order-1 lg:col-span-4">
              <h1 className="text-body mx-auto max-w-[21.8125rem] md:max-w-[24.5625rem] lg:mx-0">
                {HERO.intro}
              </h1>
              <ActionLink
                action={HERO.discover}
                className="text-caption mt-[1.5rem] inline-flex items-center gap-[0.5rem] uppercase opacity-40 transition-opacity hover:opacity-100 lg:mt-[2rem]"
              >
                <ArrowDownIcon className="size-[0.625rem]" />
                {HERO.discover.label}
              </ActionLink>
            </div>

            <p className="font-display text-title order-1 hidden uppercase lg:order-2 lg:col-span-4 lg:col-start-5 lg:block lg:text-center">
              {HERO.headline.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>

            {HERO.film.href ? (
              <a
                className="group relative order-3 ml-auto hidden h-[8.875rem] w-[12.1875rem] overflow-hidden border border-white/40 lg:col-span-4 lg:col-start-9 lg:block lg:justify-self-end"
                href={HERO.film.href}
                rel="noopener noreferrer"
                target="_blank"
              >
                <m.div
                  animate={{ rotateY: [-30, 30] }}
                  className="absolute inset-0 grid place-items-center"
                  transition={{
                    duration: 6,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "mirror"
                  }}
                >
                  <Instrument
                    className="size-[6.5rem] opacity-60"
                    finish={FINISHES.rose}
                    rotateX={10}
                    rotateY={0}
                  />
                </m.div>
                <span className="absolute inset-0 grid place-items-center">
                  <svg
                    aria-hidden
                    className="size-[0.75rem] transition-transform group-hover:scale-125"
                    viewBox="0 0 10 12"
                  >
                    <path d="M0 0 L10 6 L0 12 Z" fill="white" />
                  </svg>
                </span>
                <span className="sr-only">{HERO.film.label}</span>
              </a>
            ) : null}
          </div>
        </m.div>

        {/* Wash to gray, handing over to the next section */}
        <m.div
          aria-hidden
          className="bg-paper pointer-events-none absolute inset-0"
          style={{ opacity: wash }}
        />
      </div>
    </section>
  );
}
