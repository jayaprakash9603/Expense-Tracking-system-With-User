/**
 * Payment Method Utility Functions
 * Pure utility functions for payment method operations
 */

/**
 * Format payment method name for display
 * @param {string} name - Raw payment method name
 * @returns {string} Formatted display name
 */
export const formatPaymentMethodName = (name) => {
  const n = String(name || "")
    .toLowerCase()
    .trim();

  switch (n) {
    case "cash":
    case "cash ":
      return "Cash";
    case "creditneedtopaid":
    case "credit due":
    case "credit need to paid":
    case "credit need to pay":
    case "creditneedtopay":
      return "Credit Due";
    case "creditpaid":
    case "credit paid":
      return "Credit Paid";
    default:
      return String(name || "")
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
  }
};

/**
 * Normalize payment method name to backend key
 * @param {string} name - Payment method name or label
 * @returns {string} Normalized backend key
 */
export const normalizePaymentMethod = (name) => {
  const raw = String(name || "").trim();
  const key = raw.toLowerCase().replace(/\s+/g, "").replace(/_/g, "");

  switch (key) {
    case "creditneedtopaid":
    case "creditdue":
    case "creditneedtopay":
      return "creditNeedToPaid";
    case "creditpaid":
      return "creditPaid";
    case "cash":
      return "cash";
    default:
      return raw;
  }
};

/**
 * Get default payment methods (fallback when API fails)
 * @returns {Array} Array of default payment method objects
 */
export const getDefaultPaymentMethods = () => [
  { name: "cash", label: "Cash", type: "expense" },
  { name: "creditNeedToPaid", label: "Credit Due", type: "expense" },
  { name: "creditPaid", label: "Credit Paid", type: "expense" },
  { name: "cash", label: "Cash", type: "income" },
  { name: "creditPaid", label: "Credit Paid", type: "income" },
  { name: "creditNeedToPaid", label: "Credit Due", type: "income" },
];

/**
 * Filter payment methods by transaction type
 * @param {Array} paymentMethods - Array of payment method objects
 * @param {string} transactionType - "loss" (expense) or "gain" (income)
 * @returns {Array} Filtered payment methods
 */
export const filterPaymentMethodsByType = (paymentMethods, transactionType) => {
  if (!Array.isArray(paymentMethods) || paymentMethods.length === 0) {
    return [];
  }

  const targetType =
    transactionType === "loss"
      ? "expense"
      : transactionType === "gain"
      ? "income"
      : null;

  if (!targetType) {
    return paymentMethods;
  }

  return paymentMethods.filter(
    (pm) => pm.type && pm.type.toLowerCase() === targetType
  );
};

/**
 * Transform payment method to option format
 * @param {Object} paymentMethod - Payment method object
 * @returns {Object} Option object with value and label
 */
export const transformPaymentMethodToOption = (paymentMethod) => ({
  value: normalizePaymentMethod(paymentMethod.name),
  label: formatPaymentMethodName(paymentMethod.name),
  type: paymentMethod.type,
  original: paymentMethod,
});

/**
 * Process payment methods for autocomplete
 * @param {Array} paymentMethods - Raw payment methods from API
 * @param {string} transactionType - "loss" or "gain"
 * @param {boolean} useDefaults - Whether to use defaults if no methods available
 * @returns {Array} Processed payment method options
 */
export const processPaymentMethods = (
  paymentMethods,
  transactionType,
  useDefaults = true
) => {
  let availableMethods = [];

  if (Array.isArray(paymentMethods) && paymentMethods.length > 0) {
    const filtered = filterPaymentMethodsByType(
      paymentMethods,
      transactionType
    );
    availableMethods = filtered.map(transformPaymentMethodToOption);
  }

  if (availableMethods.length === 0 && useDefaults) {
    const defaultMethods = getDefaultPaymentMethods();
    const filtered = filterPaymentMethodsByType(
      defaultMethods,
      transactionType
    );
    availableMethods = filtered.map(transformPaymentMethodToOption);
  }

  return availableMethods;
};

/**
 * Find payment method option by value
 * @param {Array} options - Array of payment method options
 * @param {string} value - Payment method value to find
 * @returns {Object|null} Found option or null
 */
export const findPaymentMethodByValue = (options, value) => {
  if (!Array.isArray(options) || !value) {
    return null;
  }

  const normalizedValue = normalizePaymentMethod(value);
  return options.find((option) => option.value === normalizedValue) || null;
};

/**
 * Validate if payment method is valid for transaction type
 * @param {string} paymentMethod - Payment method value
 * @param {string} transactionType - "loss" or "gain"
 * @param {Array} availableOptions - Available payment method options
 * @returns {boolean} Whether the payment method is valid
 */
export const isPaymentMethodValidForType = (
  paymentMethod,
  transactionType,
  availableOptions
) => {
  if (!paymentMethod || !availableOptions || availableOptions.length === 0) {
    return false;
  }

  const normalizedValue = normalizePaymentMethod(paymentMethod);
  return availableOptions.some((option) => option.value === normalizedValue);
};

/**
 * Get first valid payment method for transaction type
 * @param {Array} options - Available payment method options
 * @returns {string} First payment method value or "cash"
 */
export const getFirstValidPaymentMethod = (options) => {
  if (!Array.isArray(options) || options.length === 0) {
    return "cash";
  }

  return normalizePaymentMethod(options[0]?.value || "cash");
};

/**
 * Compare two payment method options for equality
 * @param {Object} option - Payment method option
 * @param {Object} value - Value to compare
 * @returns {boolean} Whether they are equal
 */
export const arePaymentMethodsEqual = (option, value) => {
  if (!option || !value) {
    return false;
  }

  return option.value === value.value || option.label === value.label;
};

/**
 * Get display label for payment method
 * @param {Object|string} paymentMethod - Payment method object or value
 * @returns {string} Display label
 */
export const getPaymentMethodDisplayLabel = (paymentMethod) => {
  if (!paymentMethod) {
    return "";
  }

  if (typeof paymentMethod === "string") {
    return formatPaymentMethodName(paymentMethod);
  }

  return (
    paymentMethod.label ||
    formatPaymentMethodName(paymentMethod.value || paymentMethod.name || "")
  );
};

/**
 * Validate payment method object structure
 * @param {Object} paymentMethod - Payment method to validate
 * @returns {boolean} Whether the payment method is valid
 */
export const isValidPaymentMethod = (paymentMethod) => {
  if (!paymentMethod || typeof paymentMethod !== "object") {
    return false;
  }

  return !!(paymentMethod.name || paymentMethod.value) && !!paymentMethod.type;
};
