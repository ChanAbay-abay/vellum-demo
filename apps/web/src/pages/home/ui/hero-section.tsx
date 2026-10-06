import { Link } from "@tanstack/react-router";
import { useRef } from "react";

import { useGsapScene } from "@zo-stack/ui/hooks/use-gsap-scene.hook";
import { ScrollTrigger, gsap } from "@zo-stack/ui/lib/gsap";

import { buttonVariants } from "@/shared/ui/button";
import { ArrowRightIcon } from "@/shared/ui/icons";

import { HERO } from "@/pages/home/config/home.content";
import { HeroWordmark } from "@/pages/home/ui/hero-wordmark";

const { rider } = HERO;

/** Share of the pin spent playing frames; the rest holds the empty last frame before release. */
const PLAY_SHARE = 0.9;
/** Index where the helmet toss ends and the rider starts riding out (measured from the frames). */
const RIDE_OFF_FRAME = 36;
/** Share of the play spent on the toss. The ride-off gets the rest, so it reads fast, not floaty. */
const TOSS_SHARE = 0.65;
/**
 * Pin progress where the wordmark glints. Intro is pulled up 70svh over the pin (intro-section),
 * so it starts rising at 0.65, just after the ride-off begins (0.9 * 0.65 = 0.585); the glint
 * lands while the stage is visibly being covered and the wordmark is still clear.
 */
const SPARKLE_AT = 0.7;
/**
 * Framing. The frame is always at least as wide as the stage (then ZOOM larger), so its edges
 * sit off-screen and the rider can only leave at the viewport edge. Vertically it is anchored by
 * the top: frame row FRAME_TOP (just above the raised helmet) lands HEAD_ROOM down the stage,
 * the raised helmet tucking just under the nav pill (the nav hides once scrolling starts), and
 * the zoom crops the wheels instead of the head. Never lifted so far that
 * the frame's bottom edge shows.
 */
const ZOOM = 1.15;
const FRAME_TOP = 0.07;
const HEAD_ROOM = 0.03;
const ASPECT = rider.width / rider.height;

function frameRect(stageW: number, stageH: number) {
  const w = Math.max(stageW, stageH * ASPECT) * ZOOM;
  const h = w / ASPECT;
  return { x: (stageW - w) / 2, y: Math.max(HEAD_ROOM * stageH - FRAME_TOP * h, stageH - h), w, h };
}

/** frameRect() in CSS for the server-rendered poster, so first paint matches the canvas. */
const POSTER_W = `calc(max(100cqw, 100cqh * ${ASPECT}) * ${ZOOM})`;
const POSTER_H = `calc(${POSTER_W} / ${ASPECT})`;
const POSTER_STYLE = {
  width: POSTER_W,
  left: `calc((100cqw - ${POSTER_W}) / 2)`,
  top: `max(${HEAD_ROOM * 100}cqh - ${FRAME_TOP} * ${POSTER_H}, 100cqh - ${POSTER_H})`
};

/** Low-priority frame requests in flight at once, so 88 fetches don't starve other assets. */
const MAX_IN_FLIGHT = 6;
/** Canvas backing-store cap: frames are 1920 wide, more than 2x buys nothing. */
const MAX_DPR = 2;

/**
 * Hero, DESIGN.md §6 Direction D: bone ground, the full-width "vellum" wordmark with the Retro
 * stripe clipped inside its letters, a grayscale rider cut-out in front of it, and the statement
 * (the page's h1) with its two CTAs bottom-left. The floating nav pill replaces the reference's
 * top-right CTA.
 *
 * Motion (GSAP, once per mount): letters rise through the baseline with a 60ms stagger, the
 * stripe bands sweep in, then the corner copy fades up. The rider is the LCP element, so it is
 * never hidden: it only rises its last 40px.
 *
 * Scroll: the section is 300svh with a sticky 100svh stage (native-sticky pin). Across the pin
 * the rider plays as a transparent frame sequence drawn to a canvas: helmet toss, then out to
 * the right, leaving the wordmark. Frame 1 is a real <img> (LCP, no-JS and reduced-motion
 * state); the canvas covers it once it has drawn. Both are framed by frameRect().
 *
 * Start states are CSS (`invisible`, the rider's offset) carrying `data-reveal` for the
 * no-script reset and `motion-reduce:` overrides, so reduced motion is the static final state
 * with no JS and a one-screen section.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);

  useGsapScene(ref, ({ reduce }) => {
    if (reduce) return;

    const ease = "expo.out";

    gsap
      .timeline({ delay: 0.1 })
      .set(["[data-hero-letters]", "[data-hero-stripe]"], { autoAlpha: 1 })
      .fromTo(
        "[data-hero-letter]",
        { yPercent: 30, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 1, ease, stagger: 0.06 },
        0
      )
      .fromTo("[data-hero-rider]", { y: 40 }, { y: 0, duration: 1.4, ease }, 0)
      .fromTo(
        "[data-hero-band]",
        { scaleX: 0, transformOrigin: "0% 50%" },
        { scaleX: 1, transformOrigin: "0% 50%", duration: 0.9, ease, stagger: 0.12 },
        0.45
      )
      .fromTo(
        "[data-hero-copy]",
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.8, ease, stagger: 0.1 },
        0.7
      );

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Index 0 is frame 1. The poster <img> is already that frame, so reuse it rather than refetch.
    const frames: (HTMLImageElement | undefined)[] = Array.from({ length: rider.frameCount });
    let current = 0;
    let drawn = -1;
    // A failed request is `complete` too, and drawing a broken image throws.
    const ready = (image?: HTMLImageElement) => Boolean(image?.complete && image.naturalWidth);

    function draw() {
      if (!canvas || !ctx) return;
      // Nearest loaded frame at or before the target, so a gap holds still instead of blanking.
      let index = current;
      while (index > 0 && !ready(frames[index])) index--;
      const image = frames[index];
      if (!image || !ready(image) || index === drawn) return;

      const { width, height } = canvas;
      const { x, y, w, h } = frameRect(width, height);
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(image, x, y, w, h);
      drawn = index;
      posterRef.current?.style.setProperty("visibility", "hidden");
    }

    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio, MAX_DPR);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      drawn = -1;
      draw();
    }

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    if (posterRef.current) frames[0] = posterRef.current;

    let next = 1;
    let inFlight = 0;
    let cancelled = false;
    function pump() {
      while (!cancelled && inFlight < MAX_IN_FLIGHT && next < rider.frameCount) {
        const image = new Image();
        image.fetchPriority = "low";
        image.decoding = "async";
        image.src = rider.frameSrc(next + 1);
        frames[next++] = image;
        inFlight++;
        image.onload = image.onerror = () => {
          inFlight--;
          draw();
          pump();
        };
      }
    }
    pump();

    const sparkle = gsap
      .timeline({ paused: true })
      .fromTo(
        "[data-hero-sparkle]",
        { autoAlpha: 0, scale: 0, rotate: -90 },
        { autoAlpha: 1, scale: 1, rotate: 0, duration: 0.35, ease: "back.out(3)", stagger: 0.12 }
      )
      .to("[data-hero-sparkle]", {
        autoAlpha: 0,
        scale: 0,
        rotate: 90,
        duration: 0.3,
        ease: "power2.in",
        stagger: 0.12
      });

    let lastProgress = 0;

    ScrollTrigger.create({
      trigger: ref.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: ({ progress }) => {
        // Forward crossings only, so it tinks again on every pass down but not on the way back.
        if (lastProgress < SPARKLE_AT && progress >= SPARKLE_AT) sparkle.restart();
        lastProgress = progress;

        const play = Math.min(progress / PLAY_SHARE, 1);
        const last = rider.frameCount - 1;
        current = Math.round(
          play < TOSS_SHARE
            ? (play / TOSS_SHARE) * RIDE_OFF_FRAME
            : RIDE_OFF_FRAME + ((play - TOSS_SHARE) / (1 - TOSS_SHARE)) * (last - RIDE_OFF_FRAME)
        );
        draw();
      }
    });

    // matchMedia runs this on revert: stop queuing frames and drop the observer with the scene.
    return () => {
      cancelled = true;
      observer.disconnect();
      posterRef.current?.style.removeProperty("visibility");
    };
  });

  return (
    <section
      ref={ref}
      className="bg-bone text-ink relative h-[300svh] motion-reduce:h-auto"
      id={HERO.id}
    >
      <div className="sticky top-0 flex min-h-svh flex-col overflow-hidden pt-[6rem] lg:block lg:h-svh lg:min-h-0 lg:pt-0">
        <div className="relative min-h-[24rem] flex-1 lg:absolute lg:inset-0">
          <div className="absolute inset-x-0 top-[20%] px-(--gutter) lg:top-[45%] lg:-translate-y-1/2">
            <HeroWordmark className="block h-auto w-full" label={HERO.wordmarkLabel} />
          </div>
        </div>

        <div
          className="[container-type:size] absolute inset-0 [transform:translateY(40px)] motion-reduce:[transform:none]"
          data-hero-rider=""
          data-reveal=""
        >
          <img
            ref={posterRef}
            alt={rider.alt}
            className="absolute h-auto max-w-none"
            decoding="async"
            fetchPriority="high"
            height={rider.height}
            src={rider.frameSrc(1)}
            // Inline: the geometry is generated from the same constants as the canvas maths.
            style={POSTER_STYLE}
            width={rider.width}
          />
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="absolute inset-0 size-full motion-reduce:hidden"
          />
        </div>

        <div className="relative z-10 flex flex-col gap-[2.5rem] px-(--gutter) pt-[2rem] pb-[2.5rem] lg:absolute lg:inset-x-0 lg:bottom-0 lg:flex-row lg:items-end lg:justify-between lg:pt-0 lg:pb-[6rem]">
          <div className="invisible motion-reduce:visible" data-hero-copy="" data-reveal="">
            <h1 className="font-display text-[2rem] leading-[0.95] font-semibold tracking-[-0.03em] uppercase lg:text-[3.25rem]">
              <span className="block">{HERO.statement[0]}</span>
              <span className="text-stripe-burgundy block">
                {HERO.statement[1]}{" "}
                <span className="from-stripe-orange to-stripe-red bg-linear-to-r bg-clip-text text-transparent">
                  {HERO.statement[2]}
                </span>
              </span>
            </h1>
            <div className="mt-[2rem] flex flex-wrap items-center gap-[0.75rem]">
              <Link className={buttonVariants()} to={HERO.cta.to}>
                {HERO.cta.label}
                <ArrowRightIcon className="w-[0.8rem]" />
              </Link>
              <Link className={buttonVariants({ variant: "inverse" })} to={HERO.secondary.to}>
                {HERO.secondary.label}
                <ArrowRightIcon className="w-[0.8rem]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
