import heritageEdgeCollage from "@/shared/assets/images/edge/edge-2007-collage.jpg?responsive";
import modelsEdge from "@/shared/assets/images/edge/edge-gen2-crop.jpg?responsive";
import heritageChampagne from "@/shared/assets/images/fuerza/champagne/fuerza-champagne-studio.jpg?responsive";
import heritageRetro from "@/shared/assets/images/fuerza/details/fuerza-retro-stripe-macro.jpg?responsive";
import heritageGhost from "@/shared/assets/images/fuerza/ghost/fuerza-ghost-frameset.jpg?responsive";
import modelsFuerza from "@/shared/assets/images/fuerza/retro-greige/fuerza-retro-greige-bike.jpg?responsive";
import fuerzaRudyShowroom from "@/shared/assets/images/fuerza/rudy-project/fuerza-rudy-project-showroom.jpg?responsive";
import heritageSpectrum from "@/shared/assets/images/fuerza/spectrum-silver/fuerza-spectrum-silver-bike.jpg?responsive";
import heritageFounded from "@/shared/assets/images/heritage/heritage-22-years-poster.jpg?responsive";
import heritageEmc2 from "@/shared/assets/images/heritage/heritage-emc2-team-california.jpg?responsive";
import heritageInterbike from "@/shared/assets/images/heritage/heritage-interbike-2006.jpg?responsive";
/**
 * All copy and images for the home page (PRD "Home" sections, hero per DESIGN.md §6 Direction D).
 * Lines marked `*` are placeholders to confirm with the client before delivery.
 * Nav and footer copy live in src/config/layout.content.ts (features can't import from pages).
 *
 * Inquiry links come from siteConfig.contact (instagramDm primary, messenger secondary);
 * render them with <InquireLink>, never a hard-coded URL here.
 */
import closingRide from "@/shared/assets/images/lifestyle/ride-pair-climb.jpg?responsive";
import merchCaps from "@/shared/assets/images/merch/merch-caps-18myles.jpg?responsive";
import merchHoodie from "@/shared/assets/images/merch/merch-retro-hoodie.jpg?responsive";
import merchJersey from "@/shared/assets/images/merch/merch-retro-jersey.jpg?responsive";
import merchTee from "@/shared/assets/images/merch/merch-retro-tee.jpg?responsive";
import showroomDealersPoster from "@/shared/assets/images/showroom/dealers-poster.jpg?responsive";
import showroomCebu from "@/shared/assets/images/showroom/showroom-cebu.jpg?responsive";
import showroomSugbu from "@/shared/assets/images/showroom/showroom-sugbu-heritage-display.jpg?responsive";
import showroomVpharma from "@/shared/assets/images/showroom/showroom-vpharma-display.jpg?responsive";
import modelsTerreno from "@/shared/assets/images/terreno/terreno-mtb-ugc.jpg?responsive";
import terrenoShowroom from "@/shared/assets/images/terreno/terreno-showroom-ugc.jpg?responsive";
import { type ClosingCtaProps } from "@/shared/ui/closing-cta";

/**
 * Direction D: full-width "vellum" wordmark (SVG, stripe clipped inside the letters) behind a
 * grayscale rider cut-out, statement and the two CTAs bottom-left. Ground: bone.
 */
export const HERO = {
  id: "top",
  /** The page's h1. Line two renders burgundy, its last word in the orange-to-red stripe. */
  statement: ["Set the pace.", "Two decades of", "Edge."],
  cta: { label: "Explore models", to: "/models" },
  secondary: { label: "Shop merch", to: "/merch" },
  /**
   * Scroll-scrubbed rider: frames 0-88 of vidoption1.mp4 (rider tosses the helmet and rides out
   * right), background removed, 1920x1080 WebP in public/frames/hero. Frame 1 is the hand-picked
   * start frame and doubles as the static (no-JS, reduced-motion) image.
   */
  rider: {
    frameCount: 89,
    frameSrc: (n: number) => `/frames/hero/frame-${String(n).padStart(3, "0")}.webp`,
    width: 1920,
    height: 1080,
    alt: "A rider on a Vellum Fuerza"
  },
  /** The SVG wordmark is read as text by screen readers through this label */
  wordmarkLabel: "Vellum"
} as const;

export const INTRO = {
  id: "intro",
  heading: "Made by cyclists. For cyclists.",
  body: "Vellum takes its name from a paper known for being light and strong. Two decades on, every frame is still drawn the same way: straight, sharp-edged, and built to win."
} as const;

/** Three equal columns on desktop (hovered one widens), stacked on mobile. Edge uses the SVG wordmark. */
export const MODELS = {
  id: "models",
  /** Visually hidden section heading (the columns carry the visible names) */
  heading: "The lineup",
  items: [
    {
      slug: "fuerza",
      name: "Fuerza",
      line: "The all-rounder, now in Retro.",
      image: modelsFuerza,
      alt: "Vellum Fuerza in Retro Greige on a studio backdrop",
      to: "/models/fuerza"
    },
    {
      slug: "edge",
      name: "Edge",
      line: "Where it started. 2007.",
      image: modelsEdge,
      alt: "Second-generation Vellum Edge, archive photo",
      to: "/models/edge"
    },
    {
      slug: "terreno",
      name: "Terreno",
      line: "Built for the dirt.",
      /** * Weak UGC photo; replace with a studio shot when the client sends one */
      image: modelsTerreno,
      alt: "Vellum Terreno cross-country bike on a trail",
      to: "/models/terreno"
    }
  ]
} as const;

export const MERCH = {
  id: "merch",
  heading: "Retro, down to what you wear.",
  body: "Jerseys, hoodies, caps and more.",
  cta: { label: "Shop the look", to: "/merch" },
  /** Product names are * placeholders until the client sends the merch catalogue */
  items: [
    { name: "Retro Jersey", image: merchJersey, alt: "Vellum Retro cycling jersey laid flat" },
    {
      name: "Retro Hoodie",
      image: merchHoodie,
      alt: "Grey hoodie with the Retro stripe on the chest"
    },
    {
      name: "2004 Caps",
      image: merchCaps,
      alt: "Three Vellum Cycles 2004 caps in black, grey and tan"
    },
    { name: "Retro Tee", image: merchTee, alt: "Black Vellum tee with an orange chest logo" }
  ]
} as const;

/** Horizontal strip of full-colour frames with film grain, drawn from the PRD's About timeline. */
export const HERITAGE = {
  id: "heritage",
  /** * PRD gives this strip no heading; line taken from the PRD's "one thing to communicate" */
  heading: "Twenty-two years of Cebu-designed race bikes.",
  frames: [
    {
      year: "2004",
      caption: "Founded in Cebu",
      /** * PRD lists no image for this frame; using the 22-years poster from the About timeline */
      image: heritageFounded,
      alt: "Vellum Cycles 22 years poster"
    },
    {
      year: "2006",
      caption: "Interbike, Las Vegas",
      image: heritageInterbike,
      alt: "The Vellum stand at Interbike 2006 in Las Vegas"
    },
    {
      year: "2006",
      caption: "EMC² team, California",
      image: heritageEmc2,
      alt: "The EMC² team with their Vellum bikes in California"
    },
    {
      year: "2007",
      caption: "First-generation Edge",
      image: heritageEdgeCollage,
      alt: "Collage of the first-generation Vellum Edge, 2007"
    },
    {
      year: "2023",
      caption: "Fuerza Disc",
      image: heritageGhost,
      alt: "Fuerza Disc frameset in Ghost"
    },
    {
      year: "2024",
      caption: "Fuerza Champagne",
      image: heritageChampagne,
      alt: "Fuerza in Champagne, studio shot"
    },
    {
      year: "2025",
      caption: "Fuerza Spectrum Silver",
      image: heritageSpectrum,
      alt: "Fuerza in Spectrum Silver"
    },
    {
      year: "2026",
      caption: "Retro",
      image: heritageRetro,
      alt: "Macro of the Retro stripe on a Fuerza frame"
    }
  ],
  /** Last panel on the strip, so the end of the scroll rests on a message instead of the last photo */
  closing: {
    year: "Next",
    heading: "The story is still being written.",
    body: "Every rider who takes a Vellum onto Cebu's roads writes the next frame. Ride with us.",
    cta: { label: "Follow @vellumcycles" }
  },
  cta: { label: "Our story", to: "/about" }
} as const;

export const SHOWROOM = {
  id: "showroom",
  heading: "Ride one before you decide.",
  body: "Visit the Vellum showroom in Cabancalan, Cebu, or find an authorized dealer near you.",
  /** Address, hours and the Google Maps link come from siteConfig.contact */
  directions: { label: "Get directions" },
  message: { label: "Message us" },
  messenger: { label: "Messenger" },
  availability: "Availability changes weekly. Message us.",
  dealersHeading: "Authorized dealers",
  /**
   * One row per city. The panel photos are Vellum's own images, NOT of these shops (no dealer
   * photos supplied): `caption` says what each photo really shows, never a dealer's storefront.
   */
  locations: [
    {
      city: "Cebu",
      names: ["Vellum Showroom"],
      marker: "Flagship · Mon–Sat",
      image: showroomCebu,
      alt: "Inside the Vellum Cycles showroom: two red and one olive Vellum road bikes and two frames on a stand, in front of the Vellum logo wall",
      caption: "Vellum Showroom, Cabancalan, Cebu"
    },
    {
      city: "Manila",
      names: ["Ross Cycle Center", "Crankmasters"],
      image: showroomVpharma,
      alt: "A red Vellum road bike below a framed VPharma team jersey in a Vellum display",
      caption: "Vellum display with a framed team jersey"
    },
    {
      city: "La Union",
      names: ["Wattstop"],
      image: fuerzaRudyShowroom,
      alt: "A red Fuerza road bike with deep black wheels leaning against a white paneled wall",
      caption: "A Fuerza in Rudy Project red"
    },
    {
      city: "Iloilo",
      names: ["El Capitan"],
      image: showroomSugbu,
      alt: "A silver Fuerza road bike on a wooden display plinth in front of a screen, with a red frame behind it",
      caption: "Vellum display, Sugbu Heritage"
    },
    {
      city: "Davao",
      names: ["Barney's Bikeshop"],
      image: terrenoShowroom,
      alt: "A black Terreno mountain bike with tan-wall tires in a bike shop",
      caption: "A Terreno in a customer's bike shop"
    },
    {
      city: "Online",
      online: true,
      names: ["Brick Bike Boutique", "Ride Vellum"],
      marker: "Online",
      image: showroomDealersPoster,
      alt: "Vellum's Authorized Dealers poster over a close-up of a white Fuerza head tube",
      caption: "Vellum's authorized dealers poster"
    }
  ]
} as const;

/** Closing CTA after Showroom, rendered by the shared <ClosingCta>. Sits straight on the footer. */
export const CLOSING = {
  heading: "Find your frame.",
  /** `*` placeholder copy */
  body: "Edge, Fuerza or Terreno. Designed in Cebu, built for how you ride.",
  image: {
    image: closingRide,
    alt: "Two riders climbing a quiet concrete road under trees"
  },
  primary: { label: "Explore models", to: "/models" },
  secondary: { label: "Or message us", channel: "instagram" }
} satisfies ClosingCtaProps;
