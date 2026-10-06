import { Link } from "@tanstack/react-router";

import { buttonVariants } from "@/shared/ui/button";
import { ArrowUpRightIcon } from "@/shared/ui/icons";
import { InquireLink } from "@/shared/ui/inquire-link";
import { VellumLockup } from "@/shared/ui/logo";
import { Stripe } from "@/shared/ui/stripe";

import { FOOTER } from "@/config/layout.content";
import { siteConfig } from "@/config/site.config";

const { address, email, hoursLabel } = siteConfig.contact;

/** Only socials with a confirmed URL render: TikTok and Strava are empty until the client sends them. */
const SOCIAL_LINKS = [
  { label: "Instagram", href: siteConfig.socials.instagram },
  { label: "Facebook", href: siteConfig.socials.facebook },
  { label: "TikTok", href: siteConfig.socials.tiktok },
  { label: "Strava", href: siteConfig.socials.strava }
].filter((social) => social.href);

const LINK =
  "text-body w-fit hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/** Ink footer (PRD "Footer"). The thin 3-band stripe on its top edge is the one accent. */
export function SiteFooter() {
  return (
    <footer className="bg-ink text-paper">
      <Stripe angle={0} bandHeight="0.25rem" className="w-full" />
      <div className="px-(--gutter) pt-[5rem] pb-[2rem] lg:pt-[7rem]">
        <div className="grid gap-[3.5rem] lg:grid-cols-12 lg:gap-x-[1.5rem]">
          <div className="lg:col-span-5">
            <Link
              aria-label={`${siteConfig.name}, home`}
              className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              to="/"
            >
              <VellumLockup className="w-[16rem] lg:w-[24rem]" tone="white" />
            </Link>
            <p className="lg:text-heading mt-[2rem] text-[2rem] leading-[1.05] font-medium tracking-[-0.02em]">
              {FOOTER.tagline} <span className="text-muted-on-dark">{FOOTER.established}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-[1.5rem] gap-y-[3rem] lg:col-span-7 lg:grid-cols-3">
            <nav aria-label="Footer" className="flex flex-col gap-[0.75rem]">
              <h2 className="text-label text-muted-on-dark mb-[0.5rem]">Explore</h2>
              {FOOTER.links.map((link) => (
                <Link className={LINK} key={link.to} to={link.to}>
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex flex-col gap-[0.75rem]">
              <h2 className="text-label text-muted-on-dark mb-[0.5rem]">Visit</h2>
              <address className="text-body flex flex-col not-italic">
                <span>{address.street}</span>
                <span>
                  {address.city} {address.postalCode}
                </span>
              </address>
              <p className="text-body text-muted-on-dark">{hoursLabel}</p>
            </div>

            <div className="col-span-2 flex flex-col gap-[0.75rem] lg:col-span-1">
              <h2 className="text-label text-muted-on-dark mb-[0.5rem]">Contact</h2>
              <a className={LINK} href={`mailto:${email}`}>
                {email}
              </a>
              <InquireLink
                className={buttonVariants({
                  variant: "link",
                  className: "w-fit text-body normal-case tracking-normal"
                })}
              >
                {FOOTER.inquire.label}
              </InquireLink>
              <ul className="mt-[0.5rem] flex flex-wrap gap-x-[1.5rem] gap-y-[0.75rem]">
                {SOCIAL_LINKS.map((social) => (
                  <li key={social.label}>
                    <a
                      className={`${LINK} inline-flex items-center gap-[0.4rem]`}
                      href={social.href}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {social.label}
                      <ArrowUpRightIcon className="w-[0.6rem]" />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-[5rem] flex flex-wrap items-center justify-between gap-x-[2rem] gap-y-[0.75rem] lg:mt-[7rem]">
          <p className="text-caption text-muted-on-dark">
            © {new Date().getFullYear()} {siteConfig.legal.companyName}
          </p>
          <a
            className="text-muted-on-dark hover:text-paper text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href={FOOTER.credit.href}
          >
            {FOOTER.credit.label}
          </a>
        </div>
      </div>
    </footer>
  );
}
