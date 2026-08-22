import { GUIDES } from "../features/marketing/content/guides";
import {
  APP_NOINDEX_PREFIXES,
  AUTH_NOINDEX_PATHS,
  PUBLIC_PAGE_META,
} from "./siteConfig";

const PUBLIC_ROUTE_PREFIXES = [
  "/features",
  "/guides",
  "/about",
  "/help",
  "/contact",
  "/privacy",
  "/terms",
];

export const isPublicMarketingPath = (pathname = "/") => {
  if (pathname === "/" || pathname === "") return true;
  return PUBLIC_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
};

export const isAuthPath = (pathname = "") =>
  AUTH_NOINDEX_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

export const isAppPrivatePath = (pathname = "") =>
  APP_NOINDEX_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

export const resolvePublicPage = (pathname = "/") => {
  if (PUBLIC_PAGE_META[pathname]) {
    return { path: pathname, ...PUBLIC_PAGE_META[pathname] };
  }

  if (pathname.startsWith("/guides/")) {
    const slug = pathname.slice("/guides/".length);
    const guide = GUIDES.find((item) => item.slug === slug);
    if (!guide) return null;
    return {
      path: pathname,
      title: `${guide.title} | Expensio Finance`,
      description: guide.description,
      type: "article",
      datePublished: guide.datePublished,
      dateModified: guide.dateModified,
    };
  }

  return null;
};

export const listIndexablePaths = () => [
  "/",
  "/features",
  "/guides",
  ...GUIDES.map((guide) => `/guides/${guide.slug}`),
  "/about",
  "/help",
  "/contact",
  "/privacy",
  "/terms",
];
