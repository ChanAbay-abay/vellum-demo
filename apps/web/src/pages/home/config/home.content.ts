/**
 * All copy and images for the home page. Swap this per client.
 * Images live in /public/images (rendered placeholders). Replace them with real
 * photography: ~2400px wide for gallery slides, ~1200px for journal cards.
 */

export const HERO = {
  /** Descriptive line, used as the page's h1. Say what you do and where. */
  intro:
    "zo-stack is an independent studio crafting websites and business systems for Philippine companies.",
  /** Display headline at the bottom of the hero, one entry per line */
  headline: ["Local craft.", "Global standard."],
  discover: { hash: "studio", label: "Discover" },
  scrollHint: "Scroll to explore",
  /** Optional film. Remove `href` to hide the box. */
  film: { href: "https://www.youtube.com/", label: "Watch the film" }
} as const;

export const STUDIO = {
  id: "studio",
  title: "Uncompromising craft",
  paragraphs: [
    "zo-stack is an independent studio founded to give Philippine businesses the kind of presence once reserved for global brands.",
    "Designed in Cebu for the phones your customers hold, every site is shaped with the same care: considered design, honest words, flawless execution."
  ]
} as const;

export const COLLECTION = {
  id: "collection",
  title: "The collection",
  items: [
    { cta: { label: "Explore" }, detail: "Landing page", finish: "rose", name: "Essential" },
    { cta: { label: "Explore" }, detail: "Website + system", finish: "steel", name: "Signature" }
  ]
} as const;

export const GALLERY = {
  id: "work",
  /** First slide carries a title */
  feature: {
    image: { alt: "", src: "/images/gallery-feature.jpg" },
    subtitle: "By appointment…",
    title: "Bespoke"
  },
  slides: [
    { alt: "", src: "/images/gallery-1.jpg" },
    { alt: "", src: "/images/gallery-2.jpg" },
    { alt: "", src: "/images/gallery-3.jpg" }
  ]
} as const;

export const JOURNAL = {
  id: "journal",
  title: "Journal",
  /** Set `href` once there's a page to link to */
  more: { href: "", label: "More articles" },
  items: [
    {
      category: "By design",
      date: "Sep 2026",
      image: { alt: "", src: "/images/journal-1.jpg" },
      title: "The first impression"
    },
    {
      category: "In good company",
      date: "Aug 2026",
      image: { alt: "", src: "/images/journal-2.jpg" },
      title: "Kape Cebuano, one year on"
    },
    {
      category: "By design",
      date: "Jul 2026",
      image: { alt: "", src: "/images/journal-3.jpg" },
      title: "Made for the phone in your hand"
    }
  ]
} as const;
