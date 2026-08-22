/** @vitest-environment node */
import { describe, expect, it } from "vitest";
import { GUIDES } from "../../features/marketing/content/guides";
import {
  isAppPrivatePath,
  isAuthPath,
  isPublicMarketingPath,
  listIndexablePaths,
  resolvePublicPage,
} from "../publicPaths";
import { buildJsonLd, buildSitemapXml } from "../structuredData";

describe("public SEO paths", () => {
  it("should treat marketing pages as indexable", () => {
    expect(isPublicMarketingPath("/")).toBe(true);
    expect(isPublicMarketingPath("/features")).toBe(true);
    expect(isPublicMarketingPath("/guides/how-to-track-daily-expenses")).toBe(
      true,
    );
  });

  it("should keep private app and auth pages out of the index", () => {
    expect(isAuthPath("/login")).toBe(true);
    expect(isAppPrivatePath("/dashboard")).toBe(true);
    expect(isAppPrivatePath("/expenses/create")).toBe(true);
    expect(resolvePublicPage("/dashboard")).toBeNull();
  });

  it("should list only public URLs in the sitemap", () => {
    const paths = listIndexablePaths();
    expect(paths).toContain("/");
    expect(paths).toContain("/privacy");
    GUIDES.forEach((guide) => {
      expect(paths).toContain(`/guides/${guide.slug}`);
    });
    expect(paths.some((path) => path.startsWith("/dashboard"))).toBe(false);
  });

  it("should emit organization and software application JSON-LD on the home page", () => {
    const data = buildJsonLd({
      path: "/",
      title: "Expensio Finance",
      description: "Expense tracker",
    });
    const types = data["@graph"].map((node) => node["@type"]);
    expect(types).toContain("Organization");
    expect(types).toContain("WebSite");
    expect(types).toContain("SoftwareApplication");
  });

  it("should build sitemap XML with absolute https URLs", () => {
    const xml = buildSitemapXml("https://expensio.finance", ["/", "/guides"]);
    expect(xml).toContain("<loc>https://expensio.finance/</loc>");
    expect(xml).toContain("<loc>https://expensio.finance/guides</loc>");
  });
});
