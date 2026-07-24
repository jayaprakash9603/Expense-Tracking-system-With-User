import {
  FEATURE_KEYS,
  SUB_FEATURE_KEYS,
  isPathEnabledInState,
} from "../../../config/featureCatalog";

const USER_QUICK_LINK_CANDIDATES = [
  { label: "Dashboard", path: "/dashboard", featureKey: FEATURE_KEYS.DASHBOARD },
  { label: "Expenses", path: "/expenses", featureKey: FEATURE_KEYS.EXPENSES },
  { label: "Categories", path: "/category-flow", featureKey: FEATURE_KEYS.CATEGORIES },
  { label: "Payments", path: "/payment-method", featureKey: FEATURE_KEYS.PAYMENT_METHODS },
  { label: "Bill", path: "/bill", featureKey: FEATURE_KEYS.BILLS },
  { label: "Budgets", path: "/budget", featureKey: FEATURE_KEYS.BUDGETS },
  { label: "Reports", path: "/reports", featureKey: FEATURE_KEYS.REPORTS },
  { label: "Groups", path: "/groups", featureKey: FEATURE_KEYS.GROUPS },
  { label: "Friends", path: "/friends", featureKey: FEATURE_KEYS.FRIENDS },
  { label: "Calendar", path: "/calendar-view", featureKey: SUB_FEATURE_KEYS.CALENDAR_VIEW },
];

const ADMIN_QUICK_LINK_CANDIDATES = [
  {
    label: "Admin Dashboard",
    path: "/admin/dashboard",
    featureKey: SUB_FEATURE_KEYS.ADMIN_DASHBOARD,
  },
  {
    label: "User Management",
    path: "/admin/users",
    featureKey: SUB_FEATURE_KEYS.ADMIN_USERS,
  },
  {
    label: "System Analytics",
    path: "/admin/analytics",
    featureKey: SUB_FEATURE_KEYS.ADMIN_ANALYTICS,
  },
  {
    label: "Audit Logs",
    path: "/admin/audit",
    featureKey: SUB_FEATURE_KEYS.ADMIN_AUDIT,
  },
];

const isLinkEnabled = (featureFlagsState, link) => {
  if (!link?.path) {
    return false;
  }
  return isPathEnabledInState(featureFlagsState, link.path);
};

export const getEnabledUserQuickLinks = (featureFlagsState, { max = 4 } = {}) =>
  USER_QUICK_LINK_CANDIDATES.filter((link) =>
    isLinkEnabled(featureFlagsState, link),
  ).slice(0, max);

export const getEnabledAdminQuickLinks = (featureFlagsState, { max = 4 } = {}) =>
  ADMIN_QUICK_LINK_CANDIDATES.filter((link) =>
    isLinkEnabled(featureFlagsState, link),
  ).slice(0, max);

export const getEnabledQuickLinks = (
  featureFlagsState,
  { isAdminMode = false, max = 4 } = {},
) =>
  isAdminMode
    ? getEnabledAdminQuickLinks(featureFlagsState, { max })
    : getEnabledUserQuickLinks(featureFlagsState, { max });
