/**
 * Fuerza Disc page copy, photos and 3D camera beats (PRD "Fuerza Disc"). Rendered by the shared
 * `<ModelPage>`; Edge and Terreno get a sibling file of the same shape.
 *
 * Camera poses are in the bike factory's coordinates (see `CameraPose` in
 * widgets/model-page/model/model-content.ts): metres, origin under the bottom bracket, +X to the
 * front wheel, Y up, +Z the drive side. Landmarks used below, read from the current Fuerza model:
 * bottom bracket (0, 0.27), head tube (0.44, 0.68 → 0.39, 0.83), seatpost (-0.14, 0.72 → -0.19,
 * 0.91), front axle (0.58, 0.34), rear axle (-0.41, 0.34). Retune these numbers when the final
 * model lands; the component needs no change.
 *
 * Not rendered, still to ask the client (`*` in the PRD): frame weight, geometry chart.
 * Never render prices or availability (PRD scope rules).
 */
import champagneDetail from "@/shared/assets/images/fuerza/champagne/fuerza-champagne-detail.jpg?responsive";
import champagneStudioAlt from "@/shared/assets/images/fuerza/champagne/fuerza-champagne-studio-alt.jpg?responsive";
import champagneStudio from "@/shared/assets/images/fuerza/champagne/fuerza-champagne-studio.jpg?responsive";
import builtPair from "@/shared/assets/images/fuerza/details/fuerza-built-pair.jpg?responsive";
import frameTubes from "@/shared/assets/images/fuerza/details/fuerza-frame-tubes.jpg?responsive";
import ghostBike from "@/shared/assets/images/fuerza/ghost/fuerza-ghost-bike.jpg?responsive";
import phantomDetail from "@/shared/assets/images/fuerza/phantom/fuerza-phantom-detail.jpg?responsive";
import phantomLifestyle from "@/shared/assets/images/fuerza/phantom/fuerza-phantom-lifestyle.jpg?responsive";
import retroBlackFrameset from "@/shared/assets/images/fuerza/retro-black/fuerza-retro-black-frameset.jpg?responsive";
import retroBlackHeadtube from "@/shared/assets/images/fuerza/retro-black/fuerza-retro-black-headtube.jpg?responsive";
import retroPairDetail from "@/shared/assets/images/fuerza/retro-black/fuerza-retro-pair-detail.jpg?responsive";
import retroGreigeBike from "@/shared/assets/images/fuerza/retro-greige/fuerza-retro-greige-bike.jpg?responsive";
import retroGreigeFrameset from "@/shared/assets/images/fuerza/retro-greige/fuerza-retro-greige-frameset.jpg?responsive";
import retroGreigeHeadtube from "@/shared/assets/images/fuerza/retro-greige/fuerza-retro-greige-headtube.jpg?responsive";
import rudyBadge from "@/shared/assets/images/fuerza/rudy-project/fuerza-rudy-project-badge.jpg?responsive";
import rudyFork from "@/shared/assets/images/fuerza/rudy-project/fuerza-rudy-project-fork.jpg?responsive";
import rudyStudio from "@/shared/assets/images/fuerza/rudy-project/fuerza-rudy-project-studio.jpg?responsive";
import silverFreezeSnow from "@/shared/assets/images/fuerza/silver-freeze/fuerza-silver-freeze-snow.jpg?responsive";
import spectrumBike from "@/shared/assets/images/fuerza/spectrum-silver/fuerza-spectrum-silver-bike.jpg?responsive";
import spectrumDetail from "@/shared/assets/images/fuerza/spectrum-silver/fuerza-spectrum-silver-detail.jpg?responsive";
import spectrumFrameset from "@/shared/assets/images/fuerza/spectrum-silver/fuerza-spectrum-silver-frameset.jpg?responsive";
import whiteHazeBuild from "@/shared/assets/images/fuerza/white-haze/fuerza-white-haze-build.jpg?responsive";
import whiteHazeDetail from "@/shared/assets/images/fuerza/white-haze/fuerza-white-haze-detail.jpg?responsive";
import whiteHazeStudio from "@/shared/assets/images/fuerza/white-haze/fuerza-white-haze-studio.jpg?responsive";

import { type ModelContent } from "@/widgets/model-page";

export const FUERZA = {
  name: "Fuerza",
  line: "An all-rounder frameset designed for those who set the pace.",
  // No hero: the page opens on the tour, beat 1 is the intro (round 2, Chan 2026-10-07).
  tour: {
    heading: "Inside the Fuerza",
    bike: "fuerza",
    poster: { image: retroGreigeFrameset, alt: "Fuerza Retro Greige frameset" },
    summaryLabel: "Jump to summary",
    beats: [
      {
        intro: true,
        title: "An all-rounder frameset designed for those who set the pace.",
        // Wide hero pose. -332 is the same view as 28, one turn back, so the move into
        // "Drawn in Cebu" (28) is a full spin around the frame.
        camera: { target: [0.09, 0.52, 0], azimuth: -332, elevation: 8, distance: 3.4, fov: 30 },
        orbit: 12
      },
      {
        title: "Drawn in Cebu.",
        body: "A carbon frameset designed in Cebu and built in Taiwan, by a brand that has drawn race bikes for 22 years.",
        camera: { target: [0.09, 0.52, 0], azimuth: 28, elevation: 8, distance: 3.6, fov: 30 },
        orbit: 50
      },
      {
        title: "Zero-offset aero post.",
        body: "An aero seatpost with zero offset puts you forward, in a tucked position.",
        camera: { target: [-0.17, 0.78, 0], azimuth: 35, elevation: 12, distance: 1.25, fov: 30 }
      },
      {
        title: "Curved, tapered aero fork.",
        body: "Up front, a curved, tapered aero fork.",
        via: { target: [0.09, 0.52, 0], azimuth: 45, elevation: 10, distance: 3.2, fov: 30 },
        camera: { target: [0.48, 0.55, 0], azimuth: 52, elevation: 4, distance: 1.55, fov: 30 }
      },
      {
        title: "Nothing lost at the pedals.",
        body: "A massive bottom bracket and oversized chainstays turn every pedal stroke into clean power transfer.",
        via: { target: [0.09, 0.52, 0], azimuth: 10, elevation: 8, distance: 3.2, fov: 30 },
        camera: { target: [-0.12, 0.3, 0], azimuth: -24, elevation: 12, distance: 1.45, fov: 30 }
      },
      {
        title: "Fully internal routing.",
        body: "Fully internal routing keeps every line inside the frame.",
        via: { target: [0.09, 0.52, 0], azimuth: 20, elevation: 10, distance: 3.2, fov: 30 },
        camera: { target: [0.36, 0.76, 0], azimuth: 38, elevation: 16, distance: 1.3, fov: 30 }
      },
      {
        title: "For those who set the pace.",
        body: "An all-rounder: quick to accelerate, stable at speed. Built for racing and fast group rides.",
        camera: { target: [0.09, 0.52, 0], azimuth: 0, elevation: 0, distance: 3.3, fov: 30 }
      },
      {
        title: "Made here, backed here.",
        body: "Twenty-two years of Vellum, drawn in Cebu. A five-year frame warranty. A showroom in Cabancalan and dealers from La Union to Davao. And details like the zero-offset aero post.",
        // One full turn toward the rear on the way in, pulled wide and high at the half-way mark.
        via: { target: [0.09, 0.52, 0], azimuth: -180, elevation: 22, distance: 4.4, fov: 30 },
        camera: { target: [0.09, 0.5, 0], azimuth: -332, elevation: 10, distance: 3.6, fov: 30 }
      }
    ]
  },
  summary: {
    heading: ["Seven Colorways.", "One Frame."],
    colorways: {
      current: [
        {
          name: "Retro Black",
          tag: "Limited · 2026",
          limited: true,
          swatch: "#151515",
          photos: [
            { image: retroBlackFrameset, alt: "Fuerza Retro Black frameset on a sand backdrop" },
            {
              image: retroBlackHeadtube,
              alt: "Retro Black head tube and fork crown with the Vellum mark"
            },
            { image: retroPairDetail, alt: "Retro stripe bands at the seat cluster" }
          ]
        },
        {
          name: "Retro Greige",
          tag: "Limited · 2026",
          limited: true,
          swatch: "#e4ddd1",
          photos: [
            { image: retroGreigeBike, alt: "Fuerza Retro Greige complete bike on a sand backdrop" },
            { image: retroGreigeFrameset, alt: "Fuerza Retro Greige frameset" },
            { image: retroGreigeHeadtube, alt: "Retro Greige head tube and fork" }
          ]
        },
        {
          name: "Spectrum Silver",
          tag: "2025",
          swatch: "#a9abad",
          photos: [
            { image: spectrumBike, alt: "Fuerza Spectrum Silver complete bike on graphite" },
            { image: spectrumFrameset, alt: "Fuerza Spectrum Silver frameset" },
            { image: spectrumDetail, alt: "Spectrum Silver down tube with the Vellum wordmark" }
          ]
        },
        {
          name: "White Haze",
          swatch: "#efefed",
          photos: [
            { image: whiteHazeStudio, alt: "Fuerza White Haze complete bike in the studio" },
            { image: whiteHazeDetail, alt: "White Haze head tube with the Vellum mark" },
            { image: whiteHazeBuild, alt: "Fuerza White Haze build against a stone wall" }
          ]
        },
        {
          name: "Phantom",
          swatch: "#1e1f21",
          photos: [
            { image: phantomDetail, alt: "Fuerza Phantom, gloss black wordmark on black" },
            { image: phantomLifestyle, alt: "Fuerza Phantom after a long ride" }
          ]
        },
        {
          name: "Champagne",
          tag: "2024",
          swatch: "#b8b398",
          photos: [
            { image: champagneStudio, alt: "Fuerza Champagne complete bike on a sage backdrop" },
            { image: champagneStudioAlt, alt: "Fuerza Champagne, three-quarter view" },
            { image: champagneDetail, alt: "Champagne top tube and wordmark" }
          ]
        },
        {
          name: "Rudy Project",
          tag: "Rudy Project × Vellum",
          featured: true,
          swatch: "#c3161d",
          photos: [
            { image: rudyStudio, alt: "Fuerza Rudy Project edition on a red backdrop" },
            { image: rudyFork, alt: "Rudy Project edition fork with Rudy lettering" },
            { image: rudyBadge, alt: "Rudy Project edition top tube badge" }
          ]
        }
      ],
      past: [
        {
          name: "Ghost",
          year: "2023",
          photo: { image: ghostBike, alt: "Fuerza Ghost, black on black" }
        },
        {
          name: "Silver Freeze",
          year: "2023",
          photo: { image: silverFreezeSnow, alt: "Fuerza Silver Freeze in the snow" }
        }
      ]
    },
    recapHeading: "The Fuerza, in short.",
    recapImage: {
      image: frameTubes,
      alt: "Fuerza frames in three finishes, stacked in the studio"
    },
    // The spec sheet: PRD-sourced only (PRD "Fuerza Disc" body, frameset, sizes, options).
    specs: [
      { label: "Frame", value: "Carbon, designed in Cebu, built in Taiwan" },
      { label: "Seatpost", value: "Aero, zero offset" },
      { label: "Fork", value: "Curved, tapered aero" },
      { label: "Bottom bracket", value: "Oversized, with oversized chainstays" },
      { label: "Routing", value: "Fully internal" },
      { label: "Frameset includes", value: "Frame, fork, headset, seatpost" },
      { label: "Sizes", value: "XS · S · M · L" },
      { label: "Options", value: "Frameset only, or a complete build to your spec." }
    ],
    builds: {
      heading: "Two example builds",
      note: "Components shown for reference. Every build is put together to your spec.",
      items: [
        {
          name: "Spectrum Silver · 105",
          parts: [
            { label: "Groupset", value: "Shimano 105 R7020 11-speed hydraulic" },
            { label: "Gearing", value: "50-34t 170mm crankset, 11-34T cassette" },
            { label: "Wheels", value: "Meroca 38mm alloy wheels" },
            { label: "Cockpit", value: "Carbon cockpit" },
            { label: "Saddle", value: "Prologo saddle" }
          ]
        },
        {
          name: "White Haze · 105 Di2",
          parts: [
            { label: "Groupset", value: "Shimano 105 Di2 12-speed hydraulic" },
            { label: "Gearing", value: "52-36t 170mm crankset, 11-34T cassette" },
            { label: "Wheels", value: "Meroca 42mm carbon wheels" },
            { label: "Cockpit", value: "Carbon cockpit" },
            { label: "Saddle", value: "PRO saddle" }
          ]
        }
      ]
    }
  },
  cta: {
    heading: "Find your Fuerza.",
    label: "Check availability",
    microcopy: "Availability changes weekly. Message us for sizes and builds.",
    messengerLabel: "Or Messenger",
    image: { image: builtPair, alt: "Built Fuerzas lined up in the Vellum showroom" }
  }
} satisfies ModelContent;
