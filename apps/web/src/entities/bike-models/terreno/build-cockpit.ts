import * as THREE from "three";

import {
  BAR_HALF_WIDTH,
  FORK_LEG_Z,
  FRONT_AXLE,
  HEAD_TUBE_TOP_S,
  SADDLE_CLAMP_S,
  SEAT_TUBE_TOP_S,
  STEER_DIR,
  STEER_NORMAL,
  STEM_DIR,
  STEM_LENGTH,
  STEM_S,
  forkLegPoint,
  seatPoint,
  steerPoint
} from "./terreno-dimensions";
import { MaterialBatch, line, segmentMatrix, sweep } from "./terreno-geometry-utils";
import { type TerrenoMaterials } from "./terreno-materials";

const BACKSWEEP = Math.tan(THREE.MathUtils.degToRad(8));

/** Bar centreline at lateral position z: straight through the clamp, then swept back. */
function barPoint(clamp: THREE.Vector3, z: number) {
  const reach = Math.max(0, Math.abs(z) - 0.07);
  return new THREE.Vector3(clamp.x - reach * BACKSWEEP, clamp.y, z);
}

function cylinderBetween(a: THREE.Vector3, b: THREE.Vector3, r: number, radial = 20) {
  return {
    geometry: new THREE.CylinderGeometry(r, r, 1, radial),
    matrix: segmentMatrix(a, b)
  };
}

export function buildCockpit(m: TerrenoMaterials) {
  const group = new THREE.Group();
  group.name = "cockpit";
  const batch = new MaterialBatch();
  const add = (
    part: { geometry: THREE.BufferGeometry; matrix: THREE.Matrix4 },
    mat: THREE.Material
  ) => batch.add(part.geometry, mat, part.matrix);

  // Integrated headset cover, spacer, stem steerer clamp and top cap stacked on the steering axis.
  add(
    cylinderBetween(
      steerPoint(HEAD_TUBE_TOP_S - 0.002),
      steerPoint(HEAD_TUBE_TOP_S + 0.01),
      0.027,
      28
    ),
    m.blackSatin
  );
  add(
    cylinderBetween(steerPoint(HEAD_TUBE_TOP_S + 0.01), steerPoint(STEM_S - 0.021), 0.0185),
    m.blackSatin
  );
  add(
    cylinderBetween(steerPoint(STEM_S - 0.021), steerPoint(STEM_S + 0.021), 0.0215, 24),
    m.blackSatin
  );
  add(cylinderBetween(steerPoint(STEM_S + 0.021), steerPoint(STEM_S + 0.026), 0.018), m.blackSatin);

  // Stem body.
  const stemStart = steerPoint(STEM_S);
  const clamp = stemStart.clone().addScaledVector(STEM_DIR, STEM_LENGTH);
  batch.add(
    sweep(
      line(stemStart, clamp),
      () => {
        return { h: 0.034, w: 0.036, n: 3 };
      },
      {
        lengthSegs: 6,
        radialSegs: 20
      }
    ),
    m.blackSatin
  );
  const clampBody = new THREE.CylinderGeometry(0.021, 0.021, 0.052, 24);
  clampBody.rotateX(Math.PI / 2);
  clampBody.translate(clamp.x, clamp.y, 0);
  batch.add(clampBody, m.blackSatin);

  // Bar: 31.8 clamp section tapering to 22.2 at the grips.
  const barCurve = new THREE.CatmullRomCurve3(
    Array.from({ length: 21 }, (_, i) =>
      barPoint(clamp, -BAR_HALF_WIDTH + (i / 20) * BAR_HALF_WIDTH * 2)
    )
  );
  batch.add(new THREE.TubeGeometry(barCurve, 60, 0.0112, 12, false), m.blackSatin);
  for (const side of [1, -1]) {
    const taper = new THREE.CylinderGeometry(0.0112, 0.0159, 1, 20, 1, true);
    batch.add(
      taper,
      m.blackSatin,
      segmentMatrix(barPoint(clamp, 0.15 * side), barPoint(clamp, 0.03 * side))
    );

    // Lock-on grip with inner collar and bar-end plug.
    const gripIn = barPoint(clamp, 0.232 * side);
    const gripOut = barPoint(clamp, (BAR_HALF_WIDTH - 0.004) * side);
    add(cylinderBetween(gripIn, gripOut, 0.0165), m.blackRubber);
    add(cylinderBetween(barPoint(clamp, 0.224 * side), gripIn, 0.0175), m.blackSatin);
    add(
      cylinderBetween(gripOut, barPoint(clamp, (BAR_HALF_WIDTH + 0.002) * side), 0.015),
      m.silver
    );

    // Brake lever: master cylinder on the bar, blade reaching forward and down.
    const leverAt = barPoint(clamp, 0.196 * side);
    const master = new THREE.BoxGeometry(0.05, 0.022, 0.026);
    master.translate(leverAt.x + 0.012, leverAt.y + 0.004, leverAt.z);
    batch.add(master, m.blackSatin);
    const blade = new THREE.BoxGeometry(0.012, 0.007, 0.07);
    blade.translate(0, 0, 0.03 * side);
    blade.rotateZ(-0.35);
    blade.translate(leverAt.x + 0.04, leverAt.y - 0.006, leverAt.z);
    batch.add(blade, m.blackSatin);
  }
  // Shifter pod under the bar on the drive side.
  const pod = new THREE.BoxGeometry(0.03, 0.02, 0.028);
  const podAt = barPoint(clamp, 0.165);
  pod.translate(podAt.x - 0.012, podAt.y - 0.02, podAt.z);
  batch.add(pod, m.blackSatin);

  // Front brake hose: NDS lever, in front of the head tube, down the NDS leg to the caliper.
  const caliper = FRONT_AXLE.clone()
    .addScaledVector(STEER_DIR, 0.07)
    .addScaledVector(STEER_NORMAL, -0.045);
  const frontHose = new THREE.CatmullRomCurve3([
    barPoint(clamp, -0.196).add(new THREE.Vector3(0.02, 0.0, 0)),
    clamp.clone().add(new THREE.Vector3(0.05, -0.03, -0.12)),
    steerPoint(HEAD_TUBE_TOP_S - 0.06)
      .addScaledVector(STEER_NORMAL, 0.07)
      .add(new THREE.Vector3(0, 0, -0.07)),
    forkLegPoint(0.32)
      .addScaledVector(STEER_NORMAL, -0.02)
      .add(new THREE.Vector3(0, 0, -FORK_LEG_Z - 0.012)),
    forkLegPoint(0.16)
      .addScaledVector(STEER_NORMAL, -0.03)
      .add(new THREE.Vector3(0, 0, -FORK_LEG_Z - 0.008)),
    caliper.clone().add(new THREE.Vector3(0, 0, -0.05))
  ]);
  batch.add(new THREE.TubeGeometry(frontHose, 48, 0.0026, 6, false), m.blackSatin);
  // Rear hose from the drive-side lever into the head-tube port.
  const rearHose = new THREE.CatmullRomCurve3([
    barPoint(clamp, 0.196).add(new THREE.Vector3(0.02, 0, 0)),
    clamp.clone().add(new THREE.Vector3(0.06, -0.035, 0.1)),
    steerPoint(HEAD_TUBE_TOP_S - 0.02)
      .addScaledVector(STEER_NORMAL, 0.05)
      .add(new THREE.Vector3(0, 0, 0.03)),
    steerPoint(HEAD_TUBE_TOP_S - 0.04).addScaledVector(STEER_NORMAL, 0.025)
  ]);
  batch.add(new THREE.TubeGeometry(rearHose, 32, 0.0026, 6, false), m.blackSatin);

  return batch.flushInto(group);
}

/** Saddle top-view half-width as (x along saddle, half width). Short-nose race saddle, 245 mm long. */
const SADDLE_OUTLINE: [number, number][] = [
  [0.122, 0.006],
  [0.116, 0.017],
  [0.1, 0.021],
  [0.06, 0.025],
  [0.025, 0.036],
  [-0.015, 0.055],
  [-0.06, 0.067],
  [-0.1, 0.07],
  [-0.117, 0.062],
  [-0.123, 0.035],
  [-0.124, 0.006]
];

function saddleShell() {
  const shape = new THREE.Shape();
  SADDLE_OUTLINE.forEach(([x, w], i) => (i === 0 ? shape.moveTo(x, w) : shape.lineTo(x, w)));
  for (let i = SADDLE_OUTLINE.length - 1; i >= 0; i--) {
    const [x, w] = SADDLE_OUTLINE[i];
    shape.lineTo(x, -w);
  }
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.01,
    bevelEnabled: true,
    bevelThickness: 0.007,
    bevelSize: 0.007,
    bevelSegments: 4,
    curveSegments: 6
  });
  // Shape Y -> world -Z (width), extrusion Z -> world +Y (thickness).
  geometry.rotateX(-Math.PI / 2);
  // Side profile: crown just behind centre, nose drooping.
  const pos = geometry.getAttribute("position");
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    pos.setY(i, pos.getY(i) - 0.9 * (x + 0.035) ** 2);
  }
  geometry.computeVertexNormals();
  return geometry;
}

export function buildSeatpostSaddle(m: TerrenoMaterials) {
  const group = new THREE.Group();
  group.name = "seatpost-saddle";
  const batch = new MaterialBatch();

  const clampAt = seatPoint(SADDLE_CLAMP_S);
  const post = new THREE.CylinderGeometry(0.0136, 0.0136, 1, 24);
  batch.add(post, m.blackSatin, segmentMatrix(seatPoint(SEAT_TUBE_TOP_S - 0.08), clampAt));
  const collar = new THREE.CylinderGeometry(0.0205, 0.0205, 1, 24);
  batch.add(
    collar,
    m.blackSatin,
    segmentMatrix(seatPoint(SEAT_TUBE_TOP_S - 0.012), seatPoint(SEAT_TUBE_TOP_S + 0.006))
  );
  // Collar bolt boss on the drive side.
  const bolt = new THREE.BoxGeometry(0.014, 0.012, 0.012);
  const boltAt = seatPoint(SEAT_TUBE_TOP_S - 0.003);
  bolt.translate(boltAt.x - 0.02, boltAt.y, 0.006);
  batch.add(bolt, m.blackSatin);

  // Clamp head along the post axis direction.
  const head = new THREE.BoxGeometry(0.052, 0.016, 0.034);
  head.translate(clampAt.x, clampAt.y + 0.004, 0);
  batch.add(head, m.blackSatin);

  // Rails: two bent rods from nose to tail.
  const saddleX = clampAt.x + 0.004;
  const railY = clampAt.y + 0.012;
  for (const z of [-0.021, 0.021]) {
    const rail = new THREE.CatmullRomCurve3([
      new THREE.Vector3(saddleX + 0.085, railY + 0.02, z * 0.55),
      new THREE.Vector3(saddleX + 0.045, railY + 0.002, z),
      new THREE.Vector3(saddleX - 0.04, railY, z),
      new THREE.Vector3(saddleX - 0.085, railY + 0.016, z * 1.3)
    ]);
    batch.add(new THREE.TubeGeometry(rail, 16, 0.0035, 8, false), m.blackSatin);
  }

  const shell = saddleShell();
  shell.translate(saddleX, railY + 0.02, 0);
  batch.add(shell, m.blackRubber);

  return batch.flushInto(group);
}
