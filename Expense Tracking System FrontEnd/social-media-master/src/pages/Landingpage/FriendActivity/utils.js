/**
 * Friend Activity Utilities
 * Helper functions for activity data transformation and formatting.
 */

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";

dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isYesterday);

/**
 * Format timestamp to relative time (e.g., "2 hours ago")
 * @param {string|Date} timestamp - The timestamp to format
 * @returns {string} Formatted relative time string
 */
export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return "";
  return dayjs(timestamp).fromNow();
};

/**
 * Format timestamp to full date/time
 * @param {string|Date} timestamp - The timestamp to format
 * @param {string} format - Optional dayjs format string
 * @returns {string} Formatted date string
 */
export const formatDateTime = (timestamp, format = "MMM D, YYYY h:mm A") => {
  if (!timestamp) return "";
  return dayjs(timestamp).format(format);
};

/**
 * Format timestamp for display with smart formatting
 * Shows "Today", "Yesterday", or date
 * @param {string|Date} timestamp - The timestamp to format
 * @returns {string} Smart formatted date string
 */
export const formatSmartDate = (timestamp) => {
  if (!timestamp) return "";
  const date = dayjs(timestamp);

  if (date.isToday()) {
    return `Today at ${date.format("h:mm A")}`;
  }
  if (date.isYesterday()) {
    return `Yesterday at ${date.format("h:mm A")}`;
  }
  return date.format("MMM D, YYYY h:mm A");
};

/**
 * Format currency amount
 * @param {number} amount - The amount to format
 * @param {string} symbol - Currency symbol (default: $)
 * @returns {string} Formatted currency string
 */
export const formatAmount = (amount, symbol = "$") => {
  if (amount == null || isNaN(amount)) return "";
  const formatted = Math.abs(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formatted}`;
};

/**
 * Parse metadata JSON string safely
 * @param {string} metadata - JSON string or object
 * @returns {Object} Parsed metadata or empty object
 */
export const parseMetadata = (metadata) => {
  if (!metadata) return {};
  if (typeof metadata === "object") return metadata;
  try {
    return JSON.parse(metadata);
  } catch (e) {
    console.warn("Failed to parse activity metadata:", e);
    return {};
  }
};

/**
 * Get entity type color for styling
 * @param {string} entityType - Entity type (EXPENSE, BILL, etc.)
 * @returns {string} Color code
 */
export const getEntityColor = (entityType) => {
  const colors = {
    EXPENSE: "#14b8a6",
    BILL: "#f59e0b",
    BUDGET: "#8b5cf6",
    CATEGORY: "#3b82f6",
    PAYMENT: "#ec4899",
  };
  return colors[entityType] || "#6b7280";
};

/**
 * Get action color for styling
 * @param {string} action - Action type (CREATE, UPDATE, DELETE)
 * @returns {string} Color code
 */
export const getActionColor = (action) => {
  const colors = {
    CREATE: "#22c55e",
    UPDATE: "#3b82f6",
    DELETE: "#ef4444",
  };
  return colors[action] || "#6b7280";
};

/**
 * Get activity icon name based on entity type
 * @param {string} entityType - Entity type
 * @returns {string} Icon name/identifier
 */
export const getActivityIcon = (entityType) => {
  const icons = {
    EXPENSE: "receipt_long",
    BILL: "description",
    BUDGET: "account_balance_wallet",
    CATEGORY: "category",
    PAYMENT: "payment",
  };
  return icons[entityType] || "info";
};

/**
 * Group activities by date
 * @param {Array} activities - Array of activity objects
 * @returns {Array} Array of grouped activities with labels
 */
export const groupActivitiesByDate = (activities) => {
  if (!Array.isArray(activities) || activities.length === 0) return [];

  const grouped = {};

  activities.forEach((activity) => {
    const date = dayjs(activity.timestamp);
    let label;

    if (date.isToday()) {
      label = "Today";
    } else if (date.isYesterday()) {
      label = "Yesterday";
    } else if (date.isAfter(dayjs().subtract(7, "day"))) {
      label = "This Week";
    } else if (date.isAfter(dayjs().subtract(30, "day"))) {
      label = "This Month";
    } else {
      label = date.format("MMMM YYYY");
    }

    if (!grouped[label]) {
      grouped[label] = {
        label,
        items: [],
        key: label.toLowerCase().replace(/\s+/g, "-"),
      };
    }
    grouped[label].items.push(activity);
  });

  // Return in chronological order (most recent first)
  const order = ["Today", "Yesterday", "This Week", "This Month"];
  return Object.values(grouped).sort((a, b) => {
    const aIndex = order.indexOf(a.label);
    const bIndex = order.indexOf(b.label);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return dayjs(b.items[0]?.timestamp).diff(dayjs(a.items[0]?.timestamp));
  });
};

/**
 * Group activities by service type
 * @param {Array} activities - Array of activity objects
 * @returns {Array} Array of grouped activities with labels
 */
export const groupActivitiesByService = (activities) => {
  if (!Array.isArray(activities) || activities.length === 0) return [];

  const grouped = {};
  const serviceOrder = ["EXPENSE", "BILL", "BUDGET", "CATEGORY", "PAYMENT"];
  const serviceLabels = {
    EXPENSE: "Expenses",
    BILL: "Bills",
    BUDGET: "Budgets",
    CATEGORY: "Categories",
    PAYMENT: "Payments",
  };

  activities.forEach((activity) => {
    const service = activity.sourceService || "OTHER";
    if (!grouped[service]) {
      grouped[service] = {
        label: serviceLabels[service] || service,
        items: [],
        key: service.toLowerCase(),
        service,
      };
    }
    grouped[service].items.push(activity);
  });

  return Object.values(grouped).sort((a, b) => {
    const aIndex = serviceOrder.indexOf(a.service);
    const bIndex = serviceOrder.indexOf(b.service);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.label.localeCompare(b.label);
  });
};

/**
 * Group activities by friend/actor
 * @param {Array} activities - Array of activity objects
 * @returns {Array} Array of grouped activities with labels
 */
export const groupActivitiesByFriend = (activities) => {
  if (!Array.isArray(activities) || activities.length === 0) return [];

  const grouped = {};

  activities.forEach((activity) => {
    const friendId = activity.actorUserId;
    const friendName = activity.actorUserName || `User ${friendId}`;
    const friendKey = `friend-${friendId}`;

    if (!grouped[friendKey]) {
      grouped[friendKey] = {
        label: friendName,
        items: [],
        key: friendKey,
        friendId,
        actorUser: activity.actorUser,
      };
    }
    grouped[friendKey].items.push(activity);
  });

  // Sort by activity count (most active first), then alphabetically
  return Object.values(grouped).sort((a, b) => {
    const countDiff = b.items.length - a.items.length;
    if (countDiff !== 0) return countDiff;
    return a.label.localeCompare(b.label);
  });
};

/**
 * Calculate activity statistics
 * @param {Array} activities - Array of activity objects
 * @returns {Object} Statistics object
 */
export const calculateActivityStats = (activities) => {
  if (!Array.isArray(activities) || activities.length === 0) {
    return {
      total: 0,
      unread: 0,
      byService: {},
      byAction: {},
      totalAmount: 0,
    };
  }

  const stats = {
    total: activities.length,
    unread: activities.filter((a) => !a.isRead).length,
    byService: {},
    byAction: {},
    totalAmount: 0,
  };

  activities.forEach((activity) => {
    // Count by service
    const service = activity.sourceService || "OTHER";
    stats.byService[service] = (stats.byService[service] || 0) + 1;

    // Count by action
    const action = activity.action || "OTHER";
    stats.byAction[action] = (stats.byAction[action] || 0) + 1;

    // Sum amounts
    if (activity.amount != null && !isNaN(activity.amount)) {
      stats.totalAmount += Math.abs(activity.amount);
    }
  });

  return stats;
};

/**
 * Build activity description from entity payload
 * @param {Object} activity - Activity object
 * @returns {string} Human-readable description
 */
export const buildActivityDescription = (activity) => {
  if (activity.description) return activity.description;

  const { action, entityType, entityPayload, actorUserName } = activity;
  const entityName =
    entityPayload?.name || entityPayload?.description || `${entityType}`;

  const actionVerbs = {
    CREATE: "created",
    UPDATE: "updated",
    DELETE: "deleted",
  };

  const verb = actionVerbs[action] || action?.toLowerCase() || "modified";
  return `${actorUserName || "Someone"} ${verb} ${entityType?.toLowerCase() || "item"} "${entityName}"`;
};

/**
 * Extract searchable text from activity
 * @param {Object} activity - Activity object
 * @returns {string} Searchable text string
 */
export const getSearchableText = (activity) => {
  const parts = [
    activity.actorUserName,
    activity.description,
    activity.actionText,
    activity.entityType,
    activity.sourceService,
    activity.action,
    activity.entityPayload?.name,
    activity.entityPayload?.description,
    activity.entityPayload?.category,
  ];
  return parts.filter(Boolean).join(" ").toLowerCase();
};
