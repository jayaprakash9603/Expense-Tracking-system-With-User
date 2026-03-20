import { buildDefaultDemoProfile } from "@/infrastructure/demo/domain/demoProfile";

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
    const mode = config.params?.mode || body.mode || "USER";
    store.profile = buildDefaultDemoProfile(store, { currentMode: mode });
    saveDemoStore(store);
    return resolveDemoData({ user: store.profile, currentMode: mode });
  }

  return null;
}
