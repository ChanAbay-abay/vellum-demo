import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

import { BIKE_MODELS, type BikeModelId } from "@/entities/bike-models";

import { type FlatPose } from "@/widgets/model-page/lib/pose";

export type BikeStage = {
  /** Moves the camera. Cheap: it only marks the frame dirty, the next animation frame draws. */
  setPose: (pose: FlatPose) => void;
  dispose: () => void;
};

const DEG = Math.PI / 180;

/**
 * One bike from the entities registry in a transparent WebGL canvas appended to `mount`,
 * framed by an orbit pose (see `CameraPose`). Loaded with a dynamic import so `three` stays
 * out of the page's first chunk.
 *
 * Renders only when something changed (dirty flag), and the rAF loop stops entirely while the
 * mount is off-screen or the tab is hidden (RULES §25). Returns `null` when WebGL is unavailable,
 * so the caller keeps its poster image and the copy stands alone.
 *
 * The last drawn pose is written to `mount.dataset.camera` (position and orbit, rounded), which
 * is what the Playwright check reads to prove the camera really moved between beats.
 */
export function createBikeStage(
  mount: HTMLElement,
  bike: BikeModelId,
  {
    onReady,
    shift = () => 0,
    lift = () => 0
  }: {
    onReady: () => void;
    /** Fraction of the canvas width to move the subject right, clearing room for copy on the left */
    shift?: () => number;
    /** Fraction of the canvas height to move the subject up, clearing room for copy below */
    lift?: () => number;
  }
): BikeStage | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    return null;
  }
  // Touch devices (phones, tablets) cap lower: ~56% of the pixels per frame at 1.5 vs 2.
  const maxDpr = window.matchMedia("(pointer: coarse)").matches ? 1.5 : 2;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDpr));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTexture;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9a9a9a, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 2);
  key.position.set(2, 3, 4);
  const rim = new THREE.DirectionalLight(0xffffff, 1.2);
  rim.position.set(-3, 2, -3);
  scene.add(key, rim);
  scene.add(BIKE_MODELS[bike].factory());

  const camera = new THREE.PerspectiveCamera(30, 1, 0.02, 50);
  const target = new THREE.Vector3();
  let pose: FlatPose | null = null;
  let dirty = true;
  // Link the shader programs off the main thread before the first draw, so that draw doesn't
  // stall on a synchronous compile. The canvas stays hidden until the first frame either way.
  let compiled = false;
  renderer
    .compileAsync(scene, camera)
    .catch(() => {})
    .finally(() => {
      compiled = true;
      dirty = true;
    });

  const applyPose = () => {
    if (!pose) return;
    const { clientWidth: w, clientHeight: h } = mount;
    const aspect = w && h ? w / h : 1;
    // Distances are authored for a square canvas: a narrower one backs off so the width still fits.
    const distance = pose.distance * Math.max(1, 1 / aspect);
    const az = pose.azimuth * DEG;
    const el = pose.elevation * DEG;
    target.set(pose.tx, pose.ty, pose.tz);
    camera.position.set(
      target.x + Math.sin(az) * Math.cos(el) * distance,
      target.y + Math.sin(el) * distance,
      target.z + Math.cos(az) * Math.cos(el) * distance
    );
    camera.fov = pose.fov;
    camera.aspect = aspect;
    // A view offset slides the projection, not the camera, so the orbit maths stay centred.
    const dx = shift() * w;
    const dy = lift() * h;
    if ((dx || dy) && w && h) camera.setViewOffset(w, h, -dx, dy, w, h);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
    camera.lookAt(target);
  };

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = mount;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    dirty = true;
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(mount);
  resize();

  let frame = 0;
  let ready = false;
  const tick = () => {
    frame = requestAnimationFrame(tick);
    if (!compiled || !dirty || !pose) return;
    dirty = false;
    applyPose();
    renderer.render(scene, camera);
    const p = camera.position;
    mount.dataset.camera = [p.x, p.y, p.z, pose.azimuth, pose.elevation, pose.distance]
      .map((n) => n.toFixed(3))
      .join(",");
    if (!ready) {
      ready = true;
      onReady();
    }
  };

  let onScreen = false;
  const sync = () => {
    const run = onScreen && !document.hidden;
    if (run && !frame) tick();
    if (!run && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  };
  const intersection = new IntersectionObserver(([entry]) => {
    onScreen = Boolean(entry?.isIntersecting);
    sync();
  });
  intersection.observe(mount);
  document.addEventListener("visibilitychange", sync);

  return {
    setPose(next) {
      pose = { ...next };
      dirty = true;
    },
    dispose() {
      cancelAnimationFrame(frame);
      frame = 0;
      intersection.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", sync);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          for (const m of Array.isArray(obj.material) ? obj.material : [obj.material]) m.dispose();
        }
      });
      envTexture.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      delete mount.dataset.camera;
    }
  };
}
