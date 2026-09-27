import { TRANSPORT, isValidTransport } from "./transportProfiles";

const DEFAULT_API_BASE_URL = "http://localhost:8080";
const DEFAULT_NOTIFICATION_SERVICE_BASE_URL = "http://localhost:6003";
const DEFAULT_SNOW_BASE_URL = "http://localhost:8089";

const readEnv = (key, fallback = undefined) => {
  const value = process.env?.[key];
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  return value;
};

const parseJsonMap = (raw, fallback = {}) => {
  if (!raw || typeof raw !== "string") {
    return fallback;
  }
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const ensureSecureWsUrl = (url) => {
  if (typeof window === "undefined" || !window.location) return url;
  if (window.location.protocol !== "https:") return url;
  if (!url || url.startsWith("https://")) return url;
  return url.replace(/^http:\/\//i, "https://");
};

const readRuntimeConfig = () => {
  const scope =
    typeof window !== "undefined"
      ? window
      : typeof globalThis !== "undefined"
        ? globalThis
        : null;
  if (!scope) return {};
  return scope.__APP_CONFIG__ && typeof scope.__APP_CONFIG__ === "object"
    ? scope.__APP_CONFIG__
    : {};
};

/**
 * Resolve layered app configuration.
 * Precedence: window.__APP_CONFIG__ > process.env.REACT_APP_* > defaults.
 *
 * @returns {import('./appConfig.types').AppConfig}
 */
export const resolveAppConfig = () => {
  const runtime = readRuntimeConfig();
  const envTransport = readEnv("REACT_APP_TRANSPORT", TRANSPORT.LIVE);
  const transport = isValidTransport(runtime.transport)
    ? runtime.transport
    : isValidTransport(envTransport)
      ? envTransport
      : TRANSPORT.LIVE;

  const apiBaseUrl =
    runtime.apiBaseUrl ||
    readEnv("REACT_APP_API_BASE_URL", DEFAULT_API_BASE_URL);

  const snowBaseUrl =
    runtime.snowBaseUrl ||
    readEnv("REACT_APP_SNOW_BASE_URL", DEFAULT_SNOW_BASE_URL);

  const isMicroservicesMode =
    runtime.microservices === true ||
    readEnv("REACT_APP_MICROSERVICES") === "true" ||
    readEnv("REACT_APP_MICROSERVICES") === "1";

  const notificationServiceBaseUrl =
    runtime.notificationServiceBaseUrl ||
    readEnv(
      "REACT_APP_NOTIFICATION_SERVICE_BASE_URL",
      DEFAULT_NOTIFICATION_SERVICE_BASE_URL,
    );

  const serviceBaseUrls = {
    ...parseJsonMap(readEnv("REACT_APP_SERVICE_BASE_URLS")),
    ...(runtime.serviceBaseUrls || {}),
  };

  const endpointOverrides = {
    ...(runtime.endpointOverrides || {}),
  };

  const rawNotificationWs =
    runtime.notificationWsUrl ||
    readEnv("REACT_APP_NOTIFICATION_WS_URL") ||
    (isMicroservicesMode
      ? `${notificationServiceBaseUrl.replace(/\/$/, "")}/notifications`
      : `${apiBaseUrl}/notifications`);

  const rawChatWs =
    runtime.chatWsUrl ||
    readEnv("REACT_APP_CHAT_WS_URL") ||
    `${apiBaseUrl}/chat`;

  const rawStoryWs =
    runtime.storyWsUrl ||
    readEnv("REACT_APP_STORY_WS_URL") ||
    `${apiBaseUrl}/ws-stories`;

  const activeBaseUrl = transport === TRANSPORT.SNOW ? snowBaseUrl : apiBaseUrl;

  return Object.freeze({
    transport,
    apiBaseUrl,
    snowBaseUrl,
    activeBaseUrl,
    isMicroservicesMode,
    notificationServiceBaseUrl,
    serviceBaseUrls,
    endpointOverrides,
    notificationWsUrl: ensureSecureWsUrl(rawNotificationWs),
    chatWsUrl: ensureSecureWsUrl(rawChatWs),
    storyWsUrl: ensureSecureWsUrl(rawStoryWs),
    googleClientId: runtime.googleClientId || readEnv("REACT_APP_GOOGLE_CLIENT_ID", ""),
  });
};

let cachedConfig = null;

export const getAppConfig = () => {
  if (!cachedConfig) {
    cachedConfig = resolveAppConfig();
  }
  return cachedConfig;
};

/** Force re-resolve (e.g. after runtime-config.js mutates window.__APP_CONFIG__). */
export const refreshAppConfig = () => {
  cachedConfig = resolveAppConfig();
  return cachedConfig;
};
