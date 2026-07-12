/**
 * Route preloader - preloads lazy chunks on hover/pointer to eliminate
 * perceived delay when navigating between pages.
 */

const ROUTE_IMPORT_MAP = {
  "/dashboard": () => import("@/features/dashboard/pages/DashboardPage"),
  "/settings": () => import("@/features/settings/pages/SettingsPage"),
  "/expenses": () => import("@/features/expenses/pages/CashflowPage"),
  "/expenses/add": () => import("@/features/expenses/pages/NewExpense"),
  "/budgets": () => import("@/features/budgets/pages/BudgetListPage"),
  "/budgets/add": () => import("@/features/budgets/pages/NewBudget"),
  "/categories": () => import("@/features/categories/pages/CategoryFlowPage"),
  "/categories/add": () => import("@/features/categories/pages/CategoryFormPage"),
  "/bills": () => import("@/features/bills/pages/BillListPage"),
  "/bills/add": () => import("@/features/bills/pages/NewBill"),
  "/notifications": () => import("@/features/notifications/pages/NotificationListPage"),
  "/reports": () => import("@/features/reports/pages/ReportsPage"),
  "/analytics": () => import("@/features/analytics/pages/OverviewPage"),
  "/cashflow": () => import("@/features/expenses/pages/CashflowPage"),
  "/payments": () => import("@/features/payment-methods/pages/PaymentMethodFlowPage"),
  "/profile": () => import("@/features/profile/pages/ProfilePage"),
};

const preloaded = new Set();

export function preloadRoute(path) {
  if (!path || preloaded.has(path)) return;

  const basePath = path.split("?")[0];

  const importFn = ROUTE_IMPORT_MAP[basePath];
  if (importFn) {
    preloaded.add(path);
    importFn();
  }
}

export function preloadRouteOnInteraction(path) {
  return {
    onMouseEnter: () => preloadRoute(path),
    onTouchStart: () => preloadRoute(path),
    onFocus: () => preloadRoute(path),
  };
}
