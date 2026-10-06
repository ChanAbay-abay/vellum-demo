import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { VellumLockup } from "@/shared/ui/logo";

import { ModelsMenu } from "@/features/site-nav/ui/models-menu";
import { SiteMenu } from "@/features/site-nav/ui/site-menu";

/** Scroll distance before the pill may hide (DESIGN.md §6 "Nav (CHOSEN)") */
const HIDE_AFTER = 80;
/** Ignore jitter smaller than this, in px, so a trackpad's settle doesn't flick the pill */
const MIN_DELTA = 4;

/**
 * Floating pill nav, DESIGN.md §6 "Nav (CHOSEN)": lockup left, "Catalogue ▾" dropdown and the
 * "Menu ≡" full-screen overlay right. The fully rounded pill is the design's one radius
 * exception, and it stays light on every ground.
 *
 * Hides on scroll down past 80px and returns on scroll up. It never hides while one of its
 * menus is open, and it comes back whenever keyboard focus lands inside it.
 * The dropdown and overlay portal to <body>, so the header's transform can't trap them.
 */
export function SiteNav() {
  const [scrolledAway, setScrolledAway] = useState(false);
  const [modelsOpen, setModelsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        if (Math.abs(y - lastY) < MIN_DELTA) return;
        setScrolledAway(y > lastY && y > HIDE_AFTER);
        lastY = y;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const hidden = scrolledAway && !modelsOpen && !menuOpen;

  return (
    <header
      className="fixed inset-x-4 top-4 z-50 mx-auto max-w-[1440px] transition-transform duration-300 ease-out data-[hidden=true]:-translate-y-[calc(100%+2rem)]"
      data-hidden={hidden}
      onFocus={() => setScrolledAway(false)}
    >
      <nav
        aria-label="Primary"
        className="bg-paper/80 text-ink flex h-[4rem] items-center justify-between rounded-full pr-[1.25rem] pl-[1.5rem] backdrop-blur-md lg:pr-[1.75rem] lg:pl-[2rem]"
      >
        <Link
          aria-label="Vellum Cycles home"
          className="relative rounded-sm after:absolute after:inset-x-0 after:-inset-y-[1.25rem] after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          to="/"
        >
          <VellumLockup className="w-[7.5rem] lg:w-[9.25rem]" />
        </Link>
        <div className="flex items-center gap-[1.25rem] lg:gap-[2.5rem]">
          <ModelsMenu onOpenChange={setModelsOpen} open={modelsOpen} />
          <SiteMenu onOpenChange={setMenuOpen} open={menuOpen} />
        </div>
      </nav>
    </header>
  );
}
