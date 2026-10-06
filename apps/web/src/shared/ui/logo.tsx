import { cn } from "@zo-stack/ui/lib/utils";

import { siteConfig } from "@/config/site.config";

/** Text wordmark in the display face. Replace with the client's logo SVG. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-display block text-[1.375rem] leading-none tracking-[0.16em] uppercase",
        className
      )}
    >
      {siteConfig.name}
    </span>
  );
}

/** Rosette emblem in the text color. Placeholder for the client's brand mark. */
export function Emblem({ className }: { className?: string }) {
  return (
    <svg aria-hidden className={className} fill="none" viewBox="0 0 72 72">
      {Array.from({ length: 12 }, (_, petal) => (
        <ellipse
          key={petal}
          cx="36"
          cy="22"
          rx="5.5"
          ry="14"
          stroke="currentColor"
          strokeOpacity="0.85"
          strokeWidth="1"
          transform={`rotate(${petal * 30} 36 36)`}
        />
      ))}
      <circle cx="36" cy="36" r="4" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
