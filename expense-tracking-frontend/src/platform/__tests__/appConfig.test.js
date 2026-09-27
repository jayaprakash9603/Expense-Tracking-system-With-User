import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  resolveAppConfig,
  refreshAppConfig,
} from "../config/appConfig";
import { TRANSPORT } from "../config/transportProfiles";

describe("appConfig", () => {
  const scope = globalThis;
  const original = scope.__APP_CONFIG__;

  beforeEach(() => {
    scope.__APP_CONFIG__ = {};
  });

  afterEach(() => {
    scope.__APP_CONFIG__ = original;
  });

  it("defaults to live transport", () => {
    const config = resolveAppConfig();
    expect(config.transport).toBe(TRANSPORT.LIVE);
    expect(config.apiBaseUrl).toBeTruthy();
  });

  it("prefers window.__APP_CONFIG__ over env", () => {
    scope.__APP_CONFIG__ = {
      transport: "snow",
      snowBaseUrl: "http://snow.test",
    };
    // appConfig reads window when present; polyfill for node tests
    if (typeof globalThis.window === "undefined") {
      globalThis.window = globalThis;
    }
    const config = refreshAppConfig();
    expect(config.transport).toBe(TRANSPORT.SNOW);
    expect(config.snowBaseUrl).toBe("http://snow.test");
    expect(config.activeBaseUrl).toBe("http://snow.test");
  });
});
