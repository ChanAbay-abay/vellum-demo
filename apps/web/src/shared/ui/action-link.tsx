import { Link } from "@tanstack/react-router";

import { PRIMARY_CONTACT_HREF } from "@/config/site.config";

type Action = { hash?: string; label: string };

/**
 * A config-driven call to action. With a `hash` it scrolls to that home page section,
 * otherwise it opens the main contact channel (Messenger, or email as a fallback).
 * Use inside <Button asChild>.
 */
export function ActionLink({
  action,
  children,
  className
}: {
  action: Action;
  children?: React.ReactNode;
  className?: string;
}) {
  const content = children ?? action.label;

  if (action.hash) {
    return (
      <Link className={className} hash={action.hash} to="/">
        {content}
      </Link>
    );
  }

  return (
    <a className={className} href={PRIMARY_CONTACT_HREF} rel="noopener noreferrer" target="_blank">
      {content}
    </a>
  );
}
