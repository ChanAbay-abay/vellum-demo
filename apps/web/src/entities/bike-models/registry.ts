import type * as THREE from "three";

import { createEdgeModel } from "./edge/create-edge-model";
import { createFuerzaModel } from "./fuerza/create-fuerza-model";
import { createTerrenoModel } from "./terreno/create-terreno-model";

/**
 * Factory convention (all bike models):
 * - Units are metres at real bike scale: wheelbase ~1.0 m, 700c wheel ~0.67 m dia, 29er ~0.74 m.
 * - Origin is on the ground under the bottom bracket.
 * - The bike faces +X (front wheel toward +X), Y is up, drive side is +Z
 *   (a camera on +Z sees the drive side).
 * - Top-level children are named groups so an exploded view can be added later:
 *   frame, fork, wheel-front, wheel-rear, drivetrain, cockpit, seatpost-saddle.
 */
export type BikeModelId = "fuerza" | "edge" | "terreno";

export type BikeModelEntry = {
  factory: () => THREE.Group;
  label: string;
};

export const BIKE_MODEL_IDS = ["fuerza", "edge", "terreno"] as const satisfies BikeModelId[];

export const BIKE_MODELS: Record<BikeModelId, BikeModelEntry> = {
  fuerza: {
    factory: createFuerzaModel,
    label: "Fuerza"
  },
  edge: {
    factory: createEdgeModel,
    label: "Edge"
  },
  terreno: {
    factory: createTerrenoModel,
    label: "Terreno"
  }
};
