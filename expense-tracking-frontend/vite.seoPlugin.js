import { mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GUIDES } from "./src/features/marketing/content/guides.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SITE_NAME = "Expensio Finance";
const DEFAULT_DESCRIPTION =
  "Expensio Finance is a personal and household expense tracker for daily spending, monthly budgets, recurring bills, shared costs, and clear reports. Built for people who want useful financial records, not a spreadsheet they abandon.";

const PAGE_META = {
  "/": {
    title: "Expensio Finance | Expense Tracker, Budgets, and Shared Bills",
    description: DEFAULT_DESCRIPTION,
  },
  "/features": {
    title: "Expense Tracking Features | Expensio Finance",
    description:
      "See how Expensio Finance handles expenses, categories, budgets, recurring bills, friend splits, payment methods, and reports without turning your money into a monthly cleanup project.",
  },
  "/guides": {
    title: "Personal Finance Guides | Expensio Finance",
    description:
      "Practical guides on tracking daily expenses, building a monthly budget, splitting bills fairly, reading spending reports, and keeping recurring bills visible.",
  },
  "/about": {
    title: "About Expensio Finance",
    description:
      "Why Expensio Finance exists: a calmer way to record spending, share household costs, and understand where money actually goes.",
  },
  "/help": {
    title: "Help Center | Expensio Finance",
    description:
      "Answers for getting started with Expensio Finance, adding expenses, setting budgets, managing bills, inviting friends, and keeping your account secure.",
  },
  "/contact": {
    title: "Contact Expensio Finance",
    description:
      "Contact Expensio Finance for product questions, account help, privacy requests, and feedback.",
  },
  "/privacy": {
    title: "Privacy Policy | Expensio Finance",
    description:
      "How Expensio Finance collects, uses, stores, and protects account and expense data.",
  },
  "/terms": {
    title: "Terms of Service | Expensio Finance",
    description: "The terms for using Expensio Finance.",
  },
};

const ROBOTS_DISALLOW = [
  "/dashboard",
  "/expenses",
  "/bill",
  "/budget",
  "/friends",
  "/groups",
  "/chats",
  "/profile",
  "/settings",
  "/admin",
  "/payment-method",
  "/category",
  "/calendar",
  "/share/",
  "/my-shares",
  "/public-shares",
  "/shared-with-me",
  "/component1",
  "/component2",
  "/friend-chat",
  "/support/",
  "/oauth/",
  "/mfa",
  "/otp-verification",
  "/forgot-password",
  "/create-password",
  "/login",
  "/register",
];

const listIndexablePaths = () => [
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

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const resolveSiteUrl = () => {
  const fromEnv = (process.env.REACT_APP_PUBLIC_SITE_URL || "").replace(/\/+$/, "");
  return fromEnv || "https://expensio.finance";
};

const pageMetaFor = (pagePath) => {
  if (PAGE_META[pagePath]) {
    return { path: pagePath, ...PAGE_META[pagePath] };
  }
  if (pagePath.startsWith("/guides/")) {
    const slug = pagePath.slice("/guides/".length);
    const guide = GUIDES.find((item) => item.slug === slug);
    if (!guide) return null;
    return {
      path: pagePath,
      title: `${guide.title} | ${SITE_NAME}`,
      description: guide.description,
    };
  }
  return null;
};

const buildRobotsTxt = (siteUrl) =>
  [
    "User-agent: *",
    "Allow: /",
    ...ROBOTS_DISALLOW.map((rule) => `Disallow: ${rule}`),
    "",
    `Sitemap: ${siteUrl}/sitemap.xml`,
    "",
  ].join("\n");

const buildSitemapXml = (siteUrl, paths) => {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = paths
    .map((pagePath) => {
      const loc = `${siteUrl}${pagePath === "/" ? "/" : pagePath}`;
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
};

const injectHead = (html, meta, siteUrl) => {
  const url = `${siteUrl}${meta.path === "/" ? "/" : meta.path}`;
  const title = escapeHtml(meta.title || SITE_NAME);
  const description = escapeHtml(meta.description || DEFAULT_DESCRIPTION);
  let next = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  next = next.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${description}" />`,
  );
  next = next.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${url}" />`,
  );
  next = next.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${url}" />`,
  );
  next = next.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${title}" />`,
  );
  next = next.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${description}" />`,
  );
  const article = `<article><h1>${title}</h1><p>${description}</p><nav aria-label="Public pages"><ul><li><a href="/">Home</a></li><li><a href="/features">Features</a></li><li><a href="/guides">Guides</a></li><li><a href="/about">About</a></li><li><a href="/help">Help</a></li><li><a href="/contact">Contact</a></li><li><a href="/privacy">Privacy</a></li><li><a href="/terms">Terms</a></li></ul></nav></article>`;
  next = next.replace(
    /<div id="root">[\s\S]*?<\/div>\s*<noscript>/,
    `<div id="root">${article}</div>\n    <noscript>`,
  );
  return next;
};

const writeRouteHtml = (distDir, pagePath, html) => {
  if (pagePath === "/") {
    writeFileSync(path.join(distDir, "index.html"), html);
    return;
  }
  const folder = path.join(distDir, pagePath.replace(/^\//, ""));
  mkdirSync(folder, { recursive: true });
  writeFileSync(path.join(folder, "index.html"), html);
};

export default function expensioSeoPlugin() {
  return {
    name: "expensio-seo",
    closeBundle() {
      const distDir = path.resolve(__dirname, "dist");
      const indexPath = path.join(distDir, "index.html");
      let template;
      try {
        template = readFileSync(indexPath, "utf8");
      } catch {
        return;
      }

      const siteUrl = resolveSiteUrl();
      const paths = listIndexablePaths();
      writeFileSync(path.join(distDir, "robots.txt"), buildRobotsTxt(siteUrl));
      writeFileSync(path.join(distDir, "sitemap.xml"), buildSitemapXml(siteUrl, paths));

      paths.forEach((pagePath) => {
        const meta = pageMetaFor(pagePath);
        if (!meta) return;
        writeRouteHtml(distDir, pagePath, injectHead(template, meta, siteUrl));
      });
    },
  };
}
