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
    ],
  },

  NOTIFICATIONS: {
    id: "notifications",
    title: "Notifications",
    icon: NotificationsIcon,
    items: [
      {
        id: "emailNotifications",
        icon: EmailIcon,
        title: "Email Notifications",
        description: "Receive email updates about expenses and activities",
        type: "switch",
        stateKey: "emailNotifications",
        settingsKey: "emailNotifications",
      },
      {
        id: "budgetAlerts",
        icon: AssessmentIcon,
        title: "Budget Alerts",
        description: "Get notified when approaching budget limits",
        type: "switch",
        stateKey: "budgetAlerts",
        settingsKey: "budgetAlerts",
      },
      {
        id: "weeklyReports",
        icon: DescriptionIcon,
        title: "Weekly Reports",
        description: "Receive weekly expense summaries via email",
        type: "switch",
        stateKey: "weeklyReports",
        settingsKey: "weeklyReports",
      },
      {
        id: "pushNotifications",
        icon: NotificationsIcon,
        title: "Push Notifications",
        description: "Receive real-time notifications in your browser",
        type: "switch",
        stateKey: "pushNotifications",
        settingsKey: "pushNotifications",
      },
      {
        id: "friendRequests",
        icon: PersonIcon,
        title: "Friend Request Notifications",
        description: "Get notified about new friend requests",
        type: "switch",
        stateKey: "friendRequests",
        settingsKey: "friendRequestNotifications",
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
    ],
  },

  ACCOUNT: {
    id: "account",
    title: "Account Management",
    icon: AccountCircleIcon,
    items: [
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
