export const FEATURE_KEYS = {
  EXPENSES: "expenses",
  BUDGETS: "budgets",
  CATEGORIES: "categories",
  PAYMENT_METHODS: "paymentMethods",
  BILLS: "bills",
  FRIENDS: "friends",
  GROUPS: "groups",
  SHARING: "sharing",
  REPORTS: "reports",
  CALENDAR: "calendar",
  UPLOAD: "upload",
  UTILITIES: "utilities",
  CHAT: "chat",
  STORIES: "stories",
  INVESTMENT: "investment",
  ANALYTICS: "analytics",
  NOTIFICATIONS: "notifications",
  KEYBOARD_SHORTCUTS: "keyboardShortcuts",
  SEARCH: "search",
  EVENTS: "events",
  HELP_SUPPORT: "helpSupport",
  ADMIN: "admin",
  AUTH: "auth",
  THEME_CUSTOMIZATION: "themeCustomization",
  DASHBOARD: "dashboard",
  SETTINGS: "settings",
  PROFILE: "profile",
};

export const SUB_FEATURE_KEYS = {
  EXPENSES_CREATE: "expenses.create",
  EXPENSES_EDIT: "expenses.edit",
  EXPENSES_DELETE: "expenses.delete",
  EXPENSES_VIEW: "expenses.view",
  EXPENSES_SHARE: "expenses.share",
  EXPENSES_EXPORT: "expenses.export",
  EXPENSES_LIST: "expenses.list",
  EXPENSES_REPORTS: "expenses.reports",
  EXPENSES_BULK_IMPORT: "expenses.bulkImport",
  EXPENSES_TRANSACTIONS: "expenses.transactions",
  BUDGETS_CREATE: "budgets.create",
  BUDGETS_EDIT: "budgets.edit",
  BUDGETS_DELETE: "budgets.delete",
  BUDGETS_VIEW: "budgets.view",
  BUDGETS_EXPORT: "budgets.export",
  BUDGETS_LIST: "budgets.list",
  BUDGETS_REPORTS: "budgets.reports",
  CATEGORIES_CREATE: "categories.create",
  CATEGORIES_EDIT: "categories.edit",
  CATEGORIES_DELETE: "categories.delete",
  CATEGORIES_VIEW: "categories.view",
  CATEGORIES_EXPORT: "categories.export",
  CATEGORIES_LIST: "categories.list",
  CATEGORIES_REPORTS: "categories.reports",
  CATEGORIES_CALENDAR: "categories.calendar",
  CATEGORIES_ANALYTICS: "categories.analytics",
  PAYMENT_METHODS_CREATE: "paymentMethods.create",
  PAYMENT_METHODS_EDIT: "paymentMethods.edit",
  PAYMENT_METHODS_DELETE: "paymentMethods.delete",
  PAYMENT_METHODS_VIEW: "paymentMethods.view",
  PAYMENT_METHODS_EXPORT: "paymentMethods.export",
  PAYMENT_METHODS_LIST: "paymentMethods.list",
  PAYMENT_METHODS_REPORTS: "paymentMethods.reports",
  PAYMENT_METHODS_CALENDAR: "paymentMethods.calendar",
  PAYMENT_METHODS_ANALYTICS: "paymentMethods.analytics",
  BILLS_CREATE: "bills.create",
  BILLS_EDIT: "bills.edit",
  BILLS_DELETE: "bills.delete",
  BILLS_VIEW: "bills.view",
  BILLS_EXPORT: "bills.export",
  BILLS_LIST: "bills.list",
  BILLS_REPORTS: "bills.reports",
  BILLS_UPLOAD: "bills.upload",
  BILLS_CALENDAR: "bills.calendar",
  FRIENDS_CREATE: "friends.create",
  FRIENDS_EDIT: "friends.edit",
  FRIENDS_DELETE: "friends.delete",
  FRIENDS_LIST: "friends.list",
  FRIENDS_REPORTS: "friends.reports",
  FRIENDS_ACTIVITY: "friends.activity",
  FRIENDS_CHAT: "friends.chat",
  GROUPS_CREATE: "groups.create",
  GROUPS_EDIT: "groups.edit",
  GROUPS_DELETE: "groups.delete",
  GROUPS_VIEW: "groups.view",
  GROUPS_EXPORT: "groups.export",
  GROUPS_LIST: "groups.list",
  SHARING_CREATE: "sharing.create",
  SHARING_EDIT: "sharing.edit",
  SHARING_DELETE: "sharing.delete",
  SHARING_MY_SHARES: "sharing.myShares",
  SHARING_PUBLIC: "sharing.publicShares",
  SHARING_SHARED_WITH_ME: "sharing.sharedWithMe",
  REPORTS_OVERVIEW: "reports.overview",
  REPORTS_TRANSACTIONS: "reports.transactions",
  REPORTS_CREDIT_DUE: "reports.creditDue",
  REPORTS_EXPORT: "reports.export",
  CALENDAR_VIEW: "calendar.view",
  CALENDAR_DAY_VIEW: "calendar.dayView",
  CALENDAR_BILL_DAY_VIEW: "calendar.billDayView",
  UPLOAD_EXPENSES: "upload.expenses",
  UPLOAD_CATEGORIES: "upload.categories",
  UPLOAD_PAYMENTS: "upload.payments",
  UTILITIES_TOOLS: "utilities.tools",
  CHAT_MESSAGING: "chat.messaging",
  ADMIN_CREATE: "admin.create",
  ADMIN_EDIT: "admin.edit",
  ADMIN_DELETE: "admin.delete",
  ADMIN_EXPORT: "admin.export",
  ADMIN_DASHBOARD: "admin.dashboard",
  ADMIN_USERS: "admin.users",
  ADMIN_ROLES: "admin.roles",
  ADMIN_ANALYTICS: "admin.analytics",
  ADMIN_AUDIT: "admin.audit",
  ADMIN_REPORTS: "admin.reports",
  ADMIN_SETTINGS: "admin.settings",
  ADMIN_STORIES: "admin.stories",
  NOTIFICATIONS_PREFERENCES: "notifications.preferences",
  SEARCH_UNIVERSAL: "search.universal",
  KEYBOARD_SHORTCUTS_GLOBAL: "keyboardShortcuts.global",
  HELP_SUPPORT_SUPPORT: "helpSupport.support",
  INVESTMENT_DASHBOARD: "investment.dashboard",
  STORIES_FEED: "stories.feed",
  EVENTS_PLANNING: "events.planning",
  AUTH_GOOGLE_OAUTH: "auth.googleOauth",
  AUTH_MFA: "auth.mfa",
  AUTH_EMAIL_OTP: "auth.emailOtp",
};

const SUB_FEATURE_DEFINITIONS = [
  { key: SUB_FEATURE_KEYS.EXPENSES_CREATE, parent: FEATURE_KEYS.EXPENSES, routes: ["/expenses/create"] },
  { key: SUB_FEATURE_KEYS.EXPENSES_EDIT, parent: FEATURE_KEYS.EXPENSES, routes: ["/expenses/edit"] },
  { key: SUB_FEATURE_KEYS.EXPENSES_VIEW, parent: FEATURE_KEYS.EXPENSES, routes: ["/expenses/view"] },
  { key: SUB_FEATURE_KEYS.EXPENSES_LIST, parent: FEATURE_KEYS.EXPENSES, routes: ["/expenses", "/cashflow"] },
  { key: SUB_FEATURE_KEYS.EXPENSES_REPORTS, parent: FEATURE_KEYS.EXPENSES, routes: ["/expenses/reports"] },
  { key: SUB_FEATURE_KEYS.EXPENSES_BULK_IMPORT, parent: FEATURE_KEYS.EXPENSES, routes: ["/upload/expenses"] },
  { key: SUB_FEATURE_KEYS.EXPENSES_TRANSACTIONS, parent: FEATURE_KEYS.EXPENSES, routes: ["/transactions", "/history"] },
  { key: SUB_FEATURE_KEYS.BUDGETS_CREATE, parent: FEATURE_KEYS.BUDGETS, routes: ["/budget/create"] },
  { key: SUB_FEATURE_KEYS.BUDGETS_EDIT, parent: FEATURE_KEYS.BUDGETS, routes: ["/budget/edit"] },
  { key: SUB_FEATURE_KEYS.BUDGETS_LIST, parent: FEATURE_KEYS.BUDGETS, routes: ["/budget"] },
  { key: SUB_FEATURE_KEYS.BUDGETS_REPORTS, parent: FEATURE_KEYS.BUDGETS, routes: ["/budget/report", "/budget/reports", "/budget-report"] },
  { key: SUB_FEATURE_KEYS.CATEGORIES_CREATE, parent: FEATURE_KEYS.CATEGORIES, routes: ["/category-flow/create"] },
  { key: SUB_FEATURE_KEYS.CATEGORIES_EDIT, parent: FEATURE_KEYS.CATEGORIES, routes: ["/category-flow/edit"] },
  { key: SUB_FEATURE_KEYS.CATEGORIES_VIEW, parent: FEATURE_KEYS.CATEGORIES, routes: ["/category-flow/view"] },
  { key: SUB_FEATURE_KEYS.CATEGORIES_LIST, parent: FEATURE_KEYS.CATEGORIES, routes: ["/category-flow"] },
  { key: SUB_FEATURE_KEYS.CATEGORIES_REPORTS, parent: FEATURE_KEYS.CATEGORIES, routes: ["/category-flow/reports"] },
  { key: SUB_FEATURE_KEYS.CATEGORIES_CALENDAR, parent: FEATURE_KEYS.CATEGORIES, routes: ["/category-flow/calendar"] },
  { key: SUB_FEATURE_KEYS.CATEGORIES_ANALYTICS, parent: FEATURE_KEYS.CATEGORIES, routes: ["/category-flow/view"] },
  { key: SUB_FEATURE_KEYS.PAYMENT_METHODS_CREATE, parent: FEATURE_KEYS.PAYMENT_METHODS, routes: ["/payment-method/create"] },
  { key: SUB_FEATURE_KEYS.PAYMENT_METHODS_EDIT, parent: FEATURE_KEYS.PAYMENT_METHODS, routes: ["/payment-method/edit"] },
  { key: SUB_FEATURE_KEYS.PAYMENT_METHODS_VIEW, parent: FEATURE_KEYS.PAYMENT_METHODS, routes: ["/payment-method/view"] },
  { key: SUB_FEATURE_KEYS.PAYMENT_METHODS_LIST, parent: FEATURE_KEYS.PAYMENT_METHODS, routes: ["/payment-method"] },
  { key: SUB_FEATURE_KEYS.PAYMENT_METHODS_REPORTS, parent: FEATURE_KEYS.PAYMENT_METHODS, routes: ["/payment-method/reports"] },
  { key: SUB_FEATURE_KEYS.PAYMENT_METHODS_CALENDAR, parent: FEATURE_KEYS.PAYMENT_METHODS, routes: ["/payment-method/calendar"] },
  { key: SUB_FEATURE_KEYS.PAYMENT_METHODS_ANALYTICS, parent: FEATURE_KEYS.PAYMENT_METHODS, routes: ["/payment-method/view"] },
  { key: SUB_FEATURE_KEYS.BILLS_CREATE, parent: FEATURE_KEYS.BILLS, routes: ["/bill/create"] },
  { key: SUB_FEATURE_KEYS.BILLS_EDIT, parent: FEATURE_KEYS.BILLS, routes: ["/bill/edit"] },
  { key: SUB_FEATURE_KEYS.BILLS_LIST, parent: FEATURE_KEYS.BILLS, routes: ["/bill"] },
  { key: SUB_FEATURE_KEYS.BILLS_REPORTS, parent: FEATURE_KEYS.BILLS, routes: ["/bill/report"] },
  { key: SUB_FEATURE_KEYS.BILLS_UPLOAD, parent: FEATURE_KEYS.BILLS, routes: ["/bill/upload"] },
  { key: SUB_FEATURE_KEYS.BILLS_CALENDAR, parent: FEATURE_KEYS.BILLS, routes: ["/bill/calendar"] },
  { key: SUB_FEATURE_KEYS.FRIENDS_LIST, parent: FEATURE_KEYS.FRIENDS, routes: ["/friends"] },
  { key: SUB_FEATURE_KEYS.FRIENDS_REPORTS, parent: FEATURE_KEYS.FRIENDS, routes: ["/friends/report"] },
  { key: SUB_FEATURE_KEYS.FRIENDS_ACTIVITY, parent: FEATURE_KEYS.FRIENDS, routes: ["/friends/activity"] },
  { key: SUB_FEATURE_KEYS.FRIENDS_CHAT, parent: FEATURE_KEYS.FRIENDS, routes: ["/friend-chat", "/friends/expenses"] },
  { key: SUB_FEATURE_KEYS.GROUPS_CREATE, parent: FEATURE_KEYS.GROUPS, routes: ["/groups/create"] },
  { key: SUB_FEATURE_KEYS.GROUPS_LIST, parent: FEATURE_KEYS.GROUPS, routes: ["/groups"] },
  { key: SUB_FEATURE_KEYS.SHARING_CREATE, parent: FEATURE_KEYS.SHARING, routes: ["/my-shares/create"] },
  { key: SUB_FEATURE_KEYS.SHARING_MY_SHARES, parent: FEATURE_KEYS.SHARING, routes: ["/my-shares"] },
  { key: SUB_FEATURE_KEYS.SHARING_PUBLIC, parent: FEATURE_KEYS.SHARING, routes: ["/public-shares"] },
  { key: SUB_FEATURE_KEYS.SHARING_SHARED_WITH_ME, parent: FEATURE_KEYS.SHARING, routes: ["/shared-with-me"] },
  { key: SUB_FEATURE_KEYS.REPORTS_OVERVIEW, parent: FEATURE_KEYS.REPORTS, routes: ["/reports"] },
  { key: SUB_FEATURE_KEYS.REPORTS_TRANSACTIONS, parent: FEATURE_KEYS.REPORTS, routes: ["/transactions"] },
  { key: SUB_FEATURE_KEYS.REPORTS_CREDIT_DUE, parent: FEATURE_KEYS.REPORTS, routes: ["/insights"] },
  { key: SUB_FEATURE_KEYS.CALENDAR_VIEW, parent: FEATURE_KEYS.CALENDAR, routes: ["/calendar-view"] },
  { key: SUB_FEATURE_KEYS.CALENDAR_DAY_VIEW, parent: FEATURE_KEYS.CALENDAR, routes: ["/day-view"] },
  { key: SUB_FEATURE_KEYS.CALENDAR_BILL_DAY_VIEW, parent: FEATURE_KEYS.CALENDAR, routes: ["/bill-day-view"] },
  { key: SUB_FEATURE_KEYS.UPLOAD_EXPENSES, parent: FEATURE_KEYS.UPLOAD, routes: ["/upload/expenses"] },
  { key: SUB_FEATURE_KEYS.UPLOAD_CATEGORIES, parent: FEATURE_KEYS.UPLOAD, routes: ["/upload/categories"] },
  { key: SUB_FEATURE_KEYS.UPLOAD_PAYMENTS, parent: FEATURE_KEYS.UPLOAD, routes: ["/upload/payments"] },
  { key: SUB_FEATURE_KEYS.UTILITIES_TOOLS, parent: FEATURE_KEYS.UTILITIES, routes: ["/utilities"] },
  { key: SUB_FEATURE_KEYS.CHAT_MESSAGING, parent: FEATURE_KEYS.CHAT, routes: ["/chats"] },
  { key: SUB_FEATURE_KEYS.ADMIN_CREATE, parent: FEATURE_KEYS.ADMIN, routes: ["/admin/stories/create"] },
  { key: SUB_FEATURE_KEYS.ADMIN_EDIT, parent: FEATURE_KEYS.ADMIN, routes: ["/admin/stories/edit"] },
  { key: SUB_FEATURE_KEYS.ADMIN_DASHBOARD, parent: FEATURE_KEYS.ADMIN, routes: ["/admin/dashboard"] },
  { key: SUB_FEATURE_KEYS.ADMIN_USERS, parent: FEATURE_KEYS.ADMIN, routes: ["/admin/users"] },
  { key: SUB_FEATURE_KEYS.ADMIN_ROLES, parent: FEATURE_KEYS.ADMIN, routes: ["/admin/roles"] },
  { key: SUB_FEATURE_KEYS.ADMIN_ANALYTICS, parent: FEATURE_KEYS.ADMIN, routes: ["/admin/analytics"] },
  { key: SUB_FEATURE_KEYS.ADMIN_AUDIT, parent: FEATURE_KEYS.ADMIN, routes: ["/admin/audit"] },
  { key: SUB_FEATURE_KEYS.ADMIN_REPORTS, parent: FEATURE_KEYS.ADMIN, routes: ["/admin/reports"] },
  { key: SUB_FEATURE_KEYS.ADMIN_SETTINGS, parent: FEATURE_KEYS.ADMIN, routes: ["/admin/settings"] },
  { key: SUB_FEATURE_KEYS.ADMIN_STORIES, parent: FEATURE_KEYS.ADMIN, routes: ["/admin/stories"] },
  { key: SUB_FEATURE_KEYS.NOTIFICATIONS_PREFERENCES, parent: FEATURE_KEYS.NOTIFICATIONS, routes: ["/settings/notifications"] },
  { key: SUB_FEATURE_KEYS.HELP_SUPPORT_SUPPORT, parent: FEATURE_KEYS.HELP_SUPPORT, routes: ["/support"] },
  { key: SUB_FEATURE_KEYS.INVESTMENT_DASHBOARD, parent: FEATURE_KEYS.INVESTMENT, routes: ["/component2"] },
  { key: SUB_FEATURE_KEYS.AUTH_MFA, parent: FEATURE_KEYS.AUTH, routes: ["/settings/mfa", "/mfa"] },
  { key: SUB_FEATURE_KEYS.AUTH_EMAIL_OTP, parent: FEATURE_KEYS.AUTH, routes: ["/otp-verification"] },
];

const MODULE_ROUTE_PREFIXES = [
  ["/settings/notifications", FEATURE_KEYS.NOTIFICATIONS],
  ["/settings/mfa", FEATURE_KEYS.AUTH],
  ["/otp-verification", FEATURE_KEYS.AUTH],
  ["/mfa", FEATURE_KEYS.AUTH],
  ["/admin/stories", FEATURE_KEYS.STORIES],
  ["/admin/analytics", FEATURE_KEYS.ANALYTICS],
  ["/admin", FEATURE_KEYS.ADMIN],
  ["/component2", FEATURE_KEYS.INVESTMENT],
  ["/chats", FEATURE_KEYS.CHAT],
  ["/support", FEATURE_KEYS.HELP_SUPPORT],
  ["/utilities", FEATURE_KEYS.UTILITIES],
  ["/upload", FEATURE_KEYS.UPLOAD],
  ["/calendar-view", FEATURE_KEYS.CALENDAR],
  ["/day-view", FEATURE_KEYS.CALENDAR],
  ["/bill-day-view", FEATURE_KEYS.CALENDAR],
  ["/reports", FEATURE_KEYS.REPORTS],
  ["/insights", FEATURE_KEYS.REPORTS],
  ["/transactions", FEATURE_KEYS.REPORTS],
  ["/history", FEATURE_KEYS.EXPENSES],
  ["/cashflow", FEATURE_KEYS.EXPENSES],
  ["/my-shares", FEATURE_KEYS.SHARING],
  ["/public-shares", FEATURE_KEYS.SHARING],
  ["/shared-with-me", FEATURE_KEYS.SHARING],
  ["/groups", FEATURE_KEYS.GROUPS],
  ["/friend-chat", FEATURE_KEYS.FRIENDS],
  ["/friends", FEATURE_KEYS.FRIENDS],
  ["/bill/upload", FEATURE_KEYS.UPLOAD],
  ["/bill", FEATURE_KEYS.BILLS],
  ["/payment-method", FEATURE_KEYS.PAYMENT_METHODS],
  ["/category-flow", FEATURE_KEYS.CATEGORIES],
  ["/budget-report", FEATURE_KEYS.BUDGETS],
  ["/budget", FEATURE_KEYS.BUDGETS],
  ["/expenses", FEATURE_KEYS.EXPENSES],
];

export const ALWAYS_ON_FEATURES = new Set([
  FEATURE_KEYS.DASHBOARD,
  FEATURE_KEYS.SETTINGS,
  FEATURE_KEYS.PROFILE,
]);

export const ALL_FEATURE_KEYS = Object.values(FEATURE_KEYS).filter(
  (key) => !ALWAYS_ON_FEATURES.has(key),
);

export const ALL_SUB_FEATURE_KEYS = Object.values(SUB_FEATURE_KEYS);

/** Hub tiles on /utilities — section is dormant when none of these are enabled. */
export const UTILITIES_HUB_FEATURE_KEYS = [
  SUB_FEATURE_KEYS.SHARING_MY_SHARES,
  SUB_FEATURE_KEYS.SHARING_PUBLIC,
  SUB_FEATURE_KEYS.SHARING_SHARED_WITH_ME,
  SUB_FEATURE_KEYS.FRIENDS_CHAT,
];

export const SHORTCUT_FEATURE_MAP = {
  GO_EXPENSES: SUB_FEATURE_KEYS.EXPENSES_LIST,
  NEW_EXPENSE: SUB_FEATURE_KEYS.EXPENSES_CREATE,
  GO_BUDGETS: SUB_FEATURE_KEYS.BUDGETS_LIST,
  NEW_BUDGET: SUB_FEATURE_KEYS.BUDGETS_CREATE,
  GO_BILLS: SUB_FEATURE_KEYS.BILLS_LIST,
  NEW_BILL: SUB_FEATURE_KEYS.BILLS_CREATE,
  GO_CATEGORIES: SUB_FEATURE_KEYS.CATEGORIES_LIST,
  NEW_CATEGORY: SUB_FEATURE_KEYS.CATEGORIES_CREATE,
  GO_PAYMENTS: SUB_FEATURE_KEYS.PAYMENT_METHODS_LIST,
  NEW_PAYMENT_METHOD: SUB_FEATURE_KEYS.PAYMENT_METHODS_CREATE,
  GO_FRIENDS: SUB_FEATURE_KEYS.FRIENDS_LIST,
  GO_REPORTS: SUB_FEATURE_KEYS.REPORTS_OVERVIEW,
  GO_CALENDAR: SUB_FEATURE_KEYS.CALENDAR_VIEW,
  GO_ADMIN: SUB_FEATURE_KEYS.ADMIN_DASHBOARD,
  OPEN_SEARCH: FEATURE_KEYS.SEARCH,
  TOGGLE_THEME: FEATURE_KEYS.THEME_CUSTOMIZATION,
};

export const SIDEBAR_MENU_FEATURES = {
  dashboard: FEATURE_KEYS.DASHBOARD,
  expenses: FEATURE_KEYS.EXPENSES,
  categories: FEATURE_KEYS.CATEGORIES,
  payments: FEATURE_KEYS.PAYMENT_METHODS,
  bill: FEATURE_KEYS.BILLS,
  friends: FEATURE_KEYS.FRIENDS,
  groups: FEATURE_KEYS.GROUPS,
  budgets: FEATURE_KEYS.BUDGETS,
  reports: FEATURE_KEYS.REPORTS,
  utilities: FEATURE_KEYS.UTILITIES,
  adminDashboard: SUB_FEATURE_KEYS.ADMIN_DASHBOARD,
  userManagement: SUB_FEATURE_KEYS.ADMIN_USERS,
  roleManagement: SUB_FEATURE_KEYS.ADMIN_ROLES,
  systemAnalytics: SUB_FEATURE_KEYS.ADMIN_ANALYTICS,
  auditLogs: SUB_FEATURE_KEYS.ADMIN_AUDIT,
  adminReports: SUB_FEATURE_KEYS.ADMIN_REPORTS,
  adminSettings: SUB_FEATURE_KEYS.ADMIN_SETTINGS,
  adminStories: SUB_FEATURE_KEYS.ADMIN_STORIES,
  storiesFeed: SUB_FEATURE_KEYS.STORIES_FEED,
};

const normalizePath = (path) => {
  if (!path || typeof path !== "string") {
    return "";
  }
  let normalized = path.trim();
  if (normalized.startsWith("#")) {
    return "";
  }
  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }
  if (normalized.length > 1 && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
};

const matchesPrefix = (path, prefix) =>
  path === prefix || path.startsWith(`${prefix}/`);

export const isFriendContextPath = (path) => {
  const normalized = normalizePath(path).toLowerCase();
  if (!normalized) {
    return false;
  }
  return (
    normalized.includes("/friend/") ||
    normalized.includes("/friend-") ||
    normalized.endsWith("/friend") ||
    /\/friends\/[^/]+/.test(normalized)
  );
};

export const getParentModule = (featureKey) => {
  if (!featureKey || !featureKey.includes(".")) {
    return featureKey;
  }
  return featureKey.split(".")[0];
};

export const buildDefaultModules = () =>
  ALL_FEATURE_KEYS.reduce((acc, key) => {
    // Dark-only by default until /api/config/features confirms otherwise
    acc[key] = key === FEATURE_KEYS.THEME_CUSTOMIZATION ? false : true;
    return acc;
  }, {});

export const buildDefaultSubFeatures = () =>
  ALL_SUB_FEATURE_KEYS.reduce((acc, key) => {
    acc[key] = true;
    return acc;
  }, {});

export const getFeatureForRoute = (path) => {
  const normalized = normalizePath(path);
  if (!normalized) {
    return null;
  }

  let bestMatch = null;
  let bestLength = -1;

  for (const definition of SUB_FEATURE_DEFINITIONS) {
    for (const prefix of definition.routes) {
      if (matchesPrefix(normalized, prefix) && prefix.length > bestLength) {
        bestMatch = definition.key;
        bestLength = prefix.length;
      }
    }
  }

  if (bestMatch) {
    return bestMatch;
  }

  for (const [prefix, moduleKey] of MODULE_ROUTE_PREFIXES) {
    if (matchesPrefix(normalized, prefix) && prefix.length > bestLength) {
      bestMatch = moduleKey;
      bestLength = prefix.length;
    }
  }

  return bestMatch;
};

export const isModuleEnabledInState = (featureFlagsState, moduleKey) => {
  if (!moduleKey || ALWAYS_ON_FEATURES.has(moduleKey)) {
    return true;
  }
  if (!featureFlagsState?.loaded) {
    return true;
  }
  if (!featureFlagsState.dormancyEnabled) {
    return true;
  }
  const moduleValue = featureFlagsState.modules?.[moduleKey];
  return moduleValue === undefined ? true : moduleValue;
};

export const isFeatureEnabledInState = (featureFlagsState, featureKey) => {
  if (!featureKey || ALWAYS_ON_FEATURES.has(featureKey)) {
    return true;
  }
  if (!featureFlagsState?.loaded) {
    return true;
  }
  if (!featureFlagsState.dormancyEnabled) {
    return true;
  }

  if (featureKey.includes(".")) {
    const parent = getParentModule(featureKey);
    if (!isModuleEnabledInState(featureFlagsState, parent)) {
      return false;
    }
    const subValue = featureFlagsState.subFeatures?.[featureKey];
    return subValue === undefined ? true : subValue;
  }

  return isModuleEnabledInState(featureFlagsState, featureKey);
};

export const hasUtilitiesHubContentInState = (featureFlagsState) =>
  UTILITIES_HUB_FEATURE_KEYS.some((key) =>
    isFeatureEnabledInState(featureFlagsState, key),
  );

export const isUtilitiesAccessibleInState = (featureFlagsState) =>
  isFeatureEnabledInState(featureFlagsState, SUB_FEATURE_KEYS.UTILITIES_TOOLS) &&
  hasUtilitiesHubContentInState(featureFlagsState);

export const isActionEnabledInState = (featureFlagsState, moduleKey, action) => {
  if (!moduleKey || !action) {
    return true;
  }
  return isFeatureEnabledInState(featureFlagsState, `${moduleKey}.${action}`);
};

export const isPathEnabledInState = (featureFlagsState, path) => {
  if (!featureFlagsState?.loaded || !featureFlagsState.dormancyEnabled) {
    return true;
  }

  if (isFriendContextPath(path) && !isModuleEnabledInState(featureFlagsState, FEATURE_KEYS.FRIENDS)) {
    return false;
  }

  const normalized = normalizePath(path);
  if (matchesPrefix(normalized, "/utilities")) {
    return isUtilitiesAccessibleInState(featureFlagsState);
  }

  const featureKey = getFeatureForRoute(path);
  if (!featureKey) {
    return true;
  }

  return isFeatureEnabledInState(featureFlagsState, featureKey);
};
