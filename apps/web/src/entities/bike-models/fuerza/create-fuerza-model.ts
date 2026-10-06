import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

import { wordmarkDecal } from "./brand-shapes";
import { curveOf, lerp, smooth, sweepTube, type TubeSection } from "./sweep-tube";

// Vellum Fuerza Disc, Retro Greige. Convention: see ../registry.ts.
// Landmarks measured from context/images/fuerza/retro-greige/fuerza-retro-greige-bike.jpg
// at 579 px/m (wheel radius 197 px); reconstruction notes live in context/3d/fuerza/.
const WHEEL_R = 0.343;
const REAR_AXLE = new THREE.Vector3(-0.408, WHEEL_R, 0);
const FRONT_AXLE = new THREE.Vector3(0.584, WHEEL_R, 0);
const BB = new THREE.Vector3(0, 0.271, 0);
const HT_BOTTOM = new THREE.Vector3(0.437, 0.683, 0);
// Steering axis, pointing up (head angle 72 deg).
const STEER_UP = new THREE.Vector3(
  -Math.sin((18 * Math.PI) / 180),
  Math.cos((18 * Math.PI) / 180),
  0
);
const HT_TOP = HT_BOTTOM.clone().addScaledVector(STEER_UP, 0.15);

const hex = (h: number) => new THREE.Color(h);
const PAINT = {
  white: hex(0xe8e9e5),
  burgundy: hex(0x761522),
  red: hex(0xa3201f),
  orangeRed: hex(0xcf4317),
  orange: hex(0xe27a12)
};

type Bands = { x: number; color: THREE.Color }[];
/** Paint as ordered X bands: each colour runs from its x to the next entry. */
function bandPaint(bands: Bands, fallback = PAINT.white) {
  return (p: THREE.Vector3) => {
    let c = fallback;
    for (const band of bands) if (p.x >= band.x) c = band.color;
    return c;
  };
}

function createMaterials() {
  return {
    paint: new THREE.MeshPhysicalMaterial({
      name: "frame-paint",
      vertexColors: true,
      roughness: 0.4,
      specularIntensity: 0.6,
      clearcoat: 0.4,
      clearcoatRoughness: 0.15
    }),
    decal: new THREE.MeshPhysicalMaterial({
      name: "wordmark",
      color: 0x7d1020,
      roughness: 0.55,
      specularIntensity: 0.3,
      polygonOffset: true,
      polygonOffsetFactor: -2
    }),
    carbon: new THREE.MeshPhysicalMaterial({
      name: "carbon-black",
      color: 0x141414,
      roughness: 0.55,
      specularIntensity: 0.45
    }),
    // Rim flanks are flat and face the side camera: with full dielectric specular the key light
    // paints them one uniform grey, so specular is damped to read as satin carbon.
    rim: new THREE.MeshPhysicalMaterial({
      name: "rim-carbon",
      color: 0x060606,
      roughness: 0.6,
      specularIntensity: 0.3,
      envMapIntensity: 0.5
    }),
    tyre: new THREE.MeshStandardMaterial({
      name: "tyre-rubber",
      color: 0x0d0d0d,
      roughness: 0.9,
      envMapIntensity: 0.5
    }),
    steel: new THREE.MeshStandardMaterial({
      name: "steel",
      color: 0x8c8c8c,
      metalness: 1,
      roughness: 0.42
    }),
    chain: new THREE.MeshStandardMaterial({
      name: "chain",
      color: 0x707070,
      metalness: 1,
      roughness: 0.45
    }),
    alloy: new THREE.MeshPhysicalMaterial({
      name: "alloy-black",
      color: 0x161616,
      roughness: 0.5,
      specularIntensity: 0.45
    }),
    tape: new THREE.MeshStandardMaterial({ name: "bar-tape", color: 0x131313, roughness: 0.78 }),
    spoke: new THREE.MeshStandardMaterial({
      name: "spoke",
      color: 0x1c1c1c,
      metalness: 0.6,
      roughness: 0.4
    })
  };
}
type Materials = ReturnType<typeof createMaterials>;

const solid = (color: THREE.Color) => () => color;

function tube(
  points: [number, number, number][],
  section: (u: number) => TubeSection,
  extra: Partial<Parameters<typeof sweepTube>[1]> = {}
) {
  return sweepTube(curveOf(points), { section, ...extra });
}

const mirrorZ = (points: [number, number, number][], s: number) =>
  points.map(([x, y, z]) => [x, y, z * s] as [number, number, number]);

function cylinderZ(radius: number, length: number, segments = 24) {
  const geo = new THREE.CylinderGeometry(radius, radius, length, segments);
  geo.rotateX(Math.PI / 2);
  return geo;
}

function extrudeZ(shape: THREE.Shape, depth: number, curveSegments = 24) {
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments });
  geo.translate(0, 0, -depth / 2);
  return geo;
}

/** Collects geometry per material, then emits one named mesh per material for the part. */
class PartBuilder {
  private byMaterial = new Map<THREE.Material, THREE.BufferGeometry[]>();
  readonly group: THREE.Group;
  constructor(group: THREE.Group) {
    this.group = group;
  }

  add(geo: THREE.BufferGeometry, material: THREE.Material, at?: THREE.Vector3) {
    if (at) geo.translate(at.x, at.y, at.z);
    const list = this.byMaterial.get(material) ?? [];
    list.push(geo);
    this.byMaterial.set(material, list);
    return this;
  }

  build() {
    for (const [material, geos] of this.byMaterial) {
      const usesColor = (material as THREE.MeshStandardMaterial).vertexColors;
      const normalized = geos.map((g) => {
        const flat = g.index ? g.toNonIndexed() : g;
        for (const name of Object.keys(flat.attributes)) {
          if (name !== "position" && name !== "normal" && !(usesColor && name === "color")) {
            flat.deleteAttribute(name);
          }
        }
        if (flat !== g) g.dispose();
        return flat;
      });
      const merged = mergeGeometries(normalized, false);
      for (const g of normalized) g.dispose();
      if (!merged) throw new Error(`fuerza: could not merge ${this.group.name}/${material.name}`);
      const mesh = new THREE.Mesh(merged, material);
      mesh.name = `${this.group.name}-${material.name}`;
      this.group.add(mesh);
    }
    return this.group;
  }
}

function namedGroup(name: string) {
  const g = new THREE.Group();
  g.name = name;
  return g;
}

function buildFrame(m: Materials) {
  const part = new PartBuilder(namedGroup("frame"));

  // Top tube: four Retro bands at the seat end, rising and flaring into the head tube.
  const ttPaint = bandPaint([
    { x: -1, color: PAINT.burgundy },
    { x: -0.052, color: PAINT.red },
    { x: 0.017, color: PAINT.orangeRed },
    { x: 0.076, color: PAINT.orange },
    { x: 0.119, color: PAINT.white }
  ]);
  part.add(
    tube(
      [
        [-0.17, 0.748, 0],
        [0.05, 0.759, 0],
        [0.26, 0.784, 0],
        [0.405, 0.806, 0]
      ],
      (u) => {
        return { a: lerp(0.012, 0.018, u) + 0.016 * smooth(0.8, 1, u), b: 0.021, n: 3 };
      },
      { breaksX: [-0.052, 0.017, 0.076, 0.119], color: ttPaint, segments: 40 }
    ),
    m.paint
  );

  // Head tube.
  const htStart = HT_BOTTOM.clone().addScaledVector(STEER_UP, -0.02);
  const htEnd = HT_TOP.clone().addScaledVector(STEER_UP, 0.004);
  part.add(
    tube(
      [htStart.toArray(), htEnd.toArray()],
      (u) => {
        return { a: 0.027 + 0.01 * (1 - smooth(0, 0.45, u)), b: 0.023, n: 2.6 };
      },
      { color: solid(PAINT.white), segments: 8 }
    ),
    m.paint
  );

  // Aero down tube; burgundy where it melts into the BB node.
  const dtPaint = (p: THREE.Vector3) => (p.x < 0.035 ? PAINT.burgundy : PAINT.white);
  part.add(
    tube(
      [
        [-0.005, 0.262, 0],
        [0.1, 0.372, 0],
        [0.3, 0.608, 0],
        [0.43, 0.748, 0]
      ],
      (u) => {
        return {
          a: 0.029 + 0.012 * (1 - smooth(0, 0.12, u)) + 0.008 * smooth(0.85, 1, u),
          b: 0.022,
          n: 3.4
        };
      },
      { breaksX: [0.035], color: dtPaint, segments: 40 }
    ),
    m.paint
  );

  // Wordmark on both flanks of the down tube, reading BB -> head tube on the drive side.
  const dtDir = new THREE.Vector3(0.646, 0.763, 0).normalize();
  const dtUp = new THREE.Vector3(-dtDir.y, dtDir.x, 0);
  const wmCenter = new THREE.Vector3(0.237, 0.535, 0).addScaledVector(dtUp, -0.002);
  for (const s of [1, -1]) {
    const origin = wmCenter.clone().setZ(s * 0.0232);
    const dir = s > 0 ? dtDir : dtDir.clone().negate();
    part.add(wordmarkDecal(origin, dir, dtUp, 0.44), m.decal);
  }

  // BB shell + node (burgundy, mostly behind the crankset).
  part.add(
    tube(
      [
        [0, 0.271, -0.043],
        [0, 0.271, 0.043]
      ],
      () => {
        return { a: 0.034, b: 0.034 };
      },
      { side: new THREE.Vector3(0, 1, 0), color: solid(PAINT.burgundy), segments: 2 }
    ),
    m.paint
  );

  // Black seat tube / mast, curving back around the rear wheel.
  part.add(
    tube(
      [
        [0.004, 0.268, 0],
        [-0.04, 0.39, 0],
        [-0.086, 0.547, 0],
        [-0.118, 0.651, 0],
        [-0.158, 0.746, 0],
        [-0.166, 0.772, 0]
      ],
      (u) => {
        return {
          a:
            0.02 +
            0.014 * (1 - smooth(0, 0.18, u)) +
            0.007 * smooth(0.55, 0.75, u) * (1 - smooth(0.85, 1, u)),
          b: 0.017,
          n: 3
        };
      },
      { segments: 40 }
    ),
    m.carbon
  );

  // Dropped seatstays (white) meeting the black seat tube at 0.65 m, with a white bridge.
  for (const s of [1, -1]) {
    part.add(
      tube(
        mirrorZ(
          [
            [-0.112, 0.657, 0.011],
            [-0.26, 0.502, 0.044],
            [-0.404, 0.352, 0.064]
          ],
          s
        ),
        (u) => {
          return { a: lerp(0.0105, 0.008, u), b: lerp(0.011, 0.0085, u), n: 2.4 };
        },
        { color: solid(PAINT.white), segments: 24 }
      ),
      m.paint
    );
  }
  part.add(
    tube(
      [
        [-0.126, 0.646, -0.017],
        [-0.126, 0.646, 0.017]
      ],
      () => {
        return { a: 0.012, b: 0.016 };
      },
      { side: new THREE.Vector3(0, 1, 0), color: solid(PAINT.white), segments: 2 }
    ),
    m.paint
  );

  // Chainstays: deep at the BB, Retro bands behind the crank, small badge near the dropout.
  const csPaint = bandPaint([
    { x: -1, color: PAINT.white },
    { x: -0.333, color: PAINT.burgundy },
    { x: -0.304, color: PAINT.white },
    { x: -0.204, color: PAINT.orange },
    { x: -0.173, color: PAINT.orangeRed },
    { x: -0.138, color: PAINT.red },
    { x: -0.095, color: PAINT.burgundy }
  ]);
  for (const s of [1, -1]) {
    part.add(
      tube(
        mirrorZ(
          [
            [-0.01, 0.268, 0.026],
            [-0.138, 0.285, 0.034],
            [-0.32, 0.317, 0.058],
            [-0.402, 0.338, 0.064]
          ],
          s
        ),
        (u) => {
          return { a: lerp(0.024, 0.009, smooth(0, 1, u)), b: lerp(0.011, 0.0075, u), n: 3.2 };
        },
        { breaksX: [-0.333, -0.304, -0.204, -0.173, -0.138, -0.095], color: csPaint, segments: 36 }
      ),
      m.paint
    );
    // Dropout pad around the axle.
    part.add(
      tube(
        [
          [REAR_AXLE.x, REAR_AXLE.y, s * 0.06],
          [REAR_AXLE.x, REAR_AXLE.y, s * 0.069]
        ],
        () => {
          return { a: 0.017, b: 0.017 };
        },
        { side: new THREE.Vector3(0, 1, 0), color: solid(PAINT.white), segments: 2, radial: 16 }
      ),
      m.paint
    );
  }
  // Rear brake caliper (flat mount, non-drive chainstay).
  part.add(roundedBlock(0.05, 0.026, 0.024), m.alloy, new THREE.Vector3(-0.345, 0.335, -0.072));

  // Bottle bolts on the down tube top edge and the seat tube front edge.
  for (const [x, y, nx, ny] of [
    [0.149, 0.474, -0.763, 0.646],
    [0.113, 0.432, -0.763, 0.646],
    [-0.057, 0.513, 0.95, 0.3],
    [-0.039, 0.449, 0.95, 0.3]
  ] as const) {
    const g = new THREE.CylinderGeometry(0.0042, 0.0042, 0.006, 10);
    g.applyQuaternion(
      new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(nx, ny, 0)
      )
    );
    part.add(g, m.alloy, new THREE.Vector3(x, y, 0));
  }

  return part.build();
}

function roundedBlock(w: number, h: number, d: number) {
  const r = Math.min(w, h) * 0.35;
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2 + r, -h / 2);
  shape.lineTo(w / 2 - r, -h / 2);
  shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  shape.lineTo(w / 2, h / 2 - r);
  shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  shape.lineTo(-w / 2 + r, h / 2);
  shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  shape.lineTo(-w / 2, -h / 2 + r);
  shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  return extrudeZ(shape, d, 4);
}

function buildFork(m: Materials) {
  const part = new PartBuilder(namedGroup("fork"));
  const legPaint = (p: THREE.Vector3) =>
    p.y > 0.448 && p.y < 0.472 ? PAINT.burgundy : PAINT.white;
  // Crown: flush with the head tube, spanning both legs.
  const crown = HT_BOTTOM.clone().addScaledVector(STEER_UP, -0.024);
  part.add(
    tube(
      [
        [crown.x, crown.y, -0.042],
        [crown.x, crown.y, 0.042]
      ],
      () => {
        return { a: 0.03, b: 0.017, n: 3 };
      },
      { side: new THREE.Vector3(0, 1, 0), color: solid(PAINT.white), segments: 2 }
    ),
    m.paint
  );
  for (const s of [1, -1]) {
    const leg = mirrorZ(
      [
        [crown.x - 0.002, crown.y + 0.005, 0.03],
        [0.466, 0.58, 0.037],
        [0.508, 0.478, 0.044],
        [0.552, 0.4, 0.05],
        [FRONT_AXLE.x, FRONT_AXLE.y, 0.053]
      ],
      s
    );
    part.add(
      tube(
        leg,
        (u) => {
          return { a: lerp(0.026, 0.0115, smooth(0, 1, u)), b: lerp(0.012, 0.008, u), n: 2.6 };
        },
        {
          color: legPaint,
          segments: 36
        }
      ),
      m.paint
    );
  }
  // Front caliper behind the non-drive leg.
  part.add(roundedBlock(0.048, 0.028, 0.024), m.alloy, new THREE.Vector3(0.548, 0.395, -0.066));
  return part.build();
}

function buildWheel(name: "wheel-front" | "wheel-rear", m: Materials) {
  const group = namedGroup(name);
  const front = name === "wheel-front";
  group.position.copy(front ? FRONT_AXLE : REAR_AXLE);
  const part = new PartBuilder(group);

  // Tyre 28 mm on a ~50 mm deep carbon rim.
  part.add(new THREE.TorusGeometry(WHEEL_R - 0.0142, 0.0142, 14, 128), m.tyre);
  // Flat-sided extrusion keeps the rim faces' normals true (a lathe smoothed them into a gradient).
  const rimShape = new THREE.Shape().absarc(0, 0, 0.319, 0, Math.PI * 2, false);
  rimShape.holes.push(new THREE.Path().absarc(0, 0, 0.268, 0, Math.PI * 2, true));
  const rim = new THREE.ExtrudeGeometry(rimShape, {
    depth: 0.021,
    bevelEnabled: true,
    bevelThickness: 0.002,
    bevelSize: 0.002,
    bevelSegments: 2,
    curveSegments: 128
  });
  rim.translate(0, 0, -0.0105);
  part.add(rim, m.rim);

  // Hub shell, flanges and through-axle ends.
  const hubLen = front ? 0.1 : 0.142;
  part.add(cylinderZ(0.016, hubLen - 0.02, 20), m.alloy);
  for (const z of [-1, 1]) {
    part.add(
      cylinderZ(0.024, 0.004, 24),
      m.alloy,
      new THREE.Vector3(0, 0, z * (front ? 0.026 : 0.028))
    );
    part.add(
      cylinderZ(0.011, 0.012, 16),
      m.alloy,
      new THREE.Vector3(0, 0, z * (hubLen / 2 + 0.004))
    );
  }

  // Disc rotor (160 mm) with cut-out spider on the non-drive side.
  const rotorZ = front ? -0.042 : -0.054;
  const ring = new THREE.Shape().absarc(0, 0, 0.08, 0, Math.PI * 2, false);
  ring.holes.push(new THREE.Path().absarc(0, 0, 0.064, 0, Math.PI * 2, true));
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    ring.holes.push(
      new THREE.Path().absarc(
        Math.cos(a) * 0.072,
        Math.sin(a) * 0.072,
        0.0032,
        0,
        Math.PI * 2,
        true
      )
    );
  }
  part.add(extrudeZ(ring, 0.0018, 48), m.steel, new THREE.Vector3(0, 0, rotorZ));
  const spider = new THREE.Shape().absarc(0, 0, 0.066, 0, Math.PI * 2, false);
  for (let i = 0; i < 6; i++) {
    const a0 = (i / 6) * Math.PI * 2 + 0.18;
    const a1 = a0 + Math.PI / 3 - 0.36;
    const hole = new THREE.Path();
    hole.absarc(0, 0, 0.058, a1, a0, true);
    hole.absarc(0, 0, 0.03, a0 + 0.1, a1 - 0.1, false);
    spider.holes.push(hole);
  }
  part.add(extrudeZ(spider, 0.0025, 36), m.alloy, new THREE.Vector3(0, 0, rotorZ + 0.001));

  // Valve stem near the bottom of the rim.
  const valve = new THREE.CylinderGeometry(0.0025, 0.0025, 0.03, 8);
  valve.translate(0, -0.266 + 0.012, 0);
  valve.rotateZ(front ? 0.1 : -0.1);
  part.add(valve, m.steel);
  part.build();

  // 24 straight-pull spokes, 2-cross, alternating flanges: one instanced draw call.
  const spokeGeo = new THREE.CylinderGeometry(0.0009, 0.0009, 1, 5, 1, true);
  const spokes = new THREE.InstancedMesh(spokeGeo, m.spoke, 24);
  spokes.name = `${name}-spokes`;
  const mat = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const yAxis = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < 24; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const lead = Math.floor(i / 2) % 2 === 0 ? 1 : -1;
    const rimA = (i / 24) * Math.PI * 2;
    const hubA = rimA + lead * 0.55;
    const hub = new THREE.Vector3(
      Math.cos(hubA) * 0.022,
      Math.sin(hubA) * 0.022,
      side * (front ? 0.026 : 0.028)
    );
    const rim = new THREE.Vector3(Math.cos(rimA) * 0.268, Math.sin(rimA) * 0.268, side * 0.003);
    const dir = rim.clone().sub(hub);
    const len = dir.length();
    q.setFromUnitVectors(yAxis, dir.normalize());
    mat.compose(hub.clone().add(rim).multiplyScalar(0.5), q, new THREE.Vector3(1, len, 1));
    spokes.setMatrixAt(i, mat);
  }
  group.add(spokes);
  return group;
}

function buildDrivetrain(m: Materials) {
  const part = new PartBuilder(namedGroup("drivetrain"));
  const bb = BB;

  // Chainrings 48/35 with tooth outline, black power-meter spider outboard.
  const toothRing = (teeth: number, outer: number, inner: number) => {
    const s = new THREE.Shape();
    for (let i = 0; i <= teeth * 2; i++) {
      const a = (i / (teeth * 2)) * Math.PI * 2;
      const r = i % 2 === 0 ? outer : outer - 0.0035;
      if (i === 0) s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else s.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    s.holes.push(new THREE.Path().absarc(0, 0, inner, 0, Math.PI * 2, true));
    return extrudeZ(s, 0.003, 48);
  };
  part.add(toothRing(48, 0.0985, 0.0915), m.steel, new THREE.Vector3(bb.x, bb.y, 0.052));
  part.add(toothRing(35, 0.0725, 0.066), m.steel, new THREE.Vector3(bb.x, bb.y, 0.045));
  const spider = new THREE.Shape().absarc(0, 0, 0.0935, 0, Math.PI * 2, false);
  for (let i = 0; i < 4; i++) {
    const a0 = (i / 4) * Math.PI * 2 + 0.95;
    const a1 = a0 + Math.PI / 2 - 0.5;
    const hole = new THREE.Path();
    hole.absarc(0, 0, 0.074, a0, a1, false);
    hole.absarc(0, 0, 0.036, a1 - 0.12, a0 + 0.12, true);
    spider.holes.push(hole);
  }
  part.add(extrudeZ(spider, 0.004, 48), m.alloy, new THREE.Vector3(bb.x, bb.y, 0.056));

  // Crank arms 172.5 mm and spindle.
  const crankDir = new THREE.Vector3(0.047, -0.164, 0).normalize();
  for (const s of [1, -1]) {
    const end = bb.clone().addScaledVector(crankDir, 0.1725 * s);
    part.add(
      tube(
        [
          [bb.x, bb.y, s * 0.064],
          [end.x, end.y, s * 0.07]
        ],
        (u) => {
          return { a: lerp(0.017, 0.011, u), b: 0.0075, n: 3 };
        },
        { segments: 6, radial: 16 }
      ),
      m.alloy
    );
    part.add(cylinderZ(0.009, 0.012, 12), m.steel, new THREE.Vector3(end.x, end.y, s * 0.078));
  }
  part.add(cylinderZ(0.012, 0.13, 16), m.alloy, bb.clone());

  // Cassette 10-36, largest cog inboard.
  const cogs = [36, 32, 28, 24, 21, 19, 17, 15, 13, 12, 11, 10];
  cogs.forEach((t, i) => {
    part.add(
      cylinderZ((t * 0.0127) / (2 * Math.PI) + 0.002, 0.0018, 40),
      m.steel,
      new THREE.Vector3(REAR_AXLE.x, REAR_AXLE.y, 0.022 + i * 0.0039)
    );
  });

  // Chain: upper run ring top -> 17T top, lower run ring bottom -> lower jockey -> cog.
  const chain = (pts: [number, number, number][]) =>
    tube(
      pts,
      () => {
        return { a: 0.0038, b: 0.0026 };
      },
      { segments: 4, radial: 8 }
    );
  part.add(
    chain([
      [0.0, bb.y + 0.098, 0.052],
      [REAR_AXLE.x, REAR_AXLE.y + 0.036, 0.046]
    ]),
    m.chain
  );
  part.add(
    chain([
      [0.0, bb.y - 0.098, 0.052],
      [-0.462, 0.183, 0.06]
    ]),
    m.chain
  );
  part.add(
    chain([
      [-0.462, 0.183, 0.06],
      [-0.44, 0.272, 0.058],
      [REAR_AXLE.x - 0.03, REAR_AXLE.y - 0.02, 0.05]
    ]),
    m.chain
  );

  // Rear derailleur: boxy parallelogram body, battery on top, long cage with two jockeys.
  part.add(
    tube(
      [
        [-0.412, 0.326, 0.07],
        [-0.476, 0.262, 0.076]
      ],
      () => {
        return { a: 0.03, b: 0.016, n: 5 };
      },
      { segments: 4, radial: 20 }
    ),
    m.alloy
  );
  part.add(roundedBlock(0.056, 0.034, 0.03), m.alloy, new THREE.Vector3(-0.482, 0.302, 0.074));
  part.add(
    tube(
      [
        [-0.452, 0.27, 0.068],
        [-0.462, 0.192, 0.068]
      ],
      () => {
        return { a: 0.021, b: 0.004, n: 3 };
      },
      { segments: 2, radial: 12 }
    ),
    m.alloy
  );
  for (const [x, y] of [
    [-0.452, 0.27],
    [-0.462, 0.195]
  ] as const) {
    part.add(cylinderZ(0.012, 0.006, 16), m.alloy, new THREE.Vector3(x, y, 0.061));
  }

  // Front derailleur on the seat tube braze-on, cage above the big ring.
  part.add(roundedBlock(0.034, 0.05, 0.028), m.alloy, new THREE.Vector3(-0.055, 0.395, 0.035));
  part.add(roundedBlock(0.06, 0.016, 0.004), m.steel, new THREE.Vector3(-0.035, 0.378, 0.06));

  return part.build();
}

function buildCockpit(m: Materials) {
  const part = new PartBuilder(namedGroup("cockpit"));
  // Spacer stack + top cap on the steering axis.
  const capBase = HT_TOP.clone();
  const capTop = HT_TOP.clone().addScaledVector(STEER_UP, 0.045);
  part.add(
    tube(
      [capBase.toArray(), capTop.toArray()],
      () => {
        return { a: 0.022, b: 0.02, n: 2.6 };
      },
      {
        segments: 2
      }
    ),
    m.alloy
  );
  // Stem section of the one-piece bar/stem.
  part.add(
    tube(
      [
        [capTop.x - 0.004, capTop.y - 0.012, 0],
        [0.425, 0.878, 0],
        [0.47, 0.886, 0]
      ],
      (u) => {
        return { a: lerp(0.024, 0.014, u), b: lerp(0.021, 0.016, u), n: 3.2 };
      },
      { segments: 12 }
    ),
    m.alloy
  );
  // Bar: drop end -> hook -> hood clamp -> tops -> centre, mirrored.
  const half: [number, number, number][] = [
    [0.425, 0.769, 0.212],
    [0.53, 0.772, 0.21],
    [0.59, 0.795, 0.206],
    [0.607, 0.845, 0.202],
    [0.578, 0.889, 0.198],
    [0.52, 0.892, 0.19],
    [0.475, 0.887, 0.15]
  ];
  const left = mirrorZ(half, -1);
  const right = half.map((_, i) => half[half.length - 1 - i]!);
  part.add(
    tube(
      [...left, [0.468, 0.886, 0], ...right],
      () => {
        return { a: 0.0122, b: 0.0122 };
      },
      {
        side: "transport",
        segments: 120,
        radial: 12
      }
    ),
    m.tape
  );
  // Hoods and lever blades.
  for (const s of [1, -1]) {
    part.add(
      tube(
        [
          [0.574, 0.89, s * 0.198],
          [0.615, 0.905, s * 0.199],
          [0.648, 0.925, s * 0.2]
        ],
        (u) => {
          return { a: lerp(0.021, 0.016, u), b: 0.0155, n: 2.6 };
        },
        { segments: 10, radial: 14 }
      ),
      m.tape
    );
    part.add(
      new THREE.SphereGeometry(0.0145, 12, 8),
      m.tape,
      new THREE.Vector3(0.652, 0.93, s * 0.2)
    );
    part.add(
      tube(
        [
          [0.64, 0.915, s * 0.2],
          [0.656, 0.868, s * 0.202],
          [0.664, 0.815, s * 0.204],
          [0.655, 0.788, s * 0.205]
        ],
        () => {
          return { a: 0.009, b: 0.0045, n: 3 };
        },
        { segments: 14, radial: 10 }
      ),
      m.alloy
    );
  }
  return part.build();
}

function buildSeatpostSaddle(m: Materials) {
  const part = new PartBuilder(namedGroup("seatpost-saddle"));
  // Aero seatpost, inserted into the mast.
  part.add(
    tube(
      [
        [-0.142, 0.72, 0],
        [-0.17, 0.82, 0],
        [-0.193, 0.912, 0]
      ],
      (u) => {
        return { a: lerp(0.0175, 0.0145, u), b: 0.0115, n: 3 };
      },
      { segments: 12 }
    ),
    m.carbon
  );
  // Clamp head and rails.
  part.add(roundedBlock(0.05, 0.022, 0.032), m.alloy, new THREE.Vector3(-0.2, 0.938, 0));
  for (const s of [1, -1]) {
    part.add(
      tube(
        [
          [-0.3, 0.988, s * 0.03],
          [-0.27, 0.958, s * 0.022],
          [-0.15, 0.958, s * 0.02],
          [-0.11, 0.975, s * 0.012]
        ],
        () => {
          return { a: 0.0035, b: 0.0035 };
        },
        { segments: 16, radial: 8 }
      ),
      m.alloy
    );
  }
  // Short-nose saddle: lofted flat superellipse shell, kicked up at the tail.
  part.add(
    tube(
      [
        [-0.347, 0.999, 0],
        [-0.31, 0.989, 0],
        [-0.24, 0.982, 0],
        [-0.15, 0.98, 0],
        [-0.072, 0.981, 0]
      ],
      (u) => {
        return {
          a: lerp(0.012, 0.009, u),
          b: u < 0.35 ? lerp(0.066, 0.07, u / 0.35) : lerp(0.07, 0.017, smooth(0.35, 1, u)),
          n: 3.5
        };
      },
      { segments: 30, radial: 24 }
    ),
    m.tape
  );
  return part.build();
}

export function createFuerzaModel(): THREE.Group {
  const root = new THREE.Group();
  root.name = "fuerza";
  const m = createMaterials();
  root.add(
    buildFrame(m),
    buildFork(m),
    buildWheel("wheel-front", m),
    buildWheel("wheel-rear", m),
    buildDrivetrain(m),
    buildCockpit(m),
    buildSeatpostSaddle(m)
  );
  root.userData.sculptRuntime = {
    parts: root.children.map((c) => c.name),
    pivots: {
      "wheel-front": FRONT_AXLE.toArray(),
      "wheel-rear": REAR_AXLE.toArray(),
      drivetrain: BB.toArray(),
      steering: { origin: HT_BOTTOM.toArray(), axis: STEER_UP.toArray() }
    }
  };
  return root;
}
