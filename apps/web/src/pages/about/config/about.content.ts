import { type ResponsiveImage } from "@zo-stack/ui/components/picture";

import edgeCollage from "@/shared/assets/images/edge/edge-2007-collage.jpg?responsive";
import champagneStudio from "@/shared/assets/images/fuerza/champagne/fuerza-champagne-studio.jpg?responsive";
import frameTubes from "@/shared/assets/images/fuerza/details/fuerza-frame-tubes.jpg?responsive";
import ghostFrameset from "@/shared/assets/images/fuerza/ghost/fuerza-ghost-frameset.jpg?responsive";
import retroBlackFrameset from "@/shared/assets/images/fuerza/retro-black/fuerza-retro-black-frameset.jpg?responsive";
import retroBlackHeadtube from "@/shared/assets/images/fuerza/retro-black/fuerza-retro-black-headtube.jpg?responsive";
import spectrumSilverBike from "@/shared/assets/images/fuerza/spectrum-silver/fuerza-spectrum-silver-bike.jpg?responsive";
import poster22Years from "@/shared/assets/images/heritage/heritage-22-years-poster.jpg?responsive";
import areteRacing from "@/shared/assets/images/heritage/heritage-arete-racing-2006.jpg?responsive";
import emc2California from "@/shared/assets/images/heritage/heritage-emc2-team-california.jpg?responsive";
import interbike2006 from "@/shared/assets/images/heritage/heritage-interbike-2006.jpg?responsive";
import rideBridge from "@/shared/assets/images/lifestyle/ride-bridge.jpg?responsive";
import rideCoffee from "@/shared/assets/images/lifestyle/ride-coffee.jpg?responsive";
import rideCrosswalk from "@/shared/assets/images/lifestyle/ride-crosswalk-bw.jpg?responsive";
import rideGoldenHour from "@/shared/assets/images/lifestyle/ride-golden-hour.jpg?responsive";
import rideMuralTeal from "@/shared/assets/images/lifestyle/ride-mural-teal.jpg?responsive";
import rideRace from "@/shared/assets/images/lifestyle/ride-race.jpg?responsive";
import rideRiderSide from "@/shared/assets/images/lifestyle/ride-rider-side.jpg?responsive";
import { type ClosingCtaProps } from "@/shared/ui/closing-cta";

/**
 * All copy and images for /about (PRD "About"). Story, philosophy, founders and timeline are
 * the PRD's words; lines marked `*` are ours, to confirm with the client before delivery.
 * Address, hours, map link and socials come from siteConfig; inquiries render with <InquireLink>.
 */

export const HERO = {
  /** The page's h1, one phrase per line */
  heading: ["Born from passion.", "Built for global performance."],
  story:
    "In 2004, design entrepreneur and triathlete Chris Aldeguer and architect, industrial designer and cyclist Michael Flores founded Vellum Cycles. Their partnership unites an instinctive compulsion for speed with the fundamentals and aesthetic values needed to achieve it. Vellum reflects their personalities: simple and straightforward, with an unyielding commitment to performance.",
  established: "Est. 2004 · Cebu",
  image: {
    image: retroBlackHeadtube,
    alt: "Head tube of a Fuerza Retro Black frame, the orange-to-burgundy stripe painted on the down tube, on a sand backdrop"
  }
} as const;

/**
 * Typographic cards (Chan, 2026-10-07): no founder photos exist, so the name in display type
 * over the stripe band carries each card. No silhouettes, no photo slots.
 */
export const FOUNDERS = {
  id: "founders",
  /** * heading and intro are ours; the PRD gives the section none */
  heading: "Two founders. One line.",
  intro:
    "A triathlete with an instinct for speed and an architect with an eye for form. Every Vellum is where the two meet.",
  people: [
    {
      name: ["Chris", "Aldeguer"],
      role: "Co-founder & CEO",
      about: "Design entrepreneur and triathlete."
    },
    {
      name: ["Michael", "Flores"],
      role: "Co-founder, President & Chief Designer",
      about: "Architect, industrial designer and cyclist."
    }
  ]
} as const;

export const PHILOSOPHY = {
  id: "philosophy",
  heading: "Performance with style.",
  principles: [
    "Straight, sharp-edged lines.",
    "Aerodynamic efficiency.",
    "Aggressive geometry.",
    "Precise attention to ergonomics."
  ],
  image: {
    image: frameTubes,
    alt: "Close-up of Vellum carbon frames, the wordmark running along a straight, sharp-edged down tube"
  }
} as const;

type TimelinePhoto = {
  image: ResponsiveImage;
  alt: string;
  /** object-position, so each photo keeps its subject in the 4:3 crop */
  position?: string;
  /** Archive photo: full colour with grain (DESIGN.md §9) */
  grain?: boolean;
  /** Low-res Edge archive: black and white with grain (PRD Assets) */
  mono?: boolean;
};

type TimelineEntry = {
  year: string;
  title: string;
  detail?: string;
  /** None (2012): the row shows a typographic panel built from `panel` instead */
  photos: readonly TimelinePhoto[];
  panel?: { name: string; meta: string };
};

/** PRD timeline, verified rows only. Two photos render as a pair. */
const TIMELINE_ENTRIES: readonly TimelineEntry[] = [
  {
    year: "2004",
    title: "Vellum Cycles founded in Cebu",
    photos: [
      {
        image: poster22Years,
        alt: "Vellum's 22-years poster: “Retro is the New Look” above an orange, red and burgundy stripe, “Est. 2004, Set the Pace”",
        position: "50% 55%",
        grain: true
      }
    ]
  },
  {
    year: "2006",
    title: "Interbike, Las Vegas",
    detail: "The EMC² and Arete Racing teams ride Vellum.",
    photos: [
      {
        image: interbike2006,
        alt: "Visitors at the Vellum stand at Interbike 2006, Las Vegas, red frames on the wall",
        grain: true
      },
      {
        image: areteRacing,
        alt: "Arete Racing riders in white kit on Vellum bikes, riding in a tight group",
        position: "50% 30%",
        grain: true
      }
    ]
  },
  {
    year: "2006",
    title: "EMC² team with Vellum, California",
    photos: [
      {
        image: emc2California,
        alt: "The EMC² team lined up with their Vellum bikes under a theatre sign reading “Welcome Nathan and Team Vellum”",
        position: "50% 70%",
        grain: true
      }
    ]
  },
  {
    year: "2007",
    title: "First-generation Edge",
    detail: "“The ride that brought victories.”",
    photos: [
      {
        image: edgeCollage,
        alt: "Archive collage of the first-generation Vellum Edge: a racing pack and a team photo, 2007",
        position: "50% 85%",
        mono: true
      }
    ]
  },
  {
    year: "2012",
    title: "Uno TT launched",
    detail: "Built for Ironman and XTERRA in Cebu.",
    photos: [],
    panel: { name: "Uno TT", meta: "Ironman · XTERRA · Cebu" }
  },
  {
    year: "2023",
    title: "Fuerza Disc",
    detail: "In Ghost and Silver Freeze.",
    photos: [
      {
        image: ghostFrameset,
        alt: "Fuerza Disc frameset in Ghost, matte black with orange details",
        position: "50% 50%"
      }
    ]
  },
  {
    year: "2024",
    title: "Fuerza Champagne",
    photos: [
      {
        image: champagneStudio,
        alt: "Fuerza in Champagne on a sage studio backdrop"
      }
    ]
  },
  {
    year: "2025",
    title: "Fuerza Spectrum Silver",
    photos: [
      {
        image: spectrumSilverBike,
        alt: "Fuerza in Spectrum Silver on a graphite studio backdrop",
        position: "50% 60%"
      }
    ]
  },
  {
    year: "2026",
    title: "Retro",
    detail: "Limited Fuerza Retro Black and Greige, 22 years on.",
    photos: [
      {
        image: retroBlackFrameset,
        alt: "Fuerza Retro Black frameset on a sand backdrop, the stripe running across the down tube",
        position: "50% 60%"
      }
    ]
  }
];

export const TIMELINE = {
  id: "timeline",
  /** * heading and intro are ours */
  heading: "Since 2004.",
  intro: "Twenty-two years of race frames, drawn in Cebu.",
  entries: TIMELINE_ENTRIES
} as const;

/** Static grid of six lifestyle photos (Chan: no live feed). Only IG and FB follow buttons. */
export const SOCIALS = {
  id: "socials",
  /** * heading and body are ours */
  heading: "Ride with us.",
  body: "Group rides, new colorways and builds from riders across the country.",
  handle: "@vellumcycles",
  instagram: { label: "Follow on Instagram" },
  facebook: { label: "Facebook" },
  photos: [
    {
      image: rideBridge,
      alt: "A Vellum road bike leaning on a railing below a white suspension bridge"
    },
    {
      image: rideCrosswalk,
      alt: "Black and white, overhead: two riders crossing painted road markings"
    },
    { image: rideCoffee, alt: "A black Vellum parked inside a café under a neon sign" },
    {
      image: rideGoldenHour,
      alt: "A Vellum against a low wall at sunset, an orange sky behind a lattice fence"
    },
    {
      image: rideMuralTeal,
      alt: "A Vellum in front of a teal mural painted with a giant bicycle wheel"
    },
    {
      image: rideRiderSide,
      alt: "A rider in team kit pedalling a silver Fuerza past a chain-link fence"
    }
  ]
} as const;

/**
 * Showroom with an embedded map. Same copy as the home block; the home section itself can't be
 * mounted here (pages may not import other pages), so this is a smaller About-only version.
 */
export const SHOWROOM = {
  id: "showroom",
  heading: "Ride one before you decide.",
  body: "Visit the Vellum showroom in Cabancalan, Cebu, or find an authorized dealer near you.",
  directions: { label: "Get directions" },
  message: { label: "Message us" },
  map: {
    /** Keyless Google Maps embed, the same query as siteConfig.contact.mapsUrl */
    src: "https://www.google.com/maps?q=Vellum+Cycles,+ML+Quezon+St,+Cabancalan,+Cebu+City&z=15&output=embed",
    title: "Map: Vellum Cycles showroom, ML Quezon St, Cabancalan, Cebu City",
    openLabel: "Open in Google Maps"
  },
  dealersHeading: "Authorized dealers",
  dealers: [
    { city: "Cebu", names: "Vellum Showroom" },
    { city: "Manila", names: "Ross Cycle Center · Crankmasters" },
    { city: "La Union", names: "Wattstop" },
    { city: "Iloilo", names: "El Capitan" },
    { city: "Davao", names: "Barney's Bikeshop" },
    { city: "Online", names: "Brick Bike Boutique · Ride Vellum" }
  ]
} as const;

/** Closing CTA, rendered by the shared <ClosingCta>. Sits straight on the footer. */
export const CLOSING = {
  /** `*` placeholder copy, an echo of the "Set the Pace." tagline */
  heading: "Set your pace.",
  body: "Fuerza, Edge or Terreno. Ride one in Cabancalan, or message us.",
  image: {
    image: rideRace,
    alt: "A rider in an orange helmet racing toward the camera on a city road"
  },
  primary: { label: "Explore models", to: "/models" },
  secondary: { label: "Or message us", channel: "instagram" }
} satisfies ClosingCtaProps;
