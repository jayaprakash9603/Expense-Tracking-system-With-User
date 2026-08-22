import { GUIDES } from "../features/marketing/content/guides";
import { absoluteUrl, SITE_DEFAULT_DESCRIPTION, SITE_NAME } from "./siteConfig";

const organization = () => ({
  "@type": "Organization",
  name: SITE_NAME,
  url: absoluteUrl("/"),
  logo: absoluteUrl("/favicon.jpg"),
  email: "support@expensio.com",
  sameAs: [],
});

const website = () => ({
  "@type": "WebSite",
  name: SITE_NAME,
  url: absoluteUrl("/"),
  description: SITE_DEFAULT_DESCRIPTION,
  publisher: { "@id": `${absoluteUrl("/")}#organization` },
});

const softwareApplication = () => ({
  "@type": "SoftwareApplication",
  name: SITE_NAME,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  url: absoluteUrl("/"),
  description: SITE_DEFAULT_DESCRIPTION,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
});

export const breadcrumbJsonLd = (crumbs = []) => ({
  "@type": "BreadcrumbList",
  itemListElement: crumbs.map((crumb, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: crumb.name,
    item: absoluteUrl(crumb.path),
  })),
});

export const buildJsonLd = (page) => {
  const graph = [
    { "@id": `${absoluteUrl("/")}#organization`, ...organization() },
    { "@id": `${absoluteUrl("/")}#website`, ...website() },
  ];

  if (!page?.path) {
    return { "@context": "https://schema.org", "@graph": graph };
  }

  if (page.path === "/") {
    graph.push(
      {
        "@type": "WebPage",
        name: page.title,
        url: absoluteUrl("/"),
        description: page.description,
        isPartOf: { "@id": `${absoluteUrl("/")}#website` },
        about: { "@id": `${absoluteUrl("/")}#organization` },
      },
      softwareApplication(),
    );
  } else if (page.path === "/about") {
    graph.push({
      "@type": "AboutPage",
      name: page.title,
      url: absoluteUrl(page.path),
      description: page.description,
      isPartOf: { "@id": `${absoluteUrl("/")}#website` },
    });
  } else if (page.path === "/contact") {
    graph.push({
      "@type": "ContactPage",
      name: page.title,
      url: absoluteUrl(page.path),
      description: page.description,
      isPartOf: { "@id": `${absoluteUrl("/")}#website` },
    });
  } else if (page.type === "article") {
    const slug = page.path.replace("/guides/", "");
    const guide = GUIDES.find((item) => item.slug === slug);
    graph.push(
      {
        "@type": "Article",
        headline: guide?.title || page.title,
        description: page.description,
        datePublished: page.datePublished,
        dateModified: page.dateModified || page.datePublished,
        author: { "@type": "Organization", name: SITE_NAME },
        publisher: { "@id": `${absoluteUrl("/")}#organization` },
        mainEntityOfPage: absoluteUrl(page.path),
      },
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Guides", path: "/guides" },
        { name: guide?.title || "Guide", path: page.path },
      ]),
    );
  } else {
    graph.push(
      {
        "@type": "WebPage",
        name: page.title,
        url: absoluteUrl(page.path),
        description: page.description,
        isPartOf: { "@id": `${absoluteUrl("/")}#website` },
      },
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: page.title.replace(" | Expensio Finance", ""), path: page.path },
      ]),
    );
  }

  return { "@context": "https://schema.org", "@graph": graph };
};

export const buildSitemapXml = (siteUrl, paths) => {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = paths
    .map((path) => {
      const loc = `${siteUrl.replace(/\/+$/, "")}${path === "/" ? "/" : path}`;
      const priority = path === "/" ? "1.0" : path.startsWith("/guides/") ? "0.8" : "0.7";
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
};
