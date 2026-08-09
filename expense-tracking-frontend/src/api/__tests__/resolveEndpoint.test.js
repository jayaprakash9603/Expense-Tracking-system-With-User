import { describe, it, expect } from "vitest";
import {
  resolveEndpoint,
  getEndpoint,
  normalizePath,
} from "../resolveEndpoint";
import { TRANSPORT } from "../../platform/config/transportProfiles";

describe("resolveEndpoint", () => {
  it("resolves a generated catalog key", () => {
    const ep = getEndpoint("expenses.list");
    expect(ep).toBeTruthy();
    expect(ep.path).toBe("/api/expenses/fetch-expenses");
    expect(ep.method).toBe("GET");
  });

  it("substitutes path params", () => {
    const resolved = resolveEndpoint("expenses.by-id", { id: 42 });
    expect(resolved.url).toBe("/api/expenses/expense/42");
  });

  it("normalises legacy paths without leading slash", () => {
    expect(normalizePath("api/bills")).toBe("/api/bills");
    expect(normalizePath("/api/bills")).toBe("/api/bills");
    expect(normalizePath("audit-logs/all")).toBe("/audit-logs/all");
  });

  it("applies service base URL override", () => {
    const resolved = resolveEndpoint(
      "expenses.list",
      {},
      {
        transport: TRANSPORT.LIVE,
        serviceBaseUrls: { expense: "http://localhost:6001" },
      },
    );
    expect(resolved.url).toBe(
      "http://localhost:6001/api/expenses/fetch-expenses",
    );
  });

  it("applies per-endpoint override from config", () => {
    const resolved = resolveEndpoint(
      "expenses.list",
      {},
      {
        endpointOverrides: {
          "expenses.list": { path: "/api/v2/expenses" },
        },
      },
    );
    expect(resolved.path).toBe("/api/v2/expenses");
  });
});
