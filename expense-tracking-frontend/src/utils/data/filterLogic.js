import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

/**
 * Applies a single column filter to a value.
 *
 * @param {any} cellValue - The value from the row to check.
 * @param {Object} filter - The filter object { operator, value }.
 * @param {String} type - The type of the column ('text', 'number', 'date').
 * @returns {Boolean} - True if the value passes the filter, false otherwise.
 */
export const applyColumnFilter = (cellValue, filter, type = "text") => {
  const { operator, value } = filter;

  if (value === "" || value === null || value === undefined) {
    if (operator !== "empty" && operator !== "notEmpty") return true;
  }

  // --- Text Logic ---
  if (type === "text") {
    const strVal = String(cellValue || "").toLowerCase();

    // Handle multiple values
    const filterValues = Array.isArray(value)
      ? value.map((v) => String(v).toLowerCase()).filter(Boolean)
      : [String(value || "").toLowerCase()].filter(Boolean);

    if (filterValues.length === 0) return true;

    // OR logic for positive matches
    if (operator === "contains") {
      return filterValues.some((v) => strVal.includes(v));
    }
    if (operator === "equals") {
      return filterValues.some((v) => strVal === v);
    }
    if (operator === "startsWith") {
      return filterValues.some((v) => strVal.startsWith(v));
    }
    if (operator === "endsWith") {
      return filterValues.some((v) => strVal.endsWith(v));
    }

    // AND logic for negative matches
    if (operator === "notContains") {
      return filterValues.every((v) => !strVal.includes(v));
    }
    if (operator === "neq") {
      return filterValues.every((v) => strVal !== v);
    }

    return true;
  }

  // --- Number Logic ---
  if (type === "number") {
    const numVal = parseFloat(cellValue || 0);
    const filterVal = parseFloat(value || 0);

    if (operator === "equals") return numVal === filterVal;
    if (operator === "gt") return numVal > filterVal;
    if (operator === "lt") return numVal < filterVal;
    if (operator === "gte") return numVal >= filterVal;
    if (operator === "lte") return numVal <= filterVal;
    if (operator === "neq") return numVal !== filterVal;
    return true;
  }

  // --- Date Logic ---
  if (type === "date") {
    const dateVal = dayjs(cellValue);
    if (!dateVal.isValid()) return false;

    // Range
    if (operator === "range") {
      const { from, to } = value || {};
      if (!from && !to) return true;
      if (from && to) return dateVal.isBetween(from, to, "day", "[]");
      if (from) return dateVal.isSameOrAfter(from, "day");
      if (to) return dateVal.isSameOrBefore(to, "day");
      return true;
    }

    // Multiple Dates (oneOf)
    if (operator === "oneOf" && Array.isArray(value)) {
      // Should match ANY of the dates
      const targetDates = value.map((d) => dayjs(d).format("YYYY-MM-DD"));
      return targetDates.includes(dateVal.format("YYYY-MM-DD"));
    }

    // Single Date
    if (operator === "equals") return dateVal.isSame(value, "day");
    if (operator === "before") return dateVal.isBefore(value, "day");
    if (operator === "after") return dateVal.isAfter(value, "day");
    if (operator === "neq") return !dateVal.isSame(value, "day");

    return true;
  }

  return true;
};
