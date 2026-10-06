/**
 * Frame warranty (PRD "Models (index)", verbatim from the client, tidied). It covers every
 * Vellum frameset, so the /models index and each model page render it from here through
 * `<Warranty>` (shared/ui/warranty.tsx). Never copy the terms into a page's own content file.
 *
 * The six PRD terms are grouped (Chan, 2026-10-07) without rewording: term 1 is the promise,
 * term 3 the exclusions, terms 2, 4, 5 and 6 the claim steps, in PRD order.
 */
export const WARRANTY = {
  id: "warranty",
  // PROPOSED (round 3): was "Five years on every frame.", which the badge's "5 YEARS on every
  // frame" lockup now says; the heading moved to the coverage fact so the two don't repeat.
  heading: "Covered for five years.",
  /**
   * The warranty badge beside the heading (decorative, `aria-hidden`; the heading and terms carry
   * the meaning): the striped "5", its "YEARS / on every frame" lockup and the rotating seal.
   */
  badge: {
    numeral: "5",
    unit: "Years",
    line: "on every frame",
    seal: "Vellum Cycles · Five-year frame warranty · Designed in Cebu · "
  },
  covered: {
    heading: "Covered",
    terms: ["Framesets are covered against defects for five (5) years from the date of purchase."]
  },
  notCovered: {
    heading: "Not covered",
    terms: [
      "Paint scratches, discoloration, small parts (headset, bolts, seat clamp) and maintenance issues are not covered."
    ]
  },
  toClaim: {
    heading: "To claim",
    terms: [
      "The owner must present a warranty card filled out by a local accredited dealer.",
      "Claims are processed through the official Vellum dealer or distributor where the frame was purchased.",
      "Only the original owner (the name on the warranty card) is eligible.",
      "Frames are sent to Vellum Cycles headquarters for inspection."
    ]
  },
  /** Opens the Instagram DM */
  cta: { label: "Start a warranty claim" }
} as const;
