/**
 * Admin Utility Functions
 * Reusable helper functions for admin components
 */

/**
 * Format number with commas (e.g., 12847 -> "12,847")
 */
export const formatNumber = (num) => {
  if (!num && num !== 0) return "0";
  return num.toLocaleString();
};

/**
 * Format currency (e.g., 1234.56 -> "$1,234.56")
 */
export const formatCurrency = (amount, currencySymbol = "$") => {
  if (!amount && amount !== 0) return `${currencySymbol}0`;
  return `${currencySymbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format percentage (e.g., 12.5 -> "+12.5%")
 */
export const formatPercentage = (value, showSign = true) => {
  if (!value && value !== 0) return "0%";
  const sign = showSign && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
};

/**
 * Get growth indicator color
 */
export const getGrowthColor = (value) => {
  if (value > 0) return "#4caf50"; // Green
  if (value < 0) return "#f44336"; // Red
  return "#9e9e9e"; // Gray
};

/**
 * Format date relative to now (e.g., "2 hours ago", "3 days ago")
 */
export const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
};

/**
 * Format date to readable string (e.g., "Dec 1, 2025")
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Get user initials from name
 */
export const getInitials = (firstName = "", lastName = "") => {
  const firstInitial = firstName?.charAt(0)?.toUpperCase() || "";
  const lastInitial = lastName?.charAt(0)?.toUpperCase() || "";
  return `${firstInitial}${lastInitial}`;
};

/**
 * Get status chip color based on status
 */
export const getStatusColor = (status) => {
  const statusColors = {
    active: "#4caf50",
    inactive: "#f44336",
    pending: "#ff9800",
    suspended: "#9e9e9e",
  };
  return statusColors[status?.toLowerCase()] || "#9e9e9e";
};

/**
 * Get role badge color
 */
export const getRoleColor = (role) => {
  const roleColors = {
    admin: "#f44336",
    moderator: "#ff9800",
    user: "#2196f3",
    viewer: "#9e9e9e",
  };
  return roleColors[role?.toLowerCase()] || "#2196f3";
};

/**
 * Filter array by search query (case-insensitive)
 */
export const filterBySearch = (items, query, fields = []) => {
  if (!query) return items;
  const lowerQuery = query.toLowerCase();
  
  return items.filter((item) =>
    fields.some((field) => {
      const value = field.split(".").reduce((obj, key) => obj?.[key], item);
      return value?.toString().toLowerCase().includes(lowerQuery);
    })
  );
};

/**
 * Sort array by field
 */
export const sortByField = (items, field, direction = "asc") => {
  return [...items].sort((a, b) => {
    const aVal = field.split(".").reduce((obj, key) => obj?.[key], a);
    const bVal = field.split(".").reduce((obj, key) => obj?.[key], b);
    
    if (direction === "asc") {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Export data to CSV format
 */
export const exportToCSV = (data, filename = "export.csv") => {
  if (!data || data.length === 0) return;

  // Get headers from first object
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((header) => `"${row[header] || ""}"`).join(",")
    ),
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

export default {
  formatNumber,
  formatCurrency,
  formatPercentage,
  getGrowthColor,
  formatRelativeTime,
  formatDate,
  getInitials,
  getStatusColor,
  getRoleColor,
  filterBySearch,
  sortByField,
  truncateText,
  exportToCSV,
};
