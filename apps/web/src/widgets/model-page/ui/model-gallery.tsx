import { m } from "motion/react";
import { useState } from "react";

import { Picture } from "@zo-stack/ui/components/picture";
import { cn } from "@zo-stack/ui/lib/utils";

import { BikeIcon } from "@/shared/ui/bike-icon";

import { type ModelContent, type ModelImage } from "@/widgets/model-page/model/model-content";

const EASE = [0.22, 1, 0.36, 1] as const;
/** DESIGN.md §5 colorway switch: 0.5s crossfade, with the pill indicator sliding on the same curve */
const FADE = { duration: 0.5, ease: EASE };
/** Hover bike: a small spring rise, and the same spring when it slides between segments. */
const BIKE_SPRING = { type: "spring", stiffness: 420, damping: 30, mass: 0.6 } as const;

/** Relative luminance of a `#rrggbb` swatch, to outline near-white bikes on bone and paper. */
function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = Number.parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

type Bike = { i: number; x: number; shown: boolean; instant: boolean };

type Colorways = NonNullable<ModelContent["summary"]["colorways"]>;

/**
 * The colorway gallery: a segmented switcher pill (one segment per colorway, `aria-pressed`
 * buttons, native keyboard) with an ink indicator that slides to the active segment (Motion
 * `layoutId`), over that colorway's photos.
 *
 * A `featured` colorway gets a pulsing stripe-red ring (until the visitor picks any segment) and
 * its tag above the segment. Hovering or keyboard-focusing a segment pops one tinted line bike
 * up above it; moving along the pill slides that same bike over (decorative, `aria-hidden`,
 * no pointer events). Reduced motion: MotionProvider drops the rise and slide, leaving a fade;
 * the pulse becomes a static ring.
 *
 * Each colorway's photos mount the first time it is picked and then stay mounted, stacked in
 * one grid cell, so switching crossfades decoded layers instead of swapping `src` on one node
 * (RULES §7). Inactive layers are `aria-hidden`.
 */
export function ColorwayGallery({ colorways }: { colorways: Colorways }) {
  const { current, past } = colorways;
  const [active, setActive] = useState(0);
  const [visited, setVisited] = useState<ReadonlySet<number>>(() => new Set([0]));
  const [picked, setPicked] = useState(false);
  const [bike, setBike] = useState<Bike | null>(null);
  const activeColorway = current[active] ?? current[0];
  const bikeColorway = bike ? current[bike.i] : undefined;

  const select = (i: number) => {
    setActive(i);
    setPicked(true);
    setVisited((prev) => (prev.has(i) ? prev : new Set(prev).add(i)));
  };

  const showBike = (i: number, segment: HTMLElement) => {
    const x = segment.offsetLeft + segment.offsetWidth / 2;
    // From hidden it appears in place; from another segment it slides over.
    setBike((prev) => {
      return { i, x, shown: true, instant: !prev?.shown };
    });
  };
  const hideBike = () => setBike((prev) => (prev ? { ...prev, shown: false } : prev));

  return (
    <div className="flex flex-col gap-[2.5rem]">
      <div className="flex flex-col gap-[1.25rem] lg:flex-row lg:items-center lg:justify-between">
        {/* Top padding is the room the featured tag and the hover bike rise into. */}
        <fieldset
          className="bg-bone relative mt-[4.75rem] flex max-w-full min-w-0 gap-[0.25rem] self-start overflow-x-auto rounded-full p-[0.3rem] lg:overflow-visible"
          data-testid="colorway-pill"
          onPointerLeave={hideBike}
        >
          <legend className="sr-only">Colorway</legend>
          {bike && bikeColorway ? (
            <m.div
              animate={{ x: bike.x, y: bike.shown ? 0 : 10, opacity: bike.shown ? 1 : 0 }}
              aria-hidden
              className="pointer-events-none absolute bottom-full left-0 mb-[2.1rem] -ml-[1.5rem] w-[3rem] text-(--bike)"
              data-testid="hover-bike"
              initial={{ x: bike.x, y: 10, opacity: 0 }}
              style={
                {
                  "--bike": bikeColorway.swatch,
                  filter:
                    luminance(bikeColorway.swatch) > 0.6
                      ? "drop-shadow(0 0 0.6px rgb(11 11 10 / 0.9)) drop-shadow(0 0 0.6px rgb(11 11 10 / 0.9))"
                      : undefined
                } as React.CSSProperties
              }
              transition={{
                x: bike.instant ? { duration: 0 } : BIKE_SPRING,
                y: BIKE_SPRING,
                opacity: { duration: 0.2 }
              }}
            >
              <BikeIcon className="block h-auto w-full" />
            </m.div>
          ) : null}
          {current.map((colorway, i) => {
            const isActive = i === active;
            return (
              <button
                aria-pressed={isActive}
                className={cn(
                  "text-caption relative flex h-[2.5rem] shrink-0 cursor-pointer items-center gap-[0.6rem] rounded-full px-[1.1rem] whitespace-nowrap transition-colors duration-300",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  isActive ? "text-paper" : "text-ink/70 hover:text-ink"
                )}
                data-featured={colorway.featured ?? undefined}
                key={colorway.name}
                onBlur={hideBike}
                onClick={() => select(i)}
                onFocus={(e) =>
                  e.currentTarget.matches(":focus-visible") && showBike(i, e.currentTarget)
                }
                onPointerEnter={(e) => e.pointerType === "mouse" && showBike(i, e.currentTarget)}
                type="button"
              >
                {colorway.featured ? (
                  <>
                    {/* Static ring under reduced motion; the pulse stops for good after any pick. */}
                    <span
                      aria-hidden
                      className={cn(
                        "pointer-events-none absolute inset-0 rounded-full",
                        !picked && "featured-ring motion-reduce:animate-none"
                      )}
                      data-testid="featured-ring"
                    />
                    {colorway.tag ? (
                      <span
                        aria-hidden
                        className="text-caption text-stripe-red pointer-events-none absolute bottom-full left-1/2 mb-[0.55rem] -translate-x-1/2 font-medium whitespace-nowrap"
                        data-testid="featured-tag"
                      >
                        {colorway.tag}
                      </span>
                    ) : null}
                  </>
                ) : null}
                {isActive ? (
                  <m.span
                    aria-hidden
                    className="bg-ink absolute inset-0 rounded-full"
                    layoutId="colorway-pill-indicator"
                    transition={FADE}
                  />
                ) : null}
                {/* The fill is product data (the colorway's own tone), not a theme token. */}
                <span
                  aria-hidden
                  className="relative size-[0.75rem] shrink-0 rounded-full bg-(--swatch) shadow-[inset_0_0_0_1px_rgb(128_128_128/0.35)]"
                  style={{ "--swatch": colorway.swatch } as React.CSSProperties}
                />
                <span className="relative">{colorway.name}</span>
              </button>
            );
          })}
        </fieldset>
        <p aria-live="polite" className="text-label flex gap-[0.75rem]">
          <span className="sr-only">Showing </span>
          <span>{activeColorway.name}</span>
          {activeColorway.tag ? (
            <span className={activeColorway.limited ? "text-stripe-red" : "text-muted-foreground"}>
              {activeColorway.tag}
            </span>
          ) : null}
        </p>
      </div>

      <div className="grid" data-testid="colorway-photos">
        {current.map((colorway, i) =>
          visited.has(i) ? (
            <m.ul
              animate={{ opacity: i === active ? 1 : 0 }}
              aria-hidden={i !== active}
              className={cn(
                "grid gap-[1.5rem] [grid-area:1/1] sm:grid-cols-3",
                i !== active && "pointer-events-none"
              )}
              data-active={i === active || undefined}
              initial={false}
              key={colorway.name}
              transition={FADE}
            >
              {colorway.photos.slice(0, 3).map((photo) => (
                <li className="bg-bone relative aspect-4/5 min-h-[16rem]" key={photo.alt}>
                  <Photo photo={photo} sizes="(min-width: 640px) 31vw, 100vw" />
                </li>
              ))}
            </m.ul>
          ) : null
        )}
      </div>

      {past?.length ? (
        <div className="flex flex-col gap-[1.5rem] pt-[1.5rem]">
          <h3 className="text-subheading">Past colorways</h3>
          <ul className="flex flex-wrap gap-[1.5rem]">
            {past.map((colorway) => (
              <li className="flex w-[11rem] flex-col gap-[0.75rem]" key={colorway.name}>
                <div className="bg-bone relative aspect-4/5 min-h-[8rem]">
                  <Photo photo={colorway.photo} sizes="11rem" />
                </div>
                <p className="text-caption">
                  {colorway.name}
                  <span className="text-muted-foreground"> · {colorway.year}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Gallery for models without colorways (Edge, Terreno): no switcher, just the photos. Four
 * columns when the count fills rows of four (so eight photos make two full rows), else three.
 */
export function PhotoGallery({ photos }: { photos: readonly ModelImage[] }) {
  const four = photos.length % 4 === 0;
  return (
    <ul
      className={cn("grid gap-[1.5rem] sm:grid-cols-2", four ? "lg:grid-cols-4" : "lg:grid-cols-3")}
      data-testid="photo-gallery"
    >
      {photos.map((photo, i) => (
        // Static list; alt text can repeat between photos, the position cannot.
        <li className="bg-bone relative aspect-4/5 min-h-[16rem]" key={i}>
          <Photo
            photo={photo}
            sizes={
              four
                ? "(min-width: 1024px) 23vw, (min-width: 640px) 50vw, 100vw"
                : "(min-width: 1024px) 31vw, (min-width: 640px) 50vw, 100vw"
            }
          />
        </li>
      ))}
    </ul>
  );
}

function Photo({ photo, sizes }: { photo: ModelImage; sizes: string }) {
  return (
    <>
      <Picture
        alt={photo.sample ? `${photo.alt} (sample photo)` : photo.alt}
        className="absolute inset-0 block size-full"
        image={photo.image}
        imgClassName="size-full object-cover"
        sizes={sizes}
      />
      {photo.sample ? (
        // Above the image layer and outside any hover treatment, so it is never hidden.
        <span
          aria-hidden
          className="bg-ink/70 text-paper text-label pointer-events-none absolute bottom-[0.75rem] left-[0.75rem] z-10 rounded-full px-[0.75rem] py-[0.45rem] backdrop-blur-sm"
          data-testid="sample-label"
        >
          Sample photo{photo.sample.credit ? ` · ${photo.sample.credit}` : ""}
        </span>
      ) : null}
    </>
  );
}
