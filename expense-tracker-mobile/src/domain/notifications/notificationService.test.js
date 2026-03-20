import { describe, expect, it } from "vitest";
import { normalizeNotification } from "@/domain/notifications/notificationService";

describe("normalizeNotification", () => {
  it("normalizes shape and defaults", () => {
    const result = normalizeNotification({ notificationId: "1", message: "hello" });
    expect(result.id).toBe("1");
    expect(result.read).toBe(false);
    expect(typeof result.createdAt).toBe("string");
  });
});
