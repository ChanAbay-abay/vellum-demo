import { type CameraPose } from "@/widgets/model-page/model/model-content";

/** A camera pose as flat numbers, so one GSAP tween can scrub every field of it. */
export type FlatPose = {
  tx: number;
  ty: number;
  tz: number;
  azimuth: number;
  elevation: number;
  distance: number;
  fov: number;
};

export function flattenPose({
  target: [tx, ty, tz],
  azimuth,
  elevation,
  distance,
  fov
}: CameraPose): FlatPose {
  return { tx, ty, tz, azimuth, elevation, distance, fov };
}
