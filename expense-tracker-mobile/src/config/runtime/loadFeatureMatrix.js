import { parse as parseYaml } from "yaml";
import matrixYaml from "@/config/runtime/feature-matrix.yaml?raw";

function isPlainObject(value) {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function deepMerge(base, overlay) {
  if (!isPlainObject(base)) {
    return overlay !== undefined ? overlay : base;
  }
  const out = { ...base };
  for (const key of Object.keys(overlay || {})) {
    const b = out[key];
    const o = overlay[key];
    if (isPlainObject(b) && isPlainObject(o)) {
      out[key] = deepMerge(b, o);
    } else {
      out[key] = o;
    }
  }
  return out;
}

function flattenFlags(node, prefix = "") {
  const out = {};
  if (!isPlainObject(node)) {
    return out;
  }
  for (const [key, value] of Object.entries(node)) {
    const dotted = prefix ? `${prefix}.${key}` : key;
    if (isPlainObject(value)) {
      Object.assign(out, flattenFlags(value, dotted));
    } else {
      out[dotted] = Boolean(value);
    }
  }
  return out;
}

let cachedDoc = null;

function readMatrixDocument() {
  if (cachedDoc) return cachedDoc;
  const parsed = parseYaml(matrixYaml);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("feature-matrix.yaml: invalid root");
  }
  if (typeof parsed.version !== "number") {
    throw new Error("feature-matrix.yaml: version must be a number");
  }
  if (!isPlainObject(parsed.profiles)) {
    throw new Error("feature-matrix.yaml: profiles must be an object");
  }
  if (!Object.prototype.hasOwnProperty.call(parsed.profiles, "live")) {
    throw new Error("feature-matrix.yaml: profiles.live is required");
  }
  if (!Object.prototype.hasOwnProperty.call(parsed.profiles, "demo")) {
    throw new Error("feature-matrix.yaml: profiles.demo is required");
  }
  cachedDoc = Object.freeze(parsed);
  return cachedDoc;
}

export function getFeatureMatrixProfile(runtimeMode) {
  const doc = readMatrixDocument();
  const defaults = isPlainObject(doc.defaults) ? doc.defaults : {};
  const profileKey = runtimeMode === "live" ? "live" : "demo";
  const profileOverlay = isPlainObject(doc.profiles[profileKey])
    ? doc.profiles[profileKey]
    : {};
  const merged = deepMerge(defaults, profileOverlay);
  return Object.freeze(flattenFlags(merged));
}

export function getLiveFeatureFlagsSnapshot() {
  return getFeatureMatrixProfile("live");
}
