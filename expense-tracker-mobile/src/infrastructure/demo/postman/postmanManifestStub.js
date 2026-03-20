import manifest from "@/infrastructure/demo/generated/postmanRoutes.manifest.json";
import { hydrateRelativeDates } from "@/infrastructure/demo/seed/hydrateRelativeDates";
import { pathTemplateToRegex } from "@/infrastructure/demo/postman/pathTemplateToRegex";

const overrideModules = import.meta.glob("@/infrastructure/demo/fixtures/overrides/*.json", {
  eager: true,
  import: "default",
});

function routeFixtureKey(routeId) {
  return routeId.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "");
}

const overrideByKey = {};
for (const path of Object.keys(overrideModules)) {
  const file = path.split("/").pop().replace(/\.json$/i, "");
  overrideByKey[file] = overrideModules[path];
}

const matchers = (manifest.routes || [])
  .map((r) => ({
    ...r,
    regex: pathTemplateToRegex(r.pathTemplate),
  }))
  .sort((a, b) => b.pathTemplate.length - a.pathTemplate.length);

function defaultStubPayload(method, pathTemplate) {
  const m = method.toUpperCase();
  const p = pathTemplate.toLowerCase();
  if (m === "GET" && p.includes("unread-count")) return { count: 0 };
  if (m === "GET" && p.includes("/exists")) return true;
  if (m === "GET" && (p.includes("paginated") || p.includes("/page"))) {
    return { content: [], number: 0, totalPages: 0, totalElements: 0, last: true };
  }
  if (m === "GET" && (p.includes("/export") || p.includes("/download"))) return "";
  if (
    m === "GET" &&
    (p.includes("/search") || p.includes("/fetch") || p.includes("/list") || p.includes("/all"))
  ) {
    if (p.includes("preferences")) return {};
    return [];
  }
  if (m === "GET" && p.includes("/health")) return { status: "UP" };
  if (m === "GET") return {};
  if (m === "DELETE") return { success: true };
  if (m === "POST" || m === "PUT" || m === "PATCH") {
    if (p.includes("upload") || p.includes("scan")) return { success: true };
    return { success: true };
  }
  return { success: true };
}

function matchPostmanRoute(method, path) {
  const m = method.toUpperCase();
  for (const r of matchers) {
    if (r.method !== m) continue;
    if (r.regex.test(path)) return r;
  }
  return null;
}

export function resolvePostmanStubPayload(method, path) {
  const route = matchPostmanRoute(method, path);
  if (!route) return null;
  const key = routeFixtureKey(route.id);
  const raw = overrideByKey[key];
  if (raw != null) return hydrateRelativeDates(raw);
  return defaultStubPayload(method, route.pathTemplate);
}
