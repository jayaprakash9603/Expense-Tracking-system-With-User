/**
 * Notification Type Configuration
 * Maps notification types to their visual representation
 * Following Material Design principles for consistency
 */

import {
  Notifications,
  Person,
  PersonAdd,
  PersonRemove,
  Check,
  Close,
  Message,
  Event,
  Payment,
  Category,
  AccountBalanceWallet,
  ReceiptLong,
  Celebration,
  Warning,
  Error,
  Info,
  MoneyOff,
  TrendingUp,
  TrendingDown,
  Group,
  Chat,
  Comment,
} from "@mui/icons-material";

/**
 * Priority Levels
 */
export const PRIORITY_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};

/**
 * Notification Type Configurations
 * Each type has: icon, color, defaultDuration, priority
 */
export const NOTIFICATION_TYPE_CONFIG = {
  // ==========================================
  // FRIEND RELATED NOTIFICATIONS
  // ==========================================
  FRIEND_REQUEST_RECEIVED: {
    icon: PersonAdd,
    color: "#3b82f6", // Blue
    gradient: "linear-gradient(135deg, #3b82f6, #2563eb)",
    bgColor: "rgba(59, 130, 246, 0.1)",
    borderColor: "rgba(59, 130, 246, 0.3)",
    defaultDuration: 6000,
    priority: PRIORITY_LEVELS.HIGH,
    sound: true,
  },
  FRIEND_REQUEST_ACCEPTED: {
    icon: Check,
    color: "#10b981", // Green
    gradient: "linear-gradient(135deg, #10b981, #059669)",
    bgColor: "rgba(16, 185, 129, 0.1)",
    borderColor: "rgba(16, 185, 129, 0.3)",
    defaultDuration: 5000,
    priority: PRIORITY_LEVELS.MEDIUM,
    sound: true,
  },
  FRIEND_REQUEST_REJECTED: {
    icon: Close,
    color: "#ef4444", // Red
    gradient: "linear-gradient(135deg, #ef4444, #dc2626)",
    bgColor: "rgba(239, 68, 68, 0.1)",
    borderColor: "rgba(239, 68, 68, 0.3)",
    defaultDuration: 4000,
    priority: PRIORITY_LEVELS.LOW,
    sound: false,
  },
  FRIENDSHIP_REMOVED: {
    icon: PersonRemove,
    color: "#f59e0b", // Amber
    gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
    bgColor: "rgba(245, 158, 11, 0.1)",
    borderColor: "rgba(245, 158, 11, 0.3)",
    defaultDuration: 4000,
    priority: PRIORITY_LEVELS.MEDIUM,
    sound: false,
  },

  // ==========================================
  // EXPENSE RELATED NOTIFICATIONS
  // ==========================================
  EXPENSE_ADDED: {
    icon: ReceiptLong,
    color: "#8b5cf6", // Purple
    gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    bgColor: "rgba(139, 92, 246, 0.1)",
    borderColor: "rgba(139, 92, 246, 0.3)",
    defaultDuration: 4000,
    priority: PRIORITY_LEVELS.MEDIUM,
    sound: false,
  },
  EXPENSE_UPDATED: {
    icon: ReceiptLong,
    color: "#06b6d4", // Cyan
    gradient: "linear-gradient(135deg, #06b6d4, #0891b2)",
    bgColor: "rgba(6, 182, 212, 0.1)",
    borderColor: "rgba(6, 182, 212, 0.3)",
    defaultDuration: 4000,
    priority: PRIORITY_LEVELS.LOW,
    sound: false,
  },
  EXPENSE_DELETED: {
    icon: MoneyOff,
    color: "#64748b", // Slate
    gradient: "linear-gradient(135deg, #64748b, #475569)",
    bgColor: "rgba(100, 116, 139, 0.1)",
    borderColor: "rgba(100, 116, 139, 0.3)",
    defaultDuration: 3000,
    priority: PRIORITY_LEVELS.LOW,
    sound: false,
  },
  EXPENSE_SHARED: {
    icon: Group,
    color: "#14b8a6", // Teal
    gradient: "linear-gradient(135deg, #14b8a6, #0d9488)",
    bgColor: "rgba(20, 184, 166, 0.1)",
    borderColor: "rgba(20, 184, 166, 0.3)",
    defaultDuration: 5000,
    priority: PRIORITY_LEVELS.MEDIUM,
    sound: true,
  },

  // ==========================================
  // BUDGET RELATED NOTIFICATIONS
  // ==========================================
  BUDGET_THRESHOLD_WARNING: {
    icon: Warning,
    color: "#f59e0b", // Amber
    gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
    bgColor: "rgba(245, 158, 11, 0.1)",
    borderColor: "rgba(245, 158, 11, 0.3)",
    defaultDuration: 7000,
    priority: PRIORITY_LEVELS.HIGH,
    sound: true,
  },
  BUDGET_EXCEEDED: {
    icon: Error,
    color: "#ef4444", // Red
    gradient: "linear-gradient(135deg, #ef4444, #dc2626)",
    bgColor: "rgba(239, 68, 68, 0.1)",
    borderColor: "rgba(239, 68, 68, 0.3)",
    defaultDuration: 8000,
    priority: PRIORITY_LEVELS.CRITICAL,
    sound: true,
  },
  BUDGET_CREATED: {
    icon: AccountBalanceWallet,
    color: "#10b981", // Green
    gradient: "linear-gradient(135deg, #10b981, #059669)",
    bgColor: "rgba(16, 185, 129, 0.1)",
    borderColor: "rgba(16, 185, 129, 0.3)",
    defaultDuration: 4000,
    priority: PRIORITY_LEVELS.MEDIUM,
    sound: false,
  },
  BUDGET_UPDATED: {
    icon: TrendingUp,
    color: "#06b6d4", // Cyan
    gradient: "linear-gradient(135deg, #06b6d4, #0891b2)",
    bgColor: "rgba(6, 182, 212, 0.1)",
    borderColor: "rgba(6, 182, 212, 0.3)",
    defaultDuration: 4000,
    priority: PRIORITY_LEVELS.LOW,
    sound: false,
  },

  // ==========================================
  // BILL RELATED NOTIFICATIONS
  // ==========================================
  BILL_DUE_SOON: {
    icon: Event,
    color: "#f59e0b", // Amber
    gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
    bgColor: "rgba(245, 158, 11, 0.1)",
    borderColor: "rgba(245, 158, 11, 0.3)",
    defaultDuration: 7000,
    priority: PRIORITY_LEVELS.HIGH,
    sound: true,
  },
  BILL_OVERDUE: {
    icon: Error,
    color: "#ef4444", // Red
    gradient: "linear-gradient(135deg, #ef4444, #dc2626)",
    bgColor: "rgba(239, 68, 68, 0.1)",
    borderColor: "rgba(239, 68, 68, 0.3)",
    defaultDuration: 8000,
    priority: PRIORITY_LEVELS.CRITICAL,
    sound: true,
  },
  BILL_PAID: {
    icon: Payment,
    color: "#10b981", // Green
    gradient: "linear-gradient(135deg, #10b981, #059669)",
    bgColor: "rgba(16, 185, 129, 0.1)",
    borderColor: "rgba(16, 185, 129, 0.3)",
    defaultDuration: 5000,
    priority: PRIORITY_LEVELS.MEDIUM,
    sound: true,
  },
  BILL_REMINDER: {
    icon: Notifications,
    color: "#3b82f6", // Blue
    gradient: "linear-gradient(135deg, #3b82f6, #2563eb)",
    bgColor: "rgba(59, 130, 246, 0.1)",
    borderColor: "rgba(59, 130, 246, 0.3)",
    defaultDuration: 6000,
    priority: PRIORITY_LEVELS.HIGH,
    sound: true,
  },

  // ==========================================
  // CHAT & MESSAGING
  // ==========================================
  NEW_MESSAGE: {
    icon: Message,
    color: "#8b5cf6", // Purple
    gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    bgColor: "rgba(139, 92, 246, 0.1)",
    borderColor: "rgba(139, 92, 246, 0.3)",
    defaultDuration: 5000,
    priority: PRIORITY_LEVELS.MEDIUM,
    sound: true,
  },
  NEW_COMMENT: {
    icon: Comment,
    color: "#06b6d4", // Cyan
    gradient: "linear-gradient(135deg, #06b6d4, #0891b2)",
    bgColor: "rgba(6, 182, 212, 0.1)",
    borderColor: "rgba(6, 182, 212, 0.3)",
    defaultDuration: 4000,
    priority: PRIORITY_LEVELS.LOW,
    sound: false,
  },

  // ==========================================
  // SYSTEM NOTIFICATIONS
  // ==========================================
  SYSTEM_UPDATE: {
    icon: Info,
    color: "#3b82f6", // Blue
    gradient: "linear-gradient(135deg, #3b82f6, #2563eb)",
    bgColor: "rgba(59, 130, 246, 0.1)",
    borderColor: "rgba(59, 130, 246, 0.3)",
    defaultDuration: 5000,
    priority: PRIORITY_LEVELS.LOW,
    sound: false,
  },
  ACHIEVEMENT: {
    icon: Celebration,
    color: "#f59e0b", // Amber
    gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
    bgColor: "rgba(245, 158, 11, 0.1)",
    borderColor: "rgba(245, 158, 11, 0.3)",
    defaultDuration: 6000,
    priority: PRIORITY_LEVELS.MEDIUM,
    sound: true,
  },

  // ==========================================
  // DEFAULT/FALLBACK
  // ==========================================
  DEFAULT: {
    icon: Notifications,
    color: "#64748b", // Slate
    gradient: "linear-gradient(135deg, #64748b, #475569)",
    bgColor: "rgba(100, 116, 139, 0.1)",
    borderColor: "rgba(100, 116, 139, 0.3)",
    defaultDuration: 5000,
    priority: PRIORITY_LEVELS.MEDIUM,
    sound: false,
  },
};

/**
 * Get configuration for a notification type
 * @param {string} type - Notification type
 * @returns {Object} Configuration object
 */
export const getNotificationConfig = (type) => {
  return NOTIFICATION_TYPE_CONFIG[type] || NOTIFICATION_TYPE_CONFIG.DEFAULT;
};

/**
 * Duration multipliers based on priority
 */
export const PRIORITY_DURATION_MULTIPLIERS = {
  [PRIORITY_LEVELS.LOW]: 0.8,
  [PRIORITY_LEVELS.MEDIUM]: 1.0,
  [PRIORITY_LEVELS.HIGH]: 1.2,
  [PRIORITY_LEVELS.CRITICAL]: 1.5,
};

/**
 * Get duration with priority adjustment
 * @param {string} type - Notification type
 * @param {number} baseDuration - Base duration in ms
 * @returns {number} Adjusted duration
 */
export const getAdjustedDuration = (type, baseDuration = null) => {
  const config = getNotificationConfig(type);
  const duration = baseDuration || config.defaultDuration;
  const multiplier =
    PRIORITY_DURATION_MULTIPLIERS[config.priority] ||
    PRIORITY_DURATION_MULTIPLIERS[PRIORITY_LEVELS.MEDIUM];
  return Math.round(duration * multiplier);
};
