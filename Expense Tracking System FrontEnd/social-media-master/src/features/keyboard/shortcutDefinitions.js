/**
 * Shortcut Definitions - Central configuration for all keyboard shortcuts
 * 
 * This file contains:
 * 1. Default shortcuts for all application features
 * 2. Reserved browser/OS shortcuts that should never be overridden
 * 3. Shortcut categories and metadata
 * 
 * Components reference these definitions, but actual registration
 * happens through the ShortcutRegistry when components mount.
 */

/**
 * Shortcut categories for organization in help modal
 */
export const SHORTCUT_CATEGORIES = {
  NAVIGATION: "Navigation",
  EXPENSES: "Expenses",
  BUDGETS: "Budgets",
  BILLS: "Bills",
  CATEGORIES: "Categories",
  PAYMENTS: "Payment Methods",
  FRIENDS: "Friends",
  TABLES: "Table Navigation",
  FORMS: "Forms",
  MODALS: "Modals & Dialogs",
  SEARCH: "Search",
  GENERAL: "General",
  ADMIN: "Admin",
};

/**
 * Priority levels for shortcuts
 */
export const SHORTCUT_PRIORITY = {
  LOW: "LOW",
  NORMAL: "NORMAL",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
};

/**
 * Reserved shortcuts that should NEVER be overridden
 * These are browser/OS shortcuts that users expect to work normally
 */
export const RESERVED_SHORTCUTS = [
  // Browser essentials
  "mod+t", // New tab
  "mod+w", // Close tab
  "mod+q", // Quit browser
  "mod+n", // New window (will use mod+shift+n for new expense)
  "mod+shift+t", // Reopen closed tab
  "mod+l", // Focus address bar
  "mod+r", // Refresh
  "mod+shift+r", // Hard refresh
  "mod+d", // Bookmark
  "mod+p", // Print
  "mod+s", // Save (though we can override in app context)
  "mod+f", // Find (we'll use this for search)
  "mod+g", // Find next
  "mod+shift+g", // Find previous
  "mod+h", // History
  "mod+j", // Downloads

  // Text editing
  "mod+a", // Select all
  "mod+c", // Copy
  "mod+v", // Paste
  "mod+x", // Cut
  "mod+z", // Undo
  "mod+shift+z", // Redo
  "mod+y", // Redo (Windows)

  // Accessibility
  "mod++", // Zoom in
  "mod+-", // Zoom out
  "mod+0", // Reset zoom

  // Dev tools
  "mod+shift+i", // Dev tools
  "mod+shift+j", // Console
  "mod+shift+c", // Inspect element
  "f12", // Dev tools
];

/**
 * Default shortcuts for the application
 * These are the out-of-box shortcuts available to all users
 */
export const DEFAULT_SHORTCUTS = {
  // ═══════════════════════════════════════════════════════════════════
  // NAVIGATION SHORTCUTS
  // ═══════════════════════════════════════════════════════════════════
  
  GO_DASHBOARD: {
    id: "GO_DASHBOARD",
    keys: "g d",
    description: "Go to Dashboard",
    category: SHORTCUT_CATEGORIES.NAVIGATION,
    scope: "GLOBAL",
    priority: SHORTCUT_PRIORITY.HIGH,
    icon: "dashboard",
  },

  GO_EXPENSES: {
    id: "GO_EXPENSES",
    keys: "g e",
    description: "Go to Expenses",
    category: SHORTCUT_CATEGORIES.NAVIGATION,
    scope: "GLOBAL",
    priority: SHORTCUT_PRIORITY.HIGH,
    icon: "receipt",
  },

  GO_BUDGETS: {
    id: "GO_BUDGETS",
    keys: "g b",
    description: "Go to Budgets",
    category: SHORTCUT_CATEGORIES.NAVIGATION,
    scope: "GLOBAL",
    priority: SHORTCUT_PRIORITY.HIGH,
    icon: "account_balance_wallet",
  },

  GO_BILLS: {
    id: "GO_BILLS",
    keys: "g i",
    description: "Go to Bills",
    category: SHORTCUT_CATEGORIES.NAVIGATION,
    scope: "GLOBAL",
    priority: SHORTCUT_PRIORITY.NORMAL,
    icon: "receipt_long",
  },

  GO_CATEGORIES: {
    id: "GO_CATEGORIES",
    keys: "g c",
    description: "Go to Categories",
    category: SHORTCUT_CATEGORIES.NAVIGATION,
    scope: "GLOBAL",
    priority: SHORTCUT_PRIORITY.NORMAL,
    icon: "category",
  },

  GO_PAYMENTS: {
    id: "GO_PAYMENTS",
    keys: "g p",
    description: "Go to Payment Methods",
    category: SHORTCUT_CATEGORIES.NAVIGATION,
    scope: "GLOBAL",
    priority: SHORTCUT_PRIORITY.NORMAL,
    icon: "credit_card",
  },

  GO_FRIENDS: {
    id: "GO_FRIENDS",
    keys: "g f",
    description: "Go to Friends",
    category: SHORTCUT_CATEGORIES.NAVIGATION,
    scope: "GLOBAL",
    priority: SHORTCUT_PRIORITY.NORMAL,
    icon: "people",
  },

  GO_REPORTS: {
    id: "GO_REPORTS",
    keys: "g r",
    description: "Go to Reports",
    category: SHORTCUT_CATEGORIES.NAVIGATION,
    scope: "GLOBAL",
    priority: SHORTCUT_PRIORITY.NORMAL,
    icon: "analytics",
  },

  GO_CALENDAR: {
    id: "GO_CALENDAR",
    keys: "g a",
    description: "Go to Calendar",
    category: SHORTCUT_CATEGORIES.NAVIGATION,
    scope: "GLOBAL",
    priority: SHORTCUT_PRIORITY.NORMAL,
    icon: "calendar_month",
  },

  GO_SETTINGS: {
    id: "GO_SETTINGS",
    keys: "g s",
    description: "Go to Settings",
    category: SHORTCUT_CATEGORIES.NAVIGATION,
    scope: "GLOBAL",
    priority: SHORTCUT_PRIORITY.NORMAL,
    icon: "settings",
  },

  GO_PROFILE: {
    id: "GO_PROFILE",
    keys: "g u",
    description: "Go to Profile",
    category: SHORTCUT_CATEGORIES.NAVIGATION,
    scope: "GLOBAL",
    priority: SHORTCUT_PRIORITY.LOW,
    icon: "person",
  },

  // ═══════════════════════════════════════════════════════════════════
  // EXPENSE SHORTCUTS
  // ═══════════════════════════════════════════════════════════════════

  NEW_EXPENSE: {
    id: "NEW_EXPENSE",
    keys: "mod+shift+e",
    description: "Create new expense",
    category: SHORTCUT_CATEGORIES.EXPENSES,
    scope: "GLOBAL",
    priority: SHORTCUT_PRIORITY.HIGH,
    icon: "add_card",
  },

  DUPLICATE_EXPENSE: {
    id: "DUPLICATE_EXPENSE",
    keys: "mod+shift+d",
    description: "Duplicate selected expense",
    category: SHORTCUT_CATEGORIES.EXPENSES,
    scope: "PAGE",
    priority: SHORTCUT_PRIORITY.NORMAL,
    icon: "content_copy",
  },

  DELETE_EXPENSE: {
    id: "DELETE_EXPENSE",
    keys: "mod+backspace",
    description: "Delete selected expense",
    category: SHORTCUT_CATEGORIES.EXPENSES,
    scope: "PAGE",
    priority: SHORTCUT_PRIORITY.NORMAL,
    icon: "delete",
    destructive: true,
  },

  EDIT_EXPENSE: {
    id: "EDIT_EXPENSE",
    keys: "e",
    description: "Edit selected expense",
    category: SHORTCUT_CATEGORIES.EXPENSES,
    scope: "PAGE",
    priority: SHORTCUT_PRIORITY.NORMAL,
    icon: "edit",
  },

  // ═══════════════════════════════════════════════════════════════════
  // BUDGET SHORTCUTS
  // ═══════════════════════════════════════════════════════════════════

  NEW_BUDGET: {
    id: "NEW_BUDGET",
    keys: "mod+shift+b",
    description: "Create new budget",
    category: SHORTCUT_CATEGORIES.BUDGETS,
    scope: "GLOBAL",
    priority: SHORTCUT_PRIORITY.HIGH,
    icon: "savings",
  },

  VIEW_BUDGET_DETAILS: {
    id: "VIEW_BUDGET_DETAILS",
    keys: "enter",
    description: "View budget details",
    category: SHORTCUT_CATEGORIES.BUDGETS,
    scope: "PAGE",
    priority: SHORTCUT_PRIORITY.NORMAL,
    icon: "visibility",
  },

  // ═══════════════════════════════════════════════════════════════════
  // BILL SHORTCUTS
  // ═══════════════════════════════════════════════════════════════════

  NEW_BILL: {
    id: "NEW_BILL",
    keys: "mod+shift+i",
    description: "Create new bill",
    category: SHORTCUT_CATEGORIES.BILLS,
    scope: "GLOBAL",
    priority: SHORTCUT_PRIORITY.NORMAL,
    icon: "receipt_long",
  },

  MARK_BILL_PAID: {
    id: "MARK_BILL_PAID",
    keys: "p",
    description: "Mark bill as paid",
    category: SHORTCUT_CATEGORIES.BILLS,
    scope: "PAGE",
    priority: SHORTCUT_PRIORITY.NORMAL,
    icon: "check_circle",
  },

  // ═══════════════════════════════════════════════════════════════════
  // CATEGORY & PAYMENT SHORTCUTS
  // ═══════════════════════════════════════════════════════════════════

  NEW_CATEGORY: {
    id: "NEW_CATEGORY",
    keys: "mod+shift+c",
    description: "Create new category",
    category: SHORTCUT_CATEGORIES.CATEGORIES,
    scope: "GLOBAL",
    priority: SHORTCUT_PRIORITY.NORMAL,
    icon: "create_new_folder",
  },

  NEW_PAYMENT_METHOD: {
    id: "NEW_PAYMENT_METHOD",
    keys: "mod+shift+p",
    description: "Add payment method",
    category: SHORTCUT_CATEGORIES.PAYMENTS,
    scope: "GLOBAL",
    priority: SHORTCUT_PRIORITY.NORMAL,
    icon: "add_card",
  },

  // ═══════════════════════════════════════════════════════════════════
  // TABLE NAVIGATION SHORTCUTS
  // ═══════════════════════════════════════════════════════════════════

  TABLE_NEXT_ROW: {
    id: "TABLE_NEXT_ROW",
    keys: "j",
    description: "Next row",
    category: SHORTCUT_CATEGORIES.TABLES,
    scope: "COMPONENT",
    priority: SHORTCUT_PRIORITY.NORMAL,
    icon: "arrow_downward",
  },

  TABLE_PREV_ROW: {
    id: "TABLE_PREV_ROW",
    keys: "k",
    description: "Previous row",
    category: SHORTCUT_CATEGORIES.TABLES,
    scope: "COMPONENT",
    priority: SHORTCUT_PRIORITY.NORMAL,
    icon: "arrow_upward",
  },

  TABLE_SELECT_ROW: {
    id: "TABLE_SELECT_ROW",
    keys: "x",
    description: "Select/deselect row",
    category: SHORTCUT_CATEGORIES.TABLES,
    scope: "COMPONENT",
    priority: SHORTCUT_PRIORITY.NORMAL,
    icon: "check_box",
  },

  TABLE_SELECT_ALL: {
    id: "TABLE_SELECT_ALL",
    keys: "mod+shift+a",
    description: "Select all rows",
    category: SHORTCUT_CATEGORIES.TABLES,
    scope: "COMPONENT",
    priority: SHORTCUT_PRIORITY.NORMAL,
    icon: "select_all",
  },

  TABLE_FIRST_ROW: {
    id: "TABLE_FIRST_ROW",
    keys: "shift+g g",
    description: "Go to first row",
    category: SHORTCUT_CATEGORIES.TABLES,
    scope: "COMPONENT",
    priority: SHORTCUT_PRIORITY.LOW,
    icon: "first_page",
  },

  TABLE_LAST_ROW: {
    id: "TABLE_LAST_ROW",
    keys: "shift+g",
    description: "Go to last row",
    category: SHORTCUT_CATEGORIES.TABLES,
    scope: "COMPONENT",
    priority: SHORTCUT_PRIORITY.LOW,
    icon: "last_page",
  },

  // ═══════════════════════════════════════════════════════════════════
  // FORM SHORTCUTS
  // ═══════════════════════════════════════════════════════════════════

  FORM_SUBMIT: {
    id: "FORM_SUBMIT",
    keys: "mod+enter",
    description: "Submit form",
    category: SHORTCUT_CATEGORIES.FORMS,
    scope: "COMPONENT",
    priority: SHORTCUT_PRIORITY.HIGH,
    globalOverride: true,
    icon: "send",
  },

  FORM_CANCEL: {
    id: "FORM_CANCEL",
    keys: "escape",
    description: "Cancel / Close form",
    category: SHORTCUT_CATEGORIES.FORMS,
    scope: "COMPONENT",
    priority: SHORTCUT_PRIORITY.HIGH,
    globalOverride: true,
    icon: "close",
  },

  FORM_RESET: {
    id: "FORM_RESET",
    keys: "mod+shift+backspace",
    description: "Reset form",
    category: SHORTCUT_CATEGORIES.FORMS,
    scope: "COMPONENT",
    priority: SHORTCUT_PRIORITY.NORMAL,
    icon: "refresh",
  },

  // ═══════════════════════════════════════════════════════════════════
  // MODAL SHORTCUTS
  // ═══════════════════════════════════════════════════════════════════

  MODAL_CLOSE: {
    id: "MODAL_CLOSE",
    keys: "escape",
    description: "Close modal",
    category: SHORTCUT_CATEGORIES.MODALS,
    scope: "MODAL",
    priority: SHORTCUT_PRIORITY.CRITICAL,
    globalOverride: true,
    icon: "close",
  },

  MODAL_CONFIRM: {
    id: "MODAL_CONFIRM",
    keys: "enter",
    description: "Confirm action",
    category: SHORTCUT_CATEGORIES.MODALS,
    scope: "MODAL",
    priority: SHORTCUT_PRIORITY.HIGH,
    icon: "check",
  },

  // ═══════════════════════════════════════════════════════════════════
  // SEARCH SHORTCUTS
  // ═══════════════════════════════════════════════════════════════════

  OPEN_SEARCH: {
    id: "OPEN_SEARCH",
    keys: "mod+k",
    description: "Open universal search",
    category: SHORTCUT_CATEGORIES.SEARCH,
    scope: "GLOBAL",
    priority: SHORTCUT_PRIORITY.CRITICAL,
    globalOverride: true,
    icon: "search",
  },

  FOCUS_SEARCH: {
    id: "FOCUS_SEARCH",
    keys: "/",
    description: "Focus search input",
    category: SHORTCUT_CATEGORIES.SEARCH,
    scope: "GLOBAL",
    priority: SHORTCUT_PRIORITY.HIGH,
    icon: "search",
  },

  CLEAR_SEARCH: {
    id: "CLEAR_SEARCH",
    keys: "escape",
    description: "Clear search",
    category: SHORTCUT_CATEGORIES.SEARCH,
    scope: "COMPONENT",
    priority: SHORTCUT_PRIORITY.NORMAL,
    icon: "clear",
  },

  // ═══════════════════════════════════════════════════════════════════
  // GENERAL SHORTCUTS
  // ═══════════════════════════════════════════════════════════════════

  SHOW_SHORTCUTS: {
    id: "SHOW_SHORTCUTS",
    keys: "mod+/",
    description: "Show keyboard shortcuts",
    category: SHORTCUT_CATEGORIES.GENERAL,
    scope: "GLOBAL",
    priority: SHORTCUT_PRIORITY.HIGH,
    globalOverride: true,
    icon: "keyboard",
  },

  TOGGLE_THEME: {
    id: "TOGGLE_THEME",
    keys: "mod+shift+l",
    description: "Toggle light/dark theme",
    category: SHORTCUT_CATEGORIES.GENERAL,
    scope: "GLOBAL",
    priority: SHORTCUT_PRIORITY.NORMAL,
    icon: "dark_mode",
  },

  TOGGLE_SIDEBAR: {
    id: "TOGGLE_SIDEBAR",
    keys: "mod+\\",
    description: "Toggle sidebar",
    category: SHORTCUT_CATEGORIES.GENERAL,
    scope: "GLOBAL",
    priority: SHORTCUT_PRIORITY.NORMAL,
    icon: "menu",
  },

  TOGGLE_MASKING: {
    id: "TOGGLE_MASKING",
    keys: "mod+shift+m",
    description: "Toggle sensitive data masking",
    category: SHORTCUT_CATEGORIES.GENERAL,
    scope: "GLOBAL",
    priority: SHORTCUT_PRIORITY.NORMAL,
    icon: "visibility_off",
  },

  REFRESH_DATA: {
    id: "REFRESH_DATA",
    keys: "mod+shift+r",
    description: "Refresh current data",
    category: SHORTCUT_CATEGORIES.GENERAL,
    scope: "PAGE",
    priority: SHORTCUT_PRIORITY.NORMAL,
    icon: "refresh",
  },

  EXPORT_DATA: {
    id: "EXPORT_DATA",
    keys: "mod+shift+x",
    description: "Export data",
    category: SHORTCUT_CATEGORIES.GENERAL,
    scope: "PAGE",
    priority: SHORTCUT_PRIORITY.LOW,
    icon: "download",
  },

  // ═══════════════════════════════════════════════════════════════════
  // ADMIN SHORTCUTS
  // ═══════════════════════════════════════════════════════════════════

  GO_ADMIN: {
    id: "GO_ADMIN",
    keys: "g x",
    description: "Go to Admin Dashboard",
    category: SHORTCUT_CATEGORIES.ADMIN,
    scope: "GLOBAL",
    priority: SHORTCUT_PRIORITY.LOW,
    icon: "admin_panel_settings",
    requiresRole: "ADMIN",
  },
};

/**
 * Get all shortcuts as an array
 */
export function getAllDefaultShortcuts() {
  return Object.values(DEFAULT_SHORTCUTS);
}

/**
 * Get shortcuts grouped by category
 */
export function getShortcutsByCategory() {
  const grouped = {};

  Object.values(DEFAULT_SHORTCUTS).forEach((shortcut) => {
    const category = shortcut.category || SHORTCUT_CATEGORIES.GENERAL;
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(shortcut);
  });

  return grouped;
}

/**
 * Get a specific shortcut by ID
 */
export function getShortcutById(id) {
  return DEFAULT_SHORTCUTS[id] || null;
}

/**
 * Check if a key combination is reserved
 */
export function isReserved(keys) {
  const normalized = keys.toLowerCase().replace(/ctrl|cmd|meta/g, "mod");
  return RESERVED_SHORTCUTS.some(
    (reserved) => reserved.toLowerCase() === normalized
  );
}

export default DEFAULT_SHORTCUTS;
