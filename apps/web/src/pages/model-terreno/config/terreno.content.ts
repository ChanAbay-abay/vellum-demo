/**
 * Terreno page copy, photos and 3D camera beats (PRD "Terreno"). Rendered by the shared
 * `<ModelPage>`. No colorways, so the gallery has no switcher pill (Chan, 2026-10-07).
 *
 * Camera poses: see `CameraPose` (widgets/model-page/model/model-content.ts). Landmarks from
 * the current Terreno model (29er): bottom bracket (0, 0.30), rear axle (-0.44, 0.37), front
 * axle (0.64, 0.37); head tube and top tube are estimates. Retune here.
 *
 * `*` ASK the client before delivery: current status of the Terreno (only two older rider
 * photos found, PRD). Copy is limited to the PRD body until they confirm.
 */
import xcGrass from "@/shared/assets/images/terreno/samples/sample-xc-hardtail-grass-2.jpg?responsive";
import xcRoad from "@/shared/assets/images/terreno/samples/sample-xc-hardtail-road-1.jpg?responsive";
import xcStream from "@/shared/assets/images/terreno/samples/sample-xc-riding-stream-5.jpg?responsive";
import terrenoMtb from "@/shared/assets/images/terreno/terreno-mtb-ugc.jpg?responsive";
import terrenoShowroom from "@/shared/assets/images/terreno/terreno-showroom-ugc.jpg?responsive";

import { type ModelContent } from "@/widgets/model-page";

export const TERRENO = {
  name: "Terreno",
  line: "XC race frame.",
  // No hero: the page opens on the tour, beat 1 is the intro.
  tour: {
    heading: "Inside the Terreno",
    bike: "terreno",
    poster: { image: terrenoMtb, alt: "Vellum Terreno on the trail" },
    summaryLabel: "Jump to summary",
    beats: [
      {
        intro: true,
        title: "XC race frame.",
        // Wide pose; -332 is the same view as 28, so the move into beat 2 is a full spin.
        camera: { target: [0.1, 0.55, 0], azimuth: -332, elevation: 8, distance: 4.0, fov: 30 },
        orbit: 12
      },
      {
        title: "Built for cross-country.",
        body: "A cross-country race-specific carbon frame.",
        camera: { target: [0.1, 0.55, 0], azimuth: 28, elevation: 8, distance: 3.9, fov: 30 },
        orbit: 45
      },
      {
        title: "Diamond-profile tubes.",
        body: "Diamond-profile tubes for lateral stiffness with vertical compliance.",
        camera: { target: [0.2, 0.62, 0], azimuth: 24, elevation: 8, distance: 2.0, fov: 30 }
      },
      {
        title: "Unidirectional carbon.",
        body: "A unidirectional carbon finish.",
        via: { target: [0.1, 0.55, 0], azimuth: 0, elevation: 8, distance: 3.5, fov: 30 },
        camera: { target: [0.18, 0.6, 0], azimuth: -28, elevation: 12, distance: 1.7, fov: 30 }
      },
      {
        title: "FSA integrated headset.",
        body: "An FSA integrated headset up front.",
        via: { target: [0.1, 0.55, 0], azimuth: -180, elevation: 22, distance: 4.6, fov: 30 },
        camera: { target: [0.46, 0.8, 0], azimuth: -300, elevation: 12, distance: 1.3, fov: 30 }
      }
    ]
  },
  summary: {
    // PROPOSED copy (not in the PRD).
    heading: ["On the trail.", "Built for the dirt."],
    gallery: [
      { image: terrenoMtb, alt: "Vellum Terreno on the trail" },
      { image: terrenoShowroom, alt: "Vellum Terreno in the showroom" },
      {
        image: xcRoad,
        alt: "Dark carbon XC hardtail on a forest road",
        sample: { credit: "Austin Briones / Pexels" }
      },
      {
        image: xcGrass,
        alt: "Hardtail mountain bike in a grassy clearing",
        sample: { credit: "Jamiul Islam / Pexels" }
      },
      {
        image: xcStream,
        alt: "Rider on a black hardtail splashing through a stream",
        sample: { credit: "Josue Rodriguez / Pexels" }
      }
    ],
    recapHeading: "The Terreno, in short.",
    // PRD-sourced only. `*` not rendered, ask the client: frame weight, sizes, geometry, wheel size, current status.
    specs: [
      { label: "Frame", value: "Carbon, XC race-specific" },
      { label: "Tubes", value: "Diamond profile" },
      { label: "Finish", value: "Unidirectional carbon" },
      { label: "Headset", value: "FSA integrated" }
    ]
  },
  // PROPOSED heading, so it does not repeat the gallery's last line.
  cta: {
    heading: "Find your Terreno.",
    label: "Ask about Terreno",
    // Pexels stand-in (context/images/terreno/samples/SOURCES.md); not grass-2 (Rockrider logo).
    image: {
      image: xcRoad,
      alt: "Dark XC hardtail on a forest road",
      sample: { credit: "Austin Briones / Pexels" }
    }
  }
} satisfies ModelContent;
