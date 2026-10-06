/**
 * The client's business details. Edit this first for every new project.
 * SEO tags, JSON-LD (Google Business-style rich results), the navbar, footer,
 * contact buttons, and the legal pages all read from here.
 *
 * Page copy (hero text, services, testimonials...) lives in
 * src/pages/home/config/home.content.ts.
 */
export const siteConfig = {
  /** Business name. Shown in the navbar, footer, and title template ("Page | name"). */
  name: "Vellum Cycles",
  /** Home page <title>. Aim for 50-60 characters with what you do and where. */
  title: "Vellum Cycles | Carbon Road Bikes Designed in Cebu Since 2004",
  /** Default meta description. Aim for 140-160 characters. */
  description:
    "Vellum Cycles designs performance carbon road framesets in Cebu since 2004. Explore Fuerza, Edge and Terreno, and visit the Cabancalan showroom.",
  /** Public origin, from VITE_SITE_URL (validated in vite.config.ts). */
  url: import.meta.env.VITE_SITE_URL,
  /** <html lang> */
  lang: "en-PH",
  /** og:locale */
  locale: "en_PH",
  /** Browser UI color on mobile. Bone, the hero ground. */
  themeColor: "#F4F1EC",
  /** Default social share image in /public. 1200x630 PNG or JPG. */
  ogImage: {
    alt: "Vellum Cycles: carbon road bikes designed in Cebu since 2004",
    height: 630,
    url: "/og/default.png",
    width: 1200
  },
  /** Square logo in /public, at least 112x112. Used in JSON-LD. */
  logo: "/logo512.png",

  contact: {
    email: "info@vellumcycles.com",
    /** * Placeholder: from a 2017 FB post, confirm with the client. */
    phone: "032 232 2054",
    phoneE164: "+63322322054",
    /** Secondary inquiry channel. The primary is the Instagram DM (`instagramDm`). */
    messenger: "https://m.me/vellumcycles",
    /** Primary inquiry channel: every Inquire CTA opens this. */
    instagramDm: "https://ig.me/m/vellumcycles",
    address: {
      street: "ML Quezon St, Cabancalan",
      city: "Cebu City",
      region: "Cebu",
      postalCode: "6000",
      country: "PH"
    },
    /** Opening hours. Days use schema.org codes: Mo Tu We Th Fr Sa Su. */
    hours: [{ closes: "17:00", days: ["Mo", "Tu", "We", "Th", "Fr", "Sa"], opens: "10:00" }],
    /** Shown in the footer */
    hoursLabel: "Mon to Sat, 10:00 AM to 5:00 PM",
    /** Showroom on Google Maps (Get directions) */
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Vellum+Cycles+ML+Quezon+St+Cabancalan+Cebu+City"
  },

  /** Leave a value "" to hide that icon. Also used as "sameAs" in JSON-LD. */
  socials: {
    instagram: "https://instagram.com/vellumcycles",
    facebook: "https://facebook.com/vellumcycles",
    /** * Placeholder: TikTok handle not confirmed (PRD open question 1) */
    tiktok: "",
    /** * Placeholder: Strava club not confirmed (PRD open question 1) */
    strava: ""
  },

  /**
   * schema.org business type for Google. Pick the closest:
   * LocalBusiness, ProfessionalService, Store, Restaurant, CafeOrCoffeeShop, MedicalClinic,
   * Dentist, BeautySalon, RealEstateAgent, LegalService, AccountingService, EducationalOrganization.
   */
  businessType: "Store",
  /** Prices are never shown on this site, so none is claimed here either. */
  priceRange: "",

  legal: {
    /** Registered business name for the legal pages */
    companyName: "Vellum Cycles",
    jurisdictionCountry: "the Republic of the Philippines",
    serverLocation: "Singapore and the United States",
    privacyEffectiveDate: "October 7, 2026",
    termsEffectiveDate: "October 7, 2026"
  }
} as const;

/** Main call to action: the Instagram DM (PRD scope rule: every CTA deep-links to socials). */
export const PRIMARY_CONTACT_HREF = siteConfig.contact.instagramDm;
