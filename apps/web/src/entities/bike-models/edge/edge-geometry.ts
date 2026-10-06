import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/** Cross-section in (u, v): u runs along the ring's lateral axis, v along its in-plane normal. */
export type Profile = Array<[number, number]>;

const Z_AXIS = new THREE.Vector3(0, 0, 1);

export function v3(x: number, y: number, z = 0) {
  return new THREE.Vector3(x, y, z);
}

/** Rectangle with 45-degree chamfered corners: the faceted, sharp-edged Vellum tube section. */
export function chamferRect(w: number, h: number, c: number): Profile {
  const x = w / 2;
  const y = h / 2;
  return [
    [x - c, -y],
    [x, -y + c],
    [x, y - c],
    [x - c, y],
    [-x + c, y],
    [-x, y - c],
    [-x, -y + c],
    [-x + c, -y]
  ];
}

export function ellipse(w: number, h: number, n = 12): Profile {
  const out: Profile = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    out.push([(Math.cos(a) * w) / 2, (Math.sin(a) * h) / 2]);
  }
  return out;
}

export function lerpProfile(a: Profile, b: Profile, t: number): Profile {
  return a.map(([u, v], i) => [u + (b[i][0] - u) * t, v + (b[i][1] - v) * t]);
}

function ccw(p: Profile): Profile {
  let area = 0;
  for (let i = 0; i < p.length; i++) {
    const [x0, y0] = p[i];
    const [x1, y1] = p[(i + 1) % p.length];
    area += x0 * y1 - x1 * y0;
  }
  return area >= 0 ? p : p.map((_, i) => p[p.length - 1 - i]);
}

/**
 * Sweeps profiles along a polyline. Frames use parallel transport seeded from `lateral`
 * (default world Z), so planar frame tubes keep u on the bike's lateral axis.
 * Flat shading keeps chamfer facets crisp; smooth suits round parts.
 */
export function loft(
  points: THREE.Vector3[],
  profiles: Profile[],
  opts: { lateral?: THREE.Vector3; smooth?: boolean; caps?: boolean } = {}
): THREE.BufferGeometry {
  const { lateral = Z_AXIS, smooth = false, caps = true } = opts;
  const n = points.length;
  const rings: THREE.Vector3[][] = [];
  let s = new THREE.Vector3();
  for (let k = 0; k < n; k++) {
    const t = new THREE.Vector3()
      .subVectors(points[Math.min(k + 1, n - 1)], points[Math.max(k - 1, 0)])
      .normalize();
    const seed = k === 0 ? lateral.clone() : s;
    s = seed.clone().addScaledVector(t, -seed.dot(t));
    if (s.lengthSq() < 1e-8) s = new THREE.Vector3(0, 1, 0).addScaledVector(t, -t.y);
    s.normalize();
    const nrm = new THREE.Vector3().crossVectors(t, s);
    const prof = ccw(profiles[Math.min(k, profiles.length - 1)]);
    rings.push(
      prof.map(([u, v]) => points[k].clone().addScaledVector(s, u).addScaledVector(nrm, v))
    );
  }
  const m = rings[0].length;
  const pos: number[] = [];
  const push = (...vs: THREE.Vector3[]) => vs.forEach((p) => pos.push(p.x, p.y, p.z));
  let geo: THREE.BufferGeometry;
  if (smooth) {
    const idx: number[] = [];
    rings.forEach((r) => push(...r));
    for (let k = 0; k < n - 1; k++) {
      for (let i = 0; i < m; i++) {
        const a = k * m + i;
        const b = k * m + ((i + 1) % m);
        const c = (k + 1) * m + ((i + 1) % m);
        const d = (k + 1) * m + i;
        idx.push(a, b, c, a, c, d);
      }
    }
    geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    geo = geo.toNonIndexed();
  } else {
    for (let k = 0; k < n - 1; k++) {
      for (let i = 0; i < m; i++) {
        const a = rings[k][i];
        const b = rings[k][(i + 1) % m];
        const c = rings[k + 1][(i + 1) % m];
        const d = rings[k + 1][i];
        push(a, b, c, a, c, d);
      }
    }
    geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.computeVertexNormals();
  }
  if (!caps) return geo;
  const cap: number[] = [];
  const r0 = rings[0];
  const r1 = rings[n - 1];
  for (let i = 1; i < m - 1; i++) {
    cap.push(...r0[0].toArray(), ...r0[i + 1].toArray(), ...r0[i].toArray());
    cap.push(...r1[0].toArray(), ...r1[i].toArray(), ...r1[i + 1].toArray());
  }
  const capGeo = new THREE.BufferGeometry();
  capGeo.setAttribute("position", new THREE.Float32BufferAttribute(cap, 3));
  capGeo.computeVertexNormals();
  return mergeGeometries([geo, capGeo]) ?? geo;
}

/** Straight tapered tube between two points. */
export function tube(
  a: THREE.Vector3,
  b: THREE.Vector3,
  pa: Profile,
  pb: Profile = pa,
  lateral?: THREE.Vector3
) {
  return loft([a, b], [pa, pb], { lateral });
}

/** Smooth round tube along a Catmull-Rom curve through `pts`. */
export function hose(pts: THREE.Vector3[], radius: number, segments = 24, radial = 8) {
  const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
  const prof = ellipse(radius * 2, radius * 2, radial);
  return loft(curve.getSpacedPoints(segments), [prof], {
    smooth: true,
    lateral: new THREE.Vector3(0, 1, 0)
  });
}

/** Lathe around the local Z axis from (r, z) points listed counter-clockwise. */
export function latheZ(points: Array<[number, number]>, segments = 64) {
  const g = new THREE.LatheGeometry(
    points.map(([r, z]) => new THREE.Vector2(r, z)),
    segments
  );
  g.rotateX(Math.PI / 2);
  return g;
}

/** Arc of a circular tyre/rim section, counter-clockwise from a0 to a1 (radians). */
export function arcSection(cr: number, rad: number, a0: number, a1: number, steps: number) {
  const out: Array<[number, number]> = [];
  for (let i = 0; i <= steps; i++) {
    const a = a0 + ((a1 - a0) * i) / steps;
    out.push([cr + Math.cos(a) * rad, Math.sin(a) * rad]);
  }
  return out;
}

/** Cylinder whose axis runs from a to b. */
export function rod(a: THREE.Vector3, b: THREE.Vector3, r: number, radial = 12) {
  const len = a.distanceTo(b);
  const g = new THREE.CylinderGeometry(r, r, len, radial);
  const q = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3().subVectors(b, a).normalize()
  );
  g.applyQuaternion(q);
  const mid = a.clone().add(b).multiplyScalar(0.5);
  g.translate(mid.x, mid.y, mid.z);
  return g;
}

/** Keeps only position + normal and drops the index so every part can merge into one buffer. */
export function prep(g: THREE.BufferGeometry) {
  const out = g.index ? g.toNonIndexed() : g;
  for (const name of Object.keys(out.attributes)) {
    if (name !== "position" && name !== "normal") out.deleteAttribute(name);
  }
  if (!out.attributes.normal) out.computeVertexNormals();
  return out;
}

/**
 * Collects geometry per material and emits one merged mesh per material, so a top-level
 * part costs one draw call per finish instead of one per sub-piece.
 */
export class PartBuilder {
  private buckets = new Map<THREE.Material, THREE.BufferGeometry[]>();

  add(material: THREE.Material, ...geos: THREE.BufferGeometry[]) {
    const list = this.buckets.get(material) ?? [];
    list.push(...geos.map(prep));
    this.buckets.set(material, list);
    return this;
  }

  build(name: string) {
    const group = new THREE.Group();
    group.name = name;
    for (const [material, geos] of this.buckets) {
      const merged = mergeGeometries(geos);
      if (!merged) throw new Error(`edge: failed to merge ${name}/${material.name}`);
      const mesh = new THREE.Mesh(merged, material);
      mesh.name = `${name}:${material.name}`;
      mesh.userData.explodeWithParent = true;
      group.add(mesh);
    }
    return group;
  }
}

/**
 * Parses an SVG path made of M/L/Z polygons (the brand wordmark) into shapes. Sub-paths
 * inside an odd number of others become holes, matching fill-rule="evenodd".
 * Output is y-up, normalised so the mark spans x 0..1 and is vertically centred.
 */
export function svgPolygonsToGeometry(d: string, viewBox: [number, number]) {
  const polys: THREE.Vector2[][] = [];
  for (const chunk of d.split(/M/).filter((c) => c.trim())) {
    const nums = chunk.replace(/[LZ]/g, " ").trim().split(/\s+/).map(Number);
    const poly: THREE.Vector2[] = [];
    for (let i = 0; i + 1 < nums.length; i += 2) {
      poly.push(
        new THREE.Vector2(nums[i] / viewBox[0], (viewBox[1] / 2 - nums[i + 1]) / viewBox[0])
      );
    }
    polys.push(poly);
  }
  const inside = (p: THREE.Vector2, poly: THREE.Vector2[]) => {
    let hit = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const a = poly[i];
      const b = poly[j];
      if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) {
        hit = !hit;
      }
    }
    return hit;
  };
  const shapes: THREE.Shape[] = [];
  const owners = polys.map((poly, i) =>
    polys.findIndex((other, j) => j !== i && inside(poly[0], other))
  );
  polys.forEach((poly, i) => {
    if (owners[i] === -1) shapes[i] = new THREE.Shape(poly);
  });
  polys.forEach((poly, i) => {
    const owner = owners[i];
    if (owner !== -1 && shapes[owner]) shapes[owner].holes.push(new THREE.Path(poly));
  });
  return new THREE.ShapeGeometry(shapes.filter(Boolean));
}
