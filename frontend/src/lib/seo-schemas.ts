import type { SeoFaqItem, SeoPageContent } from "@/data/seo-pages";
import { BUSINESS_INFO, SITE_TITLE_SUFFIX, getAbsoluteUrl } from "@/data/seo";

export function buildFaqSchema(faqs: SeoFaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function buildCollectionPageSchema(content: SeoPageContent) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: content.title,
    headline: content.h1,
    description: content.metaDescription,
    url: getAbsoluteUrl(content.path),
    inLanguage: "es-EC",
    about: content.keywords,
    publisher: {
      "@type": "Organization",
      name: SITE_TITLE_SUFFIX,
      url: getAbsoluteUrl("/"),
    },
  };
}

export function buildWebPageSchema(content: SeoPageContent) {
  return {
    "@context": "https://schema.org",
    "@type": content.schemaType,
    name: content.title,
    headline: content.h1,
    description: content.metaDescription,
    url: getAbsoluteUrl(content.path),
    inLanguage: "es-EC",
    about: [...content.keywords, ...content.cityMentions],
  };
}

export function buildContactPageSchema(content: SeoPageContent) {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: content.title,
    headline: content.h1,
    description: content.metaDescription,
    url: getAbsoluteUrl(content.path),
    mainEntity: {
      "@type": "Organization",
      name: BUSINESS_INFO.name,
      telephone: BUSINESS_INFO.phoneRaw,
      email: BUSINESS_INFO.email,
      areaServed: BUSINESS_INFO.areaServed,
    },
  };
}

export function buildArticleSchema(content: SeoPageContent) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: content.h1,
    name: content.title,
    description: content.metaDescription,
    url: getAbsoluteUrl(content.path),
    datePublished: content.articlePublishedAt,
    dateModified: content.articleModifiedAt ?? content.articlePublishedAt,
    author: {
      "@type": "Organization",
      name: BUSINESS_INFO.name,
    },
    publisher: {
      "@type": "Organization",
      name: BUSINESS_INFO.name,
    },
    inLanguage: "es-EC",
    keywords: content.keywords.join(", "),
  };
}

export function buildProductSchema({
  name,
  description,
  image,
  price,
  path,
}: {
  name: string;
  description: string;
  image: string;
  price: number;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: [image.startsWith("http") ? image : getAbsoluteUrl(image)],
    sku: path.replaceAll("/", "").replace("producto", "product-"),
    brand: {
      "@type": "Brand",
      name: BUSINESS_INFO.name,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: price.toFixed(2),
      availability: "https://schema.org/InStock",
      url: getAbsoluteUrl(path),
      seller: {
        "@type": "Organization",
        name: BUSINESS_INFO.name,
      },
    },
  };
}
