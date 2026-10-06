import { type ResponsiveImage } from "@zo-stack/ui/components/picture";

import { type BikeModelId } from "@/entities/bike-models";

/**
 * The typed content one model page is built from. Each model keeps its own object in
 * `pages/model-<slug>/config/<slug>.content.ts`; `<ModelPage>` renders any of them.
 */

export type ModelImage = {
  image: ResponsiveImage;
  alt: string;
  /**
   * A non-Vellum stand-in photo. Renders a "Sample photo" chip on the image and appends
   * "(sample photo)" to its alt text, so nobody mistakes it for the client's own product.
   */
  sample?: { credit?: string };
};

/**
 * Where the camera sits for one beat of the 3D tour, in the bike factory's own coordinates
 * (entities/bike-models/registry.ts: metres, origin on the ground under the bottom bracket,
 * +X toward the front wheel, Y up, +Z the drive side).
 *
 * The camera orbits `target`: azimuth 0 looks at the drive side from +Z, positive azimuth
 * swings toward the front wheel, negative toward the rear. Elevation is degrees above the
 * horizon. `distance` is in metres at a square canvas; narrower canvases back off to keep the
 * same horizontal framing. Plain numbers, so they can be retuned without touching the component.
 */
export type CameraPose = {
  target: readonly [number, number, number];
  azimuth: number;
  elevation: number;
  distance: number;
  /** Vertical field of view, degrees */
  fov: number;
};

/**
 * One stop of the scroll tour. Scrolling into a beat tweens the camera from wherever the last
 * beat left it to `camera`, eased, so there are no jumps:
 * - `via` routes the move through a waypoint: a wide pose between two close-ups reads as
 *   pulling back out and zooming in again.
 * - Azimuth is not wrapped, so a spin is just a bigger number: 0 → -360 is one full turn
 *   toward the rear, 30 → 390 one turn toward the front.
 * - `orbit` keeps turning the camera this many degrees while the beat holds on screen.
 */
export type ModelBeat = {
  title: string;
  body?: string;
  /**
   * The tour's opening beat on pages without a hero: its title is the page's h1 (with the model
   * name prefixed for screen readers).
   */
  intro?: boolean;
  camera: CameraPose;
  via?: CameraPose;
  orbit?: number;
};

export type Colorway = {
  name: string;
  /** "Limited · 2026", "2025"... */
  tag?: string;
  /** Retro only: the tag renders in stripe red (DESIGN.md §2, accent use 3) */
  limited?: boolean;
  /**
   * Highlighted in the switcher pill: a pulsing ring until the visitor picks any colorway, and
   * its `tag` shown above the segment. Not the default selection (that stays the first).
   */
  featured?: boolean;
  /** Swatch fill: the colorway's dominant tone, sampled from its studio photo */
  swatch: string;
  /** First photo is the main shot */
  photos: readonly [ModelImage, ...ModelImage[]];
};

export type PastColorway = { name: string; year: string; photo: ModelImage };

/**
 * One example build as labelled rows (Groupset, Gearing...). The recap renders each build as
 * a card listing the same labels in the same order, so give every build every label.
 */
export type ModelBuild = { name: string; parts: readonly { label: string; value: string }[] };

export type ModelContent = {
  /** Display name, rendered as the slanted model title (hero, and giant behind the 3D bike). */
  name: string;
  /** Use the SVG wordmark instead of type (Edge, DESIGN.md §3) */
  wordmark?: "edge";
  line: string;
  /**
   * Optional sand hero above the tour, with a fixed "Jump to summary" pill. Without it the page
   * opens on the tour, whose first beat should be `intro`, and the tour's control bar (arrows,
   * counter, progress, jump link) replaces the pill.
   */
  hero?: { image: ModelImage; summaryLabel: string };
  tour: {
    /** Visually hidden heading for the tour section */
    heading: string;
    bike: BikeModelId;
    beats: readonly [ModelBeat, ...ModelBeat[]];
    /** Shown until the 3D model has drawn, and instead of it without WebGL or JavaScript */
    poster: ModelImage;
    /** Jump link label in the control bar (pages without a hero) */
    summaryLabel?: string;
  };
  /** The gallery right after the tour; it carries `#summary`, where the jump links land. */
  summary: {
    /** One string, or one string per line: each line is forced onto its own line at every width. */
    heading: string | readonly string[];
    /** Models with colorways get the switcher pill; models without show `gallery` only. */
    colorways?: { current: readonly [Colorway, ...Colorway[]]; past?: readonly PastColorway[] };
    gallery?: readonly ModelImage[];
    recapHeading: string;
    /** Photo spanning the recap's full height on the left. Without it the sheet runs alone. */
    recapImage?: ModelImage;
    specs: readonly { label: string; value: string }[];
    builds?: { heading: string; note: string; items: readonly ModelBuild[] };
  };
  /**
   * Closing CTA: Instagram DM primary, Messenger as the quieter secondary. With `image` the
   * photo bleeds off the right edge onto the footer stripe; without it the CTA is copy only.
   */
  cta: {
    heading: string;
    label: string;
    microcopy?: string;
    /** Secondary Messenger link; omitted when absent */
    messengerLabel?: string;
    image?: ModelImage;
    /** Copy side; see `ClosingCtaProps.align`. Default left. */
    align?: "left" | "right";
  };
};
