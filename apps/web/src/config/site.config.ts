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
  name: "zo-stack",
  /** Home page <title>. Aim for 50-60 characters with what you do and where. */
  title: "zo-stack | Websites and Systems for Philippine Businesses",
  /** Default meta description. Aim for 140-160 characters. */
  description:
    "zo-stack is an independent studio in Cebu crafting websites and business systems for Philippine companies, with the care of a fine instrument.",
  /** Public origin, from VITE_SITE_URL (validated in vite.config.ts). */
  url: import.meta.env.VITE_SITE_URL,
  /** <html lang> */
  lang: "en-PH",
  /** og:locale */
  locale: "en_PH",
  /** Browser UI color on mobile. */
  themeColor: "#111111",
  /** Default social share image in /public. 1200x630 PNG or JPG. */
  ogImage: {
    alt: "zo-stack: websites and systems for Philippine businesses",
    height: 630,
    url: "/og/default.png",
    width: 1200
  },
  /** Square logo in /public, at least 112x112. Used in JSON-LD. */
  logo: "/logo512.png",

  contact: {
    email: "hello@example.com",
    /** As people write it locally */
    phone: "0917 123 4567",
    /** Same number in international format, for tel: links and JSON-LD */
    phoneE164: "+639171234567",
    /** Facebook Messenger link (m.me/<page>). Most PH customers message first. Leave "" to hide. */
    messenger: "https://m.me/",
    address: {
      street: "Unit 1, Example Building, Example Street",
      city: "Cebu City",
      region: "Cebu",
      postalCode: "6000",
      country: "PH"
    },
    /** Opening hours. Days use schema.org codes: Mo Tu We Th Fr Sa Su. */
    hours: [{ closes: "18:00", days: ["Mo", "Tu", "We", "Th", "Fr"], opens: "09:00" }],
    /** Shown in the footer */
    hoursLabel: "Mon to Fri, 9:00 AM to 6:00 PM"
  },

  /** Leave a value "" to hide that icon. Also used as "sameAs" in JSON-LD. */
  socials: {
    facebook: "https://facebook.com/",
    instagram: "https://instagram.com/",
    tiktok: "",
    linkedin: "https://linkedin.com/",
    youtube: ""
  },

  /**
   * schema.org business type for Google. Pick the closest:
   * LocalBusiness, ProfessionalService, Store, Restaurant, CafeOrCoffeeShop, MedicalClinic,
   * Dentist, BeautySalon, RealEstateAgent, LegalService, AccountingService, EducationalOrganization.
   */
  businessType: "ProfessionalService",
  /** Rough price level for Google, e.g. "₱", "₱₱", "₱₱₱". "" to omit. */
  priceRange: "₱₱",

  legal: {
    /** Registered business name for the legal pages */
    companyName: "zo-stack",
    jurisdictionCountry: "the Republic of the Philippines",
    serverLocation: "Singapore and the United States",
    privacyEffectiveDate: "October 4, 2026",
    termsEffectiveDate: "October 4, 2026"
  }
} as const;

/** Main call to action: Messenger if set, otherwise email. */
export const PRIMARY_CONTACT_HREF =
  siteConfig.contact.messenger || `mailto:${siteConfig.contact.email}`;
