import { useEffect, useState } from "react";

import { cn } from "@zo-stack/ui/lib/utils";

import { ArrowDownIcon } from "@/shared/ui/icons";

import { SUMMARY_ID } from "@/widgets/model-page/ui/model-hero";

/**
 * True until the summary (`#summary`) is three quarters of the way up the viewport. Shared by
 * the fixed jump pill and the tour's control bar so both hide at the same moment.
 *
 * Reads the summary's position in a rAF-gated passive scroll listener rather than an
 * IntersectionObserver, which can miss a programmatic jump that never crosses a threshold
 * (RULES §8).
 */
export function useBeforeSummary() {
  const [before, setBefore] = useState(true);

  useEffect(() => {
    const summary = document.getElementById(SUMMARY_ID);
    if (!summary) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      setBefore(summary.getBoundingClientRect().top > window.innerHeight * 0.75);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return before;
}

/**
 * Fixed "Jump to summary" pill for pages with a hero, shown from the hero through the scroll
 * tour and hidden once the summary is in view. It is a plain `#summary` anchor: Lenis
 * (`anchors: true`) smooth-scrolls it, and with no JS or reduced motion (no Lenis) the browser
 * jumps natively. Hidden means out of the tab order and the accessibility tree too.
 */
export function JumpToSummary({ label }: { label: string }) {
  const visible = useBeforeSummary();

  return (
    <a
      aria-hidden={!visible}
      className={cn(
        "bg-ink/90 text-paper text-label fixed bottom-[1.5rem] left-1/2 z-40 flex h-[2.75rem] -translate-x-1/2 items-center gap-[0.75rem] rounded-full px-[1.5rem] backdrop-blur-md transition-[opacity,translate] duration-300 ease-out",
        "hover:bg-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        !visible && "pointer-events-none translate-y-[1rem] opacity-0"
      )}
      data-testid="jump-to-summary"
      href={`#${SUMMARY_ID}`}
      tabIndex={visible ? undefined : -1}
    >
      {label}
      <ArrowDownIcon className="w-[0.6rem]" />
    </a>
  );
}
