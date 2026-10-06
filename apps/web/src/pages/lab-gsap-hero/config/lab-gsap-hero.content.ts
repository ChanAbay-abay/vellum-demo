/**
 * Copy for the GSAP hero lab. Placeholder words: a demo ports the scene, then writes its own.
 * The lab route is deleted before delivery (see .agents/iridel.md).
 */

export const LAB_HERO = {
  /** One entry per line of the h1. Keep each short so the split reads as two clean lines. */
  title: ["Made with care", "Built to last"],
  subtitle: "A short line that says what the business does and who it is for.",
  cta: { hash: "studio", label: "Discover" },
  image: { alt: "A wide, softly lit landscape" }
} as const;

export const LAB_NEXT = {
  id: "next",
  paragraph:
    "The next section starts on paper, so the hero's closing wash hands over without a seam. Everything below the hero animates with Motion, not GSAP."
} as const;
