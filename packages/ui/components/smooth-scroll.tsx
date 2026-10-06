import { type LenisProps, ReactLenis } from "lenis/react";

/**
 * Smooth scrolling for the whole page (Lenis in root mode). Render it once inside <body>.
 * Lenis turns itself off for people who prefer reduced motion.
 *
 * `anchors: true` smooth-scrolls same-page links like `#features`, honoring each
 * section's `scroll-margin-top`. Read or drive the scroll anywhere with `useLenis()`.
 */
export function SmoothScroll({ options }: { options?: LenisProps["options"] }) {
  return <ReactLenis root options={{ anchors: true, ...options }} />;
}
