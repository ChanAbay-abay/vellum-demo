// `?responsive` image imports are resolved by apps/web/vite/responsive-images.ts.
declare module "*?responsive" {
  import { type ResponsiveImage } from "@zo-stack/ui/components/picture";

  const image: ResponsiveImage;
  export default image;
}
