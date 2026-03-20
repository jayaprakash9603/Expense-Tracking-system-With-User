import { DEFAULT_FEATURE_FLAGS } from "@/config/runtime/defaultFeatureFlags";

const RUNTIME_MODES = new Set(["live", "demo"]);
const SEED_SCENARIOS = new Set(["empty", "sample"]);

function normalizeMode(raw) {
  const v = String(raw || "demo").toLowerCase();
  return RUNTIME_MODES.has(v) ? v : "demo";
}

function parseFeatureFlagsJson(raw) {
  if (raw == null || raw === "") return {};
  try {
    const parsed = JSON.parse(String(raw));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function mergeFeatureFlags(overrides) {
  return Object.freeze({ ...DEFAULT_FEATURE_FLAGS, ...overrides });
}

function buildConfig() {
  const runtimeMode = normalizeMode(import.meta.env.VITE_APP_RUNTIME_MODE);
  const isDemo = runtimeMode === "demo";
  const featureFlagsRaw = parseFeatureFlagsJson(import.meta.env.VITE_FEATURE_FLAGS_JSON);
  const demoSeedScenarioRaw = String(
    import.meta.env.VITE_DEMO_SEED_SCENARIO || "sample",
  ).toLowerCase();
  const demoSeedScenario = SEED_SCENARIOS.has(demoSeedScenarioRaw)
    ? demoSeedScenarioRaw
    : "sample";
  const googleClientId = String(import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();

  return Object.freeze({
    runtimeMode,
    isDemo,
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
    googleClientId,
    demoEmail: import.meta.env.VITE_DEMO_EMAIL || "admin@gmail.com",
    demoPassword: import.meta.env.VITE_DEMO_PASSWORD || "admin",
    demoSeedScenario,
    featureFlags: mergeFeatureFlags(featureFlagsRaw),
  });
}

export function getAppConfig() {
  return buildConfig();
}

export function isFeatureEnabled(flagKey) {
  const { featureFlags } = getAppConfig();
  if (Object.prototype.hasOwnProperty.call(featureFlags, flagKey)) {
    return Boolean(featureFlags[flagKey]);
  }
  return true;
}
