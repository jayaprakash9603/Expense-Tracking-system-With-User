/**
 * Settings Configuration Constants
 * Centralized configuration for all settings options
 * Following DRY principle - define once, use everywhere
 */

import {
  Email as EmailIcon,
  Assessment as AssessmentIcon,
  Description as DescriptionIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Language as LanguageIcon,
  MonetizationOn as MonetizationOnIcon,
  Info as InfoIcon,
  Visibility as VisibilityIcon,
  Security as SecurityIcon,
  Block as BlockIcon,
  Lock as LockIcon,
  Storage as StorageIcon,
  Delete as DeleteIcon,
  Help as HelpIcon,
  Support as SupportIcon,
  Shield as ShieldIcon,
  Palette as PaletteIcon,
  AccountCircle as AccountCircleIcon,
  TextFields as TextFieldsIcon,
  ViewCompact as ViewCompactIcon,
  Animation as AnimationIcon,
  Contrast as ContrastIcon,
  CloudSync as CloudSyncIcon,
  CloudDownload as CloudDownloadIcon,
  DeleteSweep as DeleteSweepIcon,
  Psychology as PsychologyIcon,
  AutoAwesome as AutoAwesomeIcon,
  Schedule as ScheduleIcon,
  NotificationImportant as NotificationImportantIcon,
  Accessible as AccessibleIcon,
  Keyboard as KeyboardIcon,
  MotionPhotosOff as MotionPhotosOffIcon,
  RecordVoiceOver as RecordVoiceOverIcon,
  Brightness4 as Brightness4Icon,
  Timer as TimerIcon,
  Category as CategoryIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";

/**
 * Language options for user selection
 */
export const LANGUAGE_OPTIONS = [
  { value: "en", label: "🇺🇸 English" },
  { value: "es", label: "🇪🇸 Spanish" },
  { value: "fr", label: "🇫🇷 French" },
  { value: "de", label: "🇩🇪 German" },
  { value: "hi", label: "🇮🇳 Hindi" },
];

/**
 * Currency options for user selection
 */
export const CURRENCY_OPTIONS = [
  { value: "USD", label: "💵 USD - US Dollar ($)" },
  { value: "EUR", label: "💶 EUR - Euro (€)" },
  { value: "GBP", label: "💷 GBP - British Pound (£)" },
  { value: "INR", label: "💴 INR - Indian Rupee (₹)" },
  { value: "JPY", label: "💴 JPY - Japanese Yen (¥)" },
];

/**
 * Date format options
 */
export const DATE_FORMAT_OPTIONS = [
  { value: "MM/DD/YYYY", label: "📅 MM/DD/YYYY (US)" },
  { value: "DD/MM/YYYY", label: "📅 DD/MM/YYYY (UK/EU)" },
  { value: "YYYY-MM-DD", label: "📅 YYYY-MM-DD (ISO)" },
];

/**
 * Font size options
 */
export const FONT_SIZE_OPTIONS = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium (Default)" },
  { value: "large", label: "Large" },
  { value: "extra-large", label: "Extra Large" },
];

/**
 * Time format options
 */
export const TIME_FORMAT_OPTIONS = [
  { value: "12h", label: "🕐 12-hour (3:00 PM)" },
  { value: "24h", label: "🕒 24-hour (15:00)" },
];

/**
 * Auto-backup frequency options
 */
export const BACKUP_FREQUENCY_OPTIONS = [
  { value: "daily", label: "📆 Daily" },
  { value: "weekly", label: "📅 Weekly" },
  { value: "monthly", label: "🗓️ Monthly" },
  { value: "manual", label: "✋ Manual Only" },
];

/**
 * Report schedule options
 */
export const REPORT_SCHEDULE_OPTIONS = [
  { value: "daily", label: "📊 Daily Summary" },
  { value: "weekly", label: "📈 Weekly Summary" },
  { value: "monthly", label: "📉 Monthly Summary" },
  { value: "none", label: "🚫 No Scheduled Reports" },
];

/**
 * Profile visibility options
 */
export const PROFILE_VISIBILITY_OPTIONS = [
  { value: "PUBLIC", label: "🌍 Public - Anyone can view" },
  { value: "FRIENDS", label: "👥 Friends Only - Restricted access" },
  { value: "PRIVATE", label: "🔒 Private - Only you" },
];

/**
 * Profile visibility messages for feedback
 */
export const PROFILE_VISIBILITY_MESSAGES = {
  PUBLIC: "Your profile is now public - anyone can view your information",
  FRIENDS: "Your profile is now friends only - only friends can view",
  PRIVATE: "Your profile is now private - only you can view your information",
};

/**
 * Profile visibility display labels with icons
 */
export const PROFILE_VISIBILITY_LABELS = {
  PUBLIC: "🌍 Public",
  FRIENDS: "👥 Friends",
  PRIVATE: "🔒 Private",
};

/**
 * App version information
 */
export const APP_INFO = {
  version: "v2.0.0",
  lastUpdated: "October 2025",
  buildNumber: "2025.10.29",
};

/**
 * Settings sections configuration
 * Each section contains its items with complete configuration
 */
export const SETTINGS_SECTIONS = {
  APPEARANCE: {
    id: "appearance",
    title: "Appearance",
    icon: PaletteIcon,
    items: [
      {
        id: "theme",
        icon: null, // Dynamic based on theme
        title: "Theme Mode",
        description: null, // Dynamic based on theme
        type: "switch",
        stateKey: "isDark",
        settingsKey: "themeMode",
      },
      {
        id: "fontSize",
        icon: TextFieldsIcon,
        title: "Font Size",
        description: "Adjust text size for better readability",
        type: "select",
        stateKey: "fontSize",
        settingsKey: "fontSize",
        options: FONT_SIZE_OPTIONS,
      },
      {
        id: "compactMode",
        icon: ViewCompactIcon,
        title: "Compact Mode",
        description: "Display more content with reduced spacing",
        type: "switch",
        stateKey: "compactMode",
        settingsKey: "compactMode",
      },
      {
        id: "animations",
        icon: AnimationIcon,
        title: "Enable Animations",
        description: "Show smooth transitions and animations",
        type: "switch",
        stateKey: "animations",
        settingsKey: "animations",
      },
      {
        id: "highContrast",
        icon: ContrastIcon,
        title: "High Contrast Mode",
        description: "Enhanced visibility for better accessibility",
        type: "switch",
        stateKey: "highContrast",
        settingsKey: "highContrast",
      },
    ],
  },

  PREFERENCES: {
    id: "preferences",
    title: "Preferences",
    icon: LanguageIcon,
    items: [
      {
        id: "language",
        icon: LanguageIcon,
        title: "Language",
        description: "Choose your preferred language",
        type: "select",
        stateKey: "language",
        settingsKey: "language",
        options: LANGUAGE_OPTIONS,
      },
      {
        id: "currency",
        icon: MonetizationOnIcon,
        title: "Default Currency",
        description: "Set your preferred currency for transactions",
        type: "select",
        stateKey: "currency",
        settingsKey: "currency",
        options: CURRENCY_OPTIONS,
      },
      {
        id: "dateFormat",
        icon: InfoIcon,
        title: "Date Format",
        description: "Choose how dates are displayed",
        type: "select",
        stateKey: "dateFormat",
        settingsKey: "dateFormat",
        options: DATE_FORMAT_OPTIONS,
      },
      {
        id: "timeFormat",
        icon: TimerIcon,
        title: "Time Format",
        description: "Choose 12-hour or 24-hour time format",
        type: "select",
        stateKey: "timeFormat",
        settingsKey: "timeFormat",
        options: TIME_FORMAT_OPTIONS,
      },
    ],
  },

  PRIVACY_SECURITY: {
    id: "privacy_security",
    title: "Privacy & Security",
    icon: ShieldIcon,
    showChip: true,
    items: [
      {
        id: "profileVisibility",
        icon: VisibilityIcon,
        title: "Profile Visibility",
        description: "Control who can see your profile and expense information",
        type: "select",
        stateKey: "profileVisibility",
        settingsKey: "profileVisibility",
        options: PROFILE_VISIBILITY_OPTIONS,
        customMessage: true,
      },
      {
        id: "maskSensitiveData",
        icon: VisibilityOffIcon,
        title: "Mask Sensitive Data",
        description: "Hide expense amounts and financial details for privacy",
        type: "switch",
        stateKey: "maskSensitiveData",
        settingsKey: "maskSensitiveData",
      },
      {
        id: "twoFactor",
        icon: SecurityIcon,
        title: "Two-Factor Authentication",
        description: "Add an extra layer of security to your account",
        type: "button",
        buttonText: "Enable",
        action: "enable2FA",
      },
      {
        id: "blockedUsers",
        icon: BlockIcon,
        title: "Blocked Users",
        description: "Manage blocked users and privacy settings",
        type: "button",
        buttonText: "Manage",
        action: "manageBlockedUsers",
      },
      {
        id: "sessionTimeout",
        icon: TimerIcon,
        title: "Auto Logout",
        description: "Automatically log out after period of inactivity",
        type: "switch",
        stateKey: "sessionTimeout",
        settingsKey: "sessionTimeout",
      },
    ],
  },

  DATA_STORAGE: {
    id: "data_storage",
    title: "Data & Storage",
    icon: StorageIcon,
    items: [
      {
        id: "autoBackup",
        icon: CloudDownloadIcon,
        title: "Auto Backup",
        description: "Automatically backup your data to cloud",
        type: "switch",
        stateKey: "autoBackup",
        settingsKey: "autoBackup",
      },
      {
        id: "backupFrequency",
        icon: ScheduleIcon,
        title: "Backup Frequency",
        description: "How often to backup your data",
        type: "select",
        stateKey: "backupFrequency",
        settingsKey: "backupFrequency",
        options: BACKUP_FREQUENCY_OPTIONS,
      },
      {
        id: "cloudSync",
        icon: CloudSyncIcon,
        title: "Cloud Sync",
        description: "Sync data across all your devices",
        type: "switch",
        stateKey: "cloudSync",
        settingsKey: "cloudSync",
      },
      {
        id: "storageUsage",
        icon: StorageIcon,
        title: "Storage Usage",
        description: "View your data storage usage",
        type: "button",
        buttonText: "View",
        action: "viewStorage",
      },
      {
        id: "clearCache",
        icon: DeleteSweepIcon,
        title: "Clear Cache",
        description: "Free up space by clearing cached data",
        type: "button",
        buttonText: "Clear",
        action: "clearCache",
      },
    ],
  },

  SMART_FEATURES: {
    id: "smart_features",
    title: "Smart Features & Automation",
    icon: PsychologyIcon,
    items: [
      {
        id: "autoCategorize",
        icon: CategoryIcon,
        title: "Auto-Categorize Expenses",
        description: "AI-powered automatic expense categorization",
        type: "switch",
        stateKey: "autoCategorize",
        settingsKey: "autoCategorize",
      },
      {
        id: "smartBudgeting",
        icon: AutoAwesomeIcon,
        title: "Smart Budget Suggestions",
        description: "Get AI recommendations for better budgeting",
        type: "switch",
        stateKey: "smartBudgeting",
        settingsKey: "smartBudgeting",
      },
      {
        id: "scheduledReports",
        icon: ScheduleIcon,
        title: "Scheduled Reports",
        description: "Receive automated expense reports",
        type: "select",
        stateKey: "scheduledReports",
        settingsKey: "scheduledReports",
        options: REPORT_SCHEDULE_OPTIONS,
      },
      {
        id: "expenseReminders",
        icon: NotificationImportantIcon,
        title: "Expense Reminders",
        description: "Get reminders for recurring expenses",
        type: "switch",
        stateKey: "expenseReminders",
        settingsKey: "expenseReminders",
      },
      {
        id: "predictiveAnalytics",
        icon: AssessmentIcon,
        title: "Predictive Analytics",
        description: "Forecast future expenses based on patterns",
        type: "switch",
        stateKey: "predictiveAnalytics",
        settingsKey: "predictiveAnalytics",
      },
    ],
  },

  ACCESSIBILITY: {
    id: "accessibility",
    title: "Accessibility",
    icon: AccessibleIcon,
    items: [
      {
        id: "screenReader",
        icon: RecordVoiceOverIcon,
        title: "Screen Reader Support",
        description: "Enhanced support for screen readers",
        type: "switch",
        stateKey: "screenReader",
        settingsKey: "screenReader",
      },
      {
        id: "keyboardShortcuts",
        icon: KeyboardIcon,
        title: "Keyboard Shortcuts",
        description: "Enable keyboard navigation shortcuts",
        type: "switch",
        stateKey: "keyboardShortcuts",
        settingsKey: "keyboardShortcuts",
      },
      {
        id: "reduceMotion",
        icon: MotionPhotosOffIcon,
        title: "Reduce Motion",
        description: "Minimize animations for better accessibility",
        type: "switch",
        stateKey: "reduceMotion",
        settingsKey: "reduceMotion",
      },
      {
        id: "focusIndicators",
        icon: Brightness4Icon,
        title: "Enhanced Focus Indicators",
        description: "Highlight focused elements more prominently",
        type: "switch",
        stateKey: "focusIndicators",
        settingsKey: "focusIndicators",
      },
      {
        id: "keyboardShortcutsGuide",
        icon: KeyboardIcon,
        title: "Keyboard Shortcuts Guide",
        description: "View all available keyboard shortcuts",
        type: "button",
        buttonText: "View",
        action: "viewShortcuts",
      },
    ],
  },

  ACCOUNT: {
    id: "account",
    title: "Account Management",
    icon: AccountCircleIcon,
    items: [
      {
        id: "notificationSettings",
        icon: NotificationImportantIcon,
        title: "Notification Settings",
        description: "Manage all notification preferences and channels",
        type: "navigation",
        action: "notificationSettings",
        showStatus: true, // Special flag to show ON/OFF status
      },
      {
        id: "editProfile",
        icon: PersonIcon,
        title: "Edit Profile",
        description: "Update your personal information and preferences",
        type: "button",
        buttonText: "Edit",
        action: "editProfile",
      },
      {
        id: "changePassword",
        icon: LockIcon,
        title: "Change Password",
        description: "Update your account password",
        type: "button",
        buttonText: "Change",
        action: "changePassword",
      },
      {
        id: "dataExport",
        icon: StorageIcon,
        title: "Data Export",
        description: "Download all your expense data",
        type: "button",
        buttonText: "Export",
        action: "exportData",
      },
      {
        id: "deleteAccount",
        icon: DeleteIcon,
        title: "Delete Account",
        description: "Permanently delete your account and all data",
        type: "button",
        buttonText: "Delete",
        action: "deleteAccount",
        isDanger: true,
      },
    ],
  },

  HELP_SUPPORT: {
    id: "help_support",
    title: "Help & Support",
    icon: HelpIcon,
    items: [
      {
        id: "helpCenter",
        icon: HelpIcon,
        title: "Help Center",
        description: "Browse FAQs and help articles",
        type: "navigation",
        action: "helpCenter",
      },
      {
        id: "contactSupport",
        icon: SupportIcon,
        title: "Contact Support",
        description: "Get help from our support team",
        type: "navigation",
        action: "contactSupport",
      },
      {
        id: "termsOfService",
        icon: DescriptionIcon,
        title: "Terms of Service",
        description: "Read our terms and conditions",
        type: "navigation",
        action: "termsOfService",
      },
      {
        id: "privacyPolicy",
        icon: ShieldIcon,
        title: "Privacy Policy",
        description: "Learn about how we protect your data",
        type: "navigation",
        action: "privacyPolicy",
      },
    ],
  },

  ABOUT: {
    id: "about",
    title: "About",
    icon: InfoIcon,
    type: "info",
  },
};
