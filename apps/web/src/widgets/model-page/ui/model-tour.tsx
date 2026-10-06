import { useLenis } from "lenis/react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { Picture } from "@zo-stack/ui/components/picture";
import { useGsapScene } from "@zo-stack/ui/hooks/use-gsap-scene.hook";
import { MOTION_QUERIES, type ScrollTrigger, gsap } from "@zo-stack/ui/lib/gsap";
import { cn } from "@zo-stack/ui/lib/utils";

import { ArrowDownIcon } from "@/shared/ui/icons";

import { type BikeStage } from "@/widgets/model-page/lib/bike-stage";
import { type FlatPose, flattenPose } from "@/widgets/model-page/lib/pose";
import { type ModelContent } from "@/widgets/model-page/model/model-content";
import { SUMMARY_ID } from "@/widgets/model-page/ui/model-hero";
import { ModelTitle } from "@/widgets/model-page/ui/model-title";
import { TourControls } from "@/widgets/model-page/ui/tour-controls";

/** Timeline units: the camera move into a beat, the hold on it, and the tail as the pin releases. */
const MOVE = 1;
const HOLD = 1.1;
const TAIL = 0.9;
/** Scroll per beat, in svh. The section is `beats * BEAT_SVH + 100svh` tall. */
const BEAT_SVH = 90;
/** Desktop pinned framing: subject centre sits this fraction of the width right of centre. */
const SHIFT = 0.16;
/** Pinned (motion allowed) and wide: the same conditions as the `lg:` scrim and copy column. */
const SHIFT_QUERY = `(min-width: 64rem) and ${MOTION_QUERIES.motion}`;
/** Seconds for an arrow step through Lenis; the scrub then carries camera and copy along. */
const STEP_DURATION = 1.4;
/** px: sitting this close to a hold point counts as being on it, so → moves on to the next. */
const STEP_TOLERANCE = 4;
/** Giant title opacity while the intro beat holds (matches `opacity-30`), easing to 10% after. */
const INTRO_TITLE_OPACITY = 0.3;

/** Where the scrubbed timeline sits for each beat, in timeline seconds. */
type BeatTimes = { swaps: number[]; holds: number[] };

function subscribeMotion(onChange: () => void) {
  const query = window.matchMedia(MOTION_QUERIES.motion);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * The scroll tour on ink: a giant model title, the 3D bike in front of it on a transparent
 * canvas, and the beat copy in front of both (z-order title < canvas < copy, the home hero's
 * wordmark-behind-subject layering). Pinned with native sticky, never `pin: true`.
 *
 * One scrubbed GSAP timeline drives everything from the beat data: the camera zooms, pulls
 * back through `via` waypoints, spins (unwrapped azimuth) and orbits (`orbit`); each beat's
 * copy steps in as its move lands; the title drifts and swells across the pin, then lifts out
 * in the tail as the pin releases into the gallery.
 *
 * Two layouts from one tree, so the canvas mount never remounts:
 * - pinned: motion allowed. Tall section, full-screen sticky stage, copy crossfading in one slot.
 * - static: the server render, no-JS and reduced motion. The bike in its first (wide) pose
 *   over the title, the beats as a plain list below. The page reads with no scroll effects.
 * `pinned` comes from `useSyncExternalStore` with a `false` server snapshot, so hydration
 * always matches and the pinned layout swaps in right after (RULES §10).
 *
 * All beat copy stays in the accessibility tree in both layouts; only opacity hides it.
 *
 * The server renders the pinned layout (the motion default), so a page that opens on the tour
 * paints its first frame without a layout swap; reduced-motion visitors swap to the static
 * layout right after hydration (useSyncExternalStore re-renders with the client snapshot).
 *
 * Pages without a hero (`controls`) also get the control bar: arrows step to each beat's hold
 * point by scrolling through Lenis, so the existing scrub moves camera and copy (no second
 * animation system). The counter follows normal scrolling too, and ←/→ step while the tour is
 * pinned on screen. Reduced motion: no bar.
 */
export function ModelTour({
  content,
  controls = false
}: {
  content: ModelContent;
  controls?: boolean;
}) {
  const { tour } = content;
  const { beats } = tour;
  const sectionRef = useRef<HTMLElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<BikeStage | null>(null);
  // The live camera pose. GSAP tweens this object; the stage reads it whenever it changes.
  const poseRef = useRef<FlatPose>(flattenPose(beats[0].camera));
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  const [beatIndex, setBeatIndex] = useState(0);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const timesRef = useRef<BeatTimes | null>(null);
  const [atStart, setAtStart] = useState(true);
  // Destination of an arrow step still in flight. Lenis's own `targetScroll` follows the
  // animated value during a programmatic scroll, so chaining needs the destination kept here.
  const pendingRef = useRef<number | null>(null);
  const lenis = useLenis();
  const intro = beats[0].intro === true;

  const pinned = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(MOTION_QUERIES.motion).matches,
    () => true
  );

  useEffect(() => {
    let disposed = false;
    let stage: BikeStage | null = null;
    void import("@/widgets/model-page/lib/bike-stage").then(({ createBikeStage }) => {
      const mount = mountRef.current;
      if (disposed || !mount) return;
      stage = createBikeStage(mount, tour.bike, {
        onReady: () => setStatus("ready"),
        // Pinned on desktop the canvas is full-bleed under the copy column: frame the bike right.
        shift: () => (window.matchMedia(SHIFT_QUERY).matches ? SHIFT : 0)
      });
      if (!stage) return setStatus("failed");
      stage.setPose(poseRef.current);
      stageRef.current = stage;
    });
    return () => {
      disposed = true;
      stage?.dispose();
      stageRef.current = null;
    };
  }, [tour.bike]);

  useGsapScene(
    sectionRef,
    ({ reduce }) => {
      const pose = poseRef.current;
      Object.assign(pose, flattenPose(beats[0].camera));
      stageRef.current?.setPose(pose);
      if (reduce || !pinned) return;

      const panels = gsap.utils.toArray<HTMLElement>("[data-beat]");
      gsap.set(panels.slice(1), { opacity: 0, y: 24 });
      const times: BeatTimes = { swaps: [0], holds: [0] };

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const { progress } = self;
            setAtStart(self.scroll() <= self.start + STEP_TOLERANCE);
            const t = progress * tl.duration();
            let i = 0;
            while (i + 1 < times.swaps.length && t >= times.swaps[i + 1]!) i++;
            setBeatIndex(i);
          }
        },
        onUpdate: () => stageRef.current?.setPose(pose)
      });
      triggerRef.current = tl.scrollTrigger ?? null;
      timesRef.current = times;

      const hold = (orbit: number | undefined, azimuth: number) => {
        if (orbit) tl.to(pose, { azimuth: azimuth + orbit, duration: HOLD, ease: "sine.inOut" });
        else tl.to({}, { duration: HOLD });
      };

      hold(beats[0].orbit, beats[0].camera.azimuth);
      beats.slice(1).forEach((beat, k) => {
        const at = tl.duration();
        if (beat.via) {
          tl.to(pose, { ...flattenPose(beat.via), duration: MOVE / 2, ease: "sine.inOut" }, at);
          tl.to(pose, { ...flattenPose(beat.camera), duration: MOVE / 2, ease: "sine.inOut" });
        } else {
          tl.to(pose, { ...flattenPose(beat.camera), duration: MOVE, ease: "power2.inOut" }, at);
        }
        times.swaps.push(at + MOVE / 2);
        times.holds.push(at + MOVE + HOLD / 2);
        tl.to(panels[k]!, { opacity: 0, y: -24, duration: MOVE * 0.35 }, at);
        tl.to(panels[k + 1]!, { opacity: 1, y: 0, duration: MOVE * 0.35 }, at + MOVE * 0.65);
        hold(beat.orbit, beat.camera.azimuth);
      });

      // Title: a slow drift and swell across the whole tour, then out as the pin releases.
      const tour = tl.duration();
      tl.fromTo(
        "[data-tour-title]",
        { xPercent: 4, scale: 0.94 },
        { xPercent: -4, scale: 1.04, duration: tour },
        0
      );
      tl.to(
        "[data-tour-title]",
        { yPercent: -40, opacity: 0, duration: TAIL, ease: "power1.in" },
        tour
      );
      tl.to(panels.at(-1)!, { opacity: 0, duration: TAIL * 0.6 }, tour + TAIL * 0.4);
      if (intro) {
        tl.fromTo(
          "[data-tour-title]",
          { opacity: INTRO_TITLE_OPACITY },
          { opacity: 0.1, duration: MOVE, ease: "power1.inOut", immediateRender: false },
          HOLD
        );
      }

      return () => {
        triggerRef.current = null;
        timesRef.current = null;
      };
    },
    [pinned]
  );

  /**
   * Step from where the page actually is, not from the counter: → goes to the first beat hold
   * point strictly after the current scroll, ← to the last one strictly before it, and → past
   * the last beat goes to the summary. While an arrow step is still running, "current" is its
   * destination, so rapid clicks chain (two clicks, two beats). Wheel or touch input cancels
   * the pending destination, since it takes over the scroll.
   */
  const step = useCallback(
    (direction: 1 | -1) => {
      const st = triggerRef.current;
      const times = timesRef.current;
      if (!st || !times) return;
      const total = st.animation?.duration() ?? 1;
      const holds = times.holds.map((t) =>
        Math.round(st.start + (t / total) * (st.end - st.start))
      );
      const current = pendingRef.current ?? window.scrollY;
      const target =
        direction === 1
          ? holds.find((y) => y > current + STEP_TOLERANCE)
          : holds.filter((y) => y < current - STEP_TOLERANCE).at(-1);
      if (target === undefined) {
        if (direction === -1) return;
        pendingRef.current = null;
        if (lenis) lenis.scrollTo(`#${SUMMARY_ID}`, { duration: STEP_DURATION });
        else document.getElementById(SUMMARY_ID)?.scrollIntoView();
        return;
      }
      if (lenis) {
        pendingRef.current = target;
        lenis.scrollTo(target, {
          duration: STEP_DURATION,
          onComplete: () => {
            if (pendingRef.current === target) pendingRef.current = null;
          }
        });
      } else window.scrollTo({ top: target });
    },
    [lenis]
  );

  // ←/→ step the tour only while it is pinned on screen; anywhere else the keys are left alone.
  useEffect(() => {
    if (!controls || !pinned) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      if (!triggerRef.current?.isActive) return;
      e.preventDefault();
      step(e.key === "ArrowRight" ? 1 : -1);
    };
    const cancelPending = () => {
      pendingRef.current = null;
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", cancelPending, { passive: true });
    window.addEventListener("touchstart", cancelPending, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", cancelPending);
      window.removeEventListener("touchstart", cancelPending);
    };
  }, [controls, pinned, step]);

  return (
    <section
      aria-labelledby="tour-heading"
      className={cn(
        "bg-ink text-paper relative",
        pinned ? "h-[calc(var(--beats)*var(--beat-h)+100svh)]" : "py-[5rem] lg:py-[8rem]"
      )}
      ref={sectionRef}
      // Per-model beat count rides a CSS variable rather than a generated class name.
      style={{ "--beats": beats.length, "--beat-h": `${BEAT_SVH}svh` } as React.CSSProperties}
    >
      <h2 className="sr-only" id="tour-heading">
        {tour.heading}
      </h2>
      <div
        className={cn(
          pinned
            ? "sticky top-0 h-svh overflow-hidden"
            : "flex flex-col gap-[4rem] overflow-hidden px-(--gutter)"
        )}
      >
        {/* Stage: title (z-0) under the transparent canvas (z-10). */}
        <div
          className={cn(
            "relative",
            pinned ? "absolute inset-0" : "aspect-square max-h-[80svh] w-full lg:aspect-[16/9]"
          )}
          data-testid="model-stage"
        >
          <div
            className={cn(
              "text-paper absolute inset-x-0 top-1/2 z-0 flex -translate-y-1/2 justify-center",
              pinned ? "px-(--gutter)" : ""
            )}
          >
            {/* The intro holds the title brighter (30%); the scene eases it down to 10%. */}
            <div className={cn("w-full", intro ? "opacity-30" : "opacity-10")} data-tour-title="">
              <ModelTitle content={content} giant tone="white" />
            </div>
          </div>

          <div
            className={cn(
              "absolute z-10",
              pinned ? "inset-x-0 top-0 bottom-[38%] lg:bottom-0" : "inset-0"
            )}
          >
            {/*
              Poster: never painted on the normal path. Until the first WebGL frame the stage is
              ink with the title behind it, then the canvas fades in. The poster mounts only when
              WebGL fails, and no-JS visitors get it through <noscript> (React does not hydrate
              noscript content, so it never reaches the DOM with JS on).
            */}
            {status === "failed" ? <Poster poster={tour.poster} /> : null}
            <noscript>
              <Poster poster={tour.poster} />
            </noscript>
            <div
              aria-hidden
              className={cn(
                "absolute inset-0 opacity-0 transition-opacity duration-700",
                status === "ready" && "opacity-100"
              )}
              data-testid="model-canvas"
              ref={mountRef}
            />
          </div>
        </div>

        {/* Desktop pinned: an ink scrim under the copy column so close-ups never fight the text. */}
        {pinned ? (
          <div
            aria-hidden
            className="from-ink via-ink/75 pointer-events-none absolute inset-y-0 left-0 z-[15] hidden w-[42%] bg-linear-to-r to-transparent lg:block"
          />
        ) : null}

        {/*
          Copy (z-20). Pinned, the beats share one grid cell, bottom-aligned, so the stack is as
          tall as the longest beat and the controls sit a fixed gap under whichever beat shows,
          centred on the stack's width.
        */}
        <div
          className={cn(
            "z-20",
            pinned
              ? "absolute inset-x-0 bottom-0 flex h-[38%] flex-col justify-center gap-[1.25rem] px-(--gutter) lg:top-0 lg:h-auto lg:w-[34%]"
              : "relative"
          )}
        >
          <ol
            className={cn(
              "grid",
              pinned
                ? "w-full max-w-[30rem]"
                : "gap-x-[1.5rem] gap-y-[3rem] sm:grid-cols-2 lg:grid-cols-3"
            )}
          >
            {beats.map((beat, i) => (
              <li
                className={cn(
                  "flex max-w-[30rem] flex-col gap-[1.25rem]",
                  // Hidden before JS too, so the pinned first paint shows one beat, not seven stacked.
                  pinned && "self-end [grid-area:1/1]",
                  pinned && i > 0 && "opacity-0"
                )}
                data-beat=""
                // Static content list, never reordered: the index is a stable key, and titles can repeat.
                key={i}
              >
                {beat.intro ? (
                  <h1 className="text-heading lg:text-heading text-[2.25rem]">
                    <span className="sr-only">{content.name}. </span>
                    {beat.title}
                  </h1>
                ) : (
                  <h3 className="text-heading lg:text-heading text-[2rem]">{beat.title}</h3>
                )}
                {beat.body ? <p className="text-muted-on-dark max-w-[62ch]">{beat.body}</p> : null}
              </li>
            ))}
          </ol>
          {controls && pinned ? (
            <div className="flex w-full max-w-[30rem] justify-center">
              <TourControls
                count={beats.length}
                atStart={atStart}
                index={beatIndex}
                onNext={() => step(1)}
                onPrev={() => step(-1)}
              />
            </div>
          ) : null}
        </div>

        {/* Bottom-centre of the pinned stage, so it is only on screen while the tour is pinned. */}
        {controls && pinned ? (
          <a
            className="bg-paper/10 text-paper text-label hover:bg-paper/20 absolute bottom-[1.5rem] left-1/2 z-30 flex h-[2.75rem] -translate-x-1/2 items-center gap-[0.75rem] rounded-full px-[1.5rem] whitespace-nowrap backdrop-blur-md transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            data-testid="jump-to-summary"
            href={`#${SUMMARY_ID}`}
          >
            {tour.summaryLabel ?? "Jump to summary"}
            <ArrowDownIcon className="w-[0.6rem]" />
          </a>
        ) : null}
      </div>
    </section>
  );
}

function Poster({ poster }: { poster: ModelContent["tour"]["poster"] }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center" data-testid="tour-poster">
      <Picture
        alt={poster.alt}
        className="block aspect-4/5 h-[75%] max-w-full"
        image={poster.image}
        imgClassName="size-full object-cover"
        sizes="(min-width: 1024px) 30vw, 70vw"
      />
    </div>
  );
}
