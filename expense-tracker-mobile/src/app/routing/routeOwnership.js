import { ROUTE_CATALOG } from "@/app/routing/routeCatalog";

const OWNER_BY_PREFIX = [
  ["dashboard", "dashboard"],
  ["expenses", "expenses"],
  ["budget", "budgets"],
  ["budgets", "budgets"],
  ["category", "categories"],
  ["categories", "categories"],
  ["payment", "payment-methods"],
  ["payments", "payment-methods"],
  ["bill", "bills"],
  ["bills", "bills"],
  ["friend", "notifications"],
  ["friends", "notifications"],
  ["group", "groups"],
  ["groups", "groups"],
  ["report", "reports"],
  ["analytics", "analytics"],
  ["cashflow", "expenses"],
  ["notification", "notifications"],
  ["profile", "profile"],
  ["settings", "settings"],
  ["admin", "system"],
  ["chat", "system"],
  ["share", "system"],
  ["support", "system"],
  ["upload", "system"],
  ["history", "reports"],
  ["insights", "analytics"],
  ["transactions", "reports"],
  ["utilities", "system"],
  ["add-new", "expenses"],
];

const EXPLICIT_OWNER = {
  login: "auth",
  register: "auth",
  "forgot-password": "auth",
  "otp-verification": "auth",
};

const VALID_STATUS = new Set(["implemented", "placeholder", "migration", "redirect"]);

export function resolveRouteOwner(routeKey) {
  if (!routeKey) return "system";
  if (EXPLICIT_OWNER[routeKey]) return EXPLICIT_OWNER[routeKey];

  const prefixMatch = OWNER_BY_PREFIX.find(([prefix]) => routeKey.startsWith(prefix));
  return prefixMatch ? prefixMatch[1] : "system";
}

export function getRouteStatus(elementMode) {
  if (elementMode === "implemented") return "implemented";
  if (elementMode === "redirect") return "redirect";
  return "placeholder";
}

export function buildRouteOwnershipMap() {
  return ROUTE_CATALOG.map((route) => ({
    key: route.key,
    path: route.path,
    owner: resolveRouteOwner(route.key),
    status: getRouteStatus(route.elementMode),
  }));
}

export function validateRouteOwnership() {
  const entries = buildRouteOwnershipMap();
  return entries.filter((entry) => !entry.owner || !VALID_STATUS.has(entry.status));
}
