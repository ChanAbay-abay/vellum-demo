import * as THREE from "three";

import {
  PartBuilder,
  arcSection,
  chamferRect,
  ellipse,
  hose,
  latheZ,
  lerpProfile,
  loft,
  rod,
  svgPolygonsToGeometry,
  tube,
  v3,
  type Profile
} from "./edge-geometry";
import { VELLUM_WORDMARK_PATH, VELLUM_WORDMARK_VIEWBOX } from "./vellum-wordmark-path";

// Vellum Edge Gen 2, reconstructed with img2threejs from the Gen 2 archive photo
// (workdir: context/3d/edge). The rider hides the drivetrain, saddle top, drops
// and seat cluster; those are inferred from c.2010s rim-brake road geometry (size ~54/56)
// and are listed as low-confidence in the spec. Convention: see ../registry.ts.

const BB = v3(0, 0.267);
const REAR_AXLE = v3(-0.405, 0.337);
const FRONT_AXLE = v3(0.585, 0.337);
const HT_TOP = v3(0.385, 0.822);
const HT_BOTTOM = v3(0.43, 0.679);
const STEER = HT_TOP.clone().sub(HT_BOTTOM).normalize();
const SEAT_TOP = v3(-0.15, 0.745);
const SEAT_DIR = SEAT_TOP.clone().sub(BB).normalize();
const DT_TOP = v3(0.432, 0.712);
const DT_BOT = v3(0.012, 0.272);
const CHAIN_Z = 0.0445;
const RIM_R = 0.3115;
const PAD_R = 0.302;
const X_AXIS = v3(1, 0, 0);
const Z_AXIS = v3(0, 0, 1);

const at = (a: THREE.Vector3, b: THREE.Vector3, t: number) => a.clone().lerp(b, t);
const withZ = (p: THREE.Vector3, z: number) => v3(p.x, p.y, z);

function makeMaterials() {
  // Dark finishes get a lower envMapIntensity so a bright studio environment does not lift
  // gloss black to mid-grey on faces square to the camera.
  const paint = (name: string, color: number, roughness: number, envMapIntensity = 1) => {
    const m = new THREE.MeshPhysicalMaterial({
      color,
      roughness,
      envMapIntensity,
      clearcoat: 1,
      clearcoatRoughness: 0.08
    });
    m.name = name;
    return m;
  };
  const std = (name: string, color: number, roughness: number, metalness = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    m.name = name;
    return m;
  };
  const decal = (name: string, color: number) => {
    const m = std(name, color, 0.9);
    m.envMapIntensity = 0.4;
    m.polygonOffset = true;
    m.polygonOffsetFactor = -2;
    m.polygonOffsetUnits = -2;
    return m;
  };
  return {
    white: paint("paint-white", 0xebebe8, 0.3),
    black: paint("paint-black", 0x141518, 0.18, 0.5),
    grey: paint("paint-grey", 0x8a8c8f, 0.32),
    decalBlack: decal("decal-black", 0x0b0b0a),
    decalWhite: decal("decal-white", 0xebebe8),
    decalRed: decal("decal-red", 0xb3262a),
    rim: (() => {
      const m = new THREE.MeshPhysicalMaterial({
        color: 0x121214,
        roughness: 0.42,
        envMapIntensity: 0.6,
        clearcoat: 0.35
      });
      m.name = "carbon-rim";
      return m;
    })(),
    tread: std("tyre-tread", 0x1b1b1c, 0.92),
    tan: std("tyre-tan", 0xa67e58, 0.8),
    spoke: std("spoke-black", 0x1a1a1c, 0.4, 0.6),
    alloy: std("alloy-black", 0x1c1c1e, 0.45, 0.5),
    silver: std("alloy-silver", 0xc9cacc, 0.22, 1),
    steel: std("chain-steel", 0x6b6d70, 0.35, 1),
    rubber: std("rubber-black", 0x121213, 0.7),
    saddle: std("saddle-black", 0x151516, 0.55),
    red: std("cap-red", 0xb42a2a, 0.5)
  };
}
type Materials = ReturnType<typeof makeMaterials>;

/** Straight tube split into painted segments: [tStart, tEnd, material][]. */
function paintedTube(
  part: PartBuilder,
  a: THREE.Vector3,
  b: THREE.Vector3,
  pa: Profile,
  pb: Profile,
  segments: Array<[number, number, THREE.Material]>
) {
  for (const [t0, t1, mat] of segments) {
    part.add(
      mat,
      tube(at(a, b, t0), at(a, b, t1), lerpProfile(pa, pb, t0), lerpProfile(pa, pb, t1))
    );
  }
}

/**
 * Wordmark decal on a down-tube side face. Non-drive side reads head tube -> BB (observed in the
 * Gen 2 photo); drive side reads BB -> head tube (inferred: mirrored for readability).
 */
function downTubeWordmark(side: 1 | -1, halfWidthAt: (t: number) => number) {
  const geo = svgPolygonsToGeometry(VELLUM_WORDMARK_PATH, VELLUM_WORDMARK_VIEWBOX);
  const d = DT_BOT.clone().sub(DT_TOP).normalize();
  const up = v3(d.y, -d.x);
  const t0 = 0.17;
  const t1 = 0.84;
  const len = DT_TOP.distanceTo(DT_BOT) * (t1 - t0);
  const xAxis = side === 1 ? d.clone().negate() : d.clone();
  const start = at(DT_TOP, DT_BOT, side === 1 ? t1 : t0);
  const m = new THREE.Matrix4().makeBasis(
    xAxis.multiplyScalar(len),
    up.clone().multiplyScalar(len),
    Z_AXIS.clone().multiplyScalar(side)
  );
  m.setPosition(start);
  geo.applyMatrix4(m);
  // Follow the tube's taper so the flat decal never sinks into the face.
  const pos = geo.attributes.position;
  const total = DT_TOP.distanceTo(DT_BOT);
  for (let i = 0; i < pos.count; i++) {
    const p = v3(pos.getX(i), pos.getY(i));
    const t = p.sub(DT_TOP).dot(d) / total;
    pos.setZ(i, side * (halfWidthAt(t) + 0.0006));
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * Dual-pivot rim caliper. `radial` points from the axle to the mount; `facing` puts the body in
 * front of the fork crown (+1) or behind the seat-stay bridge (-1); `standoff` clears the crown.
 */
function caliper(
  part: PartBuilder,
  M: Materials,
  axle: THREE.Vector3,
  radial: THREE.Vector3,
  mountR: number,
  facing: 1 | -1,
  standoff: number
) {
  const xp = v3(radial.y, -radial.x).multiplyScalar(facing);
  const origin = axle.clone().addScaledVector(radial, mountR);
  const local = (x: number, y: number, z: number) =>
    origin
      .clone()
      .addScaledVector(xp, x + standoff)
      .addScaledVector(radial, y)
      .add(v3(0, 0, z));
  const drop = mountR - PAD_R;
  for (const s of [1, -1]) {
    const arm = [
      local(0.024, 0.004, 0.005 * s),
      local(0.024, -0.004, 0.024 * s),
      local(0.019, -0.02, 0.033 * s),
      local(0.012, -drop + 0.012, 0.031 * s),
      local(0.008, -drop, 0.023 * s)
    ];
    part.add(M.silver, loft(arm, [chamferRect(0.011, 0.016, 0.003)], { lateral: xp }));
    part.add(
      M.rubber,
      tube(
        local(-0.01, -drop, 0.019 * s),
        local(0.026, -drop, 0.019 * s),
        chamferRect(0.006, 0.009, 0.002)
      )
    );
  }
  part.add(M.silver, rod(local(-0.03, 0, 0), local(0.03, 0, 0), 0.004, 8));
  part.add(M.alloy, rod(local(0.024, 0.004, 0.012), local(0.024, 0.022, 0.016), 0.0045, 8));
}

function buildFrame(M: Materials) {
  const part = new PartBuilder();

  part.add(
    M.white,
    tube(
      HT_BOTTOM.clone().addScaledVector(STEER, -0.012),
      HT_TOP.clone().addScaledVector(STEER, 0.004),
      chamferRect(0.05, 0.066, 0.012),
      chamferRect(0.044, 0.056, 0.01)
    )
  );

  // Top tube: grey panel behind the head tube, white mid, charcoal rear (observed; the knee hides
  // t 0.25-0.5, so that white run is inferred).
  paintedTube(
    part,
    v3(0.378, 0.79),
    v3(-0.142, 0.722),
    chamferRect(0.036, 0.042, 0.007),
    chamferRect(0.03, 0.032, 0.006),
    [
      [0, 0.04, M.white],
      [0.04, 0.22, M.grey],
      [0.22, 0.55, M.white],
      [0.55, 1, M.black]
    ]
  );

  const dtA = chamferRect(0.058, 0.066, 0.006);
  const dtB = chamferRect(0.066, 0.062, 0.006);
  part.add(M.white, tube(DT_TOP, DT_BOT, dtA, dtB));
  const dtHalf = (t: number) => (0.058 + (0.066 - 0.058) * t) / 2;
  part.add(M.decalBlack, downTubeWordmark(1, dtHalf), downTubeWordmark(-1, dtHalf));

  // Seat tube: black with a light band two thirds up (observed on the Gen 2 photo).
  paintedTube(
    part,
    BB.clone().addScaledVector(SEAT_DIR, 0.01),
    SEAT_TOP.clone().addScaledVector(SEAT_DIR, 0.012),
    chamferRect(0.042, 0.048, 0.007),
    chamferRect(0.034, 0.038, 0.006),
    [
      [0, 0.6, M.black],
      [0.6, 0.635, M.white],
      [0.635, 1, M.black]
    ]
  );

  // BB junction and shell.
  part.add(M.white, tube(v3(-0.036, 0.27), v3(0.05, 0.276), chamferRect(0.074, 0.07, 0.012)));
  part.add(M.alloy, rod(v3(0, 0.267, -0.044), v3(0, 0.267, 0.044), 0.0235, 16));

  const ssTop = v3(-0.14, 0.715);
  const ssDir = ssTop.clone().sub(REAR_AXLE).normalize();
  for (const s of [1, -1]) {
    part.add(
      M.white,
      tube(
        withZ(ssTop, s * 0.014),
        v3(-0.398, 0.348, s * 0.06),
        chamferRect(0.016, 0.024, 0.004),
        chamferRect(0.012, 0.015, 0.003)
      )
    );
    part.add(
      M.white,
      tube(
        v3(-0.02, 0.272, s * 0.034),
        v3(-0.398, 0.34, s * 0.06),
        chamferRect(0.022, 0.042, 0.005),
        chamferRect(0.014, 0.02, 0.004)
      )
    );
    part.add(
      M.alloy,
      tube(
        withZ(REAR_AXLE, s * 0.058),
        withZ(REAR_AXLE, s * 0.068),
        chamferRect(0.03, 0.03, 0.008),
        undefined,
        X_AXIS
      )
    );
  }
  // Seat-stay bridge carrying the rear caliper.
  const bridgeR = 0.355;
  const bridge = REAR_AXLE.clone().addScaledVector(ssDir, bridgeR);
  const bridgeZ = 0.06 - (0.06 - 0.014) * (bridgeR / ssTop.distanceTo(REAR_AXLE));
  part.add(
    M.white,
    tube(
      withZ(bridge, -bridgeZ),
      withZ(bridge, bridgeZ),
      chamferRect(0.012, 0.012, 0.002),
      undefined,
      X_AXIS
    )
  );
  caliper(part, M, REAR_AXLE, ssDir, bridgeR, -1, 0);
  // Derailleur hanger.
  part.add(
    M.alloy,
    tube(
      withZ(REAR_AXLE, 0.066),
      v3(REAR_AXLE.x + 0.006, REAR_AXLE.y - 0.03, 0.066),
      chamferRect(0.004, 0.014, 0.001),
      undefined,
      X_AXIS
    )
  );

  // Bottle cage + bottle on the down tube's upper face, cap toward the head tube.
  const d = DT_BOT.clone().sub(DT_TOP).normalize();
  const up = v3(d.y, -d.x);
  const base = at(DT_TOP, DT_BOT, 0.62).addScaledVector(up, 0.076);
  const bottle = new THREE.LatheGeometry(
    [
      [0, 0],
      [0.031, 0],
      [0.036, 0.01],
      [0.037, 0.15],
      [0.032, 0.172],
      [0.018, 0.182],
      [0.015, 0.19],
      [0, 0.19]
    ].map(([r, y]) => new THREE.Vector2(r, y)),
    24
  );
  const cap = new THREE.CylinderGeometry(0.011, 0.012, 0.022, 16).translate(0, 0.2, 0);
  const q = new THREE.Quaternion().setFromUnitVectors(v3(0, 1, 0), d.clone().negate());
  for (const g of [bottle, cap]) {
    g.applyQuaternion(q);
    g.translate(base.x, base.y, base.z);
  }
  part.add(M.alloy, bottle);
  part.add(M.red, cap);
  const bottleTop = base.clone().addScaledVector(d, -0.15);
  for (const s of [1, -1]) {
    part.add(
      M.alloy,
      hose(
        [
          at(DT_TOP, DT_BOT, 0.6).addScaledVector(up, 0.034),
          base
            .clone()
            .addScaledVector(up, -0.02)
            .add(v3(0, 0, s * 0.03)),
          bottleTop.clone().add(v3(0, 0, s * 0.033))
        ],
        0.0025,
        10,
        6
      )
    );
  }

  return part.build("frame");
}

function buildFork(M: Materials) {
  const part = new PartBuilder();
  const crown = HT_BOTTOM.clone().addScaledVector(STEER, -0.016);
  part.add(
    M.black,
    tube(
      withZ(crown, -0.06),
      withZ(crown, 0.06),
      chamferRect(0.05, 0.032, 0.008),
      undefined,
      X_AXIS
    )
  );
  part.add(M.black, rod(crown, HT_TOP.clone().addScaledVector(STEER, 0.078), 0.0143, 16));
  for (const s of [1, -1]) {
    const top = v3(crown.x + 0.006, crown.y - 0.012, s * 0.05);
    const tip = withZ(FRONT_AXLE, s * 0.05);
    part.add(
      M.black,
      tube(top, tip, chamferRect(0.022, 0.04, 0.005), chamferRect(0.012, 0.02, 0.003))
    );
    part.add(
      M.alloy,
      tube(
        withZ(FRONT_AXLE, s * 0.046),
        withZ(FRONT_AXLE, s * 0.056),
        chamferRect(0.022, 0.022, 0.006),
        undefined,
        X_AXIS
      )
    );
    // Small white decal near the fork tip (observed on the Gen 2 photo, low confidence on shape).
    const dir = tip.clone().sub(top).normalize();
    const c = at(top, tip, 0.8);
    const decal = new THREE.PlaneGeometry(0.036, 0.008);
    decal.applyMatrix4(
      new THREE.Matrix4().makeBasis(
        dir.clone().multiplyScalar(s),
        v3(-dir.y, dir.x).multiplyScalar(s),
        v3(0, 0, s)
      )
    );
    decal.translate(c.x, c.y, s * (0.05 + 0.0068 * 1));
    part.add(M.decalWhite, decal);
  }
  const radial = crown.clone().sub(FRONT_AXLE);
  const mountR = radial.length();
  caliper(part, M, FRONT_AXLE, radial.normalize(), mountR, 1, 0.016);
  return part.build("fork");
}

function buildWheel(M: Materials, name: "wheel-front" | "wheel-rear", rear: boolean) {
  const part = new PartBuilder();
  const rim: Array<[number, number]> = [
    [0.2615, 0],
    [0.263, -0.006],
    [0.268, -0.0105],
    [0.28, -0.0128],
    [0.296, -0.0135],
    [RIM_R, -0.0135],
    [0.3125, -0.011],
    [0.3125, 0.011],
    [RIM_R, 0.0135],
    [0.296, 0.0135],
    [0.28, 0.0128],
    [0.268, 0.0105],
    [0.263, 0.006],
    [0.2615, 0]
  ];
  part.add(M.rim, latheZ(rim, 96));
  const tc = 0.3245;
  const tr = 0.0125;
  part.add(M.tread, latheZ(arcSection(tc, tr, -0.95, 0.95, 8), 96));
  part.add(M.tan, latheZ(arcSection(tc, tr, 0.95, Math.PI * 2 - 0.95, 14), 96));

  const ends = rear ? 0.065 : 0.05;
  const flangeL = rear ? -0.035 : -0.028;
  const flangeR = rear ? 0.02 : 0.028;
  const flangeR0 = rear ? 0.025 : 0.022;
  part.add(
    M.alloy,
    latheZ(
      [
        [0.005, -ends],
        [0.014, -ends],
        [0.014, flangeL - 0.002],
        [flangeR0 + 0.002, flangeL - 0.001],
        [flangeR0 + 0.002, flangeL + 0.002],
        [0.013, flangeL + 0.004],
        [0.012, 0],
        [0.013, flangeR - 0.004],
        [flangeR0 + 0.002, flangeR - 0.002],
        [flangeR0 + 0.002, flangeR + 0.001],
        [0.014, flangeR + 0.002],
        [0.014, ends],
        [0.005, ends]
      ],
      24
    )
  );

  const count = rear ? 24 : 18;
  const spokes: THREE.BufferGeometry[] = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const side = i % 2 === 0 ? 1 : -1;
    // Rear is laced two-cross-like (tangential), front radial; counts read approximately off the photo.
    const ha = rear ? a + (i % 4 < 2 ? 0.32 : -0.32) : a;
    const hz = side === 1 ? flangeR : flangeL;
    spokes.push(
      rod(
        v3(Math.cos(ha) * flangeR0, Math.sin(ha) * flangeR0, hz),
        v3(Math.cos(a) * 0.263, Math.sin(a) * 0.263, side * 0.003),
        0.0011,
        4
      )
    );
  }
  part.add(M.spoke, ...spokes);

  if (rear) {
    // Red rim mark seen on the Gen 2 rear wheel (non-drive side, placement low confidence).
    const a = 1.2;
    const mark = new THREE.PlaneGeometry(0.012, 0.012).rotateZ(Math.PI / 4).rotateY(Math.PI);
    mark.translate(Math.cos(a) * 0.288, Math.sin(a) * 0.288, -0.0134);
    part.add(M.decalRed, mark);
  }

  const group = part.build(name);
  group.position.copy(rear ? REAR_AXLE : FRONT_AXLE);
  return group;
}

function gear(teeth: number, z: number, innerR: number, depth = 0.0022) {
  const pitch = (teeth * 0.0127) / (Math.PI * 2);
  const shape = new THREE.Shape();
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const pts: Array<[number, number]> = [
      [pitch - 0.0035, a - step * 0.3],
      [pitch + 0.0035, a - step * 0.1],
      [pitch + 0.0035, a + step * 0.1],
      [pitch - 0.0035, a + step * 0.3]
    ];
    pts.forEach(([r, ang], j) => {
      const x = Math.cos(ang) * r;
      const y = Math.sin(ang) * r;
      if (i === 0 && j === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    });
  }
  shape.closePath();
  const hole = new THREE.Path();
  hole.absarc(0, 0, innerR, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 24 });
  g.translate(0, 0, z);
  return g;
}

function buildDrivetrain(M: Materials) {
  const part = new PartBuilder();
  const at3 = (p: THREE.Vector3, x: number, y: number, z: number) => v3(p.x + x, p.y + y, z);

  // Crankset 50/34, 172.5 mm (inferred: hidden by the rider's foot).
  const rings = [gear(50, CHAIN_Z - 0.0011, 0.084), gear(34, CHAIN_Z - 0.0071, 0.052)];
  rings.forEach((g) => g.translate(BB.x, BB.y, 0));
  part.add(M.alloy, ...rings);
  for (let i = 0; i < 4; i++) {
    const a = Math.PI * 0.5 * i + 0.4;
    part.add(
      M.alloy,
      tube(
        withZ(BB, CHAIN_Z + 0.004),
        at3(BB, Math.cos(a) * 0.086, Math.sin(a) * 0.086, CHAIN_Z + 0.002),
        chamferRect(0.006, 0.02, 0.002),
        chamferRect(0.005, 0.012, 0.002)
      )
    );
  }
  part.add(M.alloy, rod(withZ(BB, -0.062), withZ(BB, 0.062), 0.012, 16));
  const crankA = (190 * Math.PI) / 180;
  for (const s of [1, -1]) {
    const a = s === 1 ? crankA : crankA - Math.PI;
    const end = at3(BB, Math.cos(a) * 0.1725, Math.sin(a) * 0.1725, s * 0.064);
    part.add(
      M.alloy,
      tube(
        withZ(BB, s * 0.058),
        end,
        chamferRect(0.012, 0.036, 0.004),
        chamferRect(0.012, 0.022, 0.004)
      )
    );
    part.add(M.steel, rod(end, withZ(end, s * 0.085), 0.0045, 8));
    part.add(
      M.alloy,
      tube(
        at3(end, -0.042, 0, s * 0.098),
        at3(end, 0.042, 0, s * 0.098),
        chamferRect(0.026, 0.014, 0.004),
        chamferRect(0.05, 0.012, 0.004)
      )
    );
  }

  // Cassette 11-28 (inferred).
  const cogs = [11, 12, 13, 14, 15, 17, 19, 21, 23, 25, 28];
  cogs.forEach((t, i) => {
    const r = (t * 0.0127) / (Math.PI * 2) + 0.0035;
    part.add(
      M.steel,
      new THREE.CylinderGeometry(r, r, 0.0018, 32)
        .rotateX(Math.PI / 2)
        .translate(REAR_AXLE.x, REAR_AXLE.y, 0.062 - i * 0.0039)
    );
  });

  // Rear derailleur (inferred, black) with S-routed chain.
  const upper = at3(REAR_AXLE, 0.004, -0.06, CHAIN_Z);
  const lower = at3(REAR_AXLE, 0.02, -0.13, CHAIN_Z);
  for (const c of [upper, lower]) {
    part.add(
      M.alloy,
      new THREE.CylinderGeometry(0.019, 0.019, 0.005, 20)
        .rotateX(Math.PI / 2)
        .translate(c.x, c.y, c.z)
    );
  }
  for (const z of [CHAIN_Z + 0.007, CHAIN_Z - 0.007]) {
    part.add(
      M.alloy,
      loft(
        [withZ(upper, z).add(v3(0.004, 0.014)), withZ(lower, z).add(v3(0.006, -0.016))],
        [chamferRect(0.002, 0.034, 0.0005)],
        { lateral: Z_AXIS }
      )
    );
  }
  part.add(
    M.alloy,
    tube(
      at3(REAR_AXLE, 0.008, -0.026, 0.07),
      at3(upper, -0.012, 0.018, 0.058),
      chamferRect(0.016, 0.03, 0.005),
      chamferRect(0.014, 0.024, 0.004)
    )
  );

  // Front derailleur clamped to the seat tube above the big ring (inferred).
  const fd = BB.clone().addScaledVector(SEAT_DIR, 0.13);
  for (const z of [CHAIN_Z + 0.008, CHAIN_Z - 0.008]) {
    part.add(
      M.alloy,
      tube(
        at3(fd, -0.032, 0.004, z),
        at3(fd, 0.04, -0.016, z),
        chamferRect(0.002, 0.024, 0.0005),
        undefined,
        Z_AXIS
      )
    );
  }
  part.add(
    M.alloy,
    tube(withZ(fd, 0.018), at3(fd, -0.004, 0, CHAIN_Z + 0.008), chamferRect(0.014, 0.022, 0.004))
  );

  // Chain: links spaced at 12.7 mm pitch along a closed path ring -> lower jockey -> upper jockey -> cog.
  const R1 = (50 * 0.0127) / (Math.PI * 2);
  const R2 = (17 * 0.0127) / (Math.PI * 2);
  const rp = 0.021;
  const ring = (deg: number) =>
    at3(BB, Math.cos((deg * Math.PI) / 180) * R1, Math.sin((deg * Math.PI) / 180) * R1, CHAIN_Z);
  const cog = (deg: number) =>
    at3(
      REAR_AXLE,
      Math.cos((deg * Math.PI) / 180) * R2,
      Math.sin((deg * Math.PI) / 180) * R2,
      CHAIN_Z
    );
  const path = new THREE.CatmullRomCurve3(
    [
      ring(90),
      ring(45),
      ring(0),
      ring(-45),
      ring(-90),
      at3(lower, 0.012, -rp, CHAIN_Z),
      at3(lower, -rp * 0.7, -rp * 0.7, CHAIN_Z),
      at3(lower, -rp, 0.004, CHAIN_Z),
      at3(upper, rp, -0.004, CHAIN_Z),
      at3(upper, rp * 0.7, rp * 0.7, CHAIN_Z),
      cog(-110),
      cog(-160),
      cog(160),
      cog(110),
      cog(80)
    ],
    true,
    "centripetal"
  );
  const links = Math.round(path.getLength() / 0.0127);
  const plates: THREE.BufferGeometry[] = [];
  for (let i = 0; i < links; i++) {
    const t = i / links;
    const p = path.getPointAt(t);
    const tan = path.getTangentAt(t);
    const ang = Math.atan2(tan.y, tan.x);
    for (const z of [0.0034, -0.0034]) {
      plates.push(
        new THREE.BoxGeometry(0.0135, 0.0075, 0.0012).rotateZ(ang).translate(p.x, p.y, p.z + z)
      );
    }
  }
  part.add(M.steel, ...plates);

  return part.build("drivetrain");
}

function buildCockpit(M: Materials) {
  const part = new PartBuilder();
  const up = (d: number) => HT_TOP.clone().addScaledVector(STEER, d);
  part.add(M.alloy, rod(up(0), up(0.008), 0.021, 24));
  part.add(M.alloy, rod(up(0.008), up(0.03), 0.0175, 24));
  part.add(M.alloy, rod(up(0.03), up(0.072), 0.0195, 24));
  part.add(M.alloy, rod(up(0.072), up(0.078), 0.016, 24));

  const stemDir = v3(Math.cos(0.087), Math.sin(0.087));
  const stemC = up(0.051);
  const bar = stemC.clone().addScaledVector(stemDir, 0.1);
  part.add(
    M.alloy,
    tube(
      stemC,
      bar.clone().addScaledVector(stemDir, -0.016),
      chamferRect(0.03, 0.034, 0.006),
      chamferRect(0.028, 0.03, 0.005)
    )
  );
  part.add(M.alloy, rod(withZ(bar, -0.026), withZ(bar, 0.026), 0.021, 20));

  // Bar: round tops; drops are inferred (hidden by the rider's hands / out of frame).
  part.add(
    M.alloy,
    loft(
      [-0.15, -0.06, -0.02, 0.02, 0.06, 0.15].map((z) => withZ(bar, z)),
      [
        ellipse(0.024, 0.024, 14),
        ellipse(0.024, 0.024, 14),
        ellipse(0.0318, 0.0318, 14),
        ellipse(0.0318, 0.0318, 14),
        ellipse(0.024, 0.024, 14)
      ],
      { smooth: true, lateral: X_AXIS }
    )
  );
  for (const s of [1, -1]) {
    const b = (x: number, y: number, z: number) => v3(bar.x + x, bar.y + y, s * z);
    part.add(
      M.alloy,
      hose(
        [
          b(0, 0, 0.14),
          b(0, 0, 0.17),
          b(0.014, 0, 0.198),
          b(0.042, -0.004, 0.205),
          b(0.074, -0.02, 0.207),
          b(0.087, -0.05, 0.208),
          b(0.08, -0.09, 0.21),
          b(0.054, -0.117, 0.212),
          b(0.01, -0.126, 0.213),
          b(-0.055, -0.127, 0.214)
        ],
        0.012,
        48,
        12
      )
    );
    const hood = b(0.078, -0.022, 0.207);
    part.add(
      M.rubber,
      loft(
        [
          hood,
          hood.clone().add(v3(0.03, 0.01)),
          hood.clone().add(v3(0.058, 0.022)),
          hood.clone().add(v3(0.068, 0.03))
        ],
        [
          ellipse(0.028, 0.034, 12),
          ellipse(0.03, 0.036, 12),
          ellipse(0.022, 0.028, 12),
          ellipse(0.012, 0.014, 12)
        ],
        { smooth: true }
      )
    );
    part.add(
      M.alloy,
      loft(
        [
          hood.clone().add(v3(0.054, 0.006)),
          hood.clone().add(v3(0.062, -0.04)),
          hood.clone().add(v3(0.052, -0.082)),
          hood.clone().add(v3(0.036, -0.106))
        ],
        [
          chamferRect(0.01, 0.018, 0.003),
          chamferRect(0.01, 0.014, 0.003),
          chamferRect(0.009, 0.012, 0.003),
          chamferRect(0.009, 0.01, 0.003)
        ]
      )
    );
  }

  // External housing loops from the bar into the frame ports and to the front caliper (observed).
  const crown = HT_BOTTOM.clone().addScaledVector(STEER, -0.016);
  const fRadial = crown.clone().sub(FRONT_AXLE).normalize();
  const fxp = v3(fRadial.y, -fRadial.x);
  const fTop = FRONT_AXLE.clone()
    .addScaledVector(fRadial, crown.distanceTo(FRONT_AXLE) + 0.022)
    .addScaledVector(fxp, 0.04);
  part.add(
    M.rubber,
    hose(
      [
        v3(bar.x, bar.y - 0.01, 0.09),
        v3(bar.x + 0.07, bar.y - 0.07, 0.07),
        v3(fTop.x + 0.05, fTop.y + 0.04, 0.03),
        v3(fTop.x, fTop.y, 0.016)
      ],
      0.0025,
      24,
      6
    )
  );
  for (const [z, port] of [
    [0.07, 0.024],
    [0.05, 0.02],
    [-0.07, -0.024]
  ] as const) {
    part.add(
      M.rubber,
      hose(
        [
          v3(bar.x, bar.y - 0.01, z),
          v3(bar.x + 0.075, bar.y - 0.09, z * 1.1),
          v3(0.49, 0.72, port * 1.6),
          v3(0.43, 0.716, port)
        ],
        0.0025,
        24,
        6
      )
    );
  }
  return part.build("cockpit");
}

function buildSeatpostSaddle(M: Materials) {
  const part = new PartBuilder();
  const clamp = BB.clone().addScaledVector(SEAT_DIR, 0.7);
  part.add(
    M.black,
    tube(SEAT_TOP.clone().addScaledVector(SEAT_DIR, -0.06), clamp, chamferRect(0.024, 0.034, 0.008))
  );
  part.add(
    M.black,
    tube(
      clamp.clone().add(v3(-0.024, 0.002)),
      clamp.clone().add(v3(0.022, 0.008)),
      chamferRect(0.03, 0.018, 0.004)
    )
  );
  // Small black seatpost-mounted light (observed, behind the post).
  const light = SEAT_TOP.clone().addScaledVector(SEAT_DIR, 0.1);
  part.add(
    M.rubber,
    tube(
      light.clone().add(v3(-0.014, -0.02)),
      light.clone().add(v3(-0.022, 0.012)),
      chamferRect(0.024, 0.016, 0.004)
    )
  );

  const top = clamp.y + 0.045;
  for (const s of [1, -1]) {
    part.add(
      M.alloy,
      hose(
        [
          v3(-0.355, top - 0.012, s * 0.04),
          v3(-0.31, top - 0.035, s * 0.025),
          v3(-0.17, top - 0.033, s * 0.02),
          v3(-0.125, top - 0.016, s * 0.012)
        ],
        0.0035,
        16,
        6
      )
    );
  }
  // Saddle sections along the bike axis: [x, half width, thickness, top drop] (shape inferred).
  const sections: Array<[number, number, number, number]> = [
    [-0.37, 0.06, 0.022, 0.006],
    [-0.355, 0.07, 0.03, 0.0],
    [-0.32, 0.072, 0.034, 0.0],
    [-0.27, 0.064, 0.032, 0.002],
    [-0.22, 0.044, 0.03, 0.005],
    [-0.17, 0.026, 0.028, 0.007],
    [-0.125, 0.018, 0.026, 0.007],
    [-0.1, 0.014, 0.022, 0.009],
    [-0.088, 0.008, 0.012, 0.012]
  ];
  const profile = (hw: number, th: number): Profile => {
    const out: Profile = [];
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const c = Math.cos(a);
      const sn = Math.sin(a);
      // v points down along the sweep frame for a +X path, so the flatter bottom is +v.
      out.push([
        hw * Math.sign(c) * Math.abs(c) ** 0.6,
        (th / 2) * Math.sign(sn) * Math.abs(sn) ** (sn > 0 ? 0.5 : 1.4)
      ]);
    }
    return out;
  };
  part.add(
    M.saddle,
    loft(
      sections.map(([x, , th, dropY]) => v3(x, top - dropY - th / 2)),
      sections.map(([, hw, th]) => profile(hw, th)),
      { smooth: true }
    )
  );
  return part.build("seatpost-saddle");
}

export function createEdgeModel(): THREE.Group {
  const M = makeMaterials();
  const root = new THREE.Group();
  root.name = "edge";
  root.add(
    buildFrame(M),
    buildFork(M),
    buildWheel(M, "wheel-front", false),
    buildWheel(M, "wheel-rear", true),
    buildDrivetrain(M),
    buildCockpit(M),
    buildSeatpostSaddle(M)
  );
  root.userData.sculptRuntime = {
    parts: root.children.map((c) => c.name),
    pivots: {
      "wheel-front": FRONT_AXLE.toArray(),
      "wheel-rear": REAR_AXLE.toArray(),
      steering: { origin: HT_BOTTOM.toArray(), axis: STEER.toArray() },
      cranks: { origin: BB.toArray(), axis: [0, 0, 1] }
    }
  };
  return root;
}
