import * as THREE from "three";

import {
  BB,
  CHAINLINE_Z,
  CHAINRING_TEETH,
  CHAIN_COG,
  CRANK_ANGLE,
  CRANK_LENGTH,
  REAR_AXLE,
  cogZ,
  pitchRadius
} from "./terreno-dimensions";
import { MaterialBatch, gearGeometry, line, sectionStops, sweep } from "./terreno-geometry-utils";
import { type TerrenoMaterials } from "./terreno-materials";

// Derailleur pulley centres relative to the rear axle (direct-mount, cage hanging below/behind).
const UPPER_PULLEY = new THREE.Vector3(-0.042, -0.072, 0);
const LOWER_PULLEY = new THREE.Vector3(-0.07, -0.138, 0);
const PULLEY_R = pitchRadius(12);

type Sprocket = { c: THREE.Vector2; r: number; wind: 1 | -1; z: number };

/**
 * Chain path around sprockets listed in travel order. `wind` is +1 when the chain wraps the sprocket
 * clockwise in side view (+X right, +Y up). Tangent between circles with signed radii rho1, rho2:
 * the shared normal n satisfies D.n = rho1 - rho2 and is the left normal of travel.
 */
function chainPath(sprockets: Sprocket[]) {
  const n = sprockets.length;
  const leave: { p: THREE.Vector2; z: number }[] = [];
  const arrive: { p: THREE.Vector2; z: number }[] = [];
  for (let i = 0; i < n; i++) {
    const a = sprockets[i];
    const b = sprockets[(i + 1) % n];
    const d = b.c.clone().sub(a.c);
    const len = d.length();
    const beta = Math.acos(THREE.MathUtils.clamp((a.wind * a.r - b.wind * b.r) / len, -1, 1));
    const normal = d.normalize().rotateAround(new THREE.Vector2(), beta);
    leave[i] = { p: a.c.clone().addScaledVector(normal, a.wind * a.r), z: a.z };
    arrive[(i + 1) % n] = { p: b.c.clone().addScaledVector(normal, b.wind * b.r), z: b.z };
  }
  const points: THREE.Vector3[] = [];
  for (let i = 0; i < n; i++) {
    const s = sprockets[i];
    const a0 = Math.atan2(arrive[i].p.y - s.c.y, arrive[i].p.x - s.c.x);
    let a1 = Math.atan2(leave[i].p.y - s.c.y, leave[i].p.x - s.c.x);
    // Clockwise wrap decreases the angle; counter-clockwise increases it.
    if (s.wind === 1) while (a1 > a0) a1 -= Math.PI * 2;
    else while (a1 < a0) a1 += Math.PI * 2;
    const steps = Math.max(2, Math.ceil(Math.abs(a1 - a0) / 0.12));
    for (let k = 0; k <= steps; k++) {
      const a = THREE.MathUtils.lerp(a0, a1, k / steps);
      points.push(new THREE.Vector3(s.c.x + Math.cos(a) * s.r, s.c.y + Math.sin(a) * s.r, s.z));
    }
  }
  return points;
}

/** Gold chain as link plates placed along the path every half-inch. */
function addChain(batch: MaterialBatch, m: TerrenoMaterials) {
  const rear = new THREE.Vector2(REAR_AXLE.x, REAR_AXLE.y);
  const cogZPlane = cogZ(CHAIN_COG) + 0.0009;
  const points = chainPath([
    { c: new THREE.Vector2(BB.x, BB.y), r: pitchRadius(CHAINRING_TEETH), wind: 1, z: CHAINLINE_Z },
    {
      c: rear.clone().add(new THREE.Vector2(LOWER_PULLEY.x, LOWER_PULLEY.y)),
      r: PULLEY_R,
      wind: 1,
      z: cogZPlane
    },
    {
      c: rear.clone().add(new THREE.Vector2(UPPER_PULLEY.x, UPPER_PULLEY.y)),
      r: PULLEY_R,
      wind: -1,
      z: cogZPlane
    },
    { c: rear, r: pitchRadius(16), wind: 1, z: cogZPlane }
  ]);
  const curve = new THREE.CatmullRomCurve3(points, true, "centripetal");
  const links = Math.round(curve.getLength() / 0.0127);
  const outer = new THREE.BoxGeometry(0.0128, 0.0074, 0.0062);
  const inner = new THREE.BoxGeometry(0.0128, 0.0068, 0.0052);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < links; i++) {
    const t = i / links;
    const p = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    const angle = Math.atan2(tangent.y, tangent.x);
    m4.makeRotationZ(angle).setPosition(p);
    batch.add((i % 2 ? inner : outer).clone(), m.gold, m4);
  }
  outer.dispose();
  inner.dispose();
}

function addCrankset(batch: MaterialBatch, m: TerrenoMaterials) {
  const ringR = pitchRadius(CHAINRING_TEETH);
  const ring = gearGeometry({
    teeth: CHAINRING_TEETH,
    rootR: ringR - 0.0034,
    tipR: ringR + 0.0028,
    holeR: 0.016,
    depth: 0.0026,
    windows: { count: 6, rIn: 0.027, rOut: ringR - 0.0105, armFraction: 0.3 }
  });
  ring.rotateZ(0.2);
  ring.translate(BB.x, BB.y, CHAINLINE_Z - 0.0013);
  batch.add(ring, m.silver);

  // Arms: drive side forward, non-drive side opposite. Tapered, squarish section.
  for (const side of [1, -1]) {
    const angle = side > 0 ? CRANK_ANGLE : CRANK_ANGLE + Math.PI;
    const z = side > 0 ? 0.068 : -0.068;
    const tip = new THREE.Vector3(
      BB.x + Math.cos(angle) * CRANK_LENGTH,
      BB.y + Math.sin(angle) * CRANK_LENGTH,
      z
    );
    batch.add(
      sweep(
        line(new THREE.Vector3(BB.x, BB.y, z), tip),
        sectionStops([
          [0, { h: 0.04, w: 0.018, n: 3 }],
          [1, { h: 0.026, w: 0.016, n: 3 }]
        ]),
        { lengthSegs: 10, radialSegs: 20 }
      ),
      m.silver
    );
    const boss = new THREE.CylinderGeometry(0.021, 0.021, 0.018, 24);
    boss.rotateX(Math.PI / 2);
    boss.translate(BB.x, BB.y, z);
    batch.add(boss, m.silver);
    const eye = new THREE.CylinderGeometry(0.013, 0.013, 0.016, 20);
    eye.rotateX(Math.PI / 2);
    eye.translate(tip.x, tip.y, z);
    batch.add(eye, m.silver);

    // Clipless pedal: spindle plus a compact black body with a silver binding.
    const spindle = new THREE.CylinderGeometry(0.0065, 0.0065, 0.06, 12);
    spindle.rotateX(Math.PI / 2);
    spindle.translate(tip.x, tip.y, z + side * 0.035);
    batch.add(spindle, m.silver);
    const body = new THREE.BoxGeometry(0.072, 0.022, 0.056);
    body.translate(tip.x, tip.y, z + side * 0.072);
    batch.add(body, m.blackSatin);
    const binding = new THREE.BoxGeometry(0.034, 0.026, 0.04);
    binding.translate(tip.x + 0.006, tip.y, z + side * 0.072);
    batch.add(binding, m.silver);
  }

  // Gold spindle/crank bolt ring on the drive side, black bolt centre.
  const bolt = new THREE.CylinderGeometry(0.0165, 0.0165, 0.006, 28);
  bolt.rotateX(Math.PI / 2);
  bolt.translate(BB.x, BB.y, 0.079);
  batch.add(bolt, m.gold);
  const boltCentre = new THREE.CylinderGeometry(0.0085, 0.0085, 0.0065, 6);
  boltCentre.rotateX(Math.PI / 2);
  boltCentre.translate(BB.x, BB.y, 0.0795);
  batch.add(boltCentre, m.blackSatin);
  const spindleBar = new THREE.CylinderGeometry(0.0145, 0.0145, 0.15, 20);
  spindleBar.rotateX(Math.PI / 2);
  spindleBar.translate(BB.x, BB.y, 0.002);
  batch.add(spindleBar, m.gold);
}

/** Direct-mount (UDH) rear derailleur: knuckle on the axle, body down/back, two-pulley cage. */
function addDerailleur(batch: MaterialBatch, m: TerrenoMaterials) {
  const at = (p: THREE.Vector3) => p.clone().add(REAR_AXLE);
  const bodyShape = new THREE.Shape(
    [
      [0.016, 0.014],
      [-0.016, 0.02],
      [-0.05, -0.012],
      [-0.068, -0.062],
      [-0.06, -0.09],
      [-0.03, -0.086],
      [-0.014, -0.04],
      [0.012, -0.012]
    ].map(([x, y]) => new THREE.Vector2(x, y))
  );
  const body = new THREE.ExtrudeGeometry(bodyShape, {
    depth: 0.02,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.004,
    bevelSegments: 2
  });
  body.translate(REAR_AXLE.x, REAR_AXLE.y, 0.066);
  batch.add(body, m.blackSatin);
  // Battery block on the parallelogram.
  const battery = new THREE.BoxGeometry(0.038, 0.022, 0.026);
  battery.rotateZ(0.9);
  battery.translate(REAR_AXLE.x - 0.04, REAR_AXLE.y - 0.03, 0.074);
  batch.add(battery, m.blackSatin);

  const upper = at(UPPER_PULLEY);
  const lower = at(LOWER_PULLEY);
  const cageShape = new THREE.Shape();
  const dir = lower.clone().sub(upper);
  const angle = Math.atan2(dir.y, dir.x);
  const r = 0.021;
  cageShape.absarc(0, 0, r, angle + Math.PI / 2, angle + (Math.PI * 3) / 2, false);
  cageShape.absarc(dir.x, dir.y, r * 1.05, angle - Math.PI / 2, angle + Math.PI / 2, false);
  cageShape.closePath();
  for (const z of [0.04, 0.058]) {
    const plate = new THREE.ExtrudeGeometry(cageShape, {
      depth: 0.003,
      bevelEnabled: false,
      curveSegments: 10
    });
    plate.translate(upper.x, upper.y, z);
    batch.add(plate, m.blackSatin);
  }
  for (const c of [upper, lower]) {
    const pulley = gearGeometry({
      teeth: 12,
      rootR: PULLEY_R - 0.003,
      tipR: PULLEY_R + 0.0025,
      holeR: 0.004,
      depth: 0.004
    });
    pulley.translate(c.x, c.y, cogZ(CHAIN_COG) - 0.001);
    batch.add(pulley, m.blackSatin);
  }
}

export function buildDrivetrain(m: TerrenoMaterials) {
  const group = new THREE.Group();
  group.name = "drivetrain";
  const batch = new MaterialBatch();
  addCrankset(batch, m);
  addChain(batch, m);
  addDerailleur(batch, m);
  return batch.flushInto(group);
}
