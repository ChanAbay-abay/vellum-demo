import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { Portal } from "@zo-stack/ui/components/portal";

import { ActionLink } from "@/shared/ui/action-link";
import { ArrowUpRightIcon } from "@/shared/ui/icons";

import { NAV_CTA, NAV_LEFT, NAV_RIGHT } from "@/features/navbar/config/nav-links.config";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="lg:hidden">
      <button
        aria-controls="mobile-menu"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="grid size-[1.5rem] grid-cols-2 place-items-center p-[0.25rem]"
        onClick={() => setOpen(!open)}
        type="button"
      >
        {Array.from({ length: 4 }, (_, dot) => (
          <span key={dot} className="size-[0.25rem] rounded-full bg-current" />
        ))}
      </button>
      {open && (
        // data-lenis-prevent lets the menu scroll natively while smooth scrolling is on
        <Portal className="bg-[#141414] text-white" data-lenis-prevent id="mobile-menu">
          <div className="flex size-full animate-in flex-col px-(--gutter) pt-[6rem] pb-[2rem] duration-300 fade-in">
            <nav aria-label="Mobile" className="flex flex-col">
              {[...NAV_LEFT, ...NAV_RIGHT].map((link) => (
                <Link
                  key={link.hash}
                  className="font-display text-heading border-b border-white/10 py-[1.25rem] uppercase"
                  hash={link.hash}
                  onClick={close}
                  to="/"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <ActionLink
              action={NAV_CTA}
              className="text-caption mt-auto inline-flex items-center gap-[0.5rem] font-semibold tracking-[0.1em] uppercase"
            >
              {NAV_CTA.label}
              <ArrowUpRightIcon className="size-[0.625rem]" />
            </ActionLink>
          </div>
        </Portal>
      )}
    </div>
  );
}
