/** Header links. `hash` must match a section `id` on the home page. */
export const NAV_LEFT = [
  { hash: "collection", label: "Collection" },
  { hash: "journal", label: "Journal" },
  { hash: "studio", label: "Our studio" }
] as const;

export const NAV_RIGHT = [{ hash: "work", label: "Work" }] as const;

export const NAV_CTA = { label: "Inquire" } as const;
