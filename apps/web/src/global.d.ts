/**
 * Needed to allow importing CSS files and font files without TypeScript errors
 * @see {@link https://github.com/fontsource/fontsource/issues/1038}
 */
declare module "*.css";

declare module "@fontsource/*" {
  const src: string;
  export default src;
}
declare module "@fontsource-variable/*" {
  const src: string;
  export default src;
}

// Validated and inlined at build time in vite.config.ts. Merges with Vite's own ImportMetaEnv.
// oxlint-disable-next-line typescript/consistent-type-definitions
interface ImportMetaEnv {
  readonly VITE_SITE_URL: string;
}
