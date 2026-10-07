import { Link } from "@tanstack/react-router";
import { useLenis } from "lenis/react";
import { Menu as MenuIcon, X } from "lucide-react";
import { useEffect } from "react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger
} from "@zo-stack/ui/components/sheet";
import { cn } from "@zo-stack/ui/lib/utils";

import { buttonVariants } from "@/shared/ui/button";
import { InquireLink } from "@/shared/ui/inquire-link";
import { VellumLockup } from "@/shared/ui/logo";

import { NAV_TRIGGER } from "@/features/site-nav/ui/nav-trigger";

import { NAV } from "@/config/layout.content";
import { siteConfig } from "@/config/site.config";

const SOCIAL_LINKS = [
  { label: "Instagram", href: siteConfig.socials.instagram },
  { label: "Facebook", href: siteConfig.socials.facebook }
].filter((social) => social.href);

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring";

/**
 * Phone-only staggered rise for the overlay's rows. CSS, not Motion: it is a mount-time reveal
 * (Radix mounts the content on open) and DESIGN.md §5 runs the nav on CSS. Desktop keeps the
 * plain sheet slide, and reduced motion gets the rows in place with no animation.
 */
const REVEAL =
  "max-md:motion-safe:animate-in max-md:motion-safe:fade-in max-md:motion-safe:slide-in-from-bottom-6 max-md:motion-safe:fill-mode-both max-md:motion-safe:duration-500 max-md:motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]";
/** One delay per row, listed in full so Tailwind can see every class */
const DELAYS = [
  "max-md:delay-[120ms]",
  "max-md:delay-[190ms]",
  "max-md:delay-[260ms]",
  "max-md:delay-[330ms]"
] as const;

/**
 * "Menu ≡": a full-screen ink overlay (Radix Dialog via the Sheet primitive: focus trap,
 * Esc, focus return to the trigger, scroll lock). Its top row sits exactly where the pill
 * is, so opening it reads as the pill turning dark. Links get a red underline that sweeps in
 * from the left on hover/focus and out to the right on leave; the active page keeps it.
 * `data-lenis-prevent` stops Lenis scrolling the page underneath on wheel, and Lenis is stopped
 * outright while the overlay is open. Phones: 44px tap targets, safe-area insets top and bottom,
 * rows rise in one after another (REVEAL).
 */
export function SiteMenu({
  open,
  onOpenChange
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const close = () => onOpenChange(false);
  // Null under reduced motion (GsapSmoothScroll doesn't mount Lenis); native scroll is then locked by the Dialog alone.
  const lenis = useLenis();

  useEffect(() => {
    if (!open || !lenis) return;
    lenis.stop();
    return () => lenis.start();
  }, [open, lenis]);

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetTrigger className={NAV_TRIGGER}>
        {NAV.menu.label}
        <MenuIcon aria-hidden className="size-[1.1rem]" strokeWidth={1.5} />
      </SheetTrigger>
      <SheetContent
        aria-describedby={undefined}
        className="bg-ink text-paper gap-0 border-0 data-[side=top]:h-dvh data-[side=top]:border-b-0 max-md:overflow-y-auto max-md:motion-reduce:animate-none!"
        data-lenis-prevent=""
        showCloseButton={false}
        side="top"
      >
        <SheetTitle className="sr-only">{NAV.menu.label}</SheetTitle>

        <div className="mx-4 mt-4 flex h-[4rem] shrink-0 items-center justify-between pr-[1.25rem] pl-[1.5rem] max-md:mt-[max(1rem,env(safe-area-inset-top))] lg:mx-auto lg:w-[calc(100%-2rem)] lg:max-w-[1440px] lg:pr-[1.75rem] lg:pl-[2rem]">
          <Link
            aria-label="Vellum Cycles home"
            className={cn(
              "rounded-sm max-md:inline-flex max-md:min-h-11 max-md:items-center",
              FOCUS
            )}
            onClick={close}
            to="/"
          >
            <VellumLockup className="w-[7.5rem] lg:w-[9.25rem]" tone="white" />
          </Link>
          <SheetClose className={NAV_TRIGGER}>
            {NAV.menu.closeLabel}
            <X aria-hidden className="size-[1.1rem]" strokeWidth={1.5} />
          </SheetClose>
        </div>

        <nav
          aria-label="Menu"
          className="flex flex-1 flex-col justify-center px-(--gutter) lg:px-[4rem]"
        >
          <ul className="flex flex-col gap-[0.5rem]">
            {NAV.menu.links.map((link, i) => (
              <li key={link.to} className={cn(REVEAL, DELAYS[i])}>
                <Link
                  className={cn(
                    "font-display lg:text-display relative inline-block text-[3.5rem] leading-[1] font-semibold tracking-[-0.04em] uppercase",
                    "after:bg-stripe-red after:absolute after:inset-x-0 after:-bottom-[0.1em] after:h-[0.06em] after:origin-right after:scale-x-0 after:transition-transform after:duration-500 after:ease-[cubic-bezier(0.22,1,0.36,1)] after:content-[''] motion-reduce:after:transition-none",
                    "hover:after:origin-left hover:after:scale-x-100 focus-visible:after:origin-left focus-visible:after:scale-x-100 data-[status=active]:after:scale-x-100",
                    FOCUS
                  )}
                  onClick={close}
                  to={link.to}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div
          className={cn(
            "flex flex-col-reverse gap-[2rem] px-(--gutter) pb-[2.5rem] max-md:gap-[1rem] max-md:pb-[calc(2.5rem+env(safe-area-inset-bottom))] lg:flex-row lg:items-end lg:justify-between lg:px-[4rem] lg:pb-[3rem]",
            REVEAL,
            DELAYS[NAV.menu.links.length]
          )}
        >
          <ul className="flex gap-[2rem]">
            {SOCIAL_LINKS.map((social) => (
              <li key={social.label}>
                <a
                  className={cn(
                    "text-label text-muted-on-dark hover:text-paper transition-colors max-md:inline-flex max-md:min-h-11 max-md:items-center",
                    FOCUS
                  )}
                  href={social.href}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {social.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
          <InquireLink className={buttonVariants({ variant: "inverse", className: "w-fit" })}>
            {NAV.inquire.label}
          </InquireLink>
        </div>
      </SheetContent>
    </Sheet>
  );
}
