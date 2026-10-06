import { MOTION_QUERIES, gsap, useGSAP } from "@zo-stack/ui/lib/gsap";

/**
 * Builds a GSAP scene scoped to `scope`. The scene is reverted on unmount, and when
 * `dependencies` change it is reverted before `build` runs again, so two copies never overlap.
 *
 * Reduced motion is decided inside `gsap.matchMedia`, which never touches render, so SSR and
 * hydration always agree. Don't branch JSX on `useReducedMotion` for a GSAP scene; branch
 * inside `build` instead (e.g. snap to the final state when `reduce` is true).
 *
 * Target scene-specific attributes (`[data-gsap]`, `[data-hero-*]`), never `[data-reveal]`:
 * Motion's `Reveal`, `Stagger` and `SplitReveal` render that marker too, and two libraries
 * animating one node fight. Put `data-reveal` on GSAP nodes only for the <noscript> un-hide.
 * @example
 * ```tsx
 * useGsapScene(ref, ({ reduce }) => {
 *   if (reduce) return void gsap.set("[data-gsap]", { autoAlpha: 1 });
 *   gsap.from("[data-gsap]", { autoAlpha: 0, y: 24, ease: EASE.house });
 * });
 * ```
 */
export function useGsapScene(
  scope: React.RefObject<HTMLElement | null>,
  build: (ctx: { reduce: boolean }) => void,
  dependencies: unknown[] = []
): void {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERIES, (context) => build({ reduce: Boolean(context.conditions?.reduce) }));
      return () => mm.revert();
    },
    { scope, dependencies, revertOnUpdate: true }
  );
}
