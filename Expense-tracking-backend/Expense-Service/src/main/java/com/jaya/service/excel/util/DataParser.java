package com.jaya.service.excel.util;

import java.util.HashSet;
import java.util.Set;





public class DataParser {

    


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

    


    public static Integer parseInteger(String value, Integer defaultValue) {
        if (value == null || value.trim().isEmpty()) {
            return defaultValue;
        }

        String cleaned = value.trim().replace(",", "");
        try {
            return Integer.parseInt(cleaned);
        } catch (NumberFormatException e) {
            try {
                
                Double d = Double.parseDouble(cleaned);
                return d.intValue();
            } catch (NumberFormatException ex2) {
                return defaultValue;
            }
        }
    }

    


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

    



    public static Set<Integer> parseIntegerSet(String value) {
        Set<Integer> result = new HashSet<>();

        if (value == null || value.trim().isEmpty()) {
            return result;
        }

        String cleaned = value.trim();
        
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

    



    public static String normalizeHeader(String header) {
        return header == null ? "" : header.trim().toLowerCase().replaceAll("[ _-]", "");
    }
}
