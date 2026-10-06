import bottles from "@/shared/assets/images/merch/merch-bottles.jpg?responsive";
import caps from "@/shared/assets/images/merch/merch-caps-18myles.jpg?responsive";
import kitFlatlay from "@/shared/assets/images/merch/merch-kit-flatlay.jpg?responsive";
import linearJersey from "@/shared/assets/images/merch/merch-linear-jersey-grey.jpg?responsive";
import retroHoodie from "@/shared/assets/images/merch/merch-retro-hoodie.jpg?responsive";
import retroJersey from "@/shared/assets/images/merch/merch-retro-jersey.jpg?responsive";
import stickers from "@/shared/assets/images/merch/merch-retro-stickers.jpg?responsive";
import retroTee from "@/shared/assets/images/merch/merch-retro-tee.jpg?responsive";
/**
 * All copy and images for /merch (PRD "Merch"). Product names and variants are verbatim from
 * the PRD table; lines marked `*` are placeholders to confirm with the client before delivery.
 * No prices, ever: every card's action is the Instagram DM (siteConfig.contact via InquireLink).
 */
import { type ClosingCtaProps } from "@/shared/ui/closing-cta";

export const HEADER = {
  /** One string per line, so the stripe under the h1 can match the longest line exactly */
  heading: ["Retro, down to", "what you wear."],
  /** * Body taken from the home merch row; the PRD gives this page no body line */
  body: "Jerseys, hoodies, caps and more. Message us for sizes and stock."
} as const;

/** Sizes the PRD marks `*` ASK render as this line instead of an invented size run. */
const ON_REQUEST = "Sizes on request";

/**
 * The grid, in PRD order minus the sticker set (a callout below, not a product).
 * `meta` is the PRD's "Sizes / variants" column; `null` when there is nothing confirmed to say.
 */
export const PRODUCTS = [
  {
    name: "Retro Jersey",
    meta: "XS–XL",
    image: retroJersey,
    alt: "Vellum Retro jersey in cream with the orange, red and burgundy chest stripe"
  },
  {
    name: "Retro Hoodie",
    /** PRD: "Retro Hoodie (with sticker set)"; sizes `*` ASK */
    note: "With sticker set",
    meta: ON_REQUEST,
    image: retroHoodie,
    alt: "Light grey hoodie with the Retro stripe and Vellum wordmark on the chest"
  },
  {
    name: "Retro Tee",
    /** Sizes `*` ASK */
    meta: ON_REQUEST,
    image: retroTee,
    alt: "Black Vellum tee with a red chest logo, held up against a mountain at dusk"
  },
  {
    name: "Linear Jersey",
    meta: "Light grey, dark grey · XS–XL",
    image: linearJersey,
    alt: "Light grey Linear jersey with a dark grey panel and a red band across the chest"
  },
  {
    name: "Vellum × 18Myles Strapback Cap",
    meta: "Black, grey, khaki",
    image: caps,
    alt: "Three Vellum Cycles 2004 strapback caps in black, grey and khaki"
  },
  {
    name: "Bottles",
    /** Variants `*` ASK: no line until the client confirms */
    meta: null,
    image: bottles,
    alt: "Two black Vellum bottles with the diagonal stripe beside coffee cups on a café table"
  }
] as const;

/** The sticker set is free with any purchase (PRD), so it reads as a callout, not a product. */
export const STICKERS = {
  heading: "Free with any purchase.",
  name: "Retro Sticker Set",
  /** * Placeholder copy */
  body: "Every order ships with the Retro sticker set. Ask for it when you message us.",
  image: stickers,
  alt: "The Retro sticker set: Vellum, Set the Pace, 22 and bike badges laid over the stripe"
} as const;

/** Closing CTA before the footer, rendered by the shared <ClosingCta>. Primary is the Instagram DM, Messenger secondary. */
export const CTA = {
  /** * Placeholder copy */
  heading: "Ask for your size.",
  /** * Placeholder copy */
  body: "Tell us the piece and your size, and we'll reply with what's in stock.",
  image: {
    image: kitFlatlay,
    alt: "Vellum kit laid out on concrete: Linear jersey, helmet, gloves, glasses, bottle, socks and shoes"
  },
  primary: { label: "Message us on Instagram" },
  secondary: { label: "Or Messenger", channel: "messenger" }
} satisfies ClosingCtaProps;
