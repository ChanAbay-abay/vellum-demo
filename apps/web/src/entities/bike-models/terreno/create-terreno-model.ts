import * as THREE from "three";

import { buildCockpit, buildSeatpostSaddle } from "./build-cockpit";
import { buildDrivetrain } from "./build-drivetrain";
import { buildFork } from "./build-fork";
import { buildFrame } from "./build-frame";
import { buildWheel } from "./build-wheel";
import { BB, FRONT_AXLE, REAR_AXLE, STEER_DIR, steerPoint } from "./terreno-dimensions";
import { createTerrenoMaterials } from "./terreno-materials";

/**
 * Vellum Terreno XC hardtail, black UD carbon, reconstructed from terreno-showroom-ugc.jpg
 * (img2threejs workdir: context/3d/terreno). Convention: see ../registry.ts.
 * Each top-level group merges its parts into one mesh per material to keep draw calls low.
 */
export function createTerrenoModel(): THREE.Group {
  const materials = createTerrenoMaterials();
  const root = new THREE.Group();
  root.name = "terreno";

  root.add(
    buildFrame(materials),
    buildFork(materials),
    buildWheel("front", FRONT_AXLE, materials),
    buildWheel("rear", REAR_AXLE, materials),
    buildDrivetrain(materials),
    buildCockpit(materials),
    buildSeatpostSaddle(materials)
  );

  // Pivots for later interaction (steering, wheel spin, crank spin), in root space.
  root.userData.sculptRuntime = {
    pivots: {
      steering: { origin: steerPoint(0).toArray(), axis: STEER_DIR.toArray() },
      "wheel-front": { origin: FRONT_AXLE.toArray(), axis: [0, 0, 1] },
      "wheel-rear": { origin: REAR_AXLE.toArray(), axis: [0, 0, 1] },
      crank: { origin: BB.toArray(), axis: [0, 0, 1] }
    }
  };
  return root;
}
