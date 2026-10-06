// Thin-stroke arrows, drawn to sit with small uppercase labels.
type IconProps = { className?: string };

export function ArrowUpRightIcon({ className }: IconProps) {
  return (
    <svg aria-hidden className={className} fill="none" viewBox="0 0 10 10">
      <path d="M1 9L9 1M9 1H3M9 1V7" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg aria-hidden className={className} fill="none" viewBox="0 0 13 10">
      <path d="M0 5H12M12 5L8 1M12 5L8 9" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function ArrowDownIcon({ className }: IconProps) {
  return (
    <svg aria-hidden className={className} fill="none" viewBox="0 0 10 13">
      <path d="M5 0V12M5 12L1 8M5 12L9 8" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
