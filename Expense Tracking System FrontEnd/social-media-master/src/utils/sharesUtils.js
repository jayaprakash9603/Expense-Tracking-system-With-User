/**
 * =============================================================================
 * Shares Utilities - Common Functions for Share Pages
 * =============================================================================
 *
 * Reusable utility functions for share-related pages:
 * - Status calculation
 * - Date formatting
 * - Time remaining calculation
 * - Clipboard operations
 * - QR code operations
 *
 * @author Expense Tracking System
 * @version 1.0
 * =============================================================================
 */

import { toast } from "react-toastify";

// =============================================================================
// Constants
// =============================================================================

export const STATUS_COLORS = {
  active: "#10b981",
  expired: "#f59e0b",
  revoked: "#ef4444",
};

export const ACCESS_LEVEL_CONFIG = {
  FULL: {
    label: "Full Access",
    color: "#9c27b0",
    description: "Can view, edit, and manage",
    permissions: ["view", "edit", "delete", "manage"],
  },
  WRITE: {
    label: "Edit Access",
    color: "#2196f3",
    description: "Can view and edit",
    permissions: ["view", "edit"],
  },
  READ: {
    label: "View Only",
    color: "#4caf50",
    description: "Can only view",
    permissions: ["view"],
  },
  NONE: {
    label: "No Access",
    color: "#9e9e9e",
    description: "Access revoked",
    permissions: [],
  },
};

export const RESOURCE_TYPE_CONFIG = {
  EXPENSE: {
    label: "Expenses",
    color: "#4caf50",
    icon: null, // Will be set by component
  },
  CATEGORY: {
    label: "Categories",
    color: "#2196f3",
    icon: null,
  },
  BUDGET: {
    label: "Budgets",
    color: "#ff9800",
    icon: null,
  },
  BILL: {
    label: "Bills",
    color: "#f44336",
    icon: null,
  },
  PAYMENT_METHOD: {
    label: "Payment Methods",
    color: "#9c27b0",
    icon: null,
  },
  ALL: {
    label: "All Data",
    color: "#607d8b",
    icon: null,
  },
};

export const PERMISSION_CONFIG = {
  VIEW: {
    label: "View Only",
    color: "#4caf50",
    icon: null,
  },
  EDIT: {
    label: "Can Edit",
    color: "#2196f3",
    icon: null,
  },
};

// =============================================================================
// Status Functions
// =============================================================================

/**
 * Determines the status of a share based on its properties
 * @param {Object} share - The share object
 * @returns {string} - 'active', 'expired', or 'revoked'
 */
export const getShareStatus = (share) => {
  if (!share) return "expired";
  if (share.isRevoked) return "revoked";
  if (share.expiresAt && new Date(share.expiresAt) < new Date())
    return "expired";
  return "active";
};

/**
 * Checks if a share is currently active (not expired, not revoked)
 * @param {Object} share - The share object
 * @returns {boolean} - Whether the share is active
 */
export const isShareActive = (share) => {
  if (!share) return false;
  if (share.isActive === false) return false;
  if (share.status === "REVOKED" || share.status === "EXPIRED") return false;
  if (share.expiresAt && new Date(share.expiresAt) < new Date()) return false;
  return true;
};

/**
 * Gets the access level configuration
 * @param {string} accessLevel - The access level string
 * @returns {Object} - Access level configuration
 */
export const getAccessConfig = (accessLevel) => {
  return ACCESS_LEVEL_CONFIG[accessLevel] || ACCESS_LEVEL_CONFIG.NONE;
};

/**
 * Gets the status color for a share
 * @param {Object} share - The share object
 * @returns {string} - The color hex code
 */
export const getStatusColor = (share) => {
  const status = getShareStatus(share);
  return STATUS_COLORS[status] || STATUS_COLORS.expired;
};

// =============================================================================
// Date & Time Functions
// =============================================================================

/**
 * Formats a date string into a readable format
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return "No expiry";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Invalid date";
  }
};

/**
 * Formats a date with time
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date and time string
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Invalid date";
  }
};

/**
 * Calculates time remaining until expiry
 * @param {string} expiresAt - ISO date string of expiry
 * @returns {string} - Human readable time remaining
 */
export const getTimeRemaining = (expiresAt) => {
  if (!expiresAt) return "Never expires";

  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry - now;

  if (diff < 0) return "Expired";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h remaining`;
  return "Expiring soon";
};

/**
 * Formats a date as a relative time string (e.g., "2 hours ago", "3 days ago")
 * @param {string} dateString - ISO date string
 * @returns {string} - Relative time string
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return "Never";

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    if (weeks < 4) return `${weeks}w ago`;
    if (months < 12) return `${months}mo ago`;
    return formatDate(dateString);
  } catch {
    return "Unknown";
  }
};

// =============================================================================
// Clipboard Functions
// =============================================================================

/**
 * Copies text to clipboard and shows toast notification
 * @param {string} text - Text to copy
 * @param {Function} onSuccess - Optional callback on success
 * @returns {Promise<boolean>} - Success status
 */
export const copyToClipboard = async (text, onSuccess) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
    onSuccess?.();
    return true;
  } catch (err) {
    toast.error("Failed to copy");
    return false;
  }
};

// =============================================================================
// QR Code Functions
// =============================================================================

/**
 * Downloads a QR code image
 * @param {string} qrCodeDataUri - Base64 data URI of the QR code
 * @param {string} filename - Filename for the download
 */
export const downloadQrCode = (qrCodeDataUri, filename = "qr-code") => {
  if (!qrCodeDataUri) {
    toast.error("No QR code available");
    return;
  }

  try {
    const link = document.createElement("a");
    link.href = qrCodeDataUri;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("QR code downloaded!");
  } catch (err) {
    toast.error("Failed to download QR code");
  }
};

/**
 * Generates a share URL from a token
 * @param {string} token - Share token
 * @returns {string} - Full share URL
 */
export const generateShareUrl = (token) => {
  if (!token) return "";
  return `${window.location.origin}/share/${token}`;
};

// =============================================================================
// Filter Functions
// =============================================================================

/**
 * Filters shares by search term
 * @param {Array} shares - Array of share objects
 * @param {string} searchTerm - Search term
 * @param {Array} searchFields - Fields to search in
 * @returns {Array} - Filtered shares
 */
export const filterSharesBySearch = (shares, searchTerm, searchFields = []) => {
  if (!searchTerm || !shares?.length) return shares;

  const search = searchTerm.toLowerCase();
  const defaultFields = ["shareName", "resourceType"];
  const fields = searchFields.length > 0 ? searchFields : defaultFields;

  return shares.filter((share) =>
    fields.some((field) => {
      const value = field.includes(".")
        ? field.split(".").reduce((obj, key) => obj?.[key], share)
        : share[field];
      return value?.toLowerCase?.()?.includes(search);
    }),
  );
};

/**
 * Filters shares by status
 * @param {Array} shares - Array of share objects
 * @param {string} status - Status to filter by ('all', 'active', 'expired', 'revoked')
 * @returns {Array} - Filtered shares
 */
export const filterSharesByStatus = (shares, status) => {
  if (!status || status === "all" || !shares?.length) return shares;
  return shares.filter((share) => getShareStatus(share) === status);
};

/**
 * Calculates share statistics
 * @param {Array} shares - Array of share objects
 * @returns {Object} - Statistics object
 */
export const calculateShareStats = (shares) => {
  if (!shares?.length) {
    return {
      total: 0,
      active: 0,
      expired: 0,
      revoked: 0,
      totalViews: 0,
    };
  }

  return shares.reduce(
    (stats, share) => {
      const status = getShareStatus(share);
      stats.total += 1;
      stats[status] = (stats[status] || 0) + 1;
      stats.totalViews += share.accessCount || 0;
      return stats;
    },
    { total: 0, active: 0, expired: 0, revoked: 0, totalViews: 0 },
  );
};
