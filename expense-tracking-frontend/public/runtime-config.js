/**
 * Runtime configuration — edit this file on a deployed host to switch
 * transport without rebuilding the SPA.
 *
 * Loaded before the Vite bundle (see index.html). Values here override
 * process.env.REACT_APP_* (see platform/config/appConfig.js).
 *
 * Examples:
 *   window.__APP_CONFIG__ = { transport: "snow", snowBaseUrl: "https://snow.example.com" };
 *   window.__APP_CONFIG__ = { transport: "mock" };
 *   window.__APP_CONFIG__ = {
 *     transport: "live",
 *     serviceBaseUrls: { expense: "http://localhost:6001" },
 *     endpointOverrides: { "expenses.list": { path: "/api/v2/expenses" } },
 *   };
 */
window.__APP_CONFIG__ = window.__APP_CONFIG__ || {
  // transport: "live", // "live" | "snow" | "mock"
};
