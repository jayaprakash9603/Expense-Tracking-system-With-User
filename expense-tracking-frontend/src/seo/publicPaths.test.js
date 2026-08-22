import { describe, expect, it } from "vitest";
import {
  isAppPrivatePath,
  isAuthPath,
  listIndexablePaths,
  resolvePublicPage,
} from "./publicPaths";

describe("publicPaths", () => {
  it("should resolve indexable marketing pages", () => {
    expect(resolvePublicPage("/").title).toMatch(/Expensio Finance/);
    expect(resolvePublicPage("/features")).toBeTruthy();
    expect(resolvePublicPage("/guides/how-to-track-daily-expenses").type).toBe(
      "article",
    );
  });

  it("should noindex auth and private app surfaces", () => {
    expect(isAuthPath("/login")).toBe(true);
    expect(isAppPrivatePath("/dashboard")).toBe(true);
    expect(isAppPrivatePath("/expenses/new")).toBe(true);
    expect(isAppPrivatePath("/guides")).toBe(false);
  });

  it("should list only public URLs for the sitemap", () => {
    const paths = listIndexablePaths();
    expect(paths).toContain("/");
    expect(paths).toContain("/privacy");
    expect(paths.some((path) => path.startsWith("/guides/"))).toBe(true);
    expect(paths).not.toContain("/dashboard");
  });
});
