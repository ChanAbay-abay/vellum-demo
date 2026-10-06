import { cn } from "@zo-stack/ui/lib/utils";

/**
 * Button skins (DESIGN.md §8): square, `h-[3rem] px-[1.75rem]`, `text-label`.
 * Hover slides a fill in from the left; focus is the orange ring on every ground.
 * One primary per section.
 *
 * - `default`: ink, for light grounds (paper, bone, sand)
 * - `inverse`: paper, for dark grounds (ink, graphite)
 * - `link`: text with an underline that draws in from the left
 *
 * Use `buttonVariants()` on a router `<Link>` or `<InquireLink>`; `<Button>` is the
 * native `<button>` (menu toggles, colorway swatches).
 */
const BASE = [
  "group/button relative isolate inline-flex shrink-0 cursor-pointer items-center justify-center gap-[0.75rem] overflow-hidden whitespace-nowrap text-label select-none",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
  "motion-safe:active:scale-[0.98] motion-safe:transition-transform motion-safe:duration-150",
  "aria-disabled:pointer-events-none aria-disabled:opacity-50 disabled:pointer-events-none disabled:opacity-50"
];

// The sliding fill: a ::before behind the label, scaled from the left edge on hover.
const SLIDE =
  "before:absolute before:inset-0 before:-z-10 before:origin-left before:scale-x-0 before:transition-transform before:duration-400 before:ease-[cubic-bezier(0.22,1,0.36,1)] hover:before:scale-x-100";

const VARIANTS = {
  default: cn("bg-ink text-paper before:bg-rule-dark h-[3rem] px-[1.75rem]", SLIDE),
  inverse: cn("bg-paper text-ink before:bg-sand h-[3rem] px-[1.75rem]", SLIDE),
  link: "h-[3rem] px-0 text-current before:absolute before:inset-x-0 before:bottom-[0.75rem] before:h-px before:origin-left before:scale-x-0 before:bg-current before:transition-transform before:duration-400 before:ease-[cubic-bezier(0.22,1,0.36,1)] hover:before:scale-x-100"
} as const;

export type ButtonVariant = keyof typeof VARIANTS;

export function buttonVariants({
  variant = "default",
  className
}: { variant?: ButtonVariant; className?: string } = {}) {
  return cn(BASE, VARIANTS[variant], className);
}

export function Button({
  variant,
  className,
  type = "button",
  ...props
}: React.ComponentProps<"button"> & { variant?: ButtonVariant }) {
  return <button className={buttonVariants({ className, variant })} type={type} {...props} />;
}
