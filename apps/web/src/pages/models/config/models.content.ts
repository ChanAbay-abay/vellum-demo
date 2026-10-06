/**
 * /models index copy and photos (PRD "Models (index)"). Names, lines and routes come from the
 * nav's model list (config/layout.content.ts), the one lineup source pages are allowed to read
 * (FSD forbids importing another page's content). The warranty is the shared one
 * (config/warranty.content.ts), rendered by `<Warranty>`; never copy its terms here.
 */
import edgeGen2 from "@/shared/assets/images/edge/edge-gen2-crop.jpg?responsive";
import fuerzaRetroGreige from "@/shared/assets/images/fuerza/retro-greige/fuerza-retro-greige-bike-alt.jpg?responsive";
import terrenoShowroom from "@/shared/assets/images/terreno/terreno-showroom-ugc.jpg?responsive";
import { type ClosingCtaProps } from "@/shared/ui/closing-cta";

import { NAV } from "@/config/layout.content";

/**
 * Per-model row art, keyed by route so a reordered nav list can't mismatch photos.
 * - `ground`: the row's section ground. Fuerza sits on sand, the same tone as its studio backdrop.
 * - `treatment`: `archive` renders black and white (PRD Assets: Edge archive, B&W treat);
 *   `ugc` calms a busy phone photo (desaturated, slightly darker) without hiding the bike.
 * - `position`: the `object-position` crop, so the frame stays in shot.
 * - `zoom`: optional extra crop for a photo whose subject is small in the frame (scale + origin on
 *   the <picture>; the hover scale lives on the <img>, so the two never share a transform).
 */
const ART = {
  "/models/fuerza": {
    image: fuerzaRetroGreige,
    alt: "Vellum Fuerza in Retro Greige, three-quarter view on a sand studio backdrop",
    ground: "sand",
    position: "object-[50%_55%]",
    zoom: "",
    treatment: "none"
  },
  "/models/edge": {
    image: edgeGen2,
    alt: "Second-generation Vellum Edge under a rider, archive photo",
    ground: "ink",
    position: "object-[50%_70%]",
    zoom: "",
    treatment: "archive"
  },
  // * Weak UGC photo (PRD): replace with a studio shot when the client sends one.
  "/models/terreno": {
    image: terrenoShowroom,
    alt: "Vellum Terreno in black carbon with tan-wall tyres, in the showroom",
    ground: "bone",
    position: "object-[78%_72%]",
    // Crops the shop wall and shelving above the bike down to the frame and wheels.
    zoom: "scale-[1.3] origin-[72%_92%]",
    treatment: "ugc"
  }
} as const;

export const LINEUP = {
  heading: "The lineup.",
  /** Visible label on every row's link; the model name is appended for screen readers */
  viewLabel: "View",
  items: NAV.models.items.map((item) => {
    return { ...item, ...ART[item.to] };
  })
};

/** Closing CTA before the footer, rendered by the shared <ClosingCta>. No photo: plain ink. */
export const CLOSING = {
  /** `*` placeholder copy */
  heading: "Not sure which one?",
  body: "Tell us how and where you ride. We will point you to the right frame.",
  primary: { label: "Message us", channel: "instagram" }
} satisfies ClosingCtaProps;
