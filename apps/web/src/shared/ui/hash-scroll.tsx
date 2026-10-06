import { useRouter } from "@tanstack/react-router";
import { useLenis } from "lenis/react";
import { useEffect } from "react";

/**
 * Scrolls to `#section` after each navigation, including arriving from another
 * page (e.g. /privacy-policy → /#faq). It waits for the new page to render, so
 * the target exists. Lenis's `anchors` option only covers same-page clicks.
 */
export function HashScroll() {
  const router = useRouter();
  const lenis = useLenis();

  useEffect(
    () =>
      router.subscribe("onRendered", ({ toLocation }) => {
        const { hash } = toLocation;
        if (!hash) return;

        // Next frame, so this runs after the router's own scroll reset
        requestAnimationFrame(() => {
          if (lenis) {
            lenis.scrollTo(`#${hash}`);
          } else {
            document.getElementById(hash)?.scrollIntoView();
          }
        });
      }),
    [router, lenis]
  );

  return null;
}
