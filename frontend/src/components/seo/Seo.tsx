import { useEffect } from "react";

import {
  DEFAULT_AUTHOR,
  DEFAULT_OG_IMAGE,
  DEFAULT_ROBOTS,
  SITE_NAME,
  getAbsoluteUrl,
} from "@/data/seo";

interface SeoProps {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
  type?: "website" | "article" | "product";
  robots?: string;
  schema?: Array<Record<string, unknown>>;
}

function upsertMetaByName(name: string, content: string) {
  let element = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("name", name);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function upsertMetaByProperty(property: string, content: string) {
  let element = document.head.querySelector(
    `meta[property="${property}"]`,
  ) as HTMLMetaElement | null;

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("property", property);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function upsertCanonical(href: string) {
  let element = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }

  element.setAttribute("href", href);
}

const Seo = ({
  title,
  description,
  path,
  keywords = [],
  image = DEFAULT_OG_IMAGE,
  type = "website",
  robots = DEFAULT_ROBOTS,
  schema = [],
}: SeoProps) => {
  useEffect(() => {
    const absoluteUrl = getAbsoluteUrl(path);
    const absoluteImage = image.startsWith("http") ? image : getAbsoluteUrl(image);

    document.documentElement.lang = "es";
    document.title = title;

    upsertMetaByName("description", description);
    upsertMetaByName("keywords", keywords.join(", "));
    upsertMetaByName("author", DEFAULT_AUTHOR);
    upsertMetaByName("robots", robots);
    upsertMetaByName("twitter:card", "summary_large_image");
    upsertMetaByName("twitter:title", title);
    upsertMetaByName("twitter:description", description);
    upsertMetaByName("twitter:image", absoluteImage);
    upsertMetaByName("twitter:site", SITE_NAME);

    upsertMetaByProperty("og:site_name", SITE_NAME);
    upsertMetaByProperty("og:type", type);
    upsertMetaByProperty("og:title", title);
    upsertMetaByProperty("og:description", description);
    upsertMetaByProperty("og:url", absoluteUrl);
    upsertMetaByProperty("og:image", absoluteImage);
    upsertMetaByProperty("og:locale", "es_EC");

    upsertCanonical(absoluteUrl);

    document
      .querySelectorAll('script[data-seo-schema="true"]')
      .forEach((node) => node.parentNode?.removeChild(node));

    schema.forEach((schemaEntry) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.seoSchema = "true";
      script.text = JSON.stringify(schemaEntry);
      document.head.appendChild(script);
    });
  }, [description, image, keywords, path, robots, schema, title, type]);

  return null;
};

export default Seo;
