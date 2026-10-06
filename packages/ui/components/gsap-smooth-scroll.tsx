import { type LenisProps, type LenisRef, ReactLenis, useLenis } from "lenis/react";
import { useEffect, useRef, useSyncExternalStore } from "react";

import { ScrollTrigger, gsap } from "@zo-stack/ui/lib/gsap";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * Smooth scrolling for the whole page (Lenis in root mode), driven by GSAP's ticker so Lenis
 * and ScrollTrigger read the same frame. Render it once inside <body>, in place of `SmoothScroll`.
 *
 * `autoRaf: false` is spread last so callers can't turn it back on: two rAF loops would
 * advance Lenis twice per frame. The cost is that Lenis only scrolls while something calls
 * `raf`, which is why the ticker hookup and the ScrollTrigger refresher live in this one
 * component. Split them up and a half-mounted pair can freeze the page.
 *
 * Reduced motion: Lenis is not mounted at all (the `lenis` package only makes programmatic
 * scrolls instant for these users, it still smooths the wheel). ScrollTrigger then runs on
 * native scroll, and the ticker hookup is skipped; the refresher below still applies.
 *
 * The refresher re-measures every ScrollTrigger once webfonts and the window have loaded and
 * whenever the body resizes, since trigger positions are resolved at creation time.
 */
export function GsapSmoothScroll({ options }: { options?: LenisProps["options"] }) {
  const lenisRef = useRef<LenisRef>(null);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false
  );

  useLenis(() => ScrollTrigger.update());

  // No Lenis for reduced motion, so no tick: GSAP's rAF loop then sleeps whenever no tween runs.
  useEffect(() => {
    if (reducedMotion) return;
    const tick = (time: number) => lenisRef.current?.lenis?.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
    };
  }, [reducedMotion]);

  useEffect(() => {
    let frame = 0;
    let disposed = false;

    const refresh = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // Re-read the scroll cache first, or refresh() restores a stale position after a route change.
        // At runtime the scroll func is a getter when called with no argument; its typings only
        // declare the setter.
        (ScrollTrigger.getScrollFunc(window) as unknown as () => number)();
        ScrollTrigger.refresh();
      });
    };

    void document.fonts.ready.then(() => {
      if (!disposed) refresh();
    });

    if (document.readyState === "complete") refresh();
    else window.addEventListener("load", refresh, { once: true });

    const observer = new ResizeObserver(refresh);
    observer.observe(document.body);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("load", refresh);
      observer.disconnect();
    };
  }, []);

  if (reducedMotion) return null;
  return <ReactLenis root ref={lenisRef} options={{ anchors: true, ...options, autoRaf: false }} />;
}
