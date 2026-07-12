import { getSidebarItems, getBottomNavItems, getRouteByPath } from "@/app/routing/routeCatalog";

export const MENU_ITEMS = getSidebarItems().map((r) => ({
  key: r.key,
  label: r.titleKey,
  path: r.path,
  icon: r.navIcon,
}));

export const BOTTOM_NAV_ITEMS = getBottomNavItems().map((r) => ({
  key: r.key,
  label: r.titleKey,
  path: r.path,
  icon: r.navIcon,
}));

export const SIDEBAR_ITEMS = MENU_ITEMS;

export function getMenuItemByPath(path) {
  const route = getRouteByPath(path);
  if (!route) return undefined;
  return { key: route.key, label: route.titleKey, path: route.path, icon: route.navIcon };
}
