/**
 * Transport profiles for the HTTP / realtime adapters.
 * Selected via REACT_APP_TRANSPORT or window.__APP_CONFIG__.transport.
 */

export const TRANSPORT = Object.freeze({
  LIVE: "live",
  SNOW: "snow",
  MOCK: "mock",
});

/**
 * @typedef {Object} TransportProfile
 * @property {string} id
 * @property {string} label
 * @property {'http'|'simulator'|'in-memory'} kind
 * @property {string|null} defaultBaseUrlEnv
 */

/** @type {Record<string, TransportProfile>} */
export const TRANSPORT_PROFILES = Object.freeze({
  [TRANSPORT.LIVE]: {
    id: TRANSPORT.LIVE,
    label: "Live backend",
    kind: "http",
    defaultBaseUrlEnv: "REACT_APP_API_BASE_URL",
  },
  [TRANSPORT.SNOW]: {
    id: TRANSPORT.SNOW,
    label: "Snow simulator",
    kind: "simulator",
    defaultBaseUrlEnv: "REACT_APP_SNOW_BASE_URL",
  },
  [TRANSPORT.MOCK]: {
    id: TRANSPORT.MOCK,
    label: "In-browser mock",
    kind: "in-memory",
    defaultBaseUrlEnv: null,
  },
});

export const isValidTransport = (value) =>
  Boolean(value && TRANSPORT_PROFILES[value]);
