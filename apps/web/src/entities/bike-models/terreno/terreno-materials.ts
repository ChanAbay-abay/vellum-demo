import * as THREE from "three";

import { VELLUM_WORDMARK_PATH, VELLUM_WORDMARK_VIEWBOX } from "./vellum-wordmark-path";

// Colours sampled from terreno-showroom-ugc.jpg (de-lit by eye where the shop light blows them out).
const CARBON = 0x040405;
const CARBON_CSS = "#040405";
const GRAPHIC_GREY = "#6f7277";
const COPPER = "#b0684a";

function canvasTexture(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D) => void
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("terreno: 2d canvas unavailable");
  draw(ctx);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

const carbonBase = {
  color: 0xffffff,
  // Gloss black UD: a tight clearcoat highlight along the tubes, flanks left near-black. The lab's
  // RoomEnvironment is far brighter than the shop, so the base reflection is held low.
  roughness: 0.34,
  metalness: 0,
  specularIntensity: 0.4,
  clearcoat: 0.6,
  clearcoatRoughness: 0.12,
  envMapIntensity: 0.1,
  // UD fibre: stretched highlights along the tube (sweep UVs run u along the tube axis).
  anisotropy: 0.25
} satisfies THREE.MeshPhysicalMaterialParameters;

// Wordmark span along the down tube (u 0..1 from BB to head tube) and canvas px per path unit.
const WORDMARK_U0 = 0.12;
const WORDMARK_U1 = 0.76;

/**
 * Down-tube wordmark. Sweep UVs: u 0..1 from BB to head tube, v=0.25 drive-side face, v=0.75 non-drive.
 * Canvas y is flipped (v=1 at the top row), so the drive-side band sits at 75% height. The brand
 * path is drawn with Path2D so the texture follows the tube's curvature.
 */
function downTubeTexture() {
  const W = 2048;
  const H = 512;
  const [vbW, vbH] = VELLUM_WORDMARK_VIEWBOX;
  const mark = new Path2D(VELLUM_WORDMARK_PATH);
  // Tube is ~0.55 m long and ~0.2 m round: ~3.7 px/mm along u, ~2.5 px/mm around v.
  const sx = ((WORDMARK_U1 - WORDMARK_U0) * W) / vbW;
  const sy = sx * 0.85;
  return canvasTexture(W, H, (ctx) => {
    ctx.fillStyle = CARBON_CSS;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = GRAPHIC_GREY;
    // Drive side reads BB -> head tube; the non-drive side is mirrored so it reads the same way as seen.
    const draw = (y: number, nonDrive: boolean) => {
      ctx.save();
      ctx.translate(nonDrive ? WORDMARK_U1 * W : WORDMARK_U0 * W, y);
      ctx.scale(nonDrive ? -sx : sx, nonDrive ? sy : -sy);
      ctx.translate(0, -vbH / 2);
      ctx.fill(mark, "evenodd");
      ctx.restore();
    };
    draw(H * 0.75, false);
    draw(H * 0.25, true);
  });
}

/** Grey fade on the head-tube end of the top tube (u 0..1 from head tube to seat tube). */
function topTubeTexture() {
  return canvasTexture(512, 64, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 512, 0);
    g.addColorStop(0, "#3a3c40");
    g.addColorStop(0.22, "#26272a");
    g.addColorStop(0.45, "#0a0a0c");
    g.addColorStop(1, "#0a0a0c");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 64);
  });
}

/** Copper stripe on both side faces of the seat tube (u 0..1 from BB up). */
function seatTubeTextures() {
  const paint = (ctx: CanvasRenderingContext2D, base: string, stripe: string) => {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = stripe;
    // u 0.58..0.93, v 0.12..0.40 (drive side) and 0.60..0.88 (non-drive side).
    ctx.fillRect(512 * 0.58, 128 * (1 - 0.4), 512 * 0.35, 128 * 0.28);
    ctx.fillRect(512 * 0.58, 128 * (1 - 0.88), 512 * 0.35, 128 * 0.28);
  };
  const map = canvasTexture(512, 128, (ctx) => paint(ctx, "#0a0a0c", COPPER));
  const metalness = canvasTexture(512, 128, (ctx) => paint(ctx, "#000000", "#ffffff"));
  metalness.colorSpace = THREE.NoColorSpace;
  return { map, metalness };
}

/**
 * "SID" graphic on the fork lowers' outer faces. Left half of the canvas is the drive-side leg
 * (outer face v=0.25), right half the non-drive leg (outer face v=0.75); build-fork remaps u.
 */
function forkLowerTexture() {
  return canvasTexture(1024, 128, (ctx) => {
    ctx.fillStyle = "#0b0b0c";
    ctx.fillRect(0, 0, 1024, 128);
    ctx.fillStyle = "#c9cbcf";
    ctx.font = "italic 900 54px Arial, Helvetica, sans-serif";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    // Outer face of the drive-side leg is +Z (v=0.25 -> 75% canvas height).
    ctx.save();
    ctx.translate(300, 128 * 0.75);
    ctx.scale(-1.6, 1);
    ctx.fillText("SID", 0, 2);
    ctx.restore();
    ctx.save();
    ctx.translate(512 + 300, 128 * 0.25);
    ctx.scale(1.6, -1);
    ctx.fillText("SID", 0, 2);
    ctx.restore();
  });
}

export function createTerrenoMaterials() {
  const seatTube = seatTubeTextures();
  const named = <T extends THREE.Material>(name: string, material: T) => {
    material.name = name;
    return material;
  };
  return {
    carbon: named("carbon", new THREE.MeshPhysicalMaterial({ ...carbonBase, color: CARBON })),
    carbonDownTube: named(
      "carbon-down-tube",
      new THREE.MeshPhysicalMaterial({ ...carbonBase, map: downTubeTexture() })
    ),
    carbonTopTube: named(
      "carbon-top-tube",
      new THREE.MeshPhysicalMaterial({ ...carbonBase, map: topTubeTexture() })
    ),
    carbonSeatTube: named(
      "carbon-seat-tube",
      new THREE.MeshPhysicalMaterial({
        ...carbonBase,
        map: seatTube.map,
        metalness: 1,
        metalnessMap: seatTube.metalness
      })
    ),
    rimCarbon: named(
      "rim-carbon",
      new THREE.MeshPhysicalMaterial({
        color: 0x0a0a0b,
        roughness: 0.35,
        clearcoat: 0.3,
        clearcoatRoughness: 0.35,
        envMapIntensity: 0.22
      })
    ),
    tread: named("tread", new THREE.MeshStandardMaterial({ color: 0x161616, roughness: 0.92 })),
    sidewall: named(
      "sidewall",
      new THREE.MeshStandardMaterial({ color: 0xb78f70, roughness: 0.85 })
    ),
    silver: named(
      "silver",
      new THREE.MeshStandardMaterial({ color: 0xd2d5d9, roughness: 0.3, metalness: 1 })
    ),
    gold: named(
      "gold",
      new THREE.MeshStandardMaterial({ color: 0xd2a24c, roughness: 0.3, metalness: 1 })
    ),
    blackSatin: named(
      "black-satin",
      new THREE.MeshStandardMaterial({
        color: 0x111113,
        roughness: 0.5,
        metalness: 0.1,
        envMapIntensity: 0.5
      })
    ),
    blackRubber: named(
      "black-rubber",
      new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.78 })
    ),
    forkLower: named(
      "fork-lower",
      new THREE.MeshPhysicalMaterial({
        roughness: 0.3,
        clearcoat: 0.8,
        clearcoatRoughness: 0.15,
        map: forkLowerTexture()
      })
    ),
    spoke: named(
      "spoke",
      new THREE.MeshStandardMaterial({ color: 0x1a1a1c, roughness: 0.4, metalness: 0.7 })
    ),
    rotor: named(
      "rotor",
      new THREE.MeshStandardMaterial({ color: 0xb8bbbf, roughness: 0.35, metalness: 1 })
    ),
    anodisedBlue: named(
      "anodised-blue",
      new THREE.MeshStandardMaterial({ color: 0x3150c8, roughness: 0.3, metalness: 1 })
    )
  };
}

export type TerrenoMaterials = ReturnType<typeof createTerrenoMaterials>;
