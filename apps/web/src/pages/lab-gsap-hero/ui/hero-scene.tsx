import { useRef } from "react";

import { Picture } from "@zo-stack/ui/components/picture";
import { useGsapScene } from "@zo-stack/ui/hooks/use-gsap-scene.hook";
import { DUR, EASE, gsap, revealSplit } from "@zo-stack/ui/lib/gsap";

import heroImage from "@/shared/assets/images/lab-hero.jpg?responsive";
import { ActionLink } from "@/shared/ui/action-link";

import { LAB_HERO } from "@/pages/lab-gsap-hero/config/lab-gsap-hero.content";

/**
 * Pinned GSAP hero: a 240svh section with a native sticky stage (no ScrollTrigger `pin`).
 * On mount the photo unclips while the title rises line by line; scrolling then drifts the
 * photo, lifts the copy away, and washes the stage to paper for the next section.
 *
 * Every start state is in CSS, so the prerendered HTML paints it before JS runs and the intro
 * only ever tweens *to* the final state (no pop on hydration). Text layers start `invisible`;
 * the photo starts clipped and scaled but never hidden: it is the LCP element. All of it carries
 * `data-reveal` (reset by the root <noscript> style) and `motion-reduce:` overrides, so the
 * final state needs no JS for no-script and reduced-motion users.
 *
 * Each animated property has one owner node. The intro clips and scales the photo's intro
 * layer, the scrub moves and scales the media wrapper; the intro fades the copy children, the scrub fades their
 * group. Two tweens on one node's transform would fight once a ScrollTrigger refresh re-renders
 * the scrub mid-intro.
 */
export function HeroScene() {
  const ref = useRef<HTMLElement>(null);

  useGsapScene(ref, ({ reduce }) => {
    const title = "[data-hero-title]";
    const reveals = ["[data-hero-sub]", "[data-hero-cta]"];

    // CSS already shows the final state (motion-reduce:*) in a one-viewport section.
    if (reduce) return;

    gsap
      .timeline()
      .to("[data-hero-intro]", {
        clipPath: "inset(0%)",
        scale: 1,
        duration: DUR.slow,
        ease: EASE.house
      })
      .set(title, { autoAlpha: 1 }, "<0.2")
      .fromTo(
        reveals,
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: DUR.base, ease: EASE.house, stagger: 0.1 },
        "-=0.9"
      );

    // Created here rather than inside a timeline callback so the scene's matchMedia context
    // records the split and reverts it; the delay lines it up with the `set` above.
    revealSplit(title, { tween: { delay: 0.2 } });

    gsap
      .timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom bottom", scrub: true }
      })
      .fromTo(
        "[data-hero-media]",
        { yPercent: 0, scale: 1 },
        { yPercent: 8, scale: 1.1, duration: 1 },
        0
      )
      .fromTo(
        "[data-hero-copy]",
        { yPercent: 0, autoAlpha: 1 },
        { yPercent: -20, autoAlpha: 0, duration: 0.5 },
        0
      )
      .fromTo("[data-hero-wash]", { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.8);
  });

  return (
    <section
      ref={ref}
      className="bg-ink relative h-[240svh] text-white motion-reduce:h-svh"
      id="top"
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* Overscanned past the stage so the scrub's drift never exposes its edge */}
        <div className="absolute inset-[-4%]" data-hero-media="">
          {/* Intro start state lives here in CSS; the intro tweens it to none */}
          <div
            className="size-full [transform:scale(1.12)] [clip-path:inset(8%)] motion-reduce:[transform:none] motion-reduce:[clip-path:none]"
            data-hero-intro=""
            data-reveal=""
          >
            <Picture
              alt={LAB_HERO.image.alt}
              className="block size-full"
              image={heroImage}
              imgClassName="size-full object-cover"
              priority
              sizes="100vw"
            />
          </div>
        </div>

        <div className="absolute inset-0 bg-black/45" />

        <div className="absolute inset-x-0 bottom-0 p-(--gutter)" data-hero-copy="">
          <h1
            className="font-display text-display invisible uppercase motion-reduce:visible"
            data-hero-title=""
            data-reveal=""
          >
            {LAB_HERO.title.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>
          <p
            className="text-subheading invisible mt-[1rem] max-w-[28rem] motion-reduce:visible"
            data-hero-sub=""
            data-reveal=""
          >
            {LAB_HERO.subtitle}
          </p>
          <div
            className="invisible mt-[2rem] motion-reduce:visible"
            data-hero-cta=""
            data-reveal=""
          >
            <ActionLink
              action={LAB_HERO.cta}
              className="text-caption inline-flex items-center gap-[0.5rem] font-semibold tracking-[0.1em] uppercase opacity-70 transition-opacity hover:opacity-100"
            />
          </div>
        </div>

        <div
          className="bg-paper pointer-events-none absolute inset-0 opacity-0"
          data-hero-wash=""
        />
      </div>
    </section>
  );
}
