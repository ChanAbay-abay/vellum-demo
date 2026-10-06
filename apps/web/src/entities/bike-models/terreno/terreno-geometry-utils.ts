import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/** In-plane height `h`, out-of-plane width `w` (Z for frame tubes), superellipse exponent `n` (2 = ellipse, <2 = diamond-ish). */
export type Section = { h: number; w: number; n?: number };

const Z = new THREE.Vector3(0, 0, 1);

function superellipse(theta: number, n: number) {
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  const e = 2 / n;
  return [Math.sign(c) * Math.abs(c) ** e, Math.sign(s) * Math.abs(s) ** e] as const;
}

/**
 * Sweeps a superellipse section along a path. The section's `w` axis tracks +Z (projected off the tangent),
 * so frame tubes keep their width out of the bike plane. UV: u runs along the path (0..1 when `unitU`,
 * metres otherwise), v runs around the section with v=0.25 on the +Z face and v=0.5 on the "up" face.
 */
export function sweep(
  path: (t: number) => THREE.Vector3,
  section: (t: number) => Section,
  opts: { lengthSegs?: number; radialSegs?: number; caps?: boolean; unitU?: boolean } = {}
) {
  const { lengthSegs = 24, radialSegs = 16, caps = true, unitU = false } = opts;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const rings: THREE.Vector3[][] = [];

  let arc = 0;
  let prev = path(0);
  const centres: THREE.Vector3[] = [];
  const arcs: number[] = [];
  for (let i = 0; i <= lengthSegs; i++) {
    const c = path(i / lengthSegs);
    arc += c.distanceTo(prev);
    prev = c;
    centres.push(c);
    arcs.push(arc);
  }

  for (let i = 0; i <= lengthSegs; i++) {
    const t = i / lengthSegs;
    const e = 1e-3;
    const tangent = path(Math.min(1, t + e))
      .sub(path(Math.max(0, t - e)))
      .normalize();
    const side = Z.clone().addScaledVector(tangent, -Z.dot(tangent));
    if (side.lengthSq() < 1e-6) side.set(1, 0, 0);
    side.normalize();
    const up = new THREE.Vector3().crossVectors(tangent, side);
    const { h, w, n = 2 } = section(t);
    const ring: THREE.Vector3[] = [];
    for (let j = 0; j <= radialSegs; j++) {
      const v = j / radialSegs;
      const [fx, fy] = superellipse(2 * Math.PI * (v - 0.25), n);
      const p = centres[i]
        .clone()
        .addScaledVector(side, (w / 2) * fx)
        .addScaledVector(up, (h / 2) * fy);
      ring.push(p);
      positions.push(p.x, p.y, p.z);
      uvs.push(unitU ? arcs[i] / arc : arcs[i], v);
    }
    rings.push(ring);
  }

  const stride = radialSegs + 1;
  for (let i = 0; i < lengthSegs; i++) {
    for (let j = 0; j < radialSegs; j++) {
      const a = i * stride + j;
      const b = a + 1;
      const c = a + stride;
      const d = c + 1;
      indices.push(a, b, c, b, d, c);
    }
  }

  if (caps) {
    for (const [ringIndex, flip] of [
      [0, true],
      [lengthSegs, false]
    ] as const) {
      const centreIndex = positions.length / 3;
      const centre = centres[ringIndex];
      positions.push(centre.x, centre.y, centre.z);
      uvs.push(0.5, 0.5);
      const start = positions.length / 3;
      for (const p of rings[ringIndex]) {
        positions.push(p.x, p.y, p.z);
        uvs.push(0.5, 0.5);
      }
      for (let j = 0; j < radialSegs; j++) {
        if (flip) indices.push(centreIndex, start + j + 1, start + j);
        else indices.push(centreIndex, start + j, start + j + 1);
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/** Straight segment path between two points. */
export function line(a: THREE.Vector3, b: THREE.Vector3) {
  return (t: number) => a.clone().lerp(b, t);
}

/** Quadratic Bézier path through a control point. */
export function bezier(a: THREE.Vector3, control: THREE.Vector3, b: THREE.Vector3) {
  const curve = new THREE.QuadraticBezierCurve3(a, control, b);
  return (t: number) => curve.getPoint(t);
}

/** Linear interpolation of section dimensions across a list of stops (t, section). */
export function sectionStops(stops: [number, Section][]) {
  return (t: number): Section => {
    for (let i = 1; i < stops.length; i++) {
      const [t1, s1] = stops[i];
      if (t <= t1) {
        const [t0, s0] = stops[i - 1];
        const k = (t - t0) / (t1 - t0 || 1);
        const ease = k * k * (3 - 2 * k);
        return {
          h: THREE.MathUtils.lerp(s0.h, s1.h, ease),
          w: THREE.MathUtils.lerp(s0.w, s1.w, ease),
          n: THREE.MathUtils.lerp(s0.n ?? 2, s1.n ?? 2, ease)
        };
      }
    }
    return stops[stops.length - 1][1];
  };
}

/**
 * A toothed ring (or plain disc when `teeth` is 0) in the XY plane (extruded along +Z). Used for cassette cogs and the chainring.
 * `windows` cuts `count` annular sectors between rIn and rOut, leaving arms of `armFraction` width.
 */
export function gearGeometry(opts: {
  teeth: number;
  rootR: number;
  tipR: number;
  holeR: number;
  depth: number;
  windows?: { count: number; rIn: number; rOut: number; armFraction: number };
}) {
  const { teeth, rootR, tipR, holeR, depth, windows } = opts;
  const shape = new THREE.Shape();
  // teeth === 0 gives a plain disc (brake rotor).
  if (teeth === 0) shape.absarc(0, 0, tipR, 0, Math.PI * 2, false);
  const pitch = (Math.PI * 2) / Math.max(teeth, 1);
  for (let k = 0; k < teeth; k++) {
    const a = k * pitch;
    const pts: [number, number][] = [
      [a, rootR],
      [a + pitch * 0.22, tipR],
      [a + pitch * 0.5, tipR],
      [a + pitch * 0.72, rootR]
    ];
    pts.forEach(([ang, r], i) => {
      const x = Math.cos(ang) * r;
      const y = Math.sin(ang) * r;
      if (k === 0 && i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    });
  }
  if (teeth > 0) shape.closePath();
  const hole = new THREE.Path();
  hole.absarc(0, 0, holeR, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  if (windows) {
    const step = (Math.PI * 2) / windows.count;
    const span = step * (1 - windows.armFraction);
    for (let k = 0; k < windows.count; k++) {
      const a0 = k * step + step * windows.armFraction * 0.5;
      const win = new THREE.Path();
      win.absarc(0, 0, windows.rOut, a0, a0 + span, false);
      win.absarc(0, 0, windows.rIn, a0 + span, a0, true);
      win.closePath();
      shape.holes.push(win);
    }
  }
  return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 6 });
}

/** Lathe around the Z axis (wheel axle). Profile points are [radius, z]. */
export function latheZ(profile: [number, number][], segments: number) {
  const geometry = new THREE.LatheGeometry(
    profile.map(([r, z]) => new THREE.Vector2(r, z)),
    segments
  );
  geometry.rotateX(Math.PI / 2);
  return geometry;
}

/**
 * Collects part geometries per material and merges them into one mesh per material, so a whole
 * top-level group costs a handful of draw calls.
 */
export class MaterialBatch {
  private readonly buckets = new Map<THREE.Material, THREE.BufferGeometry[]>();

  add(geometry: THREE.BufferGeometry, material: THREE.Material, matrix?: THREE.Matrix4) {
    const g = geometry.index ? geometry.toNonIndexed() : geometry;
    if (g !== geometry) geometry.dispose();
    for (const name of Object.keys(g.attributes)) {
      if (name !== "position" && name !== "normal" && name !== "uv") g.deleteAttribute(name);
    }
    if (!g.getAttribute("normal")) g.computeVertexNormals();
    if (!g.getAttribute("uv")) {
      const count = g.getAttribute("position").count;
      g.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(count * 2), 2));
    }
    g.clearGroups();
    if (matrix) g.applyMatrix4(matrix);
    const list = this.buckets.get(material) ?? [];
    list.push(g);
    this.buckets.set(material, list);
    return this;
  }

  /** Adds the merged meshes to `group`, named `<group>:<material>`. */
  flushInto(group: THREE.Group) {
    for (const [material, list] of this.buckets) {
      const merged = mergeGeometries(list, false);
      for (const g of list) g.dispose();
      if (!merged) throw new Error(`terreno: could not merge ${group.name}:${material.name}`);
      const mesh = new THREE.Mesh(merged, material);
      mesh.name = `${group.name}:${material.name}`;
      group.add(mesh);
    }
    this.buckets.clear();
    return group;
  }
}

/** Matrix placing a +Y-aligned unit primitive from `a` to `b`. */
export function segmentMatrix(a: THREE.Vector3, b: THREE.Vector3, radiusScale = 1) {
  const dir = b.clone().sub(a);
  const length = dir.length();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return new THREE.Matrix4().compose(
    a.clone().lerp(b, 0.5),
    q,
    new THREE.Vector3(radiusScale, length, radiusScale)
  );
}
