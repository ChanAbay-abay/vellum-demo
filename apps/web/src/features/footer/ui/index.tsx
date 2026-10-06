import { Link } from "@tanstack/react-router";
import { m } from "motion/react";

import { GrainCanvas } from "@zo-stack/ui/components/grain-canvas";
import { Stagger, StaggerItem } from "@zo-stack/ui/components/stagger";
import { cn } from "@zo-stack/ui/lib/utils";

import { ActionLink } from "@/shared/ui/action-link";
import { ArrowUpRightIcon } from "@/shared/ui/icons";
import { Emblem } from "@/shared/ui/logo";

import { siteConfig } from "@/config/site.config";

const LINK =
  "text-caption uppercase tracking-[0.1em] text-white/50 transition-colors duration-300 hover:text-white";

const SOCIAL_LABELS = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  youtube: "YouTube"
} as const;

const { address } = siteConfig.contact;
const MAPS_HREF = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${siteConfig.name}, ${address.street}, ${address.city}`)}`;

export function Footer({ className }: { className?: string }) {
  const socials = (Object.keys(SOCIAL_LABELS) as Array<keyof typeof SOCIAL_LABELS>).filter(
    (key) => siteConfig.socials[key]
  );

  return (
    <footer className={cn("bg-ink relative isolate overflow-hidden text-white", className)}>
      <GrainCanvas className="-z-10" />

      <div className="flex flex-col items-center gap-[3.5rem] px-(--gutter) pt-[8rem] pb-[6rem]">
        <Emblem className="size-[4.5rem] text-white/60" />
        <ActionLink
          action={{ label: "Keep in touch" }}
          className="group flex items-center gap-[1.5rem]"
        >
          <span className="font-display text-heading md:text-display uppercase transition-colors duration-300 group-hover:text-white/70">
            Keep in touch
          </span>
          <ArrowUpRightIcon className="size-[1.5rem] transition-transform duration-300 group-hover:translate-x-[3px] group-hover:-translate-y-[3px]" />
        </ActionLink>
      </div>

      <m.div
        aria-hidden
        className="mx-[2rem] h-px origin-center bg-white/10"
        initial={{ scaleX: 0 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true }}
        whileInView={{ scaleX: 1 }}
      />

      <Stagger
        className="grid grid-cols-2 gap-[2rem] px-[2rem] py-[4rem] md:grid-cols-4"
        interval={0.08}
      >
        <FooterColumn title="Discover">
          <li>
            <Link className={LINK} hash="collection" to="/">
              Collection
            </Link>
          </li>
          <li>
            <Link className={LINK} hash="studio" to="/">
              Our studio
            </Link>
          </li>
          <li>
            <Link className={LINK} hash="journal" to="/">
              Journal
            </Link>
          </li>
        </FooterColumn>

        <FooterColumn title="Visit">
          <li>
            <a className={LINK} href={MAPS_HREF} rel="noopener noreferrer" target="_blank">
              {address.street}, {address.city}
            </a>
          </li>
          <li className="text-caption tracking-[0.1em] text-white/50 uppercase">
            {siteConfig.contact.hoursLabel}
          </li>
        </FooterColumn>

        <FooterColumn title="Legal">
          <li>
            <Link className={LINK} to="/terms-of-service">
              Terms &amp; conditions
            </Link>
          </li>
          <li>
            <Link className={LINK} to="/privacy-policy">
              Privacy notice
            </Link>
          </li>
        </FooterColumn>

        <FooterColumn title="Connect">
          {socials.map((key) => (
            <li key={key}>
              <a
                className={LINK}
                href={siteConfig.socials[key]}
                rel="noopener noreferrer"
                target="_blank"
              >
                {SOCIAL_LABELS[key]}
              </a>
            </li>
          ))}
          <li>
            <a className={LINK} href={`mailto:${siteConfig.contact.email}`}>
              {siteConfig.contact.email}
            </a>
          </li>
          <li>
            <a className={LINK} href={`tel:${siteConfig.contact.phoneE164}`}>
              {siteConfig.contact.phone}
            </a>
          </li>
        </FooterColumn>
      </Stagger>

      <p className="text-caption px-(--gutter) pb-[2rem] text-center tracking-[0.1em] text-white/20 uppercase">
        &copy; {new Date().getFullYear()} {siteConfig.legal.companyName}. All rights reserved.
      </p>
    </footer>
  );
}

function FooterColumn({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <StaggerItem distance={12}>
      <p className="text-caption mb-[2rem] tracking-[0.15em] text-white/40 uppercase">{title}</p>
      <ul className="space-y-[0.75rem]">{children}</ul>
    </StaggerItem>
  );
}
