/**
 * Category Utility Functions
 * Modular helper functions for category operations
 */

/**
 * Deduplicate categories by name (case-insensitive, trimmed)
 * @param {Array} categories - Array of category objects
 * @returns {Array} - Deduplicated array of categories
 */
export const deduplicateCategories = (categories) => {
  const list = Array.isArray(categories) ? categories : [];
  const byName = new Map();

  for (const category of list) {
    const nameKey = category?.name?.toLowerCase().trim();
    if (!nameKey) continue;
    if (!byName.has(nameKey)) {
      byName.set(nameKey, category);
    }
  }

  return Array.from(byName.values());
};

/**
 * Filter categories by input value with deduplication
 * @param {Array} options - Array of category options
 * @param {string} inputValue - User input for filtering
 * @returns {Array} - Filtered and deduplicated categories
 */
export const filterCategoriesWithDeduplication = (options, inputValue) => {
  if (!inputValue) return options;

  const seen = new Set();
  return options.filter((option) => {
    const key = option.name?.toLowerCase().trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return key.includes(inputValue.toLowerCase().trim());
  });
};

/**
 * Find exact category match by name
 * @param {Array} categories - Array of category objects
 * @param {string} name - Category name to match
 * @returns {Object|null} - Matched category or null
 */
export const findExactCategoryMatch = (categories, name) => {
  if (!name || !Array.isArray(categories)) return null;

  return (
    categories.find(
      (category) =>
        category.name?.toLowerCase().trim() === name.toLowerCase().trim()
    ) || null
  );
};

/**
 * Find category by ID
 * @param {Array} categories - Array of category objects
 * @param {number|string} id - Category ID to find
 * @returns {Object|null} - Found category or null
 */
export const findCategoryById = (categories, id) => {
  if (!id || !Array.isArray(categories)) return null;

  return categories.find((category) => category.id === id) || null;
};

/**
 * Compare two categories for equality
 * @param {Object} option - First category
 * @param {Object} value - Second category
 * @returns {boolean} - True if categories are equal
 */
export const areCategoriesEqual = (option, value) => {
  if (!option || !value) return false;

  // First try ID comparison
  if (option.id != null && value.id != null) {
    return option.id === value.id;
  }

  // Fallback to name comparison
  return option.name === value.name;
};

/**
 * Get category display name
 * @param {Object} category - Category object
 * @returns {string} - Display name or empty string
 */
export const getCategoryDisplayName = (category) => {
  return category?.name || "";
};

/**
 * Validate category object
 * @param {Object} category - Category object to validate
 * @returns {boolean} - True if valid
 */
export const isValidCategory = (category) => {
  return (
    category &&
    typeof category === "object" &&
    category.name &&
    typeof category.name === "string" &&
    category.name.trim() !== ""
  );
};
