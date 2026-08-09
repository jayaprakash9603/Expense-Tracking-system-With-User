/**
 * Compatibility shim — preserves the public surface of the legacy api.js
 * while routing through the hexagonal platform container.
 *
 * Exports (unchanged for existing callers):
 *   API_BASE_URL, NOTIFICATION_WS_URL, CHAT_WS_URL, STORY_WS_URL,
 *   api, updateAuthHeader
 *
 * When REACT_APP_TRANSPORT / window.__APP_CONFIG__.transport is "snow" or
 * "mock", all consumers of `api` are re-pointed automatically.
 */

import { getAppConfig } from "../platform/config/appConfig";
import { getContainer } from "../platform/container";
import { bootstrapPlatform } from "../platform/bootstrap";

const container = bootstrapPlatform();
const config = getAppConfig();

export const API_BASE_URL = config.apiBaseUrl;
export const NOTIFICATION_WS_URL = config.notificationWsUrl;
export const CHAT_WS_URL = config.chatWsUrl;
export const STORY_WS_URL = config.storyWsUrl;

/**
 * Shared HTTP client. Prefer container.http.request({ endpointId }) for new
 * code; this axios-compat surface remains for the ~300 existing call sites.
 */
export const api = container.http._axios || container.http;

export const updateAuthHeader = () => {
  const token = container.tokenPort.getToken();
  if (api?.defaults?.headers) {
    api.defaults.headers.Authorization = token ? `Bearer ${token}` : null;
  }
};

updateAuthHeader();

export { getContainer, getAppConfig };
