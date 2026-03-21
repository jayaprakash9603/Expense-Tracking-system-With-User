import { matchPath } from "react-router-dom";
import { ROUTE_CATALOG } from "@/app/routing/routeCatalog";

const HUB = { to: "/dashboard", labelKey: "dashboard.title" };

const NESTED_PARENT = {
  expenses: { to: "/expenses", labelKey: "navigation.expenses" },
  budgets: { to: "/budgets", labelKey: "navigation.budget" },
  categories: { to: "/categories", labelKey: "navigation.categories" },
  "category-flow": { to: "/category-flow", labelKey: "navigation.categories" },
  bills: { to: "/bills", labelKey: "navigation.bills" },
  settings: { to: "/settings", labelKey: "settings.title" },
  reports: { to: "/reports", labelKey: "navigation.reports" },
  analytics: { to: "/analytics", labelKey: "navigation.insights" },
  "payment-method": { to: "/payment-method", labelKey: "navigation.payments" },
  friends: { to: "/friends", labelKey: "navigation.friends" },
  groups: { to: "/groups", labelKey: "navigation.groups" },
  notifications: { to: "/notifications", labelKey: "navigation.notifications" },
  utilities: { to: "/utilities", labelKey: "navigation.utilities" },
  upload: { to: "/upload", labelKey: "navigation.upload" },
};

export function normalizePathname(pathname) {
  if (!pathname || pathname === "/") return "/dashboard";
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname;
}

export function findMatchedRoute(pathname) {
  const normalized = normalizePathname(pathname);
  const sorted = [...ROUTE_CATALOG].sort((a, b) => b.path.length - a.path.length);
  for (const route of sorted) {
    const m = matchPath({ path: route.path, end: true }, normalized);
    if (m) return route;
  }
  return null;
}

function adminSegments(pathname, route) {
  if (pathname === "/admin/dashboard") {
    return [HUB, { labelKey: "navigation.adminDashboard" }];
  }
  return [
    HUB,
    { to: "/admin/dashboard", labelKey: "navigation.adminShort" },
    { labelKey: route.titleKey },
  ];
}

export function getBreadcrumbSegments(pathname) {
  const normalized = normalizePathname(pathname);
  const route = findMatchedRoute(normalized);
  if (!route) {
    return [HUB, { labelKey: "system.notFound" }];
  }

  if (normalized === "/dashboard") {
    return [{ labelKey: "dashboard.title" }];
  }

  if (normalized.startsWith("/admin")) {
    return adminSegments(normalized, route);
  }

  const parts = normalized.split("/").filter(Boolean);
  if (parts.length <= 1) {
    return [HUB, { labelKey: route.titleKey }];
  }

  const first = parts[0];
  const parent = NESTED_PARENT[first];
  if (parent) {
    return [HUB, parent, { labelKey: route.titleKey }];
  }

  return [HUB, { labelKey: route.titleKey }];
}
