import { buildDefaultDemoProfile } from "@/infrastructure/demo/domain/demoProfile";

function resolveSwitchModeFromRequest(config) {
  const fromParams = config.params?.mode;
  if (fromParams != null && fromParams !== "") {
    return String(fromParams).toUpperCase() === "ADMIN" ? "ADMIN" : "USER";
  }
  const url = String(config.url || "");
  const q = url.includes("?") ? url.split("?")[1].split("#")[0] : "";
  if (q) {
    const mode = new URLSearchParams(q).get("mode");
    if (mode != null && mode !== "") {
      return String(mode).toUpperCase() === "ADMIN" ? "ADMIN" : "USER";
    }
  }
  return "USER";
}

export async function tryDemoUserProfileRoutes(ctx) {
  const { method, path, body, store, config, saveDemoStore, resolveDemoData } = ctx;

  if (method === "GET" && path === "/api/user/profile") {
    return resolveDemoData(buildDefaultDemoProfile(store));
  }

  if (method === "PUT" && path === "/api/user/profile") {
    store.profile = { ...buildDefaultDemoProfile(store), ...body };
    saveDemoStore(store);
    return resolveDemoData(store.profile);
  }

  if (method === "PUT" && path === "/api/user/two-factor") {
    return resolveDemoData({ success: true });
  }

  if (method === "PUT" && path === "/api/user/switch-mode") {
    const mode =
      body?.mode != null && body.mode !== ""
        ? String(body.mode).toUpperCase() === "ADMIN"
          ? "ADMIN"
          : "USER"
        : resolveSwitchModeFromRequest(config);
    store.profile = buildDefaultDemoProfile(store, { currentMode: mode });
    saveDemoStore(store);
    return resolveDemoData({ user: store.profile, currentMode: mode });
  }

  return null;
}
