import * as THREE from "three";

import {
  CASSETTE_TEETH,
  REAR_DROPOUT_Z,
  WHEEL_RADIUS,
  cogZ,
  pitchRadius
} from "./terreno-dimensions";
import { MaterialBatch, gearGeometry, latheZ, segmentMatrix } from "./terreno-geometry-utils";
import { type TerrenoMaterials } from "./terreno-materials";

// Tyre cross-section is an ellipse in (radius, z): crown at WHEEL_RADIUS - knob height, beads at ~0.306.
const KNOB = 0.0032;
const TYRE_RC = 0.332;
const TYRE_AR = WHEEL_RADIUS - KNOB - TYRE_RC;
const TYRE_AZ = 0.029;
/** The black tread cap covers |psi| < TREAD_PSI; the tan sidewall runs from there to the bead. */
const TREAD_PSI = THREE.MathUtils.degToRad(56);
const BEAD_PSI = THREE.MathUtils.degToRad(140);
const RADIAL_SEGS = 128;

function tyreProfile(from: number, to: number, steps: number): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const psi = THREE.MathUtils.lerp(from, to, i / steps);
    pts.push([TYRE_RC + TYRE_AR * Math.cos(psi), TYRE_AZ * Math.sin(psi)]);
  }
  return pts;
}

function addTyre(batch: MaterialBatch, m: TerrenoMaterials) {
  batch.add(latheZ(tyreProfile(-TREAD_PSI, TREAD_PSI, 10), RADIAL_SEGS), m.tread);
  batch.add(latheZ(tyreProfile(TREAD_PSI, BEAD_PSI, 8), RADIAL_SEGS), m.sidewall);
  batch.add(latheZ(tyreProfile(-BEAD_PSI, -TREAD_PSI, 8), RADIAL_SEGS), m.sidewall);

  // Knobs: a centre row and two staggered shoulder rows, so the silhouette reads as an XC tread.
  const knob = new THREE.BoxGeometry(0.009, KNOB * 2, 0.008);
  const rows: { psi: number; count: number; phase: number; size: number }[] = [
    { psi: 0, count: 120, phase: 0, size: 0.8 },
    { psi: THREE.MathUtils.degToRad(38), count: 100, phase: 0.5, size: 0.75 },
    { psi: THREE.MathUtils.degToRad(-38), count: 100, phase: 0, size: 0.75 }
  ];
  const m4 = new THREE.Matrix4();
  for (const row of rows) {
    const r = TYRE_RC + TYRE_AR * Math.cos(row.psi);
    const z = TYRE_AZ * Math.sin(row.psi);
    // Outward normal of the ellipse at psi, used to tilt shoulder knobs.
    const normal = new THREE.Vector2(
      Math.cos(row.psi) / TYRE_AR,
      Math.sin(row.psi) / TYRE_AZ
    ).normalize();
    for (let k = 0; k < row.count; k++) {
      const a = ((k + row.phase) / row.count) * Math.PI * 2;
      const radial = new THREE.Vector3(Math.cos(a), Math.sin(a), 0);
      const outward = radial
        .clone()
        .multiplyScalar(normal.x)
        .add(new THREE.Vector3(0, 0, normal.y));
      const tangent = new THREE.Vector3(-Math.sin(a), Math.cos(a), 0);
      const across = new THREE.Vector3().crossVectors(tangent, outward);
      m4.makeBasis(
        tangent.multiplyScalar(row.size),
        outward,
        across.multiplyScalar(row.size)
      ).setPosition(radial.multiplyScalar(r).add(new THREE.Vector3(0, 0, z)));
      batch.add(knob.clone(), m.tread, m4);
    }
  }
  knob.dispose();
}

function addRim(batch: MaterialBatch, m: TerrenoMaterials) {
  // Counter-clockwise loop in (r, z) so the lathe faces outward. Deep-ish XC carbon rim, 30 mm wide.
  const profile: [number, number][] = [
    [0.276, 0],
    [0.279, -0.01],
    [0.29, -0.0148],
    [0.309, -0.015],
    [0.309, 0.015],
    [0.29, 0.0148],
    [0.279, 0.01],
    [0.276, 0]
  ];
  batch.add(latheZ(profile, RADIAL_SEGS), m.rimCarbon);
}

function addHub(
  batch: MaterialBatch,
  m: TerrenoMaterials,
  flangeZ: [number, number],
  halfWidth: number
) {
  const [nds, ds] = flangeZ;
  const profile: [number, number][] = [
    [0, -halfWidth],
    [0.012, -halfWidth],
    [0.012, nds - 0.01],
    [0.02, nds - 0.006],
    [0.026, nds - 0.003],
    [0.026, nds + 0.002],
    [0.017, nds + 0.005],
    [0.016, (nds + ds) / 2],
    [0.017, ds - 0.005],
    [0.026, ds - 0.002],
    [0.026, ds + 0.003],
    [0.02, ds + 0.006],
    [0.012, ds + 0.01],
    [0.012, halfWidth],
    [0, halfWidth]
  ];
  batch.add(latheZ(profile, 32), m.blackSatin);
}

/** 28 spokes, two-cross, alternating flanges. */
function addSpokes(batch: MaterialBatch, m: TerrenoMaterials, flangeZ: [number, number]) {
  const count = 28;
  const unit = new THREE.CylinderGeometry(0.0011, 0.0011, 1, 5, 1, true);
  const crossAngle = 2 * ((Math.PI * 4) / count);
  for (let i = 0; i < count; i++) {
    const rimAngle = (i / count) * Math.PI * 2;
    const side = i % 2;
    const dir = (i >> 1) % 2 === 0 ? 1 : -1;
    const hubAngle = rimAngle + dir * crossAngle;
    const hub = new THREE.Vector3(
      Math.cos(hubAngle) * 0.023,
      Math.sin(hubAngle) * 0.023,
      flangeZ[side]
    );
    const rim = new THREE.Vector3(
      Math.cos(rimAngle) * 0.281,
      Math.sin(rimAngle) * 0.281,
      side === 0 ? -0.003 : 0.003
    );
    batch.add(unit.clone(), m.spoke, segmentMatrix(hub, rim));
  }
  unit.dispose();
}

/** 160 mm six-arm rotor on the non-drive side. */
function addRotor(batch: MaterialBatch, m: TerrenoMaterials, z: number) {
  const rotor = gearGeometry({
    teeth: 0,
    rootR: 0.08,
    tipR: 0.08,
    holeR: 0.0225,
    depth: 0.0018,
    windows: { count: 6, rIn: 0.03, rOut: 0.066, armFraction: 0.32 }
  });
  rotor.translate(0, 0, z);
  batch.add(rotor, m.rotor);
}

function addCassette(batch: MaterialBatch, m: TerrenoMaterials) {
  CASSETTE_TEETH.forEach((teeth, i) => {
    const pr = pitchRadius(teeth);
    const big = teeth >= 28;
    const cog = gearGeometry({
      teeth,
      rootR: pr - 0.0035,
      tipR: pr + 0.0025,
      holeR: big ? 0.02 : 0.0175,
      depth: 0.0018,
      windows: big
        ? { count: Math.round(teeth / 5), rIn: 0.027, rOut: pr - 0.009, armFraction: 0.38 }
        : undefined
    });
    cog.translate(0, 0, cogZ(i));
    batch.add(cog, m.silver);
  });
  // Freehub / lockring core.
  const core = new THREE.CylinderGeometry(0.019, 0.019, 0.045, 24);
  core.rotateX(Math.PI / 2);
  core.translate(0, 0, 0.042);
  batch.add(core, m.blackSatin);
}

export function buildWheel(kind: "front" | "rear", axle: THREE.Vector3, m: TerrenoMaterials) {
  const group = new THREE.Group();
  group.name = kind === "front" ? "wheel-front" : "wheel-rear";
  group.position.copy(axle);
  const batch = new MaterialBatch();
  addTyre(batch, m);
  addRim(batch, m);
  if (kind === "front") {
    const flanges: [number, number] = [-0.034, 0.034];
    addHub(batch, m, flanges, 0.055);
    addSpokes(batch, m, flanges);
    addRotor(batch, m, -0.05);
  } else {
    const flanges: [number, number] = [-0.036, 0.02];
    addHub(batch, m, flanges, REAR_DROPOUT_Z - 0.002);
    addSpokes(batch, m, flanges);
    addRotor(batch, m, -0.058);
    addCassette(batch, m);
  }
  batch.flushInto(group);
  group.userData.pivot = { axis: [0, 0, 1], note: "spin about local Z (axle)" };
  return group;
}
