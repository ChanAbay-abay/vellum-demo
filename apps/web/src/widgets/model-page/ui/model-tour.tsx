import { useLenis } from "lenis/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore
} from "react";

import { Picture } from "@zo-stack/ui/components/picture";
import { useGsapScene } from "@zo-stack/ui/hooks/use-gsap-scene.hook";
import { MOTION_QUERIES, ScrollTrigger, gsap } from "@zo-stack/ui/lib/gsap";
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
/** Desktop pinned framing: subject centre sits this fraction of the width right of centre. */
const SHIFT = 0.16;
/** Short landscape screens (phones on their side): the `landscape-short:` variant in app.css. */
const LANDSCAPE_SHORT = "(orientation: landscape) and (max-height: 32rem) and (width < 64rem)";
/**
 * Pinned (motion allowed) with the copy in a left column: wide (the `lg:` scrim and column) or
 * a phone on its side (the `landscape-short:` ones).
 */
const SHIFT_QUERY = `(min-width: 64rem) and ${MOTION_QUERIES.motion}, ${LANDSCAPE_SHORT} and ${MOTION_QUERIES.motion}`;
/** Pinned below lg the copy sits along the bottom: lift the subject into the space above it. */
const LIFT = 0.19;
const LIFT_QUERY = `(max-width: 63.98rem) and ${MOTION_QUERIES.motion}`;
/** Seconds for an arrow step through Lenis; the scrub then carries camera and copy along. */
const STEP_DURATION = 1.4;
/** px: sitting this close to a hold point counts as being on it, so → moves on to the next. */
const STEP_TOLERANCE = 4;
/** Giant title opacity while the intro beat holds (matches `opacity-30`), easing to 10% after. */
const INTRO_TITLE_OPACITY = 0.3;

/**
 * Anything open that owns the arrow keys: Radix menus and dialogs (the nav's Catalogue dropdown
 * and Menu sheet), any modal, or a nav trigger reporting itself expanded.
 */
const OPEN_OVERLAY = [
  '[role="menu"]',
  '[role="dialog"]',
  '[aria-modal="true"]',
  // Scoped to the site chrome: dev tools and accordions elsewhere also report aria-expanded.
  'header [aria-expanded="true"]',
  'nav [aria-expanded="true"]'
] as const;

/** No-JS: turn the server-rendered pinned layout into the static stacked one (see the doc comment). */
const NO_SCRIPT_TOUR = [
  "[data-tour]{height:auto!important;padding:5rem 0!important}",
  "[data-tour-pin]{position:relative!important;height:auto!important;display:flex!important;flex-direction:column;gap:4rem;padding:0 var(--gutter)}",
  "[data-tour-pin]>[data-testid=model-stage]{position:relative!important;inset:auto!important;width:100%;aspect-ratio:16/9;max-height:80svh}",
  "[data-tour-copy]{position:static!important;height:auto!important;width:auto!important;padding:0!important}",
  "[data-tour-copy]>ol{max-width:none!important;gap:3rem 1.5rem;grid-template-columns:repeat(auto-fill,minmax(18rem,1fr))}",
  "[data-tour] [data-beat]{grid-area:auto!important;align-self:start!important;opacity:1!important}",
  "[data-tour-js-only]{display:none!important}"
].join("");

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
 * - static: reduced motion and no-JS. The bike in its first (wide) pose over the title, the
 *   beats as a plain list below. The page reads with no scroll effects.
 *
 * The server renders the pinned layout (the motion default; `useSyncExternalStore`'s server
 * snapshot is `true`), so a page that opens on the tour paints its first frame without a layout
 * swap. Reduced-motion visitors swap to the static layout right after hydration (the store
 * re-renders with the client snapshot, so hydration still matches, RULES §10). No-JS visitors
 * get the static layout from a <noscript> style that overrides the pinned one (NO_SCRIPT_TOUR).
 * A live reduced-motion toggle keeps the reader's place (see `readPlace`).
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
  // The counter's value for code outside render (the layout-swap bookkeeping below).
  const beatIndexRef = useRef(0);
  useEffect(() => {
    beatIndexRef.current = beatIndex;
  }, [beatIndex]);
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
        shift: () => (window.matchMedia(SHIFT_QUERY).matches ? SHIFT : 0),
        // Below lg (except on its side, where it shifts instead) the copy is at the bottom.
        lift: () =>
          window.matchMedia(LIFT_QUERY).matches && !window.matchMedia(LANDSCAPE_SHORT).matches
            ? LIFT
            : 0
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
   * Keep the reader's place when the layout swaps (reduced motion toggled live). The place is
   * recorded as a beat (inside the tour) or a distance from the tour's edge (above or below it),
   * because the two layouts differ in height by thousands of pixels. The record is kept current
   * from scroll events (rAF-gated) and the counter; the swap's layout effect runs in the commit,
   * before the swap's own scroll events arrive, so it still reads the pre-swap place. (Reading it
   * in an effect cleanup does not work: by then React has already mutated the DOM.)
   * Declared after the GSAP scene so the new ScrollTrigger exists when this restores.
   */
  const placeRef = useRef<Place>({ kind: "before", offset: 0 });
  const armedRef = useRef(false);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (armedRef.current && section) {
      const saved = placeRef.current;
      const top = section.getBoundingClientRect().top + window.scrollY;
      let y = 0;
      if (saved.kind === "before") y = Math.min(saved.offset, top);
      else if (saved.kind === "after") y = top + section.offsetHeight + saved.offset;
      else if (pinned) {
        ScrollTrigger.refresh();
        const st = triggerRef.current;
        const times = timesRef.current;
        if (st && times) {
          const total = st.animation?.duration() ?? 1;
          y = st.start + ((times.holds[saved.beat] ?? 0) / total) * (st.end - st.start);
        }
      } else {
        const beat = section.querySelectorAll<HTMLElement>("[data-beat]")[saved.beat];
        y = beat
          ? beat.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.3
          : top;
      }
      if (pinned) {
        // The scrub's onUpdate only fires on change; set the counter for where we land.
        const beat =
          saved.kind === "beat" ? saved.beat : saved.kind === "before" ? 0 : beats.length - 1;
        setBeatIndex(beat);
        setAtStart(beat === 0 && saved.kind !== "after");
      }
      const target = Math.max(0, Math.round(y));
      // Lenis (re)mounts on the same media change; land the page and Lenis on the same place.
      window.scrollTo({ top: target, behavior: "instant" });
      requestAnimationFrame(() => {
        lenis?.scrollTo(target, { immediate: true, force: true });
        window.scrollTo({ top: target, behavior: "instant" });
      });
    }
    // Arm only once the layout matches the live query. Hydrating for a reduced-motion visitor
    // first commits the server's pinned layout, then swaps: that swap is the page loading, not
    // a reader mid-page, and "restoring" the pinned layout's beat 0 onto the static list
    // scrolled the fresh page down to it. The browser's own scroll (top, or a #hash) stands.
    armedRef.current = pinned === window.matchMedia(MOTION_QUERIES.motion).matches;
    // Runs on the layout swap only; everything else is read fresh when it does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinned]);

  useEffect(() => {
    let frame = 0;
    const record = () => {
      frame = 0;
      placeRef.current = readPlace(sectionRef.current, pinned, beatIndexRef.current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(record);
    };
    record();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pinned, beatIndex]);

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
      // Arrows belong to whatever is open or focused outside the tour: an open menu, dialog or
      // popover anywhere on the page, or focus inside the site header/nav (menubar habits).
      if (OPEN_OVERLAY.some((sel) => document.querySelector(sel))) return;
      if (
        target?.closest("header, nav, [role=menu], [role=dialog]") &&
        !sectionRef.current?.contains(target)
      ) {
        return;
      }
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
      aria-label={tour.heading}
      className={cn(
        "bg-ink text-paper relative",
        // Scroll per beat: 70svh on phones and tablets (paced by flicks), 90svh from lg.
        pinned
          ? "h-[calc(var(--beats)*var(--beat-h)+100svh)] [--beat-h:70svh] lg:[--beat-h:90svh]"
          : "py-[5rem] lg:py-[8rem]"
      )}
      data-tour=""
      ref={sectionRef}
      // Per-model beat count rides a CSS variable rather than a generated class name.
      style={{ "--beats": beats.length } as React.CSSProperties}
    >
      {/* React never hydrates <noscript>, so this only exists with JavaScript off. */}
      <noscript>
        <style>{NO_SCRIPT_TOUR}</style>
      </noscript>
      <div
        className={cn(
          pinned
            ? "sticky top-0 h-svh overflow-hidden"
            : "flex flex-col gap-[4rem] overflow-hidden px-(--gutter)"
        )}
        data-tour-pin=""
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

          <div className="absolute inset-0 z-10">
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

        {/*
          Pinned: an ink scrim under the copy so close-ups never fight the text. Desktop: the
          left column. Below lg: the bottom band, where the copy and controls sit.
        */}
        {pinned ? (
          <>
            <div
              aria-hidden
              className="from-ink via-ink/75 landscape-short:block pointer-events-none absolute inset-y-0 left-0 z-[15] hidden w-[42%] bg-linear-to-r to-transparent lg:block"
            />
            <div
              aria-hidden
              className="from-ink via-ink/85 landscape-short:hidden pointer-events-none absolute inset-x-0 bottom-0 z-[15] h-[45%] bg-linear-to-t to-transparent lg:hidden"
            />
          </>
        ) : null}

        {/*
          Copy (z-20). Pinned, the beats share one grid cell, bottom-aligned, so the stack is as
          tall as the longest beat and the controls sit a fixed gap under whichever beat shows,
          centred on the stack's width. Below lg the column bottom-anchors 5rem (+ safe area) up:
          1rem to the edge + the 2.75rem pill + a 1.25rem gap. Below md the controls drop out of
          the column onto the pill's row (top = the column's bottom + that same gap), bottom-left.
        */}
        <div
          className={cn(
            "z-20",
            pinned
              ? "landscape-short:top-0 landscape-short:bottom-0 landscape-short:w-[44%] landscape-short:justify-center landscape-short:gap-[0.75rem] landscape-short:pl-[max(var(--gutter),env(safe-area-inset-left))] absolute inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] flex flex-col justify-end gap-[1rem] px-(--gutter) lg:top-0 lg:bottom-0 lg:h-auto lg:w-[34%] lg:justify-center lg:gap-[1.25rem]"
              : "relative"
          )}
          data-tour-copy=""
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
                  <h2 className="text-heading lg:text-heading text-[2rem]">{beat.title}</h2>
                )}
                {beat.body ? <p className="text-muted-on-dark max-w-[62ch]">{beat.body}</p> : null}
              </li>
            ))}
          </ol>
          {controls && pinned ? (
            <div
              className="landscape-short:static landscape-short:w-full landscape-short:max-w-[30rem] landscape-short:justify-center absolute top-[calc(100%+1.25rem)] left-(--gutter) flex md:static md:w-full md:justify-center lg:max-w-[30rem]"
              data-tour-js-only=""
            >
              <TourControls
                count={beats.length}
                atEnd={beatIndex === beats.length - 1}
                atStart={atStart}
                index={beatIndex}
                onNext={() => step(1)}
                onPrev={() => step(-1)}
              />
            </div>
          ) : null}
        </div>

        {/*
          Bottom of the pinned stage, so it is only on screen while the tour is pinned: centred
          from md up, and on phones bottom-right, opposite the controls on the same row.
          Solid ink: a translucent chip measured 1.5:1 when a white tube passed behind it.
        */}
        {controls && pinned ? (
          <a
            data-tour-js-only=""
            className="bg-ink text-paper text-label hover:bg-graphite landscape-short:right-[max(var(--gutter),env(safe-area-inset-right))] landscape-short:bottom-[calc(0.75rem+env(safe-area-inset-bottom))] landscape-short:left-auto landscape-short:translate-x-0 absolute right-(--gutter) bottom-[calc(1rem+env(safe-area-inset-bottom))] z-30 flex h-[2.75rem] items-center gap-[0.75rem] rounded-full px-[1.25rem] whitespace-nowrap transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring max-[22.5rem]:gap-[0.5rem] max-[22.5rem]:px-[0.875rem] md:right-auto md:left-1/2 md:-translate-x-1/2 md:px-[1.5rem] lg:bottom-[1.5rem]"
            data-testid="jump-to-summary"
            href={`#${SUMMARY_ID}`}
          >
            {/* Under ~424px the full label and the arrows can't share the row with a clear gap. */}
            <span className="max-[26.5rem]:hidden">{tour.summaryLabel ?? "Jump to summary"}</span>
            <span className="hidden max-[26.5rem]:inline">Summary</span>
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

type Place =
  | { kind: "before"; offset: number }
  | { kind: "after"; offset: number }
  | { kind: "beat"; beat: number };

/**
 * Where the reader is relative to the tour: above it (scrollY), below it (how far its end is
 * above the viewport top), or on a beat. Pinned, the beat is the counter; stacked, it is the last beat whose top
 * has passed 30% of the viewport.
 */
function readPlace(section: HTMLElement | null, pinned: boolean, beat: number): Place {
  if (!section) return { kind: "before", offset: window.scrollY };
  const rect = section.getBoundingClientRect();
  if (rect.top > 0) return { kind: "before", offset: window.scrollY };
  // Past the tour only once it has fully left the viewport: stacked, the whole tour fits in
  // little more than a screen, so "bottom in view" still means reading its beats.
  if (rect.bottom <= 0) return { kind: "after", offset: -rect.bottom };
  if (pinned) return { kind: "beat", beat };
  // Stacked, beats sit in rows: take the lowest row whose top has reached the 30% line, and
  // the first beat in it (reading order), so restoring onto a row reads back the same beat.
  const line = window.innerHeight * 0.3 + 2;
  const tops = [...section.querySelectorAll<HTMLElement>("[data-beat]")].map(
    (el) => el.getBoundingClientRect().top
  );
  const reached = tops.filter((t) => t <= line);
  if (reached.length === 0) return { kind: "beat", beat: 0 };
  const row = Math.max(...reached);
  return {
    kind: "beat",
    beat: Math.max(
      0,
      tops.findIndex((t) => Math.abs(t - row) < 2)
    )
  };
}
