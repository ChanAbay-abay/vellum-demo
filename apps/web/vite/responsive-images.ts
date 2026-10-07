import { type Plugin } from "vite-plus";

const RESPONSIVE_IMPORT = /^(.+\.(?:jpe?g|png|webp))\?responsive$/;
// The \0 prefix keeps imagetools (and every other plugin's createFilter) from claiming this id.
const VIRTUAL_PREFIX = "\0responsive-image:";

/**
 * imagetools directives for the two queries the virtual module below asks for.
 * `?picture` is the AVIF/WebP/JPG srcset set; `?placeholder` is a tiny blurred WebP inlined as a data URL.
 */
export function defaultDirectives(url: URL) {
  if (url.searchParams.has("picture")) {
    return new URLSearchParams({
      w: "480;640;828;1080;1600;2400",
      format: "avif;webp;jpg",
      as: "picture"
    });
  }
  if (url.searchParams.has("placeholder")) {
    return new URLSearchParams({ w: "24", blur: "2", format: "webp", inline: "" });
  }
  return new URLSearchParams();
}

/**
 * Turns `import hero from "./hero.jpg?responsive"` into one object holding the picture sources and
 * the blur placeholder, so app code needs one import per image instead of two.
 */
export function responsiveImages(): Plugin {
  return {
    name: "iridel:responsive-images",
    enforce: "pre",
    async resolveId(source, importer) {
      const match = RESPONSIVE_IMPORT.exec(source);
      if (!match) return null;
      const resolved = await this.resolve(match[1], importer, { skipSelf: true });
      if (!resolved) return null;
      return VIRTUAL_PREFIX + resolved.id;
    },
    load(id) {
      if (!id.startsWith(VIRTUAL_PREFIX)) return null;
      const file = id.slice(VIRTUAL_PREFIX.length);
      return [
        `import picture from ${JSON.stringify(`${file}?picture`)};`,
        `import placeholder from ${JSON.stringify(`${file}?placeholder`)};`,
        "export default { ...picture, placeholder };"
      ].join("\n");
    }
  };
}
