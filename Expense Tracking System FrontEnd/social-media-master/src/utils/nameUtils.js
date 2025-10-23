/**
 * nameUtils.js
 * Pure utility functions for expense/bill name processing
 *
 * Purpose: Provides modular functions for name formatting, filtering,
 * normalization, validation, and deduplication.
 */

/**
 * Normalize a name for comparison (lowercase, trim, remove extra spaces)
 * @param {string} name - The name to normalize
 * @returns {string} Normalized name
 */
export const normalizeName = (name) => {
  if (!name || typeof name !== "string") return "";
  return name.toLowerCase().trim().replace(/\s+/g, " "); // Replace multiple spaces with single space
};

/**
 * Format a name for display (capitalize first letter of each word)
 * @param {string} name - The name to format
 * @returns {string} Formatted name
 */
export const formatNameForDisplay = (name) => {
  if (!name || typeof name !== "string") return "";
  return name
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

/**
 * Check if a name is valid (not empty, meets length requirements)
 * @param {string} name - The name to validate
 * @param {number} minLength - Minimum length (default: 1)
 * @param {number} maxLength - Maximum length (default: 255)
 * @returns {boolean} True if valid
 */
export const isValidName = (name, minLength = 1, maxLength = 255) => {
  if (!name || typeof name !== "string") return false;
  const trimmed = name.trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength;
};

/**
 * Filter names by search query (case-insensitive partial match)
 * @param {string[]} names - Array of names to filter
 * @param {string} query - Search query
 * @returns {string[]} Filtered names
 */
export const filterNamesByQuery = (names, query) => {
  if (!Array.isArray(names)) return [];
  if (!query || typeof query !== "string") return names;

  const normalizedQuery = normalizeName(query);
  return names.filter((name) => {
    const normalizedName = normalizeName(name);
    return normalizedName.includes(normalizedQuery);
  });
};

/**
 * Sort names alphabetically (case-insensitive)
 * @param {string[]} names - Array of names to sort
 * @param {string} order - "asc" or "desc" (default: "asc")
 * @returns {string[]} Sorted names
 */
export const sortNames = (names, order = "asc") => {
  if (!Array.isArray(names)) return [];

  const sorted = [...names].sort((a, b) => {
    const nameA = normalizeName(a);
    const nameB = normalizeName(b);
    return nameA.localeCompare(nameB);
  });

  return order === "desc" ? sorted.reverse() : sorted;
};

/**
 * Remove duplicate names (case-insensitive comparison)
 * @param {string[]} names - Array of names (may contain duplicates)
 * @returns {string[]} Array of unique names
 */
export const deduplicateNames = (names) => {
  if (!Array.isArray(names)) return [];

  const seen = new Map();
  const unique = [];

  for (const name of names) {
    if (!name || typeof name !== "string") continue;

    const normalized = normalizeName(name);
    if (!seen.has(normalized)) {
      seen.set(normalized, true);
      unique.push(name.trim()); // Keep original casing, but trimmed
    }
  }

  return unique;
};

/**
 * Process raw API response data into clean name array
 * @param {any} data - Raw API response data
 * @returns {string[]} Array of clean, deduplicated names
 */
export const processNameData = (data) => {
  if (!data) return [];

  // Handle different response formats
  let rawNames = [];

  if (Array.isArray(data)) {
    rawNames = data;
  } else if (data.data && Array.isArray(data.data)) {
    rawNames = data.data;
  } else if (data.names && Array.isArray(data.names)) {
    rawNames = data.names;
  } else {
    return [];
  }

  // Extract string names from various formats
  const extractedNames = rawNames
    .map((item) => {
      if (typeof item === "string") {
        return item;
      } else if (item && typeof item === "object") {
        return item.name || item.expenseName || item.billName || "";
      }
      return "";
    })
    .filter((name) => name && name.trim() !== "");

  // Deduplicate and return
  return deduplicateNames(extractedNames);
};

/**
 * Find exact name match in array (case-insensitive)
 * @param {string[]} names - Array of names
 * @param {string} query - Name to find
 * @returns {string|null} Matched name or null
 */
export const findExactNameMatch = (names, query) => {
  if (!Array.isArray(names) || !query) return null;

  const normalizedQuery = normalizeName(query);
  return names.find((name) => normalizeName(name) === normalizedQuery) || null;
};

/**
 * Get top N names from array
 * @param {string[]} names - Array of names
 * @param {number} limit - Maximum number of names to return
 * @returns {string[]} Top N names
 */
export const getTopNames = (names, limit = 50) => {
  if (!Array.isArray(names)) return [];
  return names.slice(0, limit);
};

/**
 * Check if two names are equal (case-insensitive)
 * @param {string} name1 - First name
 * @param {string} name2 - Second name
 * @returns {boolean} True if names are equal
 */
export const areNamesEqual = (name1, name2) => {
  return normalizeName(name1) === normalizeName(name2);
};

/**
 * Get suggestions based on input value
 * @param {string[]} names - Array of all names
 * @param {string} inputValue - Current input value
 * @param {number} maxSuggestions - Maximum suggestions to return
 * @returns {string[]} Filtered suggestions
 */
export const getSuggestions = (names, inputValue, maxSuggestions = 50) => {
  if (!Array.isArray(names)) return [];

  // If no input, return top N names
  if (!inputValue || inputValue.trim() === "") {
    return getTopNames(names, maxSuggestions);
  }

  // Filter by input and limit results
  const filtered = filterNamesByQuery(names, inputValue);
  return getTopNames(filtered, maxSuggestions);
};

/**
 * Sanitize name input (remove special characters, limit length)
 * @param {string} name - The name to sanitize
 * @param {number} maxLength - Maximum length (default: 255)
 * @returns {string} Sanitized name
 */
export const sanitizeName = (name, maxLength = 255) => {
  if (!name || typeof name !== "string") return "";

  // Trim and limit length
  let sanitized = name.trim();
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
};

/**
 * Extract display label from name option
 * @param {string|object} option - Name option (string or object with name property)
 * @returns {string} Display label
 */
export const getNameDisplayLabel = (option) => {
  if (!option) return "";
  if (typeof option === "string") return option;
  if (typeof option === "object") {
    return (
      option.name || option.label || option.expenseName || option.billName || ""
    );
  }
  return String(option);
};
