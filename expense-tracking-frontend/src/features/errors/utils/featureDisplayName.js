import { getParentModule } from "../../../config/featureCatalog";

const MODULE_DISPLAY_NAMES = {
  expenses: "Expenses",
  budgets: "Budgets",
  categories: "Categories",
  paymentMethods: "Payment Methods",
  bills: "Bills",
  friends: "Friends",
  groups: "Groups",
  sharing: "Sharing",
  reports: "Reports",
  calendar: "Calendar",
  upload: "Upload",
  utilities: "Utilities",
  chat: "Chat",
  stories: "Stories",
  investment: "Investment",
  analytics: "Analytics",
  notifications: "Notifications",
  keyboardShortcuts: "Keyboard Shortcuts",
  search: "Search",
  events: "Events",
  helpSupport: "Help & Support",
  admin: "Admin",
  auth: "Authentication",
  themeCustomization: "Theme Customization",
  dashboard: "Dashboard",
  settings: "Settings",
  profile: "Profile",
};

const formatToken = (token) =>
  token
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const getFeatureDisplayName = (featureKey) => {
  if (!featureKey) {
    return "This feature";
  }

  const moduleKey = getParentModule(featureKey) || featureKey.split(".")[0];
  if (MODULE_DISPLAY_NAMES[moduleKey]) {
    return MODULE_DISPLAY_NAMES[moduleKey];
  }

  return formatToken(moduleKey);
};
