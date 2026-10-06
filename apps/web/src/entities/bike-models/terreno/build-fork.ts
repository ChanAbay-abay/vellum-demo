import * as THREE from "three";

import {
  CROWN_S,
  FORK_LEG_Z,
  FRONT_AXLE,
  STEER_DIR,
  STEER_NORMAL,
  forkLegPoint,
  steerPoint
} from "./terreno-dimensions";
import { MaterialBatch, line, segmentMatrix, sweep } from "./terreno-geometry-utils";
import { type TerrenoMaterials } from "./terreno-materials";

const LOWER_TOP_S = 0.235;
const STANCHION_TOP_S = CROWN_S + 0.012;

/** 100 mm XC fork: black stanchions and lowers, front arch, NDS post-mount caliper. */
export function buildFork(m: TerrenoMaterials) {
  const group = new THREE.Group();
  group.name = "fork";
  const batch = new MaterialBatch();
  const tilt = Math.atan2(-STEER_DIR.x, STEER_DIR.y);

  for (const side of [1, -1]) {
    const z = new THREE.Vector3(0, 0, FORK_LEG_Z * side);
    const stanchion = new THREE.CylinderGeometry(0.016, 0.016, 1, 24, 1, true);
    batch.add(
      stanchion,
      m.blackSatin,
      segmentMatrix(forkLegPoint(LOWER_TOP_S - 0.01).add(z), forkLegPoint(STANCHION_TOP_S).add(z))
    );
    // Lowers carry the SID graphic; swept so their UVs follow the leg, then shifted into this leg's
    // half of the texture so each graphic lands on the outer face only.
    const lower = sweep(
      line(forkLegPoint(-0.014).add(z), forkLegPoint(LOWER_TOP_S).add(z)),
      (t) => {
        const r = t > 0.93 ? 0.0225 : THREE.MathUtils.lerp(0.0205, 0.0215, t);
        return { h: r * 2, w: r * 2 };
      },
      { lengthSegs: 12, radialSegs: 24, unitU: true }
    );
    const uv = lower.getAttribute("uv");
    for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * 0.5 + (side > 0 ? 0 : 0.5));
    batch.add(lower, m.forkLower);
    // Dust-seal ring (the photo shows a warm metallic ring at the top of each lower).
    const seal = new THREE.CylinderGeometry(0.0182, 0.0182, 1, 24, 1, true);
    batch.add(
      seal,
      m.gold,
      segmentMatrix(
        forkLegPoint(LOWER_TOP_S - 0.002).add(z),
        forkLegPoint(LOWER_TOP_S + 0.006).add(z)
      )
    );
    // Dropout boss.
    const boss = new THREE.CylinderGeometry(0.017, 0.017, 0.016, 20);
    boss.rotateX(Math.PI / 2);
    boss.translate(FRONT_AXLE.x, FRONT_AXLE.y, FORK_LEG_Z * side);
    batch.add(boss, m.blackSatin);
  }

  // Crown: rounded block spanning both stanchions and the steerer, tilted to the head angle.
  const crown = sweep(
    line(new THREE.Vector3(0, 0, -0.082), new THREE.Vector3(0, 0, 0.082)),
    (t) => {
      const mid = 1 - Math.abs(t - 0.5) * 2;
      return { h: 0.03 + 0.012 * mid, w: 0.05 + 0.03 * mid, n: 3.2 };
    },
    { lengthSegs: 16, radialSegs: 20 }
  );
  crown.rotateZ(tilt);
  const crownCentre = steerPoint(CROWN_S - 0.004).addScaledVector(STEER_NORMAL, 0.022);
  crown.translate(crownCentre.x, crownCentre.y, 0);
  batch.add(crown, m.blackSatin);

  // Steerer stub below the head tube (the rest is hidden inside it).
  const steerer = new THREE.CylinderGeometry(0.019, 0.022, 1, 24);
  batch.add(steerer, m.blackSatin, segmentMatrix(steerPoint(CROWN_S), steerPoint(CROWN_S + 0.02)));

  // Top caps: blue anodised on the drive side (air spring), black on the damper side.
  const cap = new THREE.CylinderGeometry(0.0125, 0.0125, 1, 20);
  batch.add(
    cap.clone(),
    m.anodisedBlue,
    segmentMatrix(
      forkLegPoint(STANCHION_TOP_S).add(new THREE.Vector3(0, 0, FORK_LEG_Z)),
      forkLegPoint(STANCHION_TOP_S + 0.009).add(new THREE.Vector3(0, 0, FORK_LEG_Z))
    )
  );
  batch.add(
    cap,
    m.blackSatin,
    segmentMatrix(
      forkLegPoint(STANCHION_TOP_S).add(new THREE.Vector3(0, 0, -FORK_LEG_Z)),
      forkLegPoint(STANCHION_TOP_S + 0.007).add(new THREE.Vector3(0, 0, -FORK_LEG_Z))
    )
  );

  // Arch bows forward between the lowers.
  const archCurve = new THREE.CatmullRomCurve3([
    forkLegPoint(LOWER_TOP_S - 0.05).add(new THREE.Vector3(0, 0, -FORK_LEG_Z)),
    forkLegPoint(LOWER_TOP_S - 0.02)
      .addScaledVector(STEER_NORMAL, 0.024)
      .add(new THREE.Vector3(0, 0, -0.035)),
    forkLegPoint(LOWER_TOP_S - 0.01).addScaledVector(STEER_NORMAL, 0.03),
    forkLegPoint(LOWER_TOP_S - 0.02)
      .addScaledVector(STEER_NORMAL, 0.024)
      .add(new THREE.Vector3(0, 0, 0.035)),
    forkLegPoint(LOWER_TOP_S - 0.05).add(new THREE.Vector3(0, 0, FORK_LEG_Z))
  ]);
  batch.add(new THREE.TubeGeometry(archCurve, 24, 0.011, 12, false), m.blackSatin);

  // Front thru-axle and NDS caliper (silver in the photo) on the post mount behind the leg.
  const axle = new THREE.CylinderGeometry(0.0075, 0.0075, 0.15, 16);
  axle.rotateX(Math.PI / 2);
  axle.translate(FRONT_AXLE.x, FRONT_AXLE.y, 0);
  batch.add(axle, m.blackSatin);
  const lever = new THREE.BoxGeometry(0.05, 0.008, 0.006);
  lever.rotateZ(-0.5);
  lever.translate(FRONT_AXLE.x + 0.012, FRONT_AXLE.y - 0.018, FORK_LEG_Z + 0.024);
  batch.add(lever, m.blackSatin);
  const caliper = new THREE.BoxGeometry(0.056, 0.03, 0.024);
  caliper.rotateZ(tilt + Math.PI / 2);
  const caliperPos = FRONT_AXLE.clone()
    .addScaledVector(STEER_DIR, 0.05)
    .addScaledVector(STEER_NORMAL, -0.058);
  caliper.translate(caliperPos.x, caliperPos.y, -0.05);
  batch.add(caliper, m.silver);

  return batch.flushInto(group);
}
