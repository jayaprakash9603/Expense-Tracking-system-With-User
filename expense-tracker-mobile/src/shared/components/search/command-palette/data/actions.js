export const SEARCH_MODES = {
  USER: "USER",
  ADMIN: "ADMIN",
};

function isAdminRoute(route) {
  return route.guard === "admin" || String(route.path || "").startsWith("/admin");
}

function isSearchableRoute(route) {
  if (!route?.path) return false;
  if (String(route.path).includes(":")) return false;
  return route.elementMode !== "redirect";
}

function toReadableName(routeKey, path) {
  if (routeKey) {
    return routeKey
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  return String(path || "")
    .split("/")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function resolveIconByPath(path, category) {
  if (category === "Settings") return "⚙️";
  if (path.startsWith("/admin")) return "🛡️";
  if (path.includes("expenses")) return "💸";
  if (path.includes("budgets") || path.includes("budget")) return "📊";
  if (path.includes("categories") || path.includes("category")) return "🏷️";
  if (path.includes("bills") || path.includes("bill")) return "🧾";
  if (path.includes("payments")) return "💳";
  if (path.includes("friends")) return "🤝";
  if (path.includes("groups")) return "👥";
  if (path.includes("reports") || path.includes("analytics")) return "📈";
  if (path.includes("notifications")) return "🔔";
  if (path.includes("profile")) return "🙍";
  if (path.includes("support") || path.includes("help")) return "❓";
  return "➡️";
}

function getRouteCategory(path) {
  if (path.startsWith("/settings") || path.startsWith("/admin/settings")) {
    return "Settings";
  }

  if (
    path.includes("/add") ||
    path.includes("/create") ||
    path.includes("/new") ||
    path.includes("/edit") ||
    path.includes("/upload")
  ) {
    return "Actions";
  }

  return "Navigation";
}

function routeToAction(route) {
  const category = getRouteCategory(route.path);
  const name = toReadableName(route.key, route.path);
  return {
    id: `route-${route.key || route.path}`,
    name,
    keywords: [route.key, route.path, route.titleKey, route.navGroup].filter(Boolean),
    category,
    section: category === "Settings" ? "Preferences" : route.navGroup || "App",
    icon: resolveIconByPath(route.path, category),
    route: route.path,
    priority: category === "Navigation" ? 1 : 2,
  };
}

export function buildBaseCommandActions(routes = [], mode = SEARCH_MODES.USER) {
  const baseRoutes = routes.filter(isSearchableRoute).filter((route) => {
    if (mode === SEARCH_MODES.ADMIN) return true;
    return !isAdminRoute(route);
  });

  const routeActions = baseRoutes.map(routeToAction);
  const settingsChildren = routeActions
    .filter((action) => action.category === "Settings")
    .map((action) => ({
      ...action,
      category: "Settings",
      section: "Settings",
    }));

  const topLevel = routeActions.filter((action) => action.category !== "Settings");

  if (settingsChildren.length) {
    topLevel.push({
      id: "settings-root",
      name: "Settings Commands",
      keywords: ["settings", "preferences", "configuration"],
      category: "Settings",
      section: "Settings",
      icon: "⚙️",
      priority: 1,
      children: settingsChildren,
    });
  }

  return topLevel;
}

export function flattenActionTree(actions, parentTrail = []) {
  return actions.flatMap((action) => {
    const node = {
      ...action,
      trail: parentTrail,
    };
    if (!Array.isArray(action.children) || !action.children.length) {
      return [node];
    }

    return [node, ...flattenActionTree(action.children, [...parentTrail, action.name])];
  });
}
