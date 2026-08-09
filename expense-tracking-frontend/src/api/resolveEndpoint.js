import { GENERATED_ENDPOINTS } from "./endpoints/generated.index";
import {
  FRONTEND_ONLY_ENDPOINTS,
  SNOW_PATH_REWRITES,
  normalizePath,
} from "./endpoints/overrides";
import { TRANSPORT } from "../platform/config/transportProfiles";

const CATALOG = Object.freeze({
  ...GENERATED_ENDPOINTS,
  ...FRONTEND_ONLY_ENDPOINTS,
});

/**
 * @param {string} key
 * @returns {object|null}
 */
export const getEndpoint = (key) => CATALOG[key] || null;

export const listEndpoints = () => Object.keys(CATALOG);

/**
 * Resolve a catalog key to a concrete request target.
 *
 * Precedence:
 * 1. config.endpointOverrides[key]
 * 2. active transport profile rewrite (snow)
 * 3. config.serviceBaseUrls[service] (absolute prefix)
 * 4. catalog path
 *
 * @param {string} key
 * @param {Record<string, string|number>} [pathParams]
 * @param {import('../platform/config/appConfig').AppConfig|object} [config]
 */
export const resolveEndpoint = (key, pathParams = {}, config = {}) => {
  const base = getEndpoint(key);
  if (!base) {
    throw new Error(`Unknown endpoint key: ${key}`);
  }

  const override = config.endpointOverrides?.[key] || {};
  let path = override.path || base.path;
  let method = (override.method || base.method || "GET").toUpperCase();
  let auth = override.auth !== undefined ? override.auth : base.auth;
  const service = override.service || base.service;

  if (config.transport === TRANSPORT.SNOW && SNOW_PATH_REWRITES[key]) {
    const snow = SNOW_PATH_REWRITES[key];
    if (snow.path) path = snow.path;
    if (snow.method) method = snow.method.toUpperCase();
  }

  path = normalizePath(path);

  if (pathParams && typeof pathParams === "object") {
    Object.entries(pathParams).forEach(([param, value]) => {
      path = path.replace(`{${param}}`, encodeURIComponent(String(value)));
      path = path.replace(`:${param}`, encodeURIComponent(String(value)));
    });
  }

  const serviceBase = config.serviceBaseUrls?.[service];
  const url = serviceBase
    ? `${String(serviceBase).replace(/\/$/, "")}${path}`
    : path;

  return {
    key,
    service,
    method,
    path,
    url,
    skipAuth: auth === false,
    auth: auth !== false,
  };
};

/**
 * Adapter-friendly resolver used by the container.
 */
export const createCatalogResolver = () => {
  return (endpointId, pathParams, config) => {
    const resolved = resolveEndpoint(endpointId, pathParams, config);
    return {
      url: resolved.url,
      method: resolved.method,
      skipAuth: resolved.skipAuth,
    };
  };
};

export { CATALOG, normalizePath };
