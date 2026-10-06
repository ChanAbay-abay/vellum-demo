import { Link, type LinkProps } from "@tanstack/react-router";
import { useRef } from "react";

import { Picture, type ResponsiveImage } from "@zo-stack/ui/components/picture";
import { useGsapScene } from "@zo-stack/ui/hooks/use-gsap-scene.hook";
import { gsap } from "@zo-stack/ui/lib/gsap";
import { cn } from "@zo-stack/ui/lib/utils";

import { BikeIcon } from "@/shared/ui/bike-icon";
import { buttonVariants } from "@/shared/ui/button";
import { ArrowRightIcon, ArrowUpRightIcon } from "@/shared/ui/icons";
import { InquireLink } from "@/shared/ui/inquire-link";
import { Stripe } from "@/shared/ui/stripe";

/**
 * A CTA action: a social deep link (`channel`, opened through `InquireLink`, Instagram DM by
 * default) or an internal route (`to`, optionally with a `hash`, rendered as a router `<Link>`).
 */
/** One stripe band's height. The trail bike is h-[1.35vw]: three bands, the whole stripe. */
const BAND = "0.45vw";

export type ClosingCtaAction =
  | { label: string; channel?: "instagram" | "messenger" }
  | { label: string; to: LinkProps["to"]; hash?: string };

export type ClosingCtaProps = {
  heading: string;
  body?: string;
  /** Full-bleed photo under an ink gradient. Without it the block is the same, on ink. */
  image?: { image: ResponsiveImage; alt: string };
  primary: ClosingCtaAction;
  secondary?: ClosingCtaAction;
  /**
   * Which side the copy sits on. Default left. Right mirrors the whole lockup: heading, body and
   * actions flush to the right gutter (secondary to the left of the primary), the stripe anchored
   * at the right and drawing right to left with the bike facing left at its leading edge.
   */
  align?: "left" | "right";
};

/**
 * The page's closing moment: a full-bleed block, about 90svh, meant to sit straight on the
 * footer stripe. Presentational; every word and image comes from props.
 *
 * With `image` the photo fills the block under an ink gradient and scrubs from 1.1 to 1.0 as
 * the block scrolls in; without it the block is plain ink. The heading is set at the page's
 * largest display size, slanted like the model names, with the Retro stripe under it as the
 * trail of a line bike riding at its end. On enter the heading and copy rise in, then the
 * stripe draws left to right with the bike riding its leading edge. The primary action is the paper (inverse) button, the
 * secondary a quieter text link. Hovering the primary nudges the photo to 1.04 (CSS on the
 * <img>; GSAP owns the wrapper's scale, so the two never share a node). Reduced motion: static.
 */
export function ClosingCta({
  heading,
  body,
  image,
  primary,
  secondary,
  align = "left"
}: ClosingCtaProps) {
  const ref = useRef<HTMLElement>(null);
  const right = align === "right";

  useGsapScene(
    ref,
    ({ reduce }) => {
      if (reduce) return;
      if (image) {
        gsap.fromTo(
          "[data-cta-photo]",
          { scale: 1.1 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: ref.current,
              start: "top bottom",
              end: "bottom bottom",
              scrub: 0.6
            }
          }
        );
      }
      const trail = ref.current?.querySelector<HTMLElement>("[data-cta-trail]");
      // The stripe draws from its anchored end while the bike rides its leading edge: at any moment
      // the bike sits (1 - scale) × width from its resting place, i.e. on the stripe's current end.
      const travel = () => (right ? 1 : -1) * (trail?.offsetWidth ?? 0);
      gsap
        .timeline({ scrollTrigger: { trigger: ref.current, start: "top 65%", once: true } })
        .from("[data-cta-rise]", {
          yPercent: 30,
          autoAlpha: 0,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.12
        })
        .fromTo(
          "[data-cta-trail]",
          { scaleX: 0 },
          { scaleX: 1, duration: 1.4, ease: "power2.inOut" },
          0.35
        )
        .fromTo(
          "[data-cta-bike]",
          { x: travel },
          { x: 0, duration: 1.4, ease: "power2.inOut" },
          0.35
        );
    },
    [right]
  );

  const secondaryAction = secondary ? (
    <Action
      action={secondary}
      className={buttonVariants({ variant: "link", className: "text-paper" })}
    />
  ) : null;

  return (
    <section
      aria-labelledby="closing-cta-heading"
      className="group/cta bg-ink text-paper relative isolate flex min-h-[90svh] items-end overflow-hidden"
      data-testid="model-cta"
      ref={ref}
    >
      {image ? (
        <>
          <div className="absolute inset-0 -z-10 will-change-transform" data-cta-photo="">
            <Picture
              alt={image.alt}
              className="absolute inset-0 block size-full"
              image={image.image}
              imgClassName="size-full object-cover object-[50%_60%] transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:[@media(hover:hover)]:group-has-[.cta-primary:hover]/cta:scale-[1.04]"
              sizes="100vw"
            />
          </div>
          {/* Legibility: ink from the bottom corner on the copy's side. */}
          <div
            aria-hidden
            className="from-ink via-ink/70 absolute inset-0 -z-10 bg-linear-to-t to-transparent"
          />
          <div
            aria-hidden
            className={cn(
              "from-ink/80 absolute inset-0 -z-10 via-transparent to-transparent",
              right ? "bg-linear-to-l" : "bg-linear-to-r"
            )}
          />
        </>
      ) : null}

      <div
        className={cn(
          "flex w-full flex-col px-(--gutter) pt-[8rem] pb-[5rem] lg:pb-[6rem]",
          right ? "items-end text-right" : "items-start"
        )}
      >
        {/* GSAP lifts the outer wrapper; the slant lives on the inner one, so they never share a transform. */}
        <div data-cta-rise="">
          {/*
            Left: slanted from the bottom-left. Right: slanted from the top-right, so the first
            line's ink meets the gutter and the lines below step in along the slant, which is
            what reads as flush right for slanted type.
          */}
          <div
            className={cn(
              "inline-flex -skew-x-12 flex-col",
              right ? "origin-top-right" : "origin-bottom-left"
            )}
          >
            <h2
              className={cn(
                "font-display max-w-[12ch] text-[4rem] leading-[0.88] font-semibold tracking-[-0.04em] lg:text-[12vw]",
                // Right: measured ink compensation. A line ending in a low glyph (".") leaves its
                // rightmost ink 0.19em inside the box once slanted from the top-right (33px at
                // 172.8px), so the heading moves out by that much to meet the gutter optically.
                right && "translate-x-[0.19em]"
              )}
              id="closing-cta-heading"
            >
              {heading}
            </h2>
            {/* The stripe as the bike's trail: three bands, then the line bike at their end, the same height. */}
            <div
              aria-hidden
              className={cn(
                "mt-[1.5rem] flex w-full min-w-[8rem] items-center",
                right && "flex-row-reverse"
              )}
            >
              <div
                className={cn("min-w-0 flex-1", right ? "origin-right" : "origin-left")}
                data-cta-trail=""
              >
                <Stripe angle={0} bandHeight={BAND} className="w-full" />
              </div>
              <div className="shrink-0" data-cta-bike="">
                <BikeIcon
                  className={cn("text-paper block h-[1.35vw] w-auto", right && "-scale-x-100")}
                />
              </div>
            </div>
          </div>
        </div>
        <div
          className={cn(
            "mt-[2.5rem] flex flex-col gap-[2rem]",
            right ? "items-end" : "items-start"
          )}
          data-cta-rise=""
        >
          {body ? (
            <p className="text-paper max-w-[36ch]" data-testid="cta-microcopy">
              {body}
            </p>
          ) : null}
          {/* Right: the secondary comes first in the DOM too, so tab order follows the eye. */}
          <div
            className={cn(
              "flex flex-wrap items-center gap-x-[2rem] gap-y-[1rem]",
              right && "justify-end"
            )}
          >
            {right ? secondaryAction : null}
            <Action
              action={primary}
              className={buttonVariants({ variant: "inverse", className: "cta-primary" })}
              primary
            />
            {right ? null : secondaryAction}
          </div>
        </div>
      </div>
    </section>
  );
}

function Action({
  action,
  className,
  primary = false
}: {
  action: ClosingCtaAction;
  className: string;
  primary?: boolean;
}) {
  if ("to" in action) {
    return (
      <Link className={className} hash={action.hash} to={action.to}>
        {action.label}
        {primary ? <ArrowRightIcon className="w-[0.8rem]" /> : null}
      </Link>
    );
  }
  return (
    <InquireLink channel={action.channel} className={className}>
      {action.label}
      {primary ? <ArrowUpRightIcon className="w-[0.7rem]" /> : null}
    </InquireLink>
  );
}
