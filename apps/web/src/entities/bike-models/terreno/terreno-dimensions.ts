import * as THREE from "three";

// Geometry measured off terreno-showroom-ugc.jpg: a pinhole camera was solved from the two tyre
// outlines + grip ends (context/3d/terreno/solve_camera.py) and mid-plane landmarks were
// back-projected onto the bike plane. Where the photo was ambiguous, XC-hardtail norms fill in.
// Metres, origin on the ground under the BB, +X forward, +Y up, +Z drive side.

export const WHEEL_RADIUS = 0.37;
export const BB = new THREE.Vector3(0, 0.295, 0);
export const REAR_AXLE = new THREE.Vector3(-0.435, WHEEL_RADIUS, 0);
export const FRONT_AXLE = new THREE.Vector3(0.637, WHEEL_RADIUS, 0);

// The photo implies ~71.5 deg once the solved camera is applied (wide-angle phone lens; typical XC is 69-70).
const HEAD_ANGLE = THREE.MathUtils.degToRad(71.5);
const SEAT_ANGLE = THREE.MathUtils.degToRad(74.5);
const FORK_OFFSET = 0.04;

/** Unit vector up the steerer, and the forward normal to it (both in the bike plane). */
export const STEER_DIR = new THREE.Vector3(-Math.cos(HEAD_ANGLE), Math.sin(HEAD_ANGLE), 0);
export const STEER_NORMAL = new THREE.Vector3(Math.sin(HEAD_ANGLE), Math.cos(HEAD_ANGLE), 0);
const STEER_ORIGIN = FRONT_AXLE.clone().addScaledVector(STEER_NORMAL, -FORK_OFFSET);

/** Point on the steering axis, `s` metres up from the foot of the perpendicular through the front axle. */
export function steerPoint(s: number) {
  return STEER_ORIGIN.clone().addScaledVector(STEER_DIR, s);
}

/** Point on the fork-leg axis (parallel to the steerer, through the axle). */
export function forkLegPoint(s: number) {
  return FRONT_AXLE.clone().addScaledVector(STEER_DIR, s);
}

export const SEAT_DIR = new THREE.Vector3(-Math.cos(SEAT_ANGLE), Math.sin(SEAT_ANGLE), 0);
/** Point on the seat-tube axis, `s` metres from the BB. */
export function seatPoint(s: number) {
  return BB.clone().addScaledVector(SEAT_DIR, s);
}

// Steering-axis stations (s along STEER_DIR).
export const CROWN_S = 0.49;
export const HEAD_TUBE_BOTTOM_S = 0.5;
export const HEAD_TUBE_TOP_S = 0.625;
export const STEM_S = 0.66;

// Seat-tube stations (s from BB along SEAT_DIR).
export const TT_JUNCTION_S = 0.42;
export const SEAT_TUBE_TOP_S = 0.445;
export const SADDLE_CLAMP_S = 0.69;

export const STEM_LENGTH = 0.11;
/** Stem runs level (a -18.5 deg stem on the head tube), as in the photo. */
export const STEM_DIR = new THREE.Vector3(1, 0, 0);
export const BAR_HALF_WIDTH = 0.37;

/** 148 mm Boost rear spacing / 110 mm front, measured flange-to-flange as dropout faces. */
export const REAR_DROPOUT_Z = 0.074;
export const FORK_LEG_Z = 0.058;
export const CHAINLINE_Z = 0.052;
export const CRANK_LENGTH = 0.175;
/** Drive-side crank angle, radians from +X (the photo shows it forward, near horizontal). */
export const CRANK_ANGLE = THREE.MathUtils.degToRad(9);

export const CASSETTE_TEETH = [10, 12, 14, 16, 18, 21, 24, 28, 32, 38, 44, 52];
export const CHAIN_COG = 3;
export const CHAINRING_TEETH = 34;
/** Pitch radius for a 1/2" chain. */
export function pitchRadius(teeth: number) {
  return 0.0127 / 2 / Math.sin(Math.PI / teeth);
}
export function cogZ(index: number) {
  return 0.022 + (CASSETTE_TEETH.length - 1 - index) * 0.0035;
}
