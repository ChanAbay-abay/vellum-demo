import * as THREE from "three";

export type TubeSection = {
  /** Half-size along the in-plane normal (the side-view "depth" of a frame tube). */
  a: number;
  /** Half-size along the side axis (frame width when seen from the front). */
  b: number;
  /** Superellipse exponent: 2 = ellipse, 3-4 = truncated aero / boxy section. */
  n?: number;
};

type SweepOptions = {
  section: (u: number) => TubeSection;
  segments?: number;
  radial?: number;
  /**
   * Side axis used to orient the section. Default +Z keeps `b` across the frame width for tubes
   * lying in the frame plane. Pass "transport" for paths that run along Z (handlebars).
   */
  side?: THREE.Vector3 | "transport";
  /** World-space X positions where the paint changes; a hard ring pair is inserted at each. */
  breaksX?: number[];
  color?: (point: THREE.Vector3) => THREE.Color;
  caps?: boolean;
};

const sgnPow = (v: number, p: number) => Math.sign(v) * Math.abs(v) ** p;

function uAtX(curve: THREE.Curve<THREE.Vector3>, x: number): number | null {
  const steps = 200;
  let prevU = 0;
  let prevX = curve.getPointAt(0).x;
  for (let i = 1; i <= steps; i++) {
    const u = i / steps;
    const px = curve.getPointAt(u).x;
    if ((prevX - x) * (px - x) <= 0 && prevX !== px) {
      let lo = prevU;
      let hi = u;
      for (let k = 0; k < 30; k++) {
        const mid = (lo + hi) / 2;
        const mx = curve.getPointAt(mid).x;
        if ((prevX - x) * (mx - x) <= 0) hi = mid;
        else lo = mid;
      }
      return (lo + hi) / 2;
    }
    prevU = u;
    prevX = px;
  }
  return null;
}

/**
 * Sweeps a superellipse section along a curve. Paint is baked as vertex colour, with duplicated
 * rings at each break so stripe edges stay crisp without a texture.
 */
export function sweepTube(curve: THREE.Curve<THREE.Vector3>, opts: SweepOptions) {
  const segments = opts.segments ?? 48;
  const radial = opts.radial ?? 20;
  const uList = Array.from({ length: segments + 1 }, (_, i) => i / segments);
  for (const x of opts.breaksX ?? []) {
    const u = uAtX(curve, x);
    if (u === null) continue;
    // Insert in order so the ring list stays sorted.
    for (const v of [Math.max(0, u - 1e-4), Math.min(1, u + 1e-4)]) {
      const at = uList.findIndex((w) => w >= v);
      if (at === -1) uList.push(v);
      else if (uList[at] !== v) uList.splice(at, 0, v);
    }
  }

  let transportFrames: { normals: THREE.Vector3[]; binormals: THREE.Vector3[] } | null = null;
  if (opts.side === "transport") {
    transportFrames = curve.computeFrenetFrames(uList.length - 1, false);
  }
  const sideAxis = opts.side instanceof THREE.Vector3 ? opts.side : new THREE.Vector3(0, 0, 1);

  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  const ring = radial + 1;
  const p = new THREE.Vector3();
  const t = new THREE.Vector3();
  const nrm = new THREE.Vector3();
  const bin = new THREE.Vector3();
  const v = new THREE.Vector3();

  const pushColor = (point: THREE.Vector3) => {
    if (!opts.color) return;
    const c = opts.color(point);
    colors.push(c.r, c.g, c.b);
  };

  uList.forEach((u, ri) => {
    curve.getPointAt(u, p);
    curve.getTangentAt(u, t);
    if (transportFrames) {
      // computeFrenetFrames samples uniformly; nearest frame is fine for round sections.
      const fi = Math.round(u * (uList.length - 1));
      nrm.copy(transportFrames.normals[fi]!);
      bin.copy(transportFrames.binormals[fi]!);
    } else {
      nrm.crossVectors(sideAxis, t).normalize();
      bin.crossVectors(t, nrm).normalize();
    }
    const { a, b, n = 2 } = opts.section(u);
    const e = 2 / n;
    for (let j = 0; j <= radial; j++) {
      const th = -Math.PI / 2 + (j / radial) * Math.PI * 2;
      const x = a * sgnPow(Math.cos(th), e);
      const y = b * sgnPow(Math.sin(th), e);
      v.copy(p).addScaledVector(nrm, x).addScaledVector(bin, y);
      positions.push(v.x, v.y, v.z);
      pushColor(p);
    }
    if (ri > 0) {
      const base = (ri - 1) * ring;
      for (let j = 0; j < radial; j++) {
        const i0 = base + j;
        const i1 = i0 + 1;
        const i2 = i0 + ring;
        const i3 = i2 + 1;
        indices.push(i0, i1, i2, i1, i3, i2);
      }
    }
  });

  if (opts.caps !== false) {
    for (const end of [0, 1] as const) {
      const ri = end === 0 ? 0 : uList.length - 1;
      curve.getPointAt(end, p);
      const center = positions.length / 3;
      positions.push(p.x, p.y, p.z);
      pushColor(p);
      for (let j = 0; j <= radial; j++) {
        const src = (ri * ring + j) * 3;
        positions.push(positions[src]!, positions[src + 1]!, positions[src + 2]!);
        pushColor(p);
      }
      for (let j = 0; j < radial; j++) {
        const a = center + 1 + j;
        if (end === 0) indices.push(center, a + 1, a);
        else indices.push(center, a, a + 1);
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  if (opts.color) geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

export const curveOf = (points: [number, number, number][]) =>
  new THREE.CatmullRomCurve3(
    points.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    false,
    "centripetal"
  );

export const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
export const smooth = (e0: number, e1: number, x: number) => {
  const k = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return k * k * (3 - 2 * k);
};
