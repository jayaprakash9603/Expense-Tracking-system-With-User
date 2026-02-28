/**
 * Notification Utilities
 * Helper functions for notification handling and formatting
 * Following DRY (Don't Repeat Yourself) principles
 */

/**
 * Notification type configurations
 * Maps notification types to their display properties
 */
export const NOTIFICATION_TYPE_CONFIG = {
  // Friend & Social Notifications
  FRIEND_REQUEST_RECEIVED: {
    category: "info",
    icon: "person",
    priority: "medium",
    sound: true,
  },
  FRIEND_REQUEST_ACCEPTED: {
    category: "success",
    icon: "person",
    priority: "medium",
    sound: true,
  },
  FRIEND_REQUEST_REJECTED: {
    category: "info",
    icon: "person",
    priority: "low",
    sound: false,
  },

  // Budget Notifications
  BUDGET_EXCEEDED: {
    category: "error",
    icon: "warning",
    priority: "high",
    sound: true,
  },
  BUDGET_WARNING: {
    category: "warning",
    icon: "warning",
    priority: "medium",
    sound: true,
  },
  BUDGET_CREATED: {
    category: "success",
    icon: "money",
    priority: "low",
    sound: false,
  },
  BUDGET_UPDATED: {
    category: "info",
    icon: "money",
    priority: "low",
    sound: false,
  },
  BUDGET_LIMIT_APPROACHING: {
    category: "warning",
    icon: "warning",
    priority: "medium",
    sound: true,
  },

  // Expense Notifications
  EXPENSE_ADDED: {
    category: "success",
    icon: "money",
    priority: "low",
    sound: false,
  },
  EXPENSE_UPDATED: {
    category: "info",
    icon: "money",
    priority: "low",
    sound: false,
  },
  EXPENSE_DELETED: {
    category: "info",
    icon: "money",
    priority: "low",
    sound: false,
  },
  UNUSUAL_SPENDING: {
    category: "warning",
    icon: "warning",
    priority: "medium",
    sound: true,
  },

  // Bill Notifications
  BILL_DUE_REMINDER: {
    category: "warning",
    icon: "bill",
    priority: "high",
    sound: true,
  },
  BILL_OVERDUE: {
    category: "error",
    icon: "bill",
    priority: "high",
    sound: true,
  },
  BILL_PAID: {
    category: "success",
    icon: "bill",
    priority: "medium",
    sound: false,
  },
  BILL_CREATED: {
    category: "info",
    icon: "bill",
    priority: "low",
    sound: false,
  },

  // Payment Method Notifications
  PAYMENT_METHOD_ADDED: {
    category: "success",
    icon: "money",
    priority: "medium",
    sound: false,
  },
  PAYMENT_METHOD_UPDATED: {
    category: "info",
    icon: "money",
    priority: "low",
    sound: false,
  },
  PAYMENT_METHOD_DELETED: {
    category: "info",
    icon: "money",
    priority: "low",
    sound: false,
  },

  // Category Notifications
  CATEGORY_CREATED: {
    category: "success",
    icon: "category",
    priority: "low",
    sound: false,
  },
  CATEGORY_UPDATED: {
    category: "info",
    icon: "category",
    priority: "low",
    sound: false,
  },
  CATEGORY_BUDGET_EXCEEDED: {
    category: "warning",
    icon: "category",
    priority: "medium",
    sound: true,
  },

  // Report Notifications
  MONTHLY_SUMMARY: {
    category: "info",
    icon: "report",
    priority: "medium",
    sound: false,
  },
  WEEKLY_REPORT: {
    category: "info",
    icon: "report",
    priority: "low",
    sound: false,
  },

  // System Notifications
  CUSTOM_ALERT: {
    category: "info",
    icon: "info",
    priority: "medium",
    sound: false,
  },
  SECURITY_ALERT: {
    category: "error",
    icon: "warning",
    priority: "high",
    sound: true,
  },
};

/**
 * Get notification configuration by type
 * @param {string} type - Notification type
 * @returns {Object} Notification configuration
 */
export const getNotificationConfig = (type) => {
  return (
    NOTIFICATION_TYPE_CONFIG[type] || {
      category: "info",
      icon: "info",
      priority: "low",
      sound: false,
    }
  );
};

/**
 * Format notification for display
 * @param {Object} rawNotification - Raw notification from backend
 * @returns {Object} Formatted notification
 */
export const formatNotification = (rawNotification) => {
  const config = getNotificationConfig(rawNotification.type);

  return {
    id: rawNotification.id,
    type: rawNotification.type,
    category: config.category,
    icon: config.icon,
    priority: rawNotification.priority || config.priority,
    title: rawNotification.title,
    message: rawNotification.message,
    timestamp:
      rawNotification.createdAt ||
      rawNotification.timestamp ||
      new Date().toISOString(),
    read: rawNotification.isRead || rawNotification.read || false,
    metadata: rawNotification.metadata,
    userId: rawNotification.userId,
  };
};

/**
 * Format timestamp to relative time
 * @param {string|Date} timestamp - Timestamp to format
 * @returns {string} Formatted relative time
 */
export const formatRelativeTime = (timestamp) => {
  // ✅ Handle null, undefined, or invalid timestamps
  if (!timestamp) {
    return "Unknown time";
  }

  try {
    const date =
      typeof timestamp === "string" ? new Date(timestamp) : timestamp;

    // ✅ Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn("Invalid timestamp:", timestamp);
      return "Invalid date";
    }

    const now = new Date();
    const diff = now - date;

    // ✅ Handle future dates (system clock issues)
    if (diff < 0) {
      return "Just now";
    }

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    if (weeks < 4) return `${weeks}w ago`;
    if (months < 12) return `${months}mo ago`;
    return date.toLocaleDateString();
  } catch (error) {
    console.error("Error formatting timestamp:", timestamp, error);
    return "Unknown time";
  }
};

/**
 * Group notifications by time period
 * @param {Array} notifications - Array of notifications
 * @returns {Object} Grouped notifications
 */
export const groupNotificationsByTime = (notifications) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today - 86400000);

  const groups = {
    Today: [],
    Yesterday: [],
    Earlier: [],
  };

  notifications.forEach((notif) => {
    const notifDate =
      typeof notif.timestamp === "string"
        ? new Date(notif.timestamp)
        : notif.timestamp;
    const notifDay = new Date(
      notifDate.getFullYear(),
      notifDate.getMonth(),
      notifDate.getDate()
    );

    if (notifDay.getTime() === today.getTime()) {
      groups.Today.push(notif);
    } else if (notifDay.getTime() === yesterday.getTime()) {
      groups.Yesterday.push(notif);
    } else {
      groups.Earlier.push(notif);
    }
  });

  return groups;
};

/**
 * Filter notifications by criteria
 * @param {Array} notifications - Array of notifications
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered notifications
 */
export const filterNotifications = (notifications, filters = {}) => {
  let filtered = [...notifications];

  // Filter by read status
  if (filters.read === true) {
    filtered = filtered.filter((n) => n.read === true);
  } else if (filters.read === false) {
    filtered = filtered.filter((n) => n.read === false);
  }

  // Filter by type
  if (filters.type) {
    filtered = filtered.filter((n) => n.type === filters.type);
  }

  // Filter by category
  if (filters.category) {
    filtered = filtered.filter((n) => n.category === filters.category);
  }

  // Filter by priority
  if (filters.priority) {
    filtered = filtered.filter((n) => n.priority === filters.priority);
  }

  // Filter by date range
  if (filters.startDate) {
    const startDate = new Date(filters.startDate);
    filtered = filtered.filter((n) => {
      const notifDate = new Date(n.timestamp);
      return notifDate >= startDate;
    });
  }

  if (filters.endDate) {
    const endDate = new Date(filters.endDate);
    filtered = filtered.filter((n) => {
      const notifDate = new Date(n.timestamp);
      return notifDate <= endDate;
    });
  }

  return filtered;
};

/**
 * Sort notifications
 * @param {Array} notifications - Array of notifications
 * @param {string} sortBy - Sort field (timestamp, priority, read)
 * @param {string} order - Sort order (asc, desc)
 * @returns {Array} Sorted notifications
 */
export const sortNotifications = (
  notifications,
  sortBy = "timestamp",
  order = "desc"
) => {
  const sorted = [...notifications];

  sorted.sort((a, b) => {
    let valueA, valueB;

    switch (sortBy) {
      case "timestamp":
        valueA = new Date(a.timestamp).getTime();
        valueB = new Date(b.timestamp).getTime();
        break;
      case "priority":
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        valueA = priorityOrder[a.priority] || 0;
        valueB = priorityOrder[b.priority] || 0;
        break;
      case "read":
        valueA = a.read ? 1 : 0;
        valueB = b.read ? 1 : 0;
        break;
      default:
        return 0;
    }

    if (order === "asc") {
      return valueA - valueB;
    } else {
      return valueB - valueA;
    }
  });

  return sorted;
};

/**
 * Play notification sound
 * @param {boolean} enabled - Whether sound is enabled
 */
export const playNotificationSound = (enabled = true) => {
  if (!enabled) return;

  try {
    const audio = new Audio("/notification-sound.mp3");
    audio.volume = 0.5;
    audio.play().catch((error) => {
      console.warn("Could not play notification sound:", error);
    });
  } catch (error) {
    console.warn("Error playing notification sound:", error);
  }
};

/**
 * Request browser notification permission
 * @returns {Promise<boolean>} Whether permission was granted
 */
export const requestBrowserNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

/**
 * Show browser notification
 * @param {Object} notification - Notification object
 */
export const showBrowserNotification = (notification) => {
  if (Notification.permission !== "granted") {
    return;
  }

  try {
    const browserNotif = new Notification(
      notification.title || "New Notification",
      {
        body: notification.message || "",
        icon: "/notification-icon.png",
        badge: "/notification-badge.png",
        tag: `notification-${notification.id}`,
        requireInteraction: notification.priority === "high",
        silent: false,
      }
    );

    browserNotif.onclick = () => {
      window.focus();
      browserNotif.close();
    };
  } catch (error) {
    console.warn("Error showing browser notification:", error);
  }
};

/**
 * Get unread notification count
 * @param {Array} notifications - Array of notifications
 * @returns {number} Unread count
 */
export const getUnreadCount = (notifications) => {
  return notifications.filter((n) => !n.read).length;
};

/**
 * Mark notifications as read
 * @param {Array} notifications - Array of notifications
 * @param {Array|number} ids - Notification ID(s) to mark as read
 * @returns {Array} Updated notifications
 */
export const markNotificationsAsRead = (notifications, ids) => {
  const idArray = Array.isArray(ids) ? ids : [ids];

  return notifications.map((n) => {
    if (idArray.includes(n.id)) {
      return { ...n, read: true };
    }
    return n;
  });
};

/**
 * Get notification icon component based on type
 * @param {string} type - Notification type
 * @returns {JSX.Element} Icon component
 */
export const getNotificationIcon = (type) => {
  const config = getNotificationConfig(type);
  const iconType = config.icon;

  const icons = {
    person: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
          clipRule="evenodd"
        />
      </svg>
    ),
    money: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
          clipRule="evenodd"
        />
      </svg>
    ),
    bill: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
        <path
          fillRule="evenodd"
          d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
          clipRule="evenodd"
        />
      </svg>
    ),
    category: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
      </svg>
    ),
    report: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
    success: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
    ),
  };

  return icons[iconType] || icons.info;
};

/**
 * Get notification color based on type
 * @param {string} type - Notification type
 * @returns {string} CSS class for background color
 */
export const getNotificationColor = (type) => {
  const config = getNotificationConfig(type);
  const category = config.category;

  const colors = {
    success: "bg-green-100 text-green-600",
    error: "bg-red-100 text-red-600",
    warning: "bg-yellow-100 text-yellow-600",
    info: "bg-blue-100 text-blue-600",
  };

  return colors[category] || colors.info;
};

export default {
  getNotificationConfig,
  formatNotification,
  formatRelativeTime,
  groupNotificationsByTime,
  filterNotifications,
  sortNotifications,
  playNotificationSound,
  requestBrowserNotificationPermission,
  showBrowserNotification,
  getUnreadCount,
  markNotificationsAsRead,
  getNotificationIcon,
  getNotificationColor,
};
