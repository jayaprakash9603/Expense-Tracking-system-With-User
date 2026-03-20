import { getAppConfig } from "@/config/runtime/parseAppConfig";
import {
  normalizeRequestPath,
  parseRequestBody,
  rejectDemoHttp,
  resolveDemoData,
} from "@/infrastructure/demo/http/demoHttpUtils";
import { resolvePostmanStubPayload } from "@/infrastructure/demo/postman/postmanManifestStub";
import { ensureDemoStoreSeeded, saveDemoStore } from "@/infrastructure/demo/store/demoStore";
import { tryDemoAuthRoutes } from "@/infrastructure/demo/handlers/demoAuthRoutes";
import { tryDemoUserProfileRoutes } from "@/infrastructure/demo/handlers/demoUserProfileRoutes";
import { tryDemoSettingsAnalyticsRoutes } from "@/infrastructure/demo/handlers/demoSettingsAnalyticsRoutes";
import { tryDemoExpenseRoutes } from "@/infrastructure/demo/handlers/demoExpenseRoutes";
import { tryDemoBudgetRoutes } from "@/infrastructure/demo/handlers/demoBudgetRoutes";
import { tryDemoBillRoutes } from "@/infrastructure/demo/handlers/demoBillRoutes";
import { tryDemoCategoryRoutes } from "@/infrastructure/demo/handlers/demoCategoryRoutes";
import { tryDemoFriendsNotificationsMiscRoutes } from "@/infrastructure/demo/handlers/demoFriendsNotificationsMiscRoutes";

function buildCtx(config, method, path, body, store, cfg) {
  return {
    method,
    path,
    body,
    config,
    store,
    cfg,
    saveDemoStore,
    resolveDemoData,
    rejectDemoHttp,
  };
}

export async function handleDemoRequest(config) {
  const cfg = getAppConfig();
  if (!cfg.isDemo) {
    return rejectDemoHttp(500, "Demo adapter used outside demo mode");
  }

  const method = String(config.method || "get").toUpperCase();
  const path = normalizeRequestPath(config);
  const body = parseRequestBody(config);
  const store = ensureDemoStoreSeeded();
  const ctx = buildCtx(config, method, path, body, store, cfg);

  try {
    const chain = [
      tryDemoAuthRoutes,
      tryDemoUserProfileRoutes,
      tryDemoSettingsAnalyticsRoutes,
      tryDemoExpenseRoutes,
      tryDemoBudgetRoutes,
      tryDemoBillRoutes,
      tryDemoCategoryRoutes,
      tryDemoFriendsNotificationsMiscRoutes,
    ];

    for (const fn of chain) {
      const res = await fn(ctx);
      if (res != null) return res;
    }

    const stubPayload = resolvePostmanStubPayload(method, path);
    if (stubPayload !== null) {
      return resolveDemoData(stubPayload);
    }

    return rejectDemoHttp(404, `Demo: no handler for ${method} ${path}`);
  } catch (e) {
    if (e?.response) return Promise.reject(e);
    return rejectDemoHttp(500, e?.message || "Demo error");
  }
}
