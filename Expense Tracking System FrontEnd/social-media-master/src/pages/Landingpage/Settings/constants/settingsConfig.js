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
  PhonelinkLock as PhonelinkLockIcon,
} from "@mui/icons-material";

/**
 * Language options for user selection
 * Supports English, Hindi, and Telugu languages
 */
export const LANGUAGE_OPTIONS = [
  { value: "en", label: "🇺🇸 English" },
  { value: "hi", label: "🇮🇳 हिन्दी (Hindi)" },
  { value: "te", label: "🇮🇳 తెలుగు (Telugu)" },
];

/**
 * Currency options for user selection
 */
export const CURRENCY_OPTIONS = [
  {
    value: "USD",
    label: "💵 USD - US Dollar ($)",
    labelKey: "settings.currencyUSD",
  },
  {
    value: "EUR",
    label: "💶 EUR - Euro (€)",
    labelKey: "settings.currencyEUR",
  },
  {
    value: "GBP",
    label: "💷 GBP - British Pound (£)",
    labelKey: "settings.currencyGBP",
  },
  {
    value: "INR",
    label: "💴 INR - Indian Rupee (₹)",
    labelKey: "settings.currencyINR",
  },
  {
    value: "JPY",
    label: "💴 JPY - Japanese Yen (¥)",
    labelKey: "settings.currencyJPY",
  },
];

/**
 * Date format options
 */
export const DATE_FORMAT_OPTIONS = [
  {
    value: "MM/DD/YYYY",
    label: "📅 MM/DD/YYYY (US)",
    labelKey: "settings.dateFormatUS",
  },
  {
    value: "DD/MM/YYYY",
    label: "📅 DD/MM/YYYY (UK/EU)",
    labelKey: "settings.dateFormatUK",
  },
  {
    value: "YYYY-MM-DD",
    label: "📅 YYYY-MM-DD (ISO)",
    labelKey: "settings.dateFormatISO",
  },
];

/**
 * Font size options
 */
export const FONT_SIZE_OPTIONS = [
  { value: "small", label: "Small", labelKey: "settings.small" },
  { value: "medium", label: "Medium (Default)", labelKey: "settings.medium" },
  { value: "large", label: "Large", labelKey: "settings.large" },
  {
    value: "extra-large",
    label: "Extra Large",
    labelKey: "settings.extraLarge",
  },
];

/**
 * Time format options
 */
export const TIME_FORMAT_OPTIONS = [
  { value: "12h", label: "🕐 12-hour (3:00 PM)", labelKey: "settings.time12h" },
  { value: "24h", label: "🕒 24-hour (15:00)", labelKey: "settings.time24h" },
];

/**
 * Auto-backup frequency options
 */
export const BACKUP_FREQUENCY_OPTIONS = [
  { value: "daily", label: "📆 Daily", labelKey: "settings.daily" },
  { value: "weekly", label: "📅 Weekly", labelKey: "settings.weekly" },
  { value: "monthly", label: "🗓️ Monthly", labelKey: "settings.monthly" },
  { value: "manual", label: "✋ Manual Only", labelKey: "settings.manualOnly" },
];

/**
 * Report schedule options
 */
export const REPORT_SCHEDULE_OPTIONS = [
  {
    value: "daily",
    label: "📊 Daily Summary",
    labelKey: "settings.dailySummary",
  },
  {
    value: "weekly",
    label: "📈 Weekly Summary",
    labelKey: "settings.weeklySummary",
  },
  {
    value: "monthly",
    label: "📉 Monthly Summary",
    labelKey: "settings.monthlySummary",
  },
  {
    value: "none",
    label: "🚫 No Scheduled Reports",
    labelKey: "settings.noScheduledReports",
  },
];

/**
 * Profile visibility options
 */
export const PROFILE_VISIBILITY_OPTIONS = [
  {
    value: "PUBLIC",
    label: "🌍 Public - Anyone can view",
    labelKey: "settings.public",
  },
  {
    value: "FRIENDS",
    label: "👥 Friends Only - Restricted access",
    labelKey: "settings.friendsOnly",
  },
  {
    value: "PRIVATE",
    label: "🔒 Private - Only you",
    labelKey: "settings.private",
  },
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
  PUBLIC: { label: "🌍 Public", labelKey: "settings.publicLabel" },
  FRIENDS: { label: "👥 Friends", labelKey: "settings.friendsLabel" },
  PRIVATE: { label: "🔒 Private", labelKey: "settings.privateLabel" },
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
    titleKey: "settings.appearance",
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
        id: "accentColor",
        icon: PaletteIcon,
        title: "Accent Color",
        titleKey: "settings.accentColor",
        description: "Choose your preferred color palette",
        descriptionKey: "settings.accentColorDescription",
        type: "themePicker", // New component type for color palette selection
      },
      {
        id: "fontSize",
        icon: TextFieldsIcon,
        title: "Font Size",
        titleKey: "settings.fontSize",
        description: "Adjust text size for better readability",
        descriptionKey: "settings.fontSizeDescription",
        type: "select",
        stateKey: "fontSize",
        settingsKey: "fontSize",
        options: FONT_SIZE_OPTIONS,
      },
      {
        id: "compactMode",
        icon: ViewCompactIcon,
        title: "Compact Mode",
        titleKey: "settings.compactMode",
        description: "Display more content with reduced spacing",
        descriptionKey: "settings.compactModeDescription",
        type: "switch",
        stateKey: "compactMode",
        settingsKey: "compactMode",
      },
      {
        id: "animations",
        icon: AnimationIcon,
        title: "Enable Animations",
        titleKey: "settings.animations",
        description: "Show smooth transitions and animations",
        descriptionKey: "settings.animationsDescription",
        type: "switch",
        stateKey: "animations",
        settingsKey: "animations",
      },
      {
        id: "highContrast",
        icon: ContrastIcon,
        title: "High Contrast Mode",
        titleKey: "settings.highContrast",
        description: "Enhanced visibility for better accessibility",
        descriptionKey: "settings.highContrastDescription",
        type: "switch",
        stateKey: "highContrast",
        settingsKey: "highContrast",
      },
    ],
  },

  PREFERENCES: {
    id: "preferences",
    title: "Preferences",
    titleKey: "settings.preferences",
    icon: LanguageIcon,
    items: [
      {
        id: "language",
        icon: LanguageIcon,
        title: "Language",
        titleKey: "settings.language",
        description: "Choose your preferred language",
        descriptionKey: "settings.languageDescription",
        type: "select",
        stateKey: "language",
        settingsKey: "language",
        options: LANGUAGE_OPTIONS,
      },
      {
        id: "currency",
        icon: MonetizationOnIcon,
        title: "Default Currency",
        titleKey: "settings.defaultCurrency",
        description: "Set your preferred currency for transactions",
        descriptionKey: "settings.defaultCurrencyDescription",
        type: "select",
        stateKey: "currency",
        settingsKey: "currency",
        options: CURRENCY_OPTIONS,
      },
      {
        id: "dateFormat",
        icon: InfoIcon,
        title: "Date Format",
        titleKey: "settings.dateFormat",
        description: "Choose how dates are displayed",
        descriptionKey: "settings.dateFormatDescription",
        type: "select",
        stateKey: "dateFormat",
        settingsKey: "dateFormat",
        options: DATE_FORMAT_OPTIONS,
      },
      {
        id: "timeFormat",
        icon: TimerIcon,
        title: "Time Format",
        titleKey: "settings.timeFormat",
        description: "Choose 12-hour or 24-hour time format",
        descriptionKey: "settings.timeFormatDescription",
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
    titleKey: "settings.privacySecurity",
    icon: ShieldIcon,
    showChip: true,
    items: [
      {
        id: "profileVisibility",
        icon: VisibilityIcon,
        title: "Profile Visibility",
        titleKey: "settings.profileVisibility",
        description: "Control who can see your profile and expense information",
        descriptionKey: "settings.profileVisibilityDescription",
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
        titleKey: "settings.maskSensitiveData",
        description: "Hide expense amounts and financial details for privacy",
        descriptionKey: "settings.maskSensitiveDataDescription",
        type: "switch",
        stateKey: "maskSensitiveData",
        settingsKey: "maskSensitiveData",
      },
      {
        id: "twoFactor",
        icon: SecurityIcon,
        title: "Two-Factor Authentication",
        titleKey: "settings.twoFactorAuth",
        description:
          "Add an extra layer of security to your account via email OTP",
        descriptionKey: "settings.twoFactorAuthDescription",
        type: "switch",
        stateKey: "twoFactorEnabled",
        settingsKey: "twoFactorEnabled",
      },
      {
        id: "mfa",
        icon: PhonelinkLockIcon,
        title: "Authenticator App (MFA)",
        titleKey: "settings.mfaAuth",
        description:
          "Use Google Authenticator for enhanced security (takes priority over email 2FA)",
        descriptionKey: "settings.mfaAuthDescription",
        type: "button",
        buttonText: "Configure",
        buttonTextKey: "settings.configure",
        action: "configureMfa",
        priority: true, // Shows priority badge
      },
      {
        id: "blockedUsers",
        icon: BlockIcon,
        title: "Blocked Users",
        titleKey: "settings.blockedUsers",
        description: "Manage blocked users and privacy settings",
        descriptionKey: "settings.blockedUsersDescription",
        type: "button",
        buttonText: "Manage",
        buttonTextKey: "settings.manage",
        action: "manageBlockedUsers",
      },
      {
        id: "sessionTimeout",
        icon: TimerIcon,
        title: "Auto Logout",
        titleKey: "settings.autoLogout",
        description: "Automatically log out after period of inactivity",
        descriptionKey: "settings.autoLogoutDescription",
        type: "switch",
        stateKey: "sessionTimeout",
        settingsKey: "sessionTimeout",
      },
    ],
  },

  DATA_STORAGE: {
    id: "data_storage",
    title: "Data & Storage",
    titleKey: "settings.dataStorage",
    icon: StorageIcon,
    items: [
      {
        id: "autoBackup",
        icon: CloudDownloadIcon,
        title: "Auto Backup",
        titleKey: "settings.autoBackup",
        description: "Automatically backup your data to cloud",
        descriptionKey: "settings.autoBackupDescription",
        type: "switch",
        stateKey: "autoBackup",
        settingsKey: "autoBackup",
      },
      {
        id: "backupFrequency",
        icon: ScheduleIcon,
        title: "Backup Frequency",
        titleKey: "settings.backupFrequency",
        description: "How often to backup your data",
        descriptionKey: "settings.backupFrequencyDescription",
        type: "select",
        stateKey: "backupFrequency",
        settingsKey: "backupFrequency",
        options: BACKUP_FREQUENCY_OPTIONS,
      },
      {
        id: "cloudSync",
        icon: CloudSyncIcon,
        title: "Cloud Sync",
        titleKey: "settings.cloudSync",
        description: "Sync data across all your devices",
        descriptionKey: "settings.cloudSyncDescription",
        type: "switch",
        stateKey: "cloudSync",
        settingsKey: "cloudSync",
      },
      {
        id: "storageUsage",
        icon: StorageIcon,
        title: "Storage Usage",
        titleKey: "settings.storageUsage",
        description: "View your data storage usage",
        descriptionKey: "settings.storageUsageDescription",
        type: "button",
        buttonText: "View",
        buttonTextKey: "settings.view",
        action: "viewStorage",
      },
      {
        id: "clearCache",
        icon: DeleteSweepIcon,
        title: "Clear Cache",
        titleKey: "settings.clearCache",
        description: "Free up space by clearing cached data",
        descriptionKey: "settings.clearCacheDescription",
        type: "button",
        buttonText: "Clear",
        buttonTextKey: "settings.clear",
        action: "clearCache",
      },
    ],
  },

  SMART_FEATURES: {
    id: "smart_features",
    title: "Smart Features & Automation",
    titleKey: "settings.smartFeatures",
    icon: PsychologyIcon,
    items: [
      {
        id: "autoCategorize",
        icon: CategoryIcon,
        title: "Auto-Categorize Expenses",
        titleKey: "settings.autoCategorize",
        description: "AI-powered automatic expense categorization",
        descriptionKey: "settings.autoCategorizeDescription",
        type: "switch",
        stateKey: "autoCategorize",
        settingsKey: "autoCategorize",
      },
      {
        id: "smartBudgeting",
        icon: AutoAwesomeIcon,
        title: "Smart Budget Suggestions",
        titleKey: "settings.smartBudgeting",
        description: "Get AI recommendations for better budgeting",
        descriptionKey: "settings.smartBudgetingDescription",
        type: "switch",
        stateKey: "smartBudgeting",
        settingsKey: "smartBudgeting",
      },
      {
        id: "scheduledReports",
        icon: ScheduleIcon,
        title: "Scheduled Reports",
        titleKey: "settings.scheduledReports",
        description: "Receive automated expense reports",
        descriptionKey: "settings.scheduledReportsDescription",
        type: "select",
        stateKey: "scheduledReports",
        settingsKey: "scheduledReports",
        options: REPORT_SCHEDULE_OPTIONS,
      },
      {
        id: "expenseReminders",
        icon: NotificationImportantIcon,
        title: "Expense Reminders",
        titleKey: "settings.expenseReminders",
        description: "Get reminders for recurring expenses",
        descriptionKey: "settings.expenseRemindersDescription",
        type: "switch",
        stateKey: "expenseReminders",
        settingsKey: "expenseReminders",
      },
      {
        id: "predictiveAnalytics",
        icon: AssessmentIcon,
        title: "Predictive Analytics",
        titleKey: "settings.predictiveAnalytics",
        description: "Forecast future expenses based on patterns",
        descriptionKey: "settings.predictiveAnalyticsDescription",
        type: "switch",
        stateKey: "predictiveAnalytics",
        settingsKey: "predictiveAnalytics",
      },
    ],
  },

  ACCESSIBILITY: {
    id: "accessibility",
    title: "Accessibility",
    titleKey: "settings.accessibility",
    icon: AccessibleIcon,
    items: [
      {
        id: "screenReader",
        icon: RecordVoiceOverIcon,
        title: "Screen Reader Support",
        titleKey: "settings.screenReaderSupport",
        description: "Enhanced support for screen readers",
        descriptionKey: "settings.screenReaderSupportDescription",
        type: "switch",
        stateKey: "screenReader",
        settingsKey: "screenReader",
      },
      {
        id: "keyboardShortcuts",
        icon: KeyboardIcon,
        title: "Keyboard Shortcuts",
        titleKey: "settings.keyboardShortcuts",
        description: "Enable keyboard navigation shortcuts",
        descriptionKey: "settings.keyboardShortcutsDescription",
        type: "switch",
        stateKey: "keyboardShortcuts",
        settingsKey: "keyboardShortcuts",
      },
      {
        id: "showShortcutIndicators",
        icon: KeyboardIcon,
        title: "Show Shortcut Indicators",
        titleKey: "settings.showShortcutIndicators",
        description: "Display shortcut badges when Alt key is pressed",
        descriptionKey: "settings.showShortcutIndicatorsDescription",
        type: "switch",
        stateKey: "showShortcutIndicators",
        settingsKey: "showShortcutIndicators",
        indent: true, // Sub-option visual indicator
      },
      {
        id: "reduceMotion",
        icon: MotionPhotosOffIcon,
        title: "Reduce Motion",
        titleKey: "settings.reduceMotion",
        description: "Minimize animations for better accessibility",
        descriptionKey: "settings.reduceMotionDescription",
        type: "switch",
        stateKey: "reduceMotion",
        settingsKey: "reduceMotion",
      },
      {
        id: "focusIndicators",
        icon: Brightness4Icon,
        title: "Enhanced Focus Indicators",
        titleKey: "settings.enhancedFocusIndicators",
        description: "Highlight focused elements more prominently",
        descriptionKey: "settings.enhancedFocusIndicatorsDescription",
        type: "switch",
        stateKey: "focusIndicators",
        settingsKey: "focusIndicators",
      },
      {
        id: "keyboardShortcutsGuide",
        icon: KeyboardIcon,
        title: "Keyboard Shortcuts Guide",
        titleKey: "settings.keyboardShortcutsGuide",
        description: "View all available keyboard shortcuts",
        descriptionKey: "settings.keyboardShortcutsGuideDescription",
        type: "button",
        buttonText: "View",
        buttonTextKey: "settings.view",
        action: "viewShortcuts",
      },
    ],
  },

  ACCOUNT: {
    id: "account",
    title: "Account Management",
    titleKey: "settings.accountManagement",
    icon: AccountCircleIcon,
    items: [
      {
        id: "notificationSettings",
        icon: NotificationImportantIcon,
        title: "Notification Settings",
        titleKey: "settings.notificationSettings",
        description: "Manage all notification preferences and channels",
        descriptionKey: "settings.notificationSettingsDescription",
        type: "navigation",
        action: "notificationSettings",
        showStatus: true, // Special flag to show ON/OFF status
      },
      {
        id: "editProfile",
        icon: PersonIcon,
        title: "Edit Profile",
        titleKey: "settings.editProfile",
        description: "Update your personal information and preferences",
        descriptionKey: "settings.editProfileDescription",
        type: "button",
        buttonText: "Edit",
        buttonTextKey: "settings.edit",
        action: "editProfile",
      },
      {
        id: "changePassword",
        icon: LockIcon,
        title: "Change Password",
        titleKey: "settings.changePassword",
        description: "Update your account password",
        descriptionKey: "settings.changePasswordDescription",
        type: "button",
        buttonText: "Change",
        buttonTextKey: "settings.change",
        action: "changePassword",
      },
      {
        id: "dataExport",
        icon: StorageIcon,
        title: "Data Export",
        titleKey: "settings.dataExport",
        description: "Download all your expense data",
        descriptionKey: "settings.dataExportDescription",
        type: "button",
        buttonText: "Export",
        buttonTextKey: "settings.export",
        action: "exportData",
      },
      {
        id: "deleteAccount",
        icon: DeleteIcon,
        title: "Delete Account",
        titleKey: "settings.deleteAccount",
        description: "Permanently delete your account and all data",
        descriptionKey: "settings.deleteAccountDescription",
        type: "button",
        buttonText: "Delete",
        buttonTextKey: "settings.delete",
        action: "deleteAccount",
        isDanger: true,
      },
    ],
  },

  HELP_SUPPORT: {
    id: "help_support",
    title: "Help & Support",
    titleKey: "settings.helpSupport",
    icon: HelpIcon,
    items: [
      {
        id: "helpCenter",
        icon: HelpIcon,
        title: "Help Center",
        titleKey: "settings.helpCenter",
        description: "Browse FAQs and help articles",
        descriptionKey: "settings.helpCenterDescription",
        type: "navigation",
        action: "helpCenter",
      },
      {
        id: "contactSupport",
        icon: SupportIcon,
        title: "Contact Support",
        titleKey: "settings.contactSupport",
        description: "Get help from our support team",
        descriptionKey: "settings.contactSupportDescription",
        type: "navigation",
        action: "contactSupport",
      },
      {
        id: "termsOfService",
        icon: DescriptionIcon,
        title: "Terms of Service",
        titleKey: "settings.termsOfService",
        description: "Read our terms and conditions",
        descriptionKey: "settings.termsOfServiceDescription",
        type: "navigation",
        action: "termsOfService",
      },
      {
        id: "privacyPolicy",
        icon: ShieldIcon,
        title: "Privacy Policy",
        titleKey: "settings.privacyPolicy",
        description: "Learn about how we protect your data",
        descriptionKey: "settings.privacyPolicyDescription",
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
