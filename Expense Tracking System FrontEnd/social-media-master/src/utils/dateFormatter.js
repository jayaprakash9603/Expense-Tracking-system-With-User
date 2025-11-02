/**
 * Date Formatting Utility
 *
 * Provides flexible date formatting based on user settings.
 * Supports dynamic format patterns from settings configuration.
 *
 * @module utils/dateFormatter
 */

/**
 * Format a date string according to a specified format pattern
 *
 * @param {string|Date} dateString - The date to format (ISO string or Date object)
 * @param {string} format - The format pattern (e.g., "DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD")
 * @returns {string} Formatted date string
 *
 * @example
 * formatDate("2024-12-31", "DD/MM/YYYY") // "31/12/2024"
 * formatDate("2024-12-31", "MM/DD/YYYY") // "12/31/2024"
 * formatDate("2024-12-31", "YYYY-MM-DD") // "2024-12-31"
 * formatDate(new Date(), "DD/MM/YYYY") // "31/12/2024"
 */
export const formatDate = (dateString, format = "DD/MM/YYYY") => {
  if (!dateString) return "";

  const date = new Date(dateString);

  // Validate date
  if (isNaN(date.getTime())) {
    console.warn(`Invalid date provided: ${dateString}`);
    return "";
  }

  // Extract date components
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const shortYear = String(year).slice(-2);

  // Create a mapping of format tokens to values
  const tokens = {
    YYYY: year,
    YY: shortYear,
    MM: month,
    M: String(date.getMonth() + 1),
    DD: day,
    D: String(date.getDate()),
  };

  // Replace tokens in format string
  let formattedDate = format;

  // Sort tokens by length (longest first) to avoid partial replacements
  const sortedTokens = Object.keys(tokens).sort((a, b) => b.length - a.length);

  sortedTokens.forEach((token) => {
    formattedDate = formattedDate.replace(
      new RegExp(token, "g"),
      tokens[token]
    );
  });

  return formattedDate;
};

/**
 * Format a date with time according to a specified format pattern
 *
 * @param {string|Date} dateString - The date to format (ISO string or Date object)
 * @param {string} dateFormat - The date format pattern (e.g., "DD/MM/YYYY")
 * @param {string} timeFormat - The time format ("12h" or "24h")
 * @returns {string} Formatted date and time string
 *
 * @example
 * formatDateTime("2024-12-31T15:30:00", "DD/MM/YYYY", "12h") // "31/12/2024 3:30 PM"
 * formatDateTime("2024-12-31T15:30:00", "MM/DD/YYYY", "24h") // "12/31/2024 15:30"
 */
export const formatDateTime = (
  dateString,
  dateFormat = "DD/MM/YYYY",
  timeFormat = "12h"
) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  // Validate date
  if (isNaN(date.getTime())) {
    console.warn(`Invalid date provided: ${dateString}`);
    return "";
  }

  const formattedDate = formatDate(dateString, dateFormat);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");

  let timeString;
  if (timeFormat === "12h") {
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    timeString = `${displayHours}:${minutes} ${period}`;
  } else {
    timeString = `${String(hours).padStart(2, "0")}:${minutes}`;
  }

  return `${formattedDate} ${timeString}`;
};

/**
 * Parse a date string in a specific format back to a Date object
 *
 * @param {string} dateString - The formatted date string
 * @param {string} format - The format pattern used in the date string
 * @returns {Date|null} Date object or null if parsing fails
 *
 * @example
 * parseDate("31/12/2024", "DD/MM/YYYY") // Date object for Dec 31, 2024
 * parseDate("12/31/2024", "MM/DD/YYYY") // Date object for Dec 31, 2024
 */
export const parseDate = (dateString, format = "DD/MM/YYYY") => {
  if (!dateString) return null;

  try {
    // Create a regex pattern from the format
    const formatPattern = format
      .replace(/YYYY/g, "(\\d{4})")
      .replace(/YY/g, "(\\d{2})")
      .replace(/MM/g, "(\\d{2})")
      .replace(/DD/g, "(\\d{2})")
      .replace(/M/g, "(\\d{1,2})")
      .replace(/D/g, "(\\d{1,2})");

    const regex = new RegExp(`^${formatPattern}$`);
    const match = dateString.match(regex);

    if (!match) return null;

    // Extract parts based on format
    const formatParts = format.match(/YYYY|YY|MM|M|DD|D/g);
    const values = match.slice(1);

    let year, month, day;

    formatParts.forEach((part, index) => {
      const value = parseInt(values[index], 10);
      if (part === "YYYY") year = value;
      else if (part === "YY") year = 2000 + value;
      else if (part === "MM" || part === "M") month = value - 1;
      else if (part === "DD" || part === "D") day = value;
    });

    const date = new Date(year, month, day);
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    console.warn(`Failed to parse date: ${dateString}`, error);
    return null;
  }
};

/**
 * Get a localized month name
 *
 * @param {number} monthIndex - Month index (0-11)
 * @param {string} locale - Locale code (e.g., "en", "es", "fr")
 * @param {string} format - "long" or "short"
 * @returns {string} Month name
 *
 * @example
 * getMonthName(0, "en", "long") // "January"
 * getMonthName(0, "en", "short") // "Jan"
 */
export const getMonthName = (monthIndex, locale = "en", format = "long") => {
  const date = new Date(2000, monthIndex, 1);
  return new Intl.DateTimeFormat(locale, { month: format }).format(date);
};

/**
 * Get a localized day name
 *
 * @param {number} dayIndex - Day index (0-6, Sunday=0)
 * @param {string} locale - Locale code (e.g., "en", "es", "fr")
 * @param {string} format - "long" or "short"
 * @returns {string} Day name
 *
 * @example
 * getDayName(0, "en", "long") // "Sunday"
 * getDayName(0, "en", "short") // "Sun"
 */
export const getDayName = (dayIndex, locale = "en", format = "long") => {
  const date = new Date(2000, 0, 2 + dayIndex); // Jan 2, 2000 is Sunday
  return new Intl.DateTimeFormat(locale, { weekday: format }).format(date);
};

/**
 * Format a date for display with relative terms (Today, Yesterday, etc.)
 *
 * @param {string|Date} dateString - The date to format
 * @param {string} format - The format pattern for non-relative dates
 * @returns {string} Formatted date string with relative terms
 *
 * @example
 * formatRelativeDate(new Date(), "DD/MM/YYYY") // "Today"
 * formatRelativeDate(yesterdayDate, "DD/MM/YYYY") // "Yesterday"
 * formatRelativeDate(oldDate, "DD/MM/YYYY") // "15/03/2024"
 */
export const formatRelativeDate = (dateString, format = "DD/MM/YYYY") => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const today = new Date();

  // Reset time to compare dates only
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - compareDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays === -1) return "Tomorrow";
  if (diffDays > 0 && diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 0 && diffDays > -7) return `In ${Math.abs(diffDays)} days`;

  return formatDate(dateString, format);
};

/**
 * Validate if a date string matches a given format
 *
 * @param {string} dateString - The date string to validate
 * @param {string} format - The expected format pattern
 * @returns {boolean} True if valid, false otherwise
 *
 * @example
 * isValidDateFormat("31/12/2024", "DD/MM/YYYY") // true
 * isValidDateFormat("12/31/2024", "DD/MM/YYYY") // false
 */
export const isValidDateFormat = (dateString, format = "DD/MM/YYYY") => {
  const parsed = parseDate(dateString, format);
  return parsed !== null && !isNaN(parsed.getTime());
};

/**
 * Get date format separator from format string
 *
 * @param {string} format - The format pattern
 * @returns {string} The separator character (e.g., "/", "-", ".")
 *
 * @example
 * getDateSeparator("DD/MM/YYYY") // "/"
 * getDateSeparator("YYYY-MM-DD") // "-"
 */
export const getDateSeparator = (format = "DD/MM/YYYY") => {
  const match = format.match(/[^A-Za-z0-9]/);
  return match ? match[0] : "/";
};

/**
 * Convert date format pattern to display example
 *
 * @param {string} format - The format pattern
 * @returns {string} Example date in the given format
 *
 * @example
 * getFormatExample("DD/MM/YYYY") // "31/12/2024"
 * getFormatExample("MM/DD/YYYY") // "12/31/2024"
 */
export const getFormatExample = (format = "DD/MM/YYYY") => {
  return formatDate("2024-12-31", format);
};

// Default export with all functions
export default {
  formatDate,
  formatDateTime,
  parseDate,
  getMonthName,
  getDayName,
  formatRelativeDate,
  isValidDateFormat,
  getDateSeparator,
  getFormatExample,
};
