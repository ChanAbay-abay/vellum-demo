/**
 * Site-wide nav and footer copy (PRD "Global nav" and "Footer", DESIGN.md §6 "Nav (CHOSEN)").
 * Lives here, not in home.content.ts, because the nav and footer are features and FSD
 * forbids features importing from pages. Business details stay in site.config.ts.
 * Lines marked `*` are placeholders to confirm with the client.
 */

export const NAV = {
  /** "Catalogue ▾" dropdown: each model shows a small thumb (the nav owns its thumb imports) */
  models: {
    label: "Catalogue",
    items: [
      { label: "Fuerza", line: "The all-rounder, now in Retro.", to: "/models/fuerza" },
      { label: "Edge", line: "Where it started. 2007.", to: "/models/edge" },
      { label: "Terreno", line: "Built for the dirt.", to: "/models/terreno" }
    ],
    all: { label: "All models", to: "/models" },
    merch: { label: "Merch", to: "/merch" }
  },
  /** "Menu ≡" full-screen ink overlay, large display links */
  menu: {
    label: "Menu",
    closeLabel: "Close",
    links: [
      { label: "Models", to: "/models" },
      { label: "About", to: "/about" },
      { label: "Merch", to: "/merch" }
    ]
  },
  /** Opens the Instagram DM */
  inquire: { label: "Inquire" }
} as const;

export const FOOTER = {
  tagline: "Set the Pace.",
  established: "Est. 2004",
  links: [
    { label: "Models", to: "/models" },
    { label: "About", to: "/about" },
    { label: "Merch", to: "/merch" }
  ],
  inquire: { label: "Message us" },
  /** Iridel RULES §4: the only Iridel credit on the site, exact text */
  credit: { label: "Demo by iridel.com", href: "https://iridel.com" }
} as const;
