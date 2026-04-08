import type { Category } from "@/data/products";

export const SITE_NAME = "Soccer Style";
export const SITE_TITLE_SUFFIX = "Soccer Style Ecuador";
export const DEFAULT_SITE_URL = "https://www.soccerstyle.ec";
export const DEFAULT_OG_IMAGE = "/images/logo.png";
export const DEFAULT_AUTHOR = "Soccer Style";
export const DEFAULT_ROBOTS = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

export const BUSINESS_INFO = {
  name: SITE_NAME,
  legalName: "Soccer Style Ecuador",
  description:
    "Tienda especializada en zapatos de futbol, pupillos, futsal, accesorios y ropa deportiva con atencion en Riobamba, Latacunga y cobertura en Ecuador.",
  phoneDisplay: "+593 98 213 8622",
  phoneRaw: "+593982138622",
  whatsappUrl: "https://wa.me/593982138622",
  email: "ventas@soccerstyle.ec",
  areaServed: ["Riobamba", "Latacunga", "Ecuador"],
  sameAs: [
    "https://www.tiktok.com/@soccerstyleec",
    "https://www.instagram.com/soccerstyleecu",
    "https://www.facebook.com/SoccerStyleEc",
  ],
  stores: [
    {
      name: "Soccer Style Riobamba",
      city: "Riobamba",
      region: "Chimborazo",
      streetAddress: "Pichincha y Villarroel / Argentinos entre Colon y Espejo",
      openingHours: ["Mo-Sa 10:00-13:30", "Mo-Sa 15:00-19:00"],
      displayHours: ["10am a 1:30pm", "3pm a 7pm"],
    },
    {
      name: "Soccer Style Latacunga",
      city: "Latacunga",
      region: "Cotopaxi",
      streetAddress: "Belisario Quevedo y Padre Salcedo",
      openingHours: ["Mo-Sa 09:30-19:00"],
      displayHours: ["9:30am a 7pm"],
    },
  ],
} as const;

export const KEYWORD_GROUPS = {
  primaryPurchase: [
    "zapatos de futbol riobamba",
    "zapatos de futbol en latacunga",
    "tienda de futbol riobamba",
    "implementos de futbol ecuador",
    "pupillos riobamba",
    "zapatos futsal ecuador",
    "tacos de futbol latacunga",
    "tienda deportiva riobamba",
  ],
  secondaryPurchase: [
    "zapatos de futbol ecuador",
    "comprar pupillos en riobamba",
    "comprar zapatos futsal ecuador",
    "tienda deportiva en latacunga",
    "implementos deportivos futbol ecuador",
    "calzado de futbol riobamba",
    "tacos pupillos futsal ecuador",
    "accesorios de futbol riobamba",
  ],
  longTailPurchase: [
    "comprar zapatos de futbol en riobamba",
    "mejores pupillos futbol riobamba",
    "tienda de implementos deportivos en latacunga",
    "donde comprar tacos de futbol en latacunga",
    "zapatos de futbol originales en ecuador",
    "zapatos futsal para cancha sintetica en ecuador",
    "tienda de pupillos y pupos en riobamba",
    "guantes y accesorios de futbol en riobamba",
    "zapatos de futbol para nino en riobamba",
    "soccer style riobamba zapatos de futbol",
  ],
  informational: [
    "como elegir zapatos de futbol en ecuador",
    "diferencia entre pupillos futsal y tacos",
    "donde comprar zapatos de futbol en riobamba",
    "que pupillos usar en cancha sintetica",
    "zapatos futsal o pupillos cual elegir",
    "tallas de zapatos de futbol ecuador",
  ],
};

export const CATEGORY_PUBLIC_PATHS: Record<Category, string> = {
  pupos: "/pupos",
  pupillos: "/pupillos-futbol",
  futsal: "/futsal",
  guantes: "/guantes",
  ropa: "/ropa",
  accesorios: "/accesorios-futbol",
};

export function getPublicCategoryPath(category: Category) {
  return CATEGORY_PUBLIC_PATHS[category];
}

export function getCategorySeoLabel(category: Category) {
  switch (category) {
    case "pupos":
      return "Tacos de futbol";
    case "pupillos":
      return "Pupillos de futbol";
    case "futsal":
      return "Zapatos futsal";
    case "guantes":
      return "Guantes de arquero";
    case "ropa":
      return "Ropa de futbol";
    case "accesorios":
      return "Accesorios de futbol";
    default:
      return "Implementos de futbol";
  }
}

export function getAbsoluteUrl(path: string) {
  const origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : DEFAULT_SITE_URL;

  return new URL(path, origin).toString();
}

export function buildLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SportingGoodsStore",
    "@id": `${getAbsoluteUrl("/") }#localbusiness`,
    name: BUSINESS_INFO.name,
    legalName: BUSINESS_INFO.legalName,
    description: BUSINESS_INFO.description,
    url: getAbsoluteUrl("/"),
    telephone: BUSINESS_INFO.phoneRaw,
    email: BUSINESS_INFO.email,
    image: [getAbsoluteUrl(DEFAULT_OG_IMAGE)],
    sameAs: BUSINESS_INFO.sameAs,
    areaServed: BUSINESS_INFO.areaServed,
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: BUSINESS_INFO.phoneRaw,
        contactType: "sales",
        availableLanguage: ["es"],
        areaServed: BUSINESS_INFO.areaServed,
      },
    ],
    department: BUSINESS_INFO.stores.map((store) => ({
      "@type": "SportingGoodsStore",
      name: store.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: store.streetAddress,
        addressLocality: store.city,
        addressRegion: store.region,
        addressCountry: "EC",
      },
      openingHours: store.openingHours,
      telephone: BUSINESS_INFO.phoneRaw,
    })),
  };
}

export function buildWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${getAbsoluteUrl("/") }#website`,
    name: SITE_TITLE_SUFFIX,
    url: getAbsoluteUrl("/"),
    inLanguage: "es-EC",
    potentialAction: {
      "@type": "SearchAction",
      target: `${getAbsoluteUrl("/buscar")}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}
