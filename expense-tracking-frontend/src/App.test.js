import { describe, it, expect } from "vitest";

describe("smoke", () => {
  it("environment boots", () => {
    expect(1 + 1).toBe(2);
  });
});
