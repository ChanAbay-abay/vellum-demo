import * as THREE from "three";

import {
  BB,
  HEAD_TUBE_BOTTOM_S,
  HEAD_TUBE_TOP_S,
  REAR_AXLE,
  REAR_DROPOUT_Z,
  SEAT_TUBE_TOP_S,
  STEER_NORMAL,
  TT_JUNCTION_S,
  seatPoint,
  steerPoint
} from "./terreno-dimensions";
import { MaterialBatch, bezier, line, sectionStops, sweep } from "./terreno-geometry-utils";
import { type TerrenoMaterials } from "./terreno-materials";

const v = (x: number, y: number, z = 0) => new THREE.Vector3(x, y, z);

function catmull(points: THREE.Vector3[]) {
  const curve = new THREE.CatmullRomCurve3(points, false, "centripetal");
  return (t: number) => curve.getPoint(t);
}

/** Flat web filling the TT/DT/HT junction, the big wedge the photo shows behind the head tube. */
function gusset(points: THREE.Vector3[], thickness: number) {
  const shape = new THREE.Shape(points.map((p) => new THREE.Vector2(p.x, p.y)));
  const bevel = 0.008;
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: thickness - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 4
  });
  geometry.translate(0, 0, -(thickness - bevel * 2) / 2);
  return geometry;
}

export function buildFrame(m: TerrenoMaterials) {
  const group = new THREE.Group();
  group.name = "frame";
  const batch = new MaterialBatch();

  // Head tube: tapered, integrated headset (cups inside the shell).
  batch.add(
    sweep(
      line(steerPoint(HEAD_TUBE_BOTTOM_S - 0.004), steerPoint(HEAD_TUBE_TOP_S)),
      sectionStops([
        [0, { h: 0.072, w: 0.068 }],
        [1, { h: 0.06, w: 0.056 }]
      ]),
      { lengthSegs: 8, radialSegs: 28 }
    ),
    m.carbon
  );

  // Top tube: from the head tube to a low seat cluster, flared at the head tube end.
  const ttStart = steerPoint(HEAD_TUBE_TOP_S - 0.03);
  const ttEnd = seatPoint(TT_JUNCTION_S);
  const ttControl = ttStart.clone().lerp(ttEnd, 0.5).add(v(0, -0.008));
  const ttPath = bezier(ttStart, ttControl, ttEnd);
  batch.add(
    sweep(
      ttPath,
      sectionStops([
        [0, { h: 0.06, w: 0.05, n: 1.8 }],
        [0.18, { h: 0.04, w: 0.046, n: 1.7 }],
        [0.75, { h: 0.032, w: 0.036, n: 1.8 }],
        [1, { h: 0.034, w: 0.034, n: 2 }]
      ]),
      { lengthSegs: 32, radialSegs: 20, unitU: true }
    ),
    m.carbonTopTube
  );

  // Down tube: oversize, diamond-profile, BB -> head tube so the drive-side wordmark reads correctly.
  const dtStart = v(0.03, 0.318);
  const dtEnd = steerPoint(HEAD_TUBE_BOTTOM_S + 0.035).addScaledVector(STEER_NORMAL, -0.006);
  const dtPath = line(dtStart, dtEnd);
  batch.add(
    sweep(
      dtPath,
      sectionStops([
        [0, { h: 0.068, w: 0.076, n: 1.6 }],
        [0.15, { h: 0.058, w: 0.066, n: 1.5 }],
        [0.8, { h: 0.062, w: 0.062, n: 1.5 }],
        [1, { h: 0.08, w: 0.064, n: 1.7 }]
      ]),
      { lengthSegs: 32, radialSegs: 20, unitU: true }
    ),
    m.carbonDownTube
  );

  // Seat tube: wide at the BB, round at the clamp.
  batch.add(
    sweep(
      line(seatPoint(0.015), seatPoint(SEAT_TUBE_TOP_S)),
      sectionStops([
        [0, { h: 0.06, w: 0.072 }],
        [0.3, { h: 0.046, w: 0.046 }],
        [1, { h: 0.035, w: 0.035 }]
      ]),
      { lengthSegs: 24, radialSegs: 20, unitU: true }
    ),
    m.carbonSeatTube
  );

  // TT/DT/HT web.
  const webPoints = [
    steerPoint(HEAD_TUBE_TOP_S - 0.02),
    ttPath(0.2).add(v(0, -0.012)),
    dtPath(0.8).add(v(-0.004, 0.022)),
    steerPoint(HEAD_TUBE_BOTTOM_S + 0.01)
  ];
  batch.add(gusset(webPoints, 0.05), m.carbon);

  // Seat cluster and BB junction blobs.
  const cluster = new THREE.SphereGeometry(1, 20, 14);
  cluster.scale(0.024, 0.032, 0.021);
  cluster.translate(...seatPoint(TT_JUNCTION_S - 0.012).toArray());
  batch.add(cluster, m.carbon);

  const shell = new THREE.CylinderGeometry(0.026, 0.026, 0.092, 28);
  shell.rotateX(Math.PI / 2);
  shell.translate(BB.x, BB.y, 0);
  batch.add(shell, m.carbon);
  const bbBlob = new THREE.SphereGeometry(1, 24, 16);
  bbBlob.scale(0.05, 0.042, 0.04);
  bbBlob.translate(BB.x + 0.008, BB.y + 0.012, 0);
  batch.add(bbBlob, m.carbon);

  // Chainstays tuck in behind the BB to clear the chainring, then splay to Boost dropouts.
  for (const side of [1, -1]) {
    batch.add(
      sweep(
        catmull([
          v(-0.01, 0.298, 0.026 * side),
          v(-0.1, 0.314, 0.03 * side),
          v(-0.26, 0.344, 0.056 * side),
          v(REAR_AXLE.x + 0.014, REAR_AXLE.y + 0.002, (REAR_DROPOUT_Z - 0.006) * side)
        ]),
        sectionStops([
          [0, { h: 0.046, w: 0.026 }],
          [0.3, { h: 0.032, w: 0.022 }],
          [1, { h: 0.022, w: 0.016 }]
        ]),
        { lengthSegs: 28, radialSegs: 14 }
      ),
      m.carbon
    );
    // Seatstays: thin, joining just under the top tube.
    const ssStart = seatPoint(TT_JUNCTION_S - 0.03);
    batch.add(
      sweep(
        catmull([
          v(ssStart.x - 0.008, ssStart.y, 0.014 * side),
          v(ssStart.x - 0.1, ssStart.y - 0.1, 0.046 * side),
          v(REAR_AXLE.x + 0.012, REAR_AXLE.y + 0.022, (REAR_DROPOUT_Z - 0.006) * side)
        ]),
        sectionStops([
          [0, { h: 0.022, w: 0.02 }],
          [1, { h: 0.017, w: 0.014 }]
        ]),
        { lengthSegs: 24, radialSegs: 12 }
      ),
      m.carbon
    );
    // Dropout plate.
    const plate = new THREE.Shape();
    plate.moveTo(-0.016, -0.012);
    plate.lineTo(0.03, -0.006);
    plate.lineTo(0.026, 0.03);
    plate.lineTo(-0.008, 0.024);
    plate.closePath();
    const dropout = new THREE.ExtrudeGeometry(plate, {
      depth: 0.006,
      bevelEnabled: true,
      bevelThickness: 0.002,
      bevelSize: 0.003,
      bevelSegments: 2
    });
    dropout.translate(
      REAR_AXLE.x,
      REAR_AXLE.y,
      side > 0 ? REAR_DROPOUT_Z - 0.006 : -REAR_DROPOUT_Z
    );
    batch.add(dropout, m.carbon);
  }

  // Rear thru-axle and NDS flat-mount caliper (hidden in the photo; inferred).
  const axle = new THREE.CylinderGeometry(0.0075, 0.0075, 0.176, 16);
  axle.rotateX(Math.PI / 2);
  axle.translate(REAR_AXLE.x, REAR_AXLE.y, -0.002);
  batch.add(axle, m.blackSatin);
  const axleHead = new THREE.CylinderGeometry(0.012, 0.012, 0.01, 20);
  axleHead.rotateX(Math.PI / 2);
  axleHead.translate(REAR_AXLE.x, REAR_AXLE.y, -0.09);
  batch.add(axleHead, m.blackSatin);
  const caliper = new THREE.BoxGeometry(0.052, 0.026, 0.024);
  caliper.rotateZ(0.12);
  caliper.translate(REAR_AXLE.x + 0.055, REAR_AXLE.y + 0.05, -0.058);
  batch.add(caliper, m.blackSatin);

  return batch.flushInto(group);
}
