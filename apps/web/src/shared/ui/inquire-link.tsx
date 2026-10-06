import { siteConfig } from "@/config/site.config";

/**
 * Every inquiry on the site is a social deep link (PRD scope rule): Instagram DM first,
 * Messenger as the secondary channel. Opens in a new tab. Style it with `buttonVariants()`.
 *
 * @example <InquireLink className={buttonVariants()}>Check availability</InquireLink>
 * @example <InquireLink channel="messenger" className={buttonVariants({ variant: "link" })}>Messenger</InquireLink>
 */
const CHANNELS = {
  instagram: { href: siteConfig.contact.instagramDm, name: "Instagram" },
  messenger: { href: siteConfig.contact.messenger, name: "Messenger" }
} as const;

export function InquireLink({
  channel = "instagram",
  children,
  className
}: {
  channel?: keyof typeof CHANNELS;
  children: React.ReactNode;
  className?: string;
}) {
  const { href, name } = CHANNELS[channel];

  return (
    <a className={className} href={href} rel="noopener noreferrer" target="_blank">
      {children}
      <span className="sr-only"> (opens {name} in a new tab)</span>
    </a>
  );
}
