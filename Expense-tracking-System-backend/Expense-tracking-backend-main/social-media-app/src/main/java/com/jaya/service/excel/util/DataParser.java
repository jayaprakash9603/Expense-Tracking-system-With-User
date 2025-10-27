package com.jaya.service.excel.util;

import java.util.HashSet;
import java.util.Set;

/**
 * Utility for parsing common data types from strings
 * Follows DRY principle by centralizing parsing logic
 */
public class DataParser {

    /**
     * Parse Double with safe fallback
     */
    public static Double parseDouble(String value, Double defaultValue) {
        if (value == null || value.trim().isEmpty()) {
            return defaultValue;
        }

        String cleaned = value.trim().replace(",", "");
        try {
            return Double.parseDouble(cleaned);
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    /**
     * Parse Integer with safe fallback
     */
    public static Integer parseInteger(String value, Integer defaultValue) {
        if (value == null || value.trim().isEmpty()) {
            return defaultValue;
        }

        String cleaned = value.trim().replace(",", "");
        try {
            return Integer.parseInt(cleaned);
        } catch (NumberFormatException e) {
            try {
                // Handle cases where cell had a double like "12.0"
                Double d = Double.parseDouble(cleaned);
                return d.intValue();
            } catch (NumberFormatException ex2) {
                return defaultValue;
            }
        }
    }

    /**
     * Parse Boolean with safe fallback
     */
    public static Boolean parseBoolean(String value, Boolean defaultValue) {
        if (value == null || value.trim().isEmpty()) {
            return defaultValue;
        }

        String normalized = value.trim().toLowerCase();
        if (normalized.equals("true") || normalized.equals("yes") || normalized.equals("1")) {
            return true;
        }
        if (normalized.equals("false") || normalized.equals("no") || normalized.equals("0")) {
            return false;
        }
        return defaultValue;
    }

    /**
     * Parse a comma-separated list of integers
     * Supports formats: "[1, 2, 3]" or "1,2,3" or single number
     */
    public static Set<Integer> parseIntegerSet(String value) {
        Set<Integer> result = new HashSet<>();

        if (value == null || value.trim().isEmpty()) {
            return result;
        }

        String cleaned = value.trim();
        // Remove brackets if present
        if (cleaned.startsWith("[") && cleaned.endsWith("]")) {
            cleaned = cleaned.substring(1, cleaned.length() - 1);
        }

        String[] parts = cleaned.split(",");
        for (String part : parts) {
            Integer parsed = parseInteger(part, null);
            if (parsed != null) {
                result.add(parsed);
            }
        }

        return result;
    }

    /**
     * Normalize header string for comparison
     * Removes spaces, underscores, hyphens and converts to lowercase
     */
    public static String normalizeHeader(String header) {
        return header == null ? "" : header.trim().toLowerCase().replaceAll("[ _-]", "");
    }
}
