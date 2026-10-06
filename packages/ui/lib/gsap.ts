import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

/**
 * The single place GSAP and its plugins are registered. Import GSAP from here, never from
 * `gsap` directly, so registration runs exactly once and never during SSR/prerender.
 *
 * The "house" ease is the same curve as the Motion primitives (`[0.16, 1, 0.3, 1]`), so GSAP
 * scenes and Motion micro-interactions share one motion fingerprint.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, CustomEase);
  CustomEase.create("house", "0.16,1,0.3,1");
}

export const EASE = { house: "house", inOut: "power3.inOut" } as const;

/** Seconds */
export const DUR = { fast: 0.4, base: 0.8, slow: 1.4 } as const;

/** Keys for `gsap.matchMedia().add(MOTION_QUERIES, ...)`: read `context.conditions.reduce`. */
export const MOTION_QUERIES = {
  motion: "(prefers-reduced-motion: no-preference)",
  reduce: "(prefers-reduced-motion: reduce)"
} as const;

type RevealSplitOptions = {
  /** Animate whole lines (default) or words. Words are still masked by their line. */
  type?: "lines" | "words";
  tween?: gsap.TweenVars;
};

/**
 * Masked line (or word) rise for headings. `autoSplit` re-splits once webfonts load and on
 * resize, so lines are measured against the real font. Returning the tween from `onSplit`
 * lets SplitText re-run it at the current progress after each re-split.
 *
 * Call it inside `useGsapScene` so the split and tween are reverted with the scene.
 */
export function revealSplit(target: gsap.DOMTarget, opts?: RevealSplitOptions) {
  const byWords = opts?.type === "words";

  return SplitText.create(target, {
    type: byWords ? "lines,words" : "lines",
    mask: "lines",
    autoSplit: true,
    onSplit: (self) =>
      gsap.from(byWords ? self.words : self.lines, {
        yPercent: 110,
        duration: DUR.slow,
        ease: EASE.house,
        stagger: 0.08,
        ...opts?.tween
      })
  });
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
