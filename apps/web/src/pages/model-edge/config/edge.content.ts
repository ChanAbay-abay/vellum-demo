/**
 * Edge page copy, photos and 3D camera beats (PRD "Edge"). Rendered by the shared `<ModelPage>`.
 * No colorways, so the gallery has no switcher pill (Chan, 2026-10-07).
 *
 * Camera poses: see `CameraPose` (widgets/model-page/model/model-content.ts) and the Fuerza
 * content file. Edge landmarks are estimates against the current model; retune here.
 *
 * `*` ASK the client before delivery: the PRD's "The next chapter" teaser (is a new Edge
 * launching?) is not rendered until they confirm. Archive photos are low-res (PRD Assets).
 * `*` Not in the PRD, so not on the spec sheet: frame material, weight, geometry, sizes.
 *
 * The gallery mixes the four archive photos with four non-Vellum stand-ins (Pexels, credited
 * per context/images/edge/samples/SOURCES.md), each flagged `sample` so it carries the
 * "Sample photo" chip. Swap them for client photos before delivery.
 */
import edgeCollage from "@/shared/assets/images/edge/edge-2007-collage.jpg?responsive";
import edgeGen1 from "@/shared/assets/images/edge/edge-gen1-archive.jpg?responsive";
import edgeGen2 from "@/shared/assets/images/edge/edge-gen2-archive.jpg?responsive";
import edgeCover from "@/shared/assets/images/edge/edge-two-decades-cover.jpg?responsive";
import sampleBlackRed from "@/shared/assets/images/edge/samples/sample-road-black-red-wall-2.jpg?responsive";
import sampleDusk from "@/shared/assets/images/edge/samples/sample-road-dusk-ocean-3.jpg?responsive";
import sampleStoneWall from "@/shared/assets/images/edge/samples/sample-road-stone-wall-4.jpg?responsive";
import sampleStudio from "@/shared/assets/images/edge/samples/sample-road-studio-side-1.jpg?responsive";

import { type ModelContent } from "@/widgets/model-page";

export const EDGE = {
  name: "Edge",
  wordmark: "edge",
  line: "Two decades of Edge.",
  // No hero: the page opens on the tour, beat 1 is the intro (Fuerza pattern, round 4).
  tour: {
    heading: "Inside the Edge",
    bike: "edge",
    poster: { image: edgeGen1, alt: "First-generation Vellum Edge, archive photo" },
    summaryLabel: "Jump to summary",
    beats: [
      {
        intro: true,
        title: "Two decades of Edge.",
        // Wide hero pose. -332 is the same view as 28, one turn back, so the move into "2007."
        // (28) is a full spin around the frame.
        camera: { target: [0.09, 0.52, 0], azimuth: -332, elevation: 8, distance: 3.4, fov: 30 },
        orbit: 12
      },
      {
        title: "2007.",
        body: "The first-generation Edge. The ride that brought victories.",
        camera: { target: [0.09, 0.52, 0], azimuth: 28, elevation: 8, distance: 3.6, fov: 30 },
        orbit: 45
      },
      {
        title: "Into the international peloton.",
        body: "The bike that put a Cebu brand in the international peloton.",
        camera: { target: [0.2, 0.74, 0], azimuth: 24, elevation: 10, distance: 1.7, fov: 30 }
      },
      {
        title: "Light. Stiff. Never nervous.",
        body: "Light, stiff and tuned toward performance without being nervous.",
        via: { target: [0.09, 0.52, 0], azimuth: 0, elevation: 8, distance: 3.2, fov: 30 },
        camera: { target: [-0.12, 0.32, 0], azimuth: -26, elevation: 12, distance: 1.55, fov: 30 }
      },
      {
        title: "Gen 1, then Gen 2.",
        body: "Gen 1 in 2007, then Gen 2. Two decades of the frame that started it.",
        via: { target: [0.09, 0.52, 0], azimuth: -180, elevation: 22, distance: 4.4, fov: 30 },
        camera: { target: [0.09, 0.5, 0], azimuth: -332, elevation: 10, distance: 3.6, fov: 30 }
      }
    ]
  },
  summary: {
    // PROPOSED (round 4): line-split like Fuerza's gallery heading.
    heading: ["From the archive.", "Two decades on."],
    gallery: [
      { image: edgeGen1, alt: "First-generation Vellum Edge, archive photo" },
      { image: edgeGen2, alt: "Second-generation Vellum Edge, archive photo" },
      { image: edgeCollage, alt: "Collage of the 2007 Edge racing season" },
      { image: edgeCover, alt: "Two decades of Edge, cover graphic" },
      {
        image: sampleStudio,
        alt: "Black road race bike in side profile, monochrome",
        sample: { credit: "Mathias Reding / Pexels" }
      },
      {
        image: sampleBlackRed,
        alt: "Black and red road bike against a black brick wall",
        sample: { credit: "Bayram Er / Pexels" }
      },
      {
        image: sampleDusk,
        alt: "Road bike silhouetted by the sea at dusk",
        sample: { credit: "Hao Liang / Pexels" }
      },
      {
        image: sampleStoneWall,
        alt: "Black road bike with tan tyres against a stone wall",
        sample: { credit: "Hao Liang / Pexels" }
      }
    ],
    recapHeading: "The Edge, in short.",
    specs: [
      { label: "First generation", value: "2007" },
      { label: "Generations", value: "Gen 1 · Gen 2" },
      { label: "Ride", value: "Light, stiff, tuned toward performance without being nervous" },
      { label: "Designed in", value: "Cebu" }
    ]
  },
  cta: { heading: "Where it started. 2007.", label: "Be first to know", align: "right" }
} satisfies ModelContent;
