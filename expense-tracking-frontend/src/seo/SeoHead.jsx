import { useEffect } from "react";
import { absoluteUrl, DEFAULT_OG_IMAGE, SITE_NAME, SITE_THEME_COLOR } from "./siteConfig";
import { buildJsonLd } from "./structuredData";

const upsertMeta = (attr, key, content) => {
  if (!content) return;
  let element = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
};

const upsertLink = (rel, href) => {
  if (!href) return;
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
};

const upsertJsonLd = (id, data) => {
  let element = document.getElementById(id);
  if (!element) {
    element = document.createElement("script");
    element.type = "application/ld+json";
    element.id = id;
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(data);
};

export default function SeoHead({
  title,
  description,
  path = "/",
  robots = "index,follow",
  type = "website",
  image = DEFAULT_OG_IMAGE,
}) {
  useEffect(() => {
    const url = absoluteUrl(path);
    const imageUrl = image.startsWith("http") ? image : absoluteUrl(image);
    const fullTitle = title || SITE_NAME;

    document.title = fullTitle;
    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", robots);
    upsertMeta("name", "theme-color", SITE_THEME_COLOR);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", imageUrl);
    upsertMeta("property", "og:type", type === "article" ? "article" : "website");
    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:image", imageUrl);
    upsertLink("canonical", url);

    if (robots.includes("noindex")) {
      const existing = document.getElementById("expensio-jsonld");
      if (existing) existing.remove();
      return;
    }

    upsertJsonLd(
      "expensio-jsonld",
      buildJsonLd({ title: fullTitle, description, path, type }),
    );
  }, [title, description, path, robots, type, image]);

  return null;
}
