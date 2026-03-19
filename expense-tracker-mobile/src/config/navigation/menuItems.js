import {
  LayoutDashboard, Receipt, PiggyBank, FolderOpen,
  FileText, Bell, Users, BarChart3, Settings,
} from "lucide-react";

export const MENU_ITEMS = [
  { key: "dashboard", label: "nav.dashboard", path: "/", icon: LayoutDashboard },
  { key: "expenses", label: "nav.expenses", path: "/expenses", icon: Receipt },
  { key: "budgets", label: "nav.budgets", path: "/budgets", icon: PiggyBank },
  { key: "categories", label: "nav.categories", path: "/categories", icon: FolderOpen },
  { key: "bills", label: "nav.bills", path: "/bills", icon: FileText },
  { key: "notifications", label: "nav.notifications", path: "/notifications", icon: Bell, badge: "unreadCount" },
  { key: "friends", label: "nav.friends", path: "/friends", icon: Users },
  { key: "reports", label: "nav.reports", path: "/reports", icon: BarChart3 },
  { key: "settings", label: "nav.settings", path: "/settings", icon: Settings },
];

export const BOTTOM_NAV_ITEMS = MENU_ITEMS.filter((item) =>
  ["dashboard", "expenses", "budgets", "notifications", "settings"].includes(item.key)
);

export const SIDEBAR_ITEMS = MENU_ITEMS;

export function getMenuItemByPath(path) {
  return MENU_ITEMS.find((item) => item.path === path);
}
