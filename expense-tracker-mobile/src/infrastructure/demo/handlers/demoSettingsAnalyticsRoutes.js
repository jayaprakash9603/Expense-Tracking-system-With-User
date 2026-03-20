import { buildDemoAnalyticsOverview } from "@/infrastructure/demo/domain/demoAnalyticsBuilder";

export async function tryDemoSettingsAnalyticsRoutes(ctx) {
  const { method, path, body, store, saveDemoStore, resolveDemoData } = ctx;

  if (method === "GET" && path === "/api/settings/exists") {
    return resolveDemoData(true);
  }

  if (method === "GET" && path === "/api/settings") {
    const settings = store.userSettings || {
      themeMode: "dark",
      dateFormat: "DD/MM/YYYY",
      currency: "USD",
      twoFactorEnabled: false,
    };
    store.userSettings = settings;
    saveDemoStore(store);
    return resolveDemoData(settings);
  }

  if (method === "PUT" && path === "/api/settings") {
    store.userSettings = { ...(store.userSettings || {}), ...body };
    saveDemoStore(store);
    return resolveDemoData(store.userSettings);
  }

  if (method === "POST" && path === "/api/settings/default") {
    store.userSettings = {
      themeMode: "dark",
      dateFormat: "DD/MM/YYYY",
      currency: "USD",
      twoFactorEnabled: false,
    };
    saveDemoStore(store);
    return resolveDemoData(store.userSettings);
  }

  if (method === "POST" && path === "/api/settings/reset") {
    return resolveDemoData(store.userSettings || {});
  }

  if (method === "GET" && path === "/api/analytics/overview") {
    return resolveDemoData(buildDemoAnalyticsOverview(store));
  }

  if (method === "POST" && path === "/api/analytics/entity") {
    return resolveDemoData({ series: [], totals: {} });
  }

  return null;
}
