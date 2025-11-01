/**
 * Notification Settings Configuration
 * Centralized configuration for all notification preferences
 * Follows DRY principle - define once, use everywhere
 */

import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  Email as EmailIcon,
  Assessment as AssessmentIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  AttachMoney as AttachMoneyIcon,
  EventNote as EventNoteIcon,
  Payment as PaymentIcon,
  Group as GroupIcon,
  Chat as ChatIcon,
  AccountBalanceWallet as WalletIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Celebration as CelebrationIcon,
  Schedule as ScheduleIcon,
  NotificationImportant as NotificationImportantIcon,
} from "@mui/icons-material";

/**
 * Notification delivery methods
 */
export const NOTIFICATION_METHODS = {
  IN_APP: "in_app",
  EMAIL: "email",
  PUSH: "push",
  SMS: "sms",
};

/**
 * Notification priority levels
 */
export const NOTIFICATION_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};

/**
 * Notification frequency options
 */
export const NOTIFICATION_FREQUENCY_OPTIONS = [
  { value: "instant", label: "⚡ Instant - Receive immediately" },
  { value: "hourly", label: "🕐 Hourly - Digest every hour" },
  { value: "daily", label: "📅 Daily - Once per day" },
  { value: "weekly", label: "📆 Weekly - Once per week" },
  { value: "never", label: "🔕 Never - Disable completely" },
];

/**
 * Quiet hours presets
 */
export const QUIET_HOURS_PRESETS = [
  { value: "none", label: "🔔 No Quiet Hours" },
  { value: "night", label: "🌙 Night (10 PM - 7 AM)" },
  { value: "work", label: "💼 Work Hours (9 AM - 5 PM)" },
  { value: "custom", label: "⚙️ Custom" },
];

/**
 * Notification Service Categories
 * Each service has its own notification preferences
 */
export const NOTIFICATION_SERVICES = {
  EXPENSE_SERVICE: {
    id: "expense_service",
    name: "Expense Service",
    description: "Notifications related to expense tracking and management",
    icon: AttachMoneyIcon,
    color: "#10b981",
    notifications: [
      {
        id: "expense_added",
        type: "EXPENSE_ADDED",
        title: "New Expense Added",
        description: "Get notified when a new expense is created",
        icon: ReceiptIcon,
        priority: NOTIFICATION_PRIORITY.MEDIUM,
        defaultEnabled: true,
        methods: {
          [NOTIFICATION_METHODS.IN_APP]: true,
          [NOTIFICATION_METHODS.EMAIL]: false,
          [NOTIFICATION_METHODS.PUSH]: true,
        },
      },
      {
        id: "expense_updated",
        type: "EXPENSE_UPDATED",
        title: "Expense Updated",
        description: "Get notified when an expense is modified",
        icon: InfoIcon,
        priority: NOTIFICATION_PRIORITY.LOW,
        defaultEnabled: true,
        methods: {
          [NOTIFICATION_METHODS.IN_APP]: true,
          [NOTIFICATION_METHODS.EMAIL]: false,
          [NOTIFICATION_METHODS.PUSH]: false,
        },
      },
      {
        id: "expense_deleted",
        type: "EXPENSE_DELETED",
        title: "Expense Deleted",
        description: "Get notified when an expense is removed",
        icon: InfoIcon,
        priority: NOTIFICATION_PRIORITY.LOW,
        defaultEnabled: false,
        methods: {
          [NOTIFICATION_METHODS.IN_APP]: true,
          [NOTIFICATION_METHODS.EMAIL]: false,
          [NOTIFICATION_METHODS.PUSH]: false,
        },
      },
      {
        id: "large_expense_alert",
        type: "LARGE_EXPENSE_ALERT",
        title: "Large Expense Alert",
        description: "Get notified about expenses above a certain threshold",
        icon: WarningIcon,
        priority: NOTIFICATION_PRIORITY.HIGH,
        defaultEnabled: true,
        methods: {
          [NOTIFICATION_METHODS.IN_APP]: true,
          [NOTIFICATION_METHODS.EMAIL]: true,
          [NOTIFICATION_METHODS.PUSH]: true,
        },
      },
    ],
  },

  BUDGET_SERVICE: {
    id: "budget_service",
    name: "Budget Service",
    description: "Notifications for budget limits, warnings, and alerts",
    icon: WalletIcon,
    color: "#f59e0b",
    notifications: [
      {
        id: "budget_exceeded",
        type: "BUDGET_EXCEEDED",
        title: "Budget Exceeded",
        description: "Critical alert when you exceed your budget limit",
        icon: WarningIcon,
        priority: NOTIFICATION_PRIORITY.CRITICAL,
        defaultEnabled: true,
        methods: {
          [NOTIFICATION_METHODS.IN_APP]: true,
          [NOTIFICATION_METHODS.EMAIL]: true,
          [NOTIFICATION_METHODS.PUSH]: true,
        },
      },
      {
        id: "budget_warning",
        type: "BUDGET_WARNING",
        title: "Budget Warning (80%)",
        description: "Warning when you reach 80% of your budget",
        icon: NotificationImportantIcon,
        priority: NOTIFICATION_PRIORITY.HIGH,
        defaultEnabled: true,
        methods: {
          [NOTIFICATION_METHODS.IN_APP]: true,
          [NOTIFICATION_METHODS.EMAIL]: true,
          [NOTIFICATION_METHODS.PUSH]: true,
        },
      },
      {
        id: "budget_limit_approaching",
        type: "BUDGET_LIMIT_APPROACHING",
        title: "Approaching Budget Limit (50%)",
        description: "Early warning at 50% of budget usage",
        icon: InfoIcon,
        priority: NOTIFICATION_PRIORITY.MEDIUM,
        defaultEnabled: true,
        methods: {
          [NOTIFICATION_METHODS.IN_APP]: true,
          [NOTIFICATION_METHODS.EMAIL]: false,
          [NOTIFICATION_METHODS.PUSH]: true,
        },
      },
      {
        id: "budget_created",
        type: "BUDGET_CREATED",
        title: "Budget Created",
        description: "Confirmation when a new budget is created",
        icon: CheckCircleIcon,
        priority: NOTIFICATION_PRIORITY.LOW,
        defaultEnabled: true,
        methods: {
          [NOTIFICATION_METHODS.IN_APP]: true,
          [NOTIFICATION_METHODS.EMAIL]: false,
          [NOTIFICATION_METHODS.PUSH]: false,
        },
      },
      {
        id: "budget_updated",
        type: "BUDGET_UPDATED",
        title: "Budget Updated",
        description: "Get notified when budget settings are modified",
        icon: InfoIcon,
        priority: NOTIFICATION_PRIORITY.LOW,
        defaultEnabled: false,
        methods: {
          [NOTIFICATION_METHODS.IN_APP]: true,
          [NOTIFICATION_METHODS.EMAIL]: false,
          [NOTIFICATION_METHODS.PUSH]: false,
        },
      },
      {
        id: "budget_deleted",
        type: "BUDGET_DELETED",
        title: "Budget Deleted",
        description: "Get notified when a budget is deleted",
        icon: InfoIcon,
        priority: NOTIFICATION_PRIORITY.LOW,
        defaultEnabled: false,
        methods: {
          [NOTIFICATION_METHODS.IN_APP]: true,
          [NOTIFICATION_METHODS.EMAIL]: false,
          [NOTIFICATION_METHODS.PUSH]: false,
        },
      },
    ],
  },

  BILL_SERVICE: {
    id: "bill_service",
    name: "Bill Service",
    description: "Reminders and alerts for bill payments and due dates",
    icon: EventNoteIcon,
    color: "#ef4444",
    notifications: [
      {
        id: "bill_added",
        type: "BILL_ADDED",
        title: "New Bill Added",
        description: "Get notified when a new bill is created",
        icon: ReceiptIcon,
        priority: NOTIFICATION_PRIORITY.MEDIUM,
        defaultEnabled: true,
        methods: {
          [NOTIFICATION_METHODS.IN_APP]: true,
          [NOTIFICATION_METHODS.EMAIL]: false,
          [NOTIFICATION_METHODS.PUSH]: true,
        },
      },
      {
        id: "bill_updated",
        type: "BILL_UPDATED",
        title: "Bill Updated",
        description: "Get notified when a bill is modified",
        icon: InfoIcon,
        priority: NOTIFICATION_PRIORITY.LOW,
        defaultEnabled: true,
        methods: {
          [NOTIFICATION_METHODS.IN_APP]: true,
          [NOTIFICATION_METHODS.EMAIL]: false,
          [NOTIFICATION_METHODS.PUSH]: false,
        },
      },
      {
        id: "bill_deleted",
        type: "BILL_DELETED",
        title: "Bill Deleted",
        description: "Get notified when a bill is removed",
        icon: InfoIcon,
        priority: NOTIFICATION_PRIORITY.LOW,
        defaultEnabled: false,
        methods: {
          [NOTIFICATION_METHODS.IN_APP]: true,
          [NOTIFICATION_METHODS.EMAIL]: false,
          [NOTIFICATION_METHODS.PUSH]: false,
        },
      },
      {
        id: "bill_due_reminder",
        type: "BILL_DUE_REMINDER",
        title: "Bill Due Reminder",
        description: "Reminder before bill due date (3 days before)",
        icon: ScheduleIcon,
        priority: NOTIFICATION_PRIORITY.HIGH,
        defaultEnabled: true,
        methods: {
          [NOTIFICATION_METHODS.IN_APP]: true,
          [NOTIFICATION_METHODS.EMAIL]: true,
          [NOTIFICATION_METHODS.PUSH]: true,
        },
      },
      {
        id: "bill_overdue",
        type: "BILL_OVERDUE",
        title: "Overdue Bill Alert",
        description: "Critical alert for overdue bills",
        icon: WarningIcon,
        priority: NOTIFICATION_PRIORITY.CRITICAL,
        defaultEnabled: true,
        methods: {
          [NOTIFICATION_METHODS.IN_APP]: true,
          [NOTIFICATION_METHODS.EMAIL]: true,
          [NOTIFICATION_METHODS.PUSH]: true,
        },
      },
      {
        id: "bill_paid",
        type: "BILL_PAID",
        title: "Bill Payment Confirmation",
        description: "Confirmation when a bill is marked as paid",
        icon: CheckCircleIcon,
        priority: NOTIFICATION_PRIORITY.MEDIUM,
        defaultEnabled: true,
        methods: {
          [NOTIFICATION_METHODS.IN_APP]: true,
          [NOTIFICATION_METHODS.EMAIL]: false,
          [NOTIFICATION_METHODS.PUSH]: false,
        },
      },
    ],
  },

  PAYMENT_METHOD_SERVICE: {
    id: "payment_method_service",
    name: "Payment Method Service",
    description: "Notifications for payment method changes and security",
    icon: PaymentIcon,
    color: "#3b82f6",
    notifications: [
      {
        id: "payment_method_added",
        type: "PAYMENT_METHOD_ADDED",
        title: "Payment Method Added",
        description: "Security notification when new payment method is added",
        icon: CheckCircleIcon,
        priority: NOTIFICATION_PRIORITY.HIGH,
        defaultEnabled: true,
        methods: {
          [NOTIFICATION_METHODS.IN_APP]: true,
          [NOTIFICATION_METHODS.EMAIL]: true,
          [NOTIFICATION_METHODS.PUSH]: true,
        },
      },
      {
        id: "payment_method_updated",
        type: "PAYMENT_METHOD_UPDATED",
        title: "Payment Method Updated",
        description: "Get notified about payment method modifications",
        icon: InfoIcon,
        priority: NOTIFICATION_PRIORITY.MEDIUM,
        defaultEnabled: true,
        methods: {
          [NOTIFICATION_METHODS.IN_APP]: true,
          [NOTIFICATION_METHODS.EMAIL]: true,
          [NOTIFICATION_METHODS.PUSH]: false,
        },
      },
      {
        id: "payment_method_removed",
        type: "PAYMENT_METHOD_REMOVED",
        title: "Payment Method Removed",
        description: "Security alert when payment method is deleted",
        icon: WarningIcon,
        priority: NOTIFICATION_PRIORITY.HIGH,
        defaultEnabled: true,
        methods: {
          [NOTIFICATION_METHODS.IN_APP]: true,
          [NOTIFICATION_METHODS.EMAIL]: true,
          [NOTIFICATION_METHODS.PUSH]: true,
        },
      },
    ],
  },

  FRIEND_SERVICE: {
    id: "friend_service",
    name: "Friend Service",
    description: "Social notifications for friend requests and activities",
    icon: GroupIcon,
    color: "#8b5cf6",
    notifications: [
      {
        id: "friend_request_received",
        type: "FRIEND_REQUEST_RECEIVED",
        title: "New Friend Request",
        description: "Get notified about new friend requests",
        icon: PersonIcon,
        priority: NOTIFICATION_PRIORITY.MEDIUM,
        defaultEnabled: true,
        methods: {
          [NOTIFICATION_METHODS.IN_APP]: true,
          [NOTIFICATION_METHODS.EMAIL]: false,
          [NOTIFICATION_METHODS.PUSH]: true,
        },
      },
      {
        id: "friend_request_accepted",
        type: "FRIEND_REQUEST_ACCEPTED",
        title: "Friend Request Accepted",
        description: "Get notified when someone accepts your friend request",
        icon: CelebrationIcon,
        priority: NOTIFICATION_PRIORITY.LOW,
        defaultEnabled: true,
        methods: {
          [NOTIFICATION_METHODS.IN_APP]: true,
          [NOTIFICATION_METHODS.EMAIL]: false,
          [NOTIFICATION_METHODS.PUSH]: false,
        },
      },
      {
        id: "friend_request_rejected",
        type: "FRIEND_REQUEST_REJECTED",
        title: "Friend Request Declined",
        description: "Get notified when friend request is declined",
        icon: InfoIcon,
        priority: NOTIFICATION_PRIORITY.LOW,
        defaultEnabled: false,
        methods: {
          [NOTIFICATION_METHODS.IN_APP]: true,
          [NOTIFICATION_METHODS.EMAIL]: false,
          [NOTIFICATION_METHODS.PUSH]: false,
        },
      },
    ],
  },

  ANALYTICS_SERVICE: {
    id: "analytics_service",
    name: "Analytics Service",
    description: "Insights, reports, and spending analysis notifications",
    icon: TrendingUpIcon,
    color: "#14b8a6",
    notifications: [
      {
        id: "weekly_summary",
        type: "WEEKLY_SUMMARY",
        title: "Weekly Expense Summary",
        description: "Receive weekly spending analysis and insights",
        icon: AssessmentIcon,
        priority: NOTIFICATION_PRIORITY.LOW,
        defaultEnabled: true,
        methods: {
          [NOTIFICATION_METHODS.IN_APP]: true,
          [NOTIFICATION_METHODS.EMAIL]: true,
          [NOTIFICATION_METHODS.PUSH]: false,
        },
      },
      {
        id: "monthly_report",
        type: "MONTHLY_REPORT",
        title: "Monthly Financial Report",
        description: "Comprehensive monthly expense and budget report",
        icon: DescriptionIcon,
        priority: NOTIFICATION_PRIORITY.LOW,
        defaultEnabled: true,
        methods: {
          [NOTIFICATION_METHODS.IN_APP]: true,
          [NOTIFICATION_METHODS.EMAIL]: true,
          [NOTIFICATION_METHODS.PUSH]: false,
        },
      },
      {
        id: "spending_trend_alert",
        type: "SPENDING_TREND_ALERT",
        title: "Unusual Spending Pattern",
        description: "Alert when spending patterns change significantly",
        icon: NotificationImportantIcon,
        priority: NOTIFICATION_PRIORITY.MEDIUM,
        defaultEnabled: true,
        methods: {
          [NOTIFICATION_METHODS.IN_APP]: true,
          [NOTIFICATION_METHODS.EMAIL]: false,
          [NOTIFICATION_METHODS.PUSH]: true,
        },
      },
    ],
  },

  SYSTEM_NOTIFICATIONS: {
    id: "system_notifications",
    name: "System Notifications",
    description: "App updates, security, and system-wide announcements",
    icon: NotificationsIcon,
    color: "#6b7280",
    notifications: [
      {
        id: "security_alert",
        type: "SECURITY_ALERT",
        title: "Security Alerts",
        description: "Critical security notifications and warnings",
        icon: WarningIcon,
        priority: NOTIFICATION_PRIORITY.CRITICAL,
        defaultEnabled: true,
        methods: {
          [NOTIFICATION_METHODS.IN_APP]: true,
          [NOTIFICATION_METHODS.EMAIL]: true,
          [NOTIFICATION_METHODS.PUSH]: true,
        },
      },
      {
        id: "app_update",
        type: "APP_UPDATE",
        title: "App Updates",
        description: "Notifications about new features and updates",
        icon: InfoIcon,
        priority: NOTIFICATION_PRIORITY.LOW,
        defaultEnabled: true,
        methods: {
          [NOTIFICATION_METHODS.IN_APP]: true,
          [NOTIFICATION_METHODS.EMAIL]: false,
          [NOTIFICATION_METHODS.PUSH]: false,
        },
      },
      {
        id: "maintenance_notice",
        type: "MAINTENANCE_NOTICE",
        title: "Maintenance Notices",
        description: "Scheduled maintenance and downtime alerts",
        icon: ScheduleIcon,
        priority: NOTIFICATION_PRIORITY.MEDIUM,
        defaultEnabled: true,
        methods: {
          [NOTIFICATION_METHODS.IN_APP]: true,
          [NOTIFICATION_METHODS.EMAIL]: true,
          [NOTIFICATION_METHODS.PUSH]: false,
        },
      },
    ],
  },
};

/**
 * Global notification settings
 */
export const GLOBAL_NOTIFICATION_SETTINGS = {
  MASTER_TOGGLE: {
    id: "master_notifications",
    title: "Enable All Notifications",
    description:
      "Master switch to enable or disable all notifications across the application",
    icon: NotificationsActiveIcon,
    defaultEnabled: true,
  },
  DO_NOT_DISTURB: {
    id: "do_not_disturb",
    title: "Do Not Disturb Mode",
    description: "Temporarily pause all notifications except critical alerts",
    icon: NotificationsIcon,
    defaultEnabled: false,
  },
  NOTIFICATION_SOUND: {
    id: "notification_sound",
    title: "Notification Sounds",
    description: "Play sound for incoming notifications",
    icon: NotificationsIcon,
    defaultEnabled: true,
  },
  BROWSER_NOTIFICATIONS: {
    id: "browser_notifications",
    title: "Browser Notifications",
    description: "Allow browser push notifications (requires permission)",
    icon: NotificationsIcon,
    defaultEnabled: false,
  },
  FLOATING_NOTIFICATIONS: {
    id: "floating_notifications",
    title: "Floating Notifications",
    description: "Show notifications as floating popups on screen",
    icon: NotificationsIcon,
    defaultEnabled: true,
  },
};

/**
 * Helper function to get all notification types as a flat array
 */
export const getAllNotificationTypes = () => {
  const types = [];
  Object.values(NOTIFICATION_SERVICES).forEach((service) => {
    service.notifications.forEach((notification) => {
      types.push({
        ...notification,
        serviceName: service.name,
        serviceId: service.id,
        serviceColor: service.color,
      });
    });
  });
  return types;
};

/**
 * Helper function to get notification config by type
 */
export const getNotificationConfigByType = (type) => {
  const allTypes = getAllNotificationTypes();
  return allTypes.find((notif) => notif.type === type);
};

/**
 * Default notification preferences structure
 */
export const getDefaultNotificationPreferences = () => {
  const preferences = {
    masterEnabled: true,
    doNotDisturb: false,
    notificationSound: true,
    browserNotifications: false,
    quietHours: {
      enabled: false,
      preset: "none",
      start: "22:00",
      end: "07:00",
    },
    services: {},
  };

  // Initialize all services and notifications
  Object.values(NOTIFICATION_SERVICES).forEach((service) => {
    preferences.services[service.id] = {
      enabled: true,
      notifications: {},
    };

    service.notifications.forEach((notification) => {
      preferences.services[service.id].notifications[notification.id] = {
        enabled: notification.defaultEnabled,
        frequency: "instant",
        methods: { ...notification.methods },
      };
    });
  });

  return preferences;
};
