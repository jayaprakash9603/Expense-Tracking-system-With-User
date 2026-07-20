/**
 * Text Highlighting Utility
 * Utility functions for highlighting matching text in search results
 */

import React from "react";

/**
 * Highlight matching text within a string
 * @param {string} text - The full text to search in
 * @param {string} inputValue - The text to highlight
 * @param {object} styles - Optional custom styles for highlighted text
 * @returns {React.Element} - JSX with highlighted text
 */
export const highlightText = (text, inputValue, styles = {}) => {
  if (!inputValue || !text) return text;

  const defaultStyles = {
    color: "#00dac6",
    fontWeight: "600",
    ...styles,
  };

  try {
    const parts = text.split(new RegExp(`(${inputValue})`, "gi"));

    return (
      <span>
        {parts.map((part, index) =>
          part.toLowerCase() === inputValue.toLowerCase() ? (
            <span key={index} style={defaultStyles}>
              {part}
            </span>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </span>
    );
  } catch (error) {
    console.error("Error highlighting text:", error);
    return text;
  }
};

/**
 * Escape special regex characters
 * @param {string} string - String to escape
 * @returns {string} - Escaped string
 */
export const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * Highlight text with escaped regex
 * @param {string} text - The full text to search in
 * @param {string} inputValue - The text to highlight
 * @param {object} styles - Optional custom styles
 * @returns {React.Element} - JSX with highlighted text
 */
export const highlightTextSafe = (text, inputValue, styles = {}) => {
  if (!inputValue || !text) return text;

  const escapedInput = escapeRegExp(inputValue);
  return highlightText(text, escapedInput, styles);
};
