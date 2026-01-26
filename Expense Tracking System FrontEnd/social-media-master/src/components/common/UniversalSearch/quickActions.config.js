/**
 * Quick Actions Configuration for Universal Search
 * Defines all navigable actions, routes, and searchable entities
 *
 * To add new searchable items:
 * 1. Add to QUICK_ACTIONS array with appropriate category
 * 2. Ensure route exists in AppRoutes.js
 * 3. Add translation keys if needed
 */

// Search result types
export const SEARCH_TYPES = {
  EXPENSE: "EXPENSE",
  BUDGET: "BUDGET",
  CATEGORY: "CATEGORY",
  BILL: "BILL",
  PAYMENT_METHOD: "PAYMENT_METHOD",
  FRIEND: "FRIEND",
  ACTION: "ACTION",
  REPORT: "REPORT",
  SETTING: "SETTING",
  NOTIFICATION: "NOTIFICATION",
};

// Icons mapping for each type
export const TYPE_ICONS = {
  [SEARCH_TYPES.EXPENSE]: "💰",
  [SEARCH_TYPES.BUDGET]: "📊",
  [SEARCH_TYPES.CATEGORY]: "🏷️",
  [SEARCH_TYPES.BILL]: "📄",
  [SEARCH_TYPES.PAYMENT_METHOD]: "💳",
  [SEARCH_TYPES.FRIEND]: "👥",
  [SEARCH_TYPES.ACTION]: "⚡",
  [SEARCH_TYPES.REPORT]: "📈",
  [SEARCH_TYPES.SETTING]: "⚙️",
  [SEARCH_TYPES.NOTIFICATION]: "🔔",
};

// Section display order
export const SECTION_ORDER = [
  "actions",
  "expenses",
  "budgets",
  "categories",
  "bills",
  "payment_methods",
  "friends",
  "reports",
  "settings",
  "notifications",
];

// Section labels (translation keys)
export const SECTION_LABELS = {
  actions: "search.sections.quickActions",
  expenses: "search.sections.expenses",
  budgets: "search.sections.budgets",
  categories: "search.sections.categories",
  bills: "search.sections.bills",
  payment_methods: "search.sections.paymentMethods",
  friends: "search.sections.friends",
  reports: "search.sections.reports",
  settings: "search.sections.settings",
  notifications: "search.sections.notifications",
};

/**
 * Quick Actions - Static navigation actions always available
 * These are hardcoded and don't require backend search
 */
export const QUICK_ACTIONS = [
  // Expense Actions
  {
    id: "create-expense",
    type: SEARCH_TYPES.ACTION,
    section: "actions",
    title: "Add Expense",
    titleKey: "search.actions.addExpense",
    subtitle: "Create a new expense entry",
    subtitleKey: "search.actions.addExpenseDesc",
    route: "/expenses/create",
    icon: "➕",
    keywords: ["add", "create", "new", "expense", "spending", "transaction"],
    priority: 1,
  },
  {
    id: "view-expenses",
    type: SEARCH_TYPES.ACTION,
    section: "actions",
    title: "View All Expenses",
    titleKey: "search.actions.viewExpenses",
    subtitle: "Browse your expense history",
    subtitleKey: "search.actions.viewExpensesDesc",
    route: "/expenses",
    icon: "📋",
    keywords: ["view", "all", "expenses", "list", "history"],
    priority: 2,
  },
  {
    id: "expense-reports",
    type: SEARCH_TYPES.ACTION,
    section: "reports",
    title: "Expense Reports",
    titleKey: "search.actions.expenseReports",
    subtitle: "View expense analytics and reports",
    subtitleKey: "search.actions.expenseReportsDesc",
    route: "/expenses/reports",
    icon: "📊",
    keywords: ["expense", "report", "analytics", "summary", "chart"],
    priority: 3,
  },

  // Budget Actions
  {
    id: "create-budget",
    type: SEARCH_TYPES.ACTION,
    section: "actions",
    title: "Create Budget",
    titleKey: "search.actions.createBudget",
    subtitle: "Set up a new budget",
    subtitleKey: "search.actions.createBudgetDesc",
    route: "/budget/create",
    icon: "📊",
    keywords: ["add", "create", "new", "budget", "limit", "spending limit"],
    priority: 1,
  },
  {
    id: "view-budgets",
    type: SEARCH_TYPES.ACTION,
    section: "actions",
    title: "View Budgets",
    titleKey: "search.actions.viewBudgets",
    subtitle: "Manage your budgets",
    subtitleKey: "search.actions.viewBudgetsDesc",
    route: "/budget",
    icon: "💵",
    keywords: ["view", "budgets", "list", "manage"],
    priority: 2,
  },
  {
    id: "budget-reports",
    type: SEARCH_TYPES.ACTION,
    section: "reports",
    title: "Budget Reports",
    titleKey: "search.actions.budgetReports",
    subtitle: "View budget analytics",
    subtitleKey: "search.actions.budgetReportsDesc",
    route: "/budget/reports",
    icon: "📈",
    keywords: ["budget", "report", "analytics", "summary"],
    priority: 3,
  },

  // Bill Actions
  {
    id: "create-bill",
    type: SEARCH_TYPES.ACTION,
    section: "actions",
    title: "Create Bill",
    titleKey: "search.actions.createBill",
    subtitle: "Add a new recurring bill",
    subtitleKey: "search.actions.createBillDesc",
    route: "/bill/create",
    icon: "📄",
    keywords: ["add", "create", "new", "bill", "recurring", "subscription"],
    priority: 1,
  },
  {
    id: "view-bills",
    type: SEARCH_TYPES.ACTION,
    section: "actions",
    title: "View Bills",
    titleKey: "search.actions.viewBills",
    subtitle: "Manage your bills",
    subtitleKey: "search.actions.viewBillsDesc",
    route: "/bill",
    icon: "📑",
    keywords: ["view", "bills", "list", "subscriptions", "recurring"],
    priority: 2,
  },
  {
    id: "bill-calendar",
    type: SEARCH_TYPES.ACTION,
    section: "actions",
    title: "Bill Calendar",
    titleKey: "search.actions.billCalendar",
    subtitle: "View bills on calendar",
    subtitleKey: "search.actions.billCalendarDesc",
    route: "/bill/calendar",
    icon: "📅",
    keywords: ["bill", "calendar", "schedule", "due date"],
    priority: 3,
  },
  {
    id: "bill-reports",
    type: SEARCH_TYPES.ACTION,
    section: "reports",
    title: "Bill Reports",
    titleKey: "search.actions.billReports",
    subtitle: "View bill analytics",
    subtitleKey: "search.actions.billReportsDesc",
    route: "/bill/report",
    icon: "📊",
    keywords: ["bill", "report", "analytics"],
    priority: 3,
  },

  // Category Actions
  {
    id: "create-category",
    type: SEARCH_TYPES.ACTION,
    section: "actions",
    title: "Create Category",
    titleKey: "search.actions.createCategory",
    subtitle: "Add a new expense category",
    subtitleKey: "search.actions.createCategoryDesc",
    route: "/category-flow/create",
    icon: "🏷️",
    keywords: ["add", "create", "new", "category", "tag", "label"],
    priority: 1,
  },
  {
    id: "view-categories",
    type: SEARCH_TYPES.ACTION,
    section: "actions",
    title: "View Categories",
    titleKey: "search.actions.viewCategories",
    subtitle: "Manage expense categories",
    subtitleKey: "search.actions.viewCategoriesDesc",
    route: "/category-flow",
    icon: "🗂️",
    keywords: ["view", "categories", "list", "tags"],
    priority: 2,
  },
  {
    id: "category-reports",
    type: SEARCH_TYPES.ACTION,
    section: "reports",
    title: "Category Reports",
    titleKey: "search.actions.categoryReports",
    subtitle: "View spending by category",
    subtitleKey: "search.actions.categoryReportsDesc",
    route: "/category-flow/reports",
    icon: "📊",
    keywords: ["category", "report", "analytics", "breakdown"],
    priority: 3,
  },

  // Payment Method Actions
  {
    id: "create-payment-method",
    type: SEARCH_TYPES.ACTION,
    section: "actions",
    title: "Add Payment Method",
    titleKey: "search.actions.addPaymentMethod",
    subtitle: "Add a new payment method",
    subtitleKey: "search.actions.addPaymentMethodDesc",
    route: "/payment-method/create",
    icon: "💳",
    keywords: [
      "add",
      "create",
      "new",
      "payment",
      "method",
      "card",
      "bank",
      "wallet",
    ],
    priority: 1,
  },
  {
    id: "view-payment-methods",
    type: SEARCH_TYPES.ACTION,
    section: "actions",
    title: "View Payment Methods",
    titleKey: "search.actions.viewPaymentMethods",
    subtitle: "Manage your payment methods",
    subtitleKey: "search.actions.viewPaymentMethodsDesc",
    route: "/payment-method",
    icon: "💰",
    keywords: ["view", "payment", "methods", "cards", "banks"],
    priority: 2,
  },
  {
    id: "payment-reports",
    type: SEARCH_TYPES.ACTION,
    section: "reports",
    title: "Payment Method Reports",
    titleKey: "search.actions.paymentReports",
    subtitle: "View spending by payment method",
    subtitleKey: "search.actions.paymentReportsDesc",
    route: "/payment-method/reports",
    icon: "📊",
    keywords: ["payment", "method", "report", "analytics"],
    priority: 3,
  },

  // Dashboard & General
  {
    id: "dashboard",
    type: SEARCH_TYPES.ACTION,
    section: "actions",
    title: "Dashboard",
    titleKey: "search.actions.dashboard",
    subtitle: "Go to main dashboard",
    subtitleKey: "search.actions.dashboardDesc",
    route: "/dashboard",
    icon: "🏠",
    keywords: ["home", "dashboard", "main", "overview"],
    priority: 0,
  },
  {
    id: "calendar-view",
    type: SEARCH_TYPES.ACTION,
    section: "actions",
    title: "Calendar View",
    titleKey: "search.actions.calendarView",
    subtitle: "View expenses on calendar",
    subtitleKey: "search.actions.calendarViewDesc",
    route: "/calendar-view",
    icon: "📅",
    keywords: ["calendar", "date", "schedule", "view"],
    priority: 2,
  },
  {
    id: "transactions",
    type: SEARCH_TYPES.ACTION,
    section: "actions",
    title: "Transactions",
    titleKey: "search.actions.transactions",
    subtitle: "View all transactions",
    subtitleKey: "search.actions.transactionsDesc",
    route: "/transactions",
    icon: "📝",
    keywords: ["transactions", "history", "all", "records"],
    priority: 2,
  },
  {
    id: "all-reports",
    type: SEARCH_TYPES.ACTION,
    section: "reports",
    title: "All Reports",
    titleKey: "search.actions.allReports",
    subtitle: "View comprehensive reports",
    subtitleKey: "search.actions.allReportsDesc",
    route: "/reports",
    icon: "📈",
    keywords: ["reports", "analytics", "insights", "summary", "all"],
    priority: 1,
  },
  {
    id: "insights",
    type: SEARCH_TYPES.ACTION,
    section: "reports",
    title: "Insights",
    titleKey: "search.actions.insights",
    subtitle: "View spending insights",
    subtitleKey: "search.actions.insightsDesc",
    route: "/insights",
    icon: "💡",
    keywords: ["insights", "analytics", "trends", "patterns"],
    priority: 2,
  },

  // Friends
  {
    id: "view-friends",
    type: SEARCH_TYPES.ACTION,
    section: "actions",
    title: "Friends",
    titleKey: "search.actions.viewFriends",
    subtitle: "Manage your friends",
    subtitleKey: "search.actions.viewFriendsDesc",
    route: "/friends",
    icon: "👥",
    keywords: ["friends", "connections", "share", "family"],
    priority: 2,
  },
  {
    id: "friend-activity",
    type: SEARCH_TYPES.ACTION,
    section: "actions",
    title: "Friend Activity",
    titleKey: "search.actions.friendActivity",
    subtitle: "View friend activities",
    subtitleKey: "search.actions.friendActivityDesc",
    route: "/friends/activity",
    icon: "📢",
    keywords: ["friend", "activity", "feed", "updates"],
    priority: 3,
  },

  // Groups
  {
    id: "view-groups",
    type: SEARCH_TYPES.ACTION,
    section: "actions",
    title: "Groups",
    titleKey: "search.actions.viewGroups",
    subtitle: "Manage expense groups",
    subtitleKey: "search.actions.viewGroupsDesc",
    route: "/groups",
    icon: "👨‍👩‍👧‍👦",
    keywords: ["groups", "team", "shared", "split"],
    priority: 2,
  },
  {
    id: "create-group",
    type: SEARCH_TYPES.ACTION,
    section: "actions",
    title: "Create Group",
    titleKey: "search.actions.createGroup",
    subtitle: "Create a new expense group",
    subtitleKey: "search.actions.createGroupDesc",
    route: "/groups/create",
    icon: "➕",
    keywords: ["create", "new", "group", "team"],
    priority: 1,
  },

  // ========================================
  // SETTINGS - General
  // ========================================
  {
    id: "settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Settings",
    titleKey: "search.actions.settings",
    subtitle: "App settings and preferences",
    subtitleKey: "search.actions.settingsDesc",
    route: "/settings",
    icon: "⚙️",
    keywords: ["settings", "preferences", "config", "options", "configure"],
    priority: 1,
  },
  {
    id: "profile",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Profile",
    titleKey: "search.actions.profile",
    subtitle: "View and edit your profile",
    subtitleKey: "search.actions.profileDesc",
    route: "/profile",
    icon: "👤",
    keywords: ["profile", "account", "user", "personal", "my account"],
    priority: 1,
  },

  // ========================================
  // SETTINGS - Appearance
  // ========================================
  {
    id: "theme-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Theme / Dark Mode",
    titleKey: "search.settings.theme",
    subtitle: "Toggle between light and dark theme",
    subtitleKey: "search.settings.themeDesc",
    route: "/settings?section=appearance",
    icon: "🌙",
    keywords: ["theme", "dark", "light", "mode", "appearance", "color", "night"],
    priority: 1,
  },
  {
    id: "font-size-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Font Size",
    titleKey: "search.settings.fontSize",
    subtitle: "Adjust text size for better readability",
    subtitleKey: "search.settings.fontSizeDesc",
    route: "/settings?section=appearance",
    icon: "🔤",
    keywords: ["font", "size", "text", "bigger", "smaller", "readability"],
    priority: 2,
  },
  {
    id: "compact-mode-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Compact Mode",
    titleKey: "search.settings.compactMode",
    subtitle: "Display more content with reduced spacing",
    subtitleKey: "search.settings.compactModeDesc",
    route: "/settings?section=appearance",
    icon: "📐",
    keywords: ["compact", "dense", "spacing", "layout", "view"],
    priority: 2,
  },
  {
    id: "animations-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Animations",
    titleKey: "search.settings.animations",
    subtitle: "Enable or disable smooth transitions",
    subtitleKey: "search.settings.animationsDesc",
    route: "/settings?section=appearance",
    icon: "✨",
    keywords: ["animations", "transitions", "effects", "motion"],
    priority: 3,
  },
  {
    id: "high-contrast-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "High Contrast Mode",
    titleKey: "search.settings.highContrast",
    subtitle: "Enhanced visibility for better accessibility",
    subtitleKey: "search.settings.highContrastDesc",
    route: "/settings?section=appearance",
    icon: "🔲",
    keywords: ["high contrast", "contrast", "visibility", "accessibility"],
    priority: 3,
  },

  // ========================================
  // SETTINGS - Preferences
  // ========================================
  {
    id: "language-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Language",
    titleKey: "search.settings.language",
    subtitle: "Choose your preferred language",
    subtitleKey: "search.settings.languageDesc",
    route: "/settings?section=preferences",
    icon: "🌐",
    keywords: ["language", "english", "hindi", "telugu", "locale", "translation"],
    priority: 1,
  },
  {
    id: "currency-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Currency",
    titleKey: "search.settings.currency",
    subtitle: "Set your default currency for transactions",
    subtitleKey: "search.settings.currencyDesc",
    route: "/settings?section=preferences",
    icon: "💵",
    keywords: ["currency", "money", "dollar", "rupee", "euro", "usd", "inr"],
    priority: 1,
  },
  {
    id: "date-format-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Date Format",
    titleKey: "search.settings.dateFormat",
    subtitle: "Choose how dates are displayed",
    subtitleKey: "search.settings.dateFormatDesc",
    route: "/settings?section=preferences",
    icon: "📅",
    keywords: ["date", "format", "mm/dd", "dd/mm", "iso", "calendar"],
    priority: 2,
  },
  {
    id: "time-format-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Time Format",
    titleKey: "search.settings.timeFormat",
    subtitle: "Choose 12-hour or 24-hour time format",
    subtitleKey: "search.settings.timeFormatDesc",
    route: "/settings?section=preferences",
    icon: "🕐",
    keywords: ["time", "format", "12 hour", "24 hour", "clock", "am", "pm"],
    priority: 2,
  },

  // ========================================
  // SETTINGS - Privacy & Security
  // ========================================
  {
    id: "privacy-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Privacy & Security",
    titleKey: "search.settings.privacy",
    subtitle: "Manage your privacy and security settings",
    subtitleKey: "search.settings.privacyDesc",
    route: "/settings?section=privacy_security",
    icon: "🛡️",
    keywords: ["privacy", "security", "protection", "safety"],
    priority: 1,
  },
  {
    id: "profile-visibility-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Profile Visibility",
    titleKey: "search.settings.profileVisibility",
    subtitle: "Control who can see your profile",
    subtitleKey: "search.settings.profileVisibilityDesc",
    route: "/settings?section=privacy_security",
    icon: "👁️",
    keywords: ["visibility", "public", "private", "friends", "who can see"],
    priority: 2,
  },
  {
    id: "mask-sensitive-data-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Mask Sensitive Data",
    titleKey: "search.settings.maskData",
    subtitle: "Hide expense amounts and financial details",
    subtitleKey: "search.settings.maskDataDesc",
    route: "/settings?section=privacy_security",
    icon: "🙈",
    keywords: ["mask", "hide", "sensitive", "amount", "financial", "blur"],
    priority: 2,
  },
  {
    id: "two-factor-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Two-Factor Authentication",
    titleKey: "search.settings.twoFactor",
    subtitle: "Add extra security with 2FA via email OTP",
    subtitleKey: "search.settings.twoFactorDesc",
    route: "/settings?section=privacy_security",
    icon: "🔐",
    keywords: ["two factor", "2fa", "authentication", "otp", "security", "email"],
    priority: 1,
  },
  {
    id: "mfa-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Authenticator App (MFA)",
    titleKey: "search.settings.mfa",
    subtitle: "Configure Google Authenticator for enhanced security",
    subtitleKey: "search.settings.mfaDesc",
    route: "/settings?section=privacy_security",
    icon: "📱",
    keywords: ["mfa", "authenticator", "google", "security", "app", "totp"],
    priority: 1,
  },
  {
    id: "blocked-users-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Blocked Users",
    titleKey: "search.settings.blockedUsers",
    subtitle: "Manage blocked users and privacy",
    subtitleKey: "search.settings.blockedUsersDesc",
    route: "/settings?section=privacy_security",
    icon: "🚫",
    keywords: ["blocked", "users", "block", "unblock", "manage"],
    priority: 3,
  },
  {
    id: "auto-logout-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Auto Logout",
    titleKey: "search.settings.autoLogout",
    subtitle: "Automatically log out after inactivity",
    subtitleKey: "search.settings.autoLogoutDesc",
    route: "/settings?section=privacy_security",
    icon: "⏱️",
    keywords: ["auto", "logout", "timeout", "session", "inactivity"],
    priority: 3,
  },
  {
    id: "change-password-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Change Password",
    titleKey: "search.settings.changePassword",
    subtitle: "Update your account password",
    subtitleKey: "search.settings.changePasswordDesc",
    route: "/settings?section=account",
    icon: "🔑",
    keywords: ["password", "change", "update", "reset", "security"],
    priority: 1,
  },

  // ========================================
  // SETTINGS - Data & Storage
  // ========================================
  {
    id: "data-storage-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Data & Storage",
    titleKey: "search.settings.dataStorage",
    subtitle: "Manage your data backup and storage",
    subtitleKey: "search.settings.dataStorageDesc",
    route: "/settings?section=data_storage",
    icon: "💾",
    keywords: ["data", "storage", "backup", "export", "import"],
    priority: 2,
  },
  {
    id: "auto-backup-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Auto Backup",
    titleKey: "search.settings.autoBackup",
    subtitle: "Automatically backup your data to cloud",
    subtitleKey: "search.settings.autoBackupDesc",
    route: "/settings?section=data_storage",
    icon: "☁️",
    keywords: ["auto", "backup", "cloud", "automatic", "save"],
    priority: 2,
  },
  {
    id: "backup-frequency-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Backup Frequency",
    titleKey: "search.settings.backupFrequency",
    subtitle: "How often to backup your data",
    subtitleKey: "search.settings.backupFrequencyDesc",
    route: "/settings?section=data_storage",
    icon: "🔄",
    keywords: ["backup", "frequency", "daily", "weekly", "monthly", "schedule"],
    priority: 3,
  },
  {
    id: "cloud-sync-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Cloud Sync",
    titleKey: "search.settings.cloudSync",
    subtitle: "Sync data across all your devices",
    subtitleKey: "search.settings.cloudSyncDesc",
    route: "/settings?section=data_storage",
    icon: "🔁",
    keywords: ["cloud", "sync", "synchronize", "devices", "cross device"],
    priority: 2,
  },
  {
    id: "storage-usage-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Storage Usage",
    titleKey: "search.settings.storageUsage",
    subtitle: "View your data storage usage",
    subtitleKey: "search.settings.storageUsageDesc",
    route: "/settings?section=data_storage",
    icon: "📊",
    keywords: ["storage", "usage", "space", "disk", "memory"],
    priority: 3,
  },
  {
    id: "clear-cache-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Clear Cache",
    titleKey: "search.settings.clearCache",
    subtitle: "Free up space by clearing cached data",
    subtitleKey: "search.settings.clearCacheDesc",
    route: "/settings?section=data_storage",
    icon: "🧹",
    keywords: ["clear", "cache", "clean", "free space", "delete"],
    priority: 3,
  },
  {
    id: "data-export-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Export Data",
    titleKey: "search.settings.exportData",
    subtitle: "Download all your expense data",
    subtitleKey: "search.settings.exportDataDesc",
    route: "/settings?section=account",
    icon: "📤",
    keywords: ["export", "download", "data", "backup", "csv", "excel"],
    priority: 2,
  },

  // ========================================
  // SETTINGS - Smart Features
  // ========================================
  {
    id: "smart-features-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Smart Features",
    titleKey: "search.settings.smartFeatures",
    subtitle: "AI-powered automation and suggestions",
    subtitleKey: "search.settings.smartFeaturesDesc",
    route: "/settings?section=smart_features",
    icon: "🧠",
    keywords: ["smart", "ai", "automation", "intelligent", "features"],
    priority: 2,
  },
  {
    id: "auto-categorize-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Auto-Categorize Expenses",
    titleKey: "search.settings.autoCategorize",
    subtitle: "AI-powered automatic expense categorization",
    subtitleKey: "search.settings.autoCategorizeDesc",
    route: "/settings?section=smart_features",
    icon: "🏷️",
    keywords: ["auto", "categorize", "ai", "automatic", "category", "smart"],
    priority: 2,
  },
  {
    id: "smart-budgeting-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Smart Budget Suggestions",
    titleKey: "search.settings.smartBudgeting",
    subtitle: "Get AI recommendations for better budgeting",
    subtitleKey: "search.settings.smartBudgetingDesc",
    route: "/settings?section=smart_features",
    icon: "💡",
    keywords: ["smart", "budget", "suggestions", "ai", "recommendations"],
    priority: 2,
  },
  {
    id: "scheduled-reports-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Scheduled Reports",
    titleKey: "search.settings.scheduledReports",
    subtitle: "Receive automated expense reports",
    subtitleKey: "search.settings.scheduledReportsDesc",
    route: "/settings?section=smart_features",
    icon: "📅",
    keywords: ["scheduled", "reports", "automatic", "email", "summary"],
    priority: 2,
  },
  {
    id: "expense-reminders-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Expense Reminders",
    titleKey: "search.settings.expenseReminders",
    subtitle: "Get reminders for recurring expenses",
    subtitleKey: "search.settings.expenseRemindersDesc",
    route: "/settings?section=smart_features",
    icon: "⏰",
    keywords: ["expense", "reminders", "recurring", "alert", "remind"],
    priority: 2,
  },
  {
    id: "predictive-analytics-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Predictive Analytics",
    titleKey: "search.settings.predictiveAnalytics",
    subtitle: "Forecast future expenses based on patterns",
    subtitleKey: "search.settings.predictiveAnalyticsDesc",
    route: "/settings?section=smart_features",
    icon: "📈",
    keywords: ["predictive", "analytics", "forecast", "future", "patterns"],
    priority: 3,
  },

  // ========================================
  // SETTINGS - Accessibility
  // ========================================
  {
    id: "accessibility-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Accessibility",
    titleKey: "search.settings.accessibility",
    subtitle: "Configure accessibility options",
    subtitleKey: "search.settings.accessibilityDesc",
    route: "/settings?section=accessibility",
    icon: "♿",
    keywords: ["accessibility", "a11y", "accessible", "screen reader"],
    priority: 2,
  },
  {
    id: "screen-reader-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Screen Reader Support",
    titleKey: "search.settings.screenReader",
    subtitle: "Enhanced support for screen readers",
    subtitleKey: "search.settings.screenReaderDesc",
    route: "/settings?section=accessibility",
    icon: "🔊",
    keywords: ["screen reader", "voice", "narrator", "accessibility"],
    priority: 3,
  },
  {
    id: "keyboard-shortcuts-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Keyboard Shortcuts",
    titleKey: "search.settings.keyboardShortcuts",
    subtitle: "Enable keyboard navigation shortcuts",
    subtitleKey: "search.settings.keyboardShortcutsDesc",
    route: "/settings?section=accessibility",
    icon: "⌨️",
    keywords: ["keyboard", "shortcuts", "hotkeys", "navigation", "keys"],
    priority: 2,
  },
  {
    id: "reduce-motion-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Reduce Motion",
    titleKey: "search.settings.reduceMotion",
    subtitle: "Minimize animations for better accessibility",
    subtitleKey: "search.settings.reduceMotionDesc",
    route: "/settings?section=accessibility",
    icon: "⏸️",
    keywords: ["reduce", "motion", "animation", "disable", "accessibility"],
    priority: 3,
  },
  {
    id: "focus-indicators-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Enhanced Focus Indicators",
    titleKey: "search.settings.focusIndicators",
    subtitle: "Highlight focused elements more prominently",
    subtitleKey: "search.settings.focusIndicatorsDesc",
    route: "/settings?section=accessibility",
    icon: "🎯",
    keywords: ["focus", "indicators", "highlight", "keyboard", "navigation"],
    priority: 3,
  },

  // ========================================
  // SETTINGS - Account Management
  // ========================================
  {
    id: "account-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Account Management",
    titleKey: "search.settings.account",
    subtitle: "Manage your account settings",
    subtitleKey: "search.settings.accountDesc",
    route: "/settings?section=account",
    icon: "👤",
    keywords: ["account", "manage", "user", "profile", "settings"],
    priority: 1,
  },
  {
    id: "edit-profile-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Edit Profile",
    titleKey: "search.settings.editProfile",
    subtitle: "Update your personal information",
    subtitleKey: "search.settings.editProfileDesc",
    route: "/profile",
    icon: "✏️",
    keywords: ["edit", "profile", "personal", "information", "update"],
    priority: 1,
  },
  {
    id: "delete-account-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Delete Account",
    titleKey: "search.settings.deleteAccount",
    subtitle: "Permanently delete your account and all data",
    subtitleKey: "search.settings.deleteAccountDesc",
    route: "/settings?section=account",
    icon: "🗑️",
    keywords: ["delete", "account", "remove", "permanent", "close account"],
    priority: 4,
  },

  // ========================================
  // SETTINGS - Help & Support
  // ========================================
  {
    id: "help-support-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Help & Support",
    titleKey: "search.settings.helpSupport",
    subtitle: "Get help and contact support",
    subtitleKey: "search.settings.helpSupportDesc",
    route: "/settings?section=help_support",
    icon: "❓",
    keywords: ["help", "support", "faq", "contact", "assistance"],
    priority: 2,
  },
  {
    id: "help-center-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Help Center",
    titleKey: "search.settings.helpCenter",
    subtitle: "Browse FAQs and help articles",
    subtitleKey: "search.settings.helpCenterDesc",
    route: "/help",
    icon: "📖",
    keywords: ["help", "center", "faq", "questions", "articles", "documentation"],
    priority: 2,
  },
  {
    id: "contact-support-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Contact Support",
    titleKey: "search.settings.contactSupport",
    subtitle: "Get help from our support team",
    subtitleKey: "search.settings.contactSupportDesc",
    route: "/support",
    icon: "💬",
    keywords: ["contact", "support", "help", "team", "ticket", "email"],
    priority: 2,
  },
  {
    id: "terms-of-service-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Terms of Service",
    titleKey: "search.settings.termsOfService",
    subtitle: "Read our terms and conditions",
    subtitleKey: "search.settings.termsOfServiceDesc",
    route: "/terms",
    icon: "📜",
    keywords: ["terms", "service", "conditions", "legal", "agreement"],
    priority: 4,
  },
  {
    id: "privacy-policy-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Privacy Policy",
    titleKey: "search.settings.privacyPolicy",
    subtitle: "Learn about how we protect your data",
    subtitleKey: "search.settings.privacyPolicyDesc",
    route: "/privacy",
    icon: "🔒",
    keywords: ["privacy", "policy", "data", "protection", "gdpr"],
    priority: 4,
  },

  // ========================================
  // NOTIFICATIONS - Main
  // ========================================
  {
    id: "notification-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Notification Settings",
    titleKey: "search.notifications.settings",
    subtitle: "Manage all notification preferences",
    subtitleKey: "search.notifications.settingsDesc",
    route: "/settings/notifications",
    icon: "🔔",
    keywords: ["notification", "alert", "settings", "preferences", "sounds"],
    priority: 1,
  },
  {
    id: "master-notifications-toggle",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "All Notifications",
    titleKey: "search.notifications.masterToggle",
    subtitle: "Enable or disable all notifications",
    subtitleKey: "search.notifications.masterToggleDesc",
    route: "/settings/notifications",
    icon: "🔕",
    keywords: ["all", "notifications", "master", "toggle", "disable", "enable"],
    priority: 1,
  },

  // ========================================
  // NOTIFICATIONS - Expense Service
  // ========================================
  {
    id: "expense-notifications",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Expense Notifications",
    titleKey: "search.notifications.expense",
    subtitle: "Notifications for expense tracking",
    subtitleKey: "search.notifications.expenseDesc",
    route: "/settings/notifications?service=expense_service",
    icon: "💰",
    keywords: ["expense", "notification", "alert", "spending"],
    priority: 2,
  },
  {
    id: "expense-added-notification",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "New Expense Added Alert",
    titleKey: "search.notifications.expenseAdded",
    subtitle: "Get notified when a new expense is created",
    subtitleKey: "search.notifications.expenseAddedDesc",
    route: "/settings/notifications?service=expense_service",
    icon: "➕",
    keywords: ["expense", "added", "new", "created", "notification"],
    priority: 3,
  },
  {
    id: "large-expense-notification",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Large Expense Alert",
    titleKey: "search.notifications.largeExpense",
    subtitle: "Get notified about expenses above threshold",
    subtitleKey: "search.notifications.largeExpenseDesc",
    route: "/settings/notifications?service=expense_service",
    icon: "⚠️",
    keywords: ["large", "expense", "alert", "threshold", "warning", "big"],
    priority: 2,
  },

  // ========================================
  // NOTIFICATIONS - Budget Service
  // ========================================
  {
    id: "budget-notifications",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Budget Notifications",
    titleKey: "search.notifications.budget",
    subtitle: "Budget limits, warnings, and alerts",
    subtitleKey: "search.notifications.budgetDesc",
    route: "/settings/notifications?service=budget_service",
    icon: "📊",
    keywords: ["budget", "notification", "limit", "alert"],
    priority: 2,
  },
  {
    id: "budget-exceeded-notification",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Budget Exceeded Alert",
    titleKey: "search.notifications.budgetExceeded",
    subtitle: "Critical alert when you exceed budget limit",
    subtitleKey: "search.notifications.budgetExceededDesc",
    route: "/settings/notifications?service=budget_service",
    icon: "🚨",
    keywords: ["budget", "exceeded", "over", "limit", "critical", "alert"],
    priority: 1,
  },
  {
    id: "budget-warning-notification",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Budget Warning (80%)",
    titleKey: "search.notifications.budgetWarning",
    subtitle: "Warning when you reach 80% of your budget",
    subtitleKey: "search.notifications.budgetWarningDesc",
    route: "/settings/notifications?service=budget_service",
    icon: "⚡",
    keywords: ["budget", "warning", "80%", "approaching", "limit"],
    priority: 2,
  },
  {
    id: "budget-approaching-notification",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Approaching Budget Limit (50%)",
    titleKey: "search.notifications.budgetApproaching",
    subtitle: "Early warning at 50% of budget usage",
    subtitleKey: "search.notifications.budgetApproachingDesc",
    route: "/settings/notifications?service=budget_service",
    icon: "📈",
    keywords: ["budget", "approaching", "50%", "early", "warning"],
    priority: 3,
  },

  // ========================================
  // NOTIFICATIONS - Bill Service
  // ========================================
  {
    id: "bill-notifications",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Bill Notifications",
    titleKey: "search.notifications.bill",
    subtitle: "Bill reminders and due date alerts",
    subtitleKey: "search.notifications.billDesc",
    route: "/settings/notifications?service=bill_service",
    icon: "📄",
    keywords: ["bill", "notification", "reminder", "due", "payment"],
    priority: 2,
  },
  {
    id: "bill-due-reminder-notification",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Bill Due Reminder",
    titleKey: "search.notifications.billDueReminder",
    subtitle: "Reminder 3 days before bill due date",
    subtitleKey: "search.notifications.billDueReminderDesc",
    route: "/settings/notifications?service=bill_service",
    icon: "📅",
    keywords: ["bill", "due", "reminder", "upcoming", "payment"],
    priority: 1,
  },
  {
    id: "bill-overdue-notification",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Overdue Bill Alert",
    titleKey: "search.notifications.billOverdue",
    subtitle: "Critical alert for overdue bills",
    subtitleKey: "search.notifications.billOverdueDesc",
    route: "/settings/notifications?service=bill_service",
    icon: "🚨",
    keywords: ["bill", "overdue", "late", "missed", "critical", "unpaid"],
    priority: 1,
  },
  {
    id: "bill-paid-notification",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Bill Payment Confirmation",
    titleKey: "search.notifications.billPaid",
    subtitle: "Confirmation when a bill is marked as paid",
    subtitleKey: "search.notifications.billPaidDesc",
    route: "/settings/notifications?service=bill_service",
    icon: "✅",
    keywords: ["bill", "paid", "confirmation", "payment", "completed"],
    priority: 3,
  },

  // ========================================
  // NOTIFICATIONS - Category Service
  // ========================================
  {
    id: "category-notifications",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Category Notifications",
    titleKey: "search.notifications.category",
    subtitle: "Category management notifications",
    subtitleKey: "search.notifications.categoryDesc",
    route: "/settings/notifications?service=category_service",
    icon: "🏷️",
    keywords: ["category", "notification", "tag", "organize"],
    priority: 3,
  },
  {
    id: "category-budget-exceeded-notification",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Category Budget Exceeded",
    titleKey: "search.notifications.categoryBudgetExceeded",
    subtitle: "Alert when spending exceeds category budget",
    subtitleKey: "search.notifications.categoryBudgetExceededDesc",
    route: "/settings/notifications?service=category_service",
    icon: "⚠️",
    keywords: ["category", "budget", "exceeded", "over", "limit"],
    priority: 2,
  },

  // ========================================
  // NOTIFICATIONS - Payment Method Service
  // ========================================
  {
    id: "payment-method-notifications",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Payment Method Notifications",
    titleKey: "search.notifications.paymentMethod",
    subtitle: "Security alerts for payment method changes",
    subtitleKey: "search.notifications.paymentMethodDesc",
    route: "/settings/notifications?service=payment_method_service",
    icon: "💳",
    keywords: ["payment", "method", "card", "notification", "security"],
    priority: 2,
  },
  {
    id: "payment-method-added-notification",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Payment Method Added Alert",
    titleKey: "search.notifications.paymentMethodAdded",
    subtitle: "Security notification when new payment method is added",
    subtitleKey: "search.notifications.paymentMethodAddedDesc",
    route: "/settings/notifications?service=payment_method_service",
    icon: "🔔",
    keywords: ["payment", "method", "added", "new", "card", "security"],
    priority: 2,
  },
  {
    id: "payment-method-removed-notification",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Payment Method Removed Alert",
    titleKey: "search.notifications.paymentMethodRemoved",
    subtitle: "Security alert when payment method is deleted",
    subtitleKey: "search.notifications.paymentMethodRemovedDesc",
    route: "/settings/notifications?service=payment_method_service",
    icon: "🚨",
    keywords: ["payment", "method", "removed", "deleted", "card", "security"],
    priority: 2,
  },

  // ========================================
  // NOTIFICATIONS - Friend Service
  // ========================================
  {
    id: "friend-notifications",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Friend Notifications",
    titleKey: "search.notifications.friend",
    subtitle: "Friend requests and social notifications",
    subtitleKey: "search.notifications.friendDesc",
    route: "/settings/notifications?service=friend_service",
    icon: "👥",
    keywords: ["friend", "notification", "request", "social"],
    priority: 2,
  },
  {
    id: "friend-request-notification",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Friend Request Notification",
    titleKey: "search.notifications.friendRequest",
    subtitle: "Get notified about new friend requests",
    subtitleKey: "search.notifications.friendRequestDesc",
    route: "/settings/notifications?service=friend_service",
    icon: "🤝",
    keywords: ["friend", "request", "new", "notification", "invite"],
    priority: 2,
  },
  {
    id: "friend-request-accepted-notification",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Friend Request Accepted",
    titleKey: "search.notifications.friendRequestAccepted",
    subtitle: "Get notified when someone accepts your request",
    subtitleKey: "search.notifications.friendRequestAcceptedDesc",
    route: "/settings/notifications?service=friend_service",
    icon: "🎉",
    keywords: ["friend", "request", "accepted", "approved", "notification"],
    priority: 3,
  },

  // ========================================
  // NOTIFICATIONS - Friend Activity Service
  // ========================================
  {
    id: "friend-activity-notifications",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Friend Activity Notifications",
    titleKey: "search.notifications.friendActivity",
    subtitle: "Notifications when friends manage your data",
    subtitleKey: "search.notifications.friendActivityDesc",
    route: "/settings/notifications?service=friend_activity_service",
    icon: "👨‍👩‍👧‍👦",
    keywords: ["friend", "activity", "notification", "manage", "shared"],
    priority: 2,
  },
  {
    id: "friend-expense-created-notification",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Friend Created Expense Alert",
    titleKey: "search.notifications.friendExpenseCreated",
    subtitle: "Get notified when a friend creates an expense for you",
    subtitleKey: "search.notifications.friendExpenseCreatedDesc",
    route: "/settings/notifications?service=friend_activity_service",
    icon: "💰",
    keywords: ["friend", "expense", "created", "notification", "shared"],
    priority: 2,
  },
  {
    id: "friend-bill-created-notification",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Friend Created Bill Alert",
    titleKey: "search.notifications.friendBillCreated",
    subtitle: "Get notified when a friend creates a bill for you",
    subtitleKey: "search.notifications.friendBillCreatedDesc",
    route: "/settings/notifications?service=friend_activity_service",
    icon: "📄",
    keywords: ["friend", "bill", "created", "notification", "shared"],
    priority: 2,
  },

  // ========================================
  // NOTIFICATIONS - Analytics Service
  // ========================================
  {
    id: "analytics-notifications",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Analytics & Reports Notifications",
    titleKey: "search.notifications.analytics",
    subtitle: "Insights, reports, and spending analysis",
    subtitleKey: "search.notifications.analyticsDesc",
    route: "/settings/notifications?service=analytics_service",
    icon: "📊",
    keywords: ["analytics", "reports", "insights", "notification", "summary"],
    priority: 2,
  },
  {
    id: "weekly-summary-notification",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Weekly Expense Summary",
    titleKey: "search.notifications.weeklySummary",
    subtitle: "Receive weekly spending analysis and insights",
    subtitleKey: "search.notifications.weeklySummaryDesc",
    route: "/settings/notifications?service=analytics_service",
    icon: "📅",
    keywords: ["weekly", "summary", "report", "spending", "analysis"],
    priority: 2,
  },
  {
    id: "monthly-report-notification",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Monthly Financial Report",
    titleKey: "search.notifications.monthlyReport",
    subtitle: "Comprehensive monthly expense and budget report",
    subtitleKey: "search.notifications.monthlyReportDesc",
    route: "/settings/notifications?service=analytics_service",
    icon: "📈",
    keywords: ["monthly", "report", "financial", "comprehensive", "budget"],
    priority: 2,
  },
  {
    id: "spending-goal-notification",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Spending Goal Achieved",
    titleKey: "search.notifications.spendingGoal",
    subtitle: "Celebration when you meet savings goals",
    subtitleKey: "search.notifications.spendingGoalDesc",
    route: "/settings/notifications?service=analytics_service",
    icon: "🎯",
    keywords: ["spending", "goal", "achieved", "savings", "target", "celebration"],
    priority: 3,
  },

  // ========================================
  // NOTIFICATIONS - Global Settings
  // ========================================
  {
    id: "notification-email-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Email Notifications",
    titleKey: "search.notifications.email",
    subtitle: "Configure email notification delivery",
    subtitleKey: "search.notifications.emailDesc",
    route: "/settings/notifications",
    icon: "📧",
    keywords: ["email", "notification", "mail", "inbox", "delivery"],
    priority: 2,
  },
  {
    id: "notification-push-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Push Notifications",
    titleKey: "search.notifications.push",
    subtitle: "Configure push notification delivery",
    subtitleKey: "search.notifications.pushDesc",
    route: "/settings/notifications",
    icon: "📱",
    keywords: ["push", "notification", "mobile", "browser", "alert"],
    priority: 2,
  },
  {
    id: "notification-sound-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Notification Sounds",
    titleKey: "search.notifications.sounds",
    subtitle: "Configure notification sounds and alerts",
    subtitleKey: "search.notifications.soundsDesc",
    route: "/settings/notifications",
    icon: "🔊",
    keywords: ["sound", "notification", "alert", "audio", "ring", "tone"],
    priority: 3,
  },
  {
    id: "quiet-hours-settings",
    type: SEARCH_TYPES.SETTING,
    section: "settings",
    title: "Quiet Hours / Do Not Disturb",
    titleKey: "search.notifications.quietHours",
    subtitle: "Set quiet hours for notifications",
    subtitleKey: "search.notifications.quietHoursDesc",
    route: "/settings/notifications",
    icon: "🌙",
    keywords: ["quiet", "hours", "dnd", "do not disturb", "night", "sleep"],
    priority: 2,
  },

  // Upload
  {
    id: "upload-expenses",
    type: SEARCH_TYPES.ACTION,
    section: "actions",
    title: "Upload Expenses",
    titleKey: "search.actions.uploadExpenses",
    subtitle: "Bulk upload expenses from file",
    subtitleKey: "search.actions.uploadExpensesDesc",
    route: "/upload/expenses",
    icon: "📤",
    keywords: ["upload", "import", "bulk", "csv", "excel", "file"],
    priority: 3,
  },
  {
    id: "upload-bills",
    type: SEARCH_TYPES.ACTION,
    section: "actions",
    title: "Upload Bills",
    titleKey: "search.actions.uploadBills",
    subtitle: "Bulk upload bills from file",
    subtitleKey: "search.actions.uploadBillsDesc",
    route: "/bill/upload",
    icon: "📤",
    keywords: ["upload", "import", "bulk", "bills", "file"],
    priority: 3,
  },

  // Chat
  {
    id: "chat",
    type: SEARCH_TYPES.ACTION,
    section: "actions",
    title: "Chat",
    titleKey: "search.actions.chat",
    subtitle: "Open chat with friends",
    subtitleKey: "search.actions.chatDesc",
    route: "/chats",
    icon: "💬",
    keywords: ["chat", "message", "talk", "communicate"],
    priority: 3,
  },
];

/**
 * Get route for a dynamic search result
 * @param {string} type - Search result type
 * @param {string|number} id - Entity ID
 * @returns {string} - Route path
 */
export const getRouteForResult = (type, id) => {
  const routes = {
    [SEARCH_TYPES.EXPENSE]: `/expenses/edit/${id}`,
    [SEARCH_TYPES.BUDGET]: `/budget/report/${id}`,
    [SEARCH_TYPES.CATEGORY]: `/category-flow`,
    [SEARCH_TYPES.BILL]: `/bill/edit/${id}`,
    [SEARCH_TYPES.PAYMENT_METHOD]: `/payment-method/edit/${id}`,
    [SEARCH_TYPES.FRIEND]: `/friends/expenses/${id}`,
  };
  return routes[type] || "/dashboard";
};

/**
 * Fuzzy match algorithm for local search
 * @param {string} text - Text to search in
 * @param {string} pattern - Search pattern
 * @returns {{ matches: boolean, score: number, indices: number[] }}
 */
export const fuzzyMatch = (text, pattern) => {
  if (!pattern) return { matches: true, score: 0, indices: [] };
  if (!text) return { matches: false, score: Infinity, indices: [] };

  const textLower = text.toLowerCase();
  const patternLower = pattern.toLowerCase();

  let patternIdx = 0;
  let score = 0;
  let lastMatchIdx = -1;
  let consecutiveBonus = 0;
  const indices = [];

  for (
    let i = 0;
    i < textLower.length && patternIdx < patternLower.length;
    i++
  ) {
    if (textLower[i] === patternLower[patternIdx]) {
      indices.push(i);
      // Bonus for consecutive matches
      if (lastMatchIdx === i - 1) {
        consecutiveBonus += 1;
      }
      // Bonus for matching at word start
      if (i === 0 || /[\s\-_]/.test(text[i - 1])) {
        score -= 10;
      }
      // Penalty for gaps between matches
      if (lastMatchIdx >= 0) {
        score += i - lastMatchIdx - 1;
      }
      lastMatchIdx = i;
      patternIdx++;
    }
  }

  // All pattern characters must be found
  if (patternIdx !== patternLower.length) {
    return { matches: false, score: Infinity, indices: [] };
  }

  // Apply consecutive bonus
  score -= consecutiveBonus * 5;

  return { matches: true, score, indices };
};

/**
 * Search quick actions locally
 * @param {string} query - Search query
 * @returns {Array} - Filtered and sorted quick actions
 */
export const searchQuickActions = (query) => {
  if (!query || !query.trim()) {
    // Return top priority actions when no query
    return QUICK_ACTIONS.filter((action) => action.priority <= 1)
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 8);
  }

  const queryLower = query.toLowerCase().trim();

  return QUICK_ACTIONS.map((action) => {
    // Match against title
    const titleMatch = fuzzyMatch(action.title, queryLower);

    // Match against keywords
    const keywordMatches = action.keywords.map((kw) =>
      fuzzyMatch(kw, queryLower),
    );
    const bestKeywordMatch = keywordMatches.reduce(
      (best, current) => (current.score < best.score ? current : best),
      { matches: false, score: Infinity },
    );

    // Match against subtitle
    const subtitleMatch = fuzzyMatch(action.subtitle, queryLower);

    // Determine best match
    let bestMatch = { matches: false, score: Infinity };
    if (titleMatch.matches && titleMatch.score < bestMatch.score) {
      bestMatch = { ...titleMatch, source: "title" };
    }
    if (bestKeywordMatch.matches && bestKeywordMatch.score < bestMatch.score) {
      bestMatch = { ...bestKeywordMatch, source: "keyword" };
    }
    if (subtitleMatch.matches && subtitleMatch.score < bestMatch.score) {
      bestMatch = { ...subtitleMatch, source: "subtitle" };
    }

    return {
      ...action,
      matchScore: bestMatch.score,
      matches: bestMatch.matches,
      matchSource: bestMatch.source,
      matchIndices: bestMatch.indices,
    };
  })
    .filter((action) => action.matches)
    .sort((a, b) => {
      // Sort by score first, then by priority
      if (a.matchScore !== b.matchScore) {
        return a.matchScore - b.matchScore;
      }
      return a.priority - b.priority;
    })
    .slice(0, 10);
};

export default QUICK_ACTIONS;
