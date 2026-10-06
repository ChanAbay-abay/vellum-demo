import { Link } from "@tanstack/react-router";

import { ActionLink } from "@/shared/ui/action-link";
import { ArrowUpRightIcon } from "@/shared/ui/icons";
import { Wordmark } from "@/shared/ui/logo";

import { NAV_CTA, NAV_LEFT, NAV_RIGHT } from "@/features/navbar/config/nav-links.config";
import { MobileNav } from "@/features/navbar/ui/mobile-nav";

const LINK =
  "text-caption font-semibold tracking-[0.1em] uppercase opacity-70 transition-opacity duration-300 hover:opacity-100";

/**
 * Fixed, transparent header. `mix-blend-difference` keeps the white text readable
 * on both the black and the gray sections without any scroll logic.
 */
export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 grid grid-cols-[1fr_auto_1fr] items-center px-[2rem] py-[1.5rem] text-white mix-blend-difference max-lg:px-(--gutter)">
      <nav aria-label="Primary" className="hidden items-center gap-[2.5rem] lg:flex">
        {NAV_LEFT.map((link) => (
          <Link key={link.hash} className={LINK} hash={link.hash} to="/">
            {link.label}
          </Link>
        ))}
      </nav>

      <Link aria-label="Home" className="col-start-2" to="/">
        <Wordmark />
      </Link>

      <div className="col-start-3 flex items-center justify-end gap-[2.5rem]">
        {NAV_RIGHT.map((link) => (
          <Link key={link.hash} className={`${LINK} hidden lg:block`} hash={link.hash} to="/">
            {link.label}
          </Link>
        ))}
        <ActionLink
          action={NAV_CTA}
          className="group text-caption hidden items-center gap-[0.35rem] font-semibold tracking-[0.1em] uppercase transition-all duration-300 hover:gap-[0.5rem] lg:inline-flex"
        >
          {NAV_CTA.label}
          <ArrowUpRightIcon className="mt-px size-[0.625rem] transition-transform duration-300 group-hover:translate-x-[2px] group-hover:-translate-y-[2px]" />
        </ActionLink>
        <MobileNav />
      </div>
    </header>
  );
}
