package com.jaya.service.excel.util;

import org.apache.poi.ss.usermodel.*;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;

/**
 * Utility for reading values from Excel cells with proper type conversion
 */
public class ExcelCellReader {

    /**
     * Get cell value as String with formula evaluation
     */
    public static String getCellValueAsString(Cell cell, FormulaEvaluator evaluator) {
        if (cell == null)
            return "";

        CellType type = cell.getCellType();
        if (type == CellType.FORMULA && evaluator != null) {
            type = evaluator.evaluateFormulaCell(cell);
        }

        switch (type) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getLocalDateTimeCellValue().toLocalDate().toString();
                } else {
                    double val = cell.getNumericCellValue();
                    // Remove trailing .0 for whole numbers
                    String s = Double.toString(val);
                    if (s.endsWith(".0")) {
                        s = s.substring(0, s.length() - 2);
                    }
                    return s;
                }
            case BOOLEAN:
                return Boolean.toString(cell.getBooleanCellValue());
            case BLANK:
                return "";
            case ERROR:
                return "";
            default:
                return cell.toString();
        }
    }

    /**
     * Parse LocalDate from cell
     */
    public static LocalDate getCellValueAsLocalDate(Cell cell, FormulaEvaluator evaluator) {
        if (cell == null)
            return null;

        // Try numeric date first
        if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
            return cell.getLocalDateTimeCellValue().toLocalDate();
        }

        // Try parsing as string
        String dateStr = getCellValueAsString(cell, evaluator);
        if (dateStr.isEmpty())
            return null;

        try {
            return LocalDate.parse(dateStr);
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    /**
     * Get cell value as Double
     */
    public static Double getCellValueAsDouble(Cell cell, FormulaEvaluator evaluator) {
        if (cell == null)
            return null;

        CellType type = cell.getCellType();
        if (type == CellType.FORMULA && evaluator != null) {
            type = evaluator.evaluateFormulaCell(cell);
        }

        if (type == CellType.NUMERIC) {
            return cell.getNumericCellValue();
        }

        String strValue = getCellValueAsString(cell, evaluator);
        return parseDoubleSafe(strValue, null);
    }

    /**
     * Get cell value as Integer
     */
    public static Integer getCellValueAsInteger(Cell cell, FormulaEvaluator evaluator) {
        if (cell == null)
            return null;

        CellType type = cell.getCellType();
        if (type == CellType.FORMULA && evaluator != null) {
            type = evaluator.evaluateFormulaCell(cell);
        }

        if (type == CellType.NUMERIC) {
            return (int) cell.getNumericCellValue();
        }

        String strValue = getCellValueAsString(cell, evaluator);
        return parseIntegerSafe(strValue, null);
    }

    /**
     * Get cell value as Boolean
     */
    public static Boolean getCellValueAsBoolean(Cell cell, FormulaEvaluator evaluator) {
        if (cell == null)
            return null;

        CellType type = cell.getCellType();
        if (type == CellType.FORMULA && evaluator != null) {
            type = evaluator.evaluateFormulaCell(cell);
        }

        if (type == CellType.BOOLEAN) {
            return cell.getBooleanCellValue();
        }

        String strValue = getCellValueAsString(cell, evaluator);
        return parseBooleanSafe(strValue, null);
    }

    // Helper parsing methods
    private static Double parseDoubleSafe(String s, Double defaultVal) {
        if (s == null || s.trim().isEmpty())
            return defaultVal;
        String t = s.trim().replace(",", "");
        try {
            return Double.parseDouble(t);
        } catch (NumberFormatException ex) {
            return defaultVal;
        }
    }

    private static Integer parseIntegerSafe(String s, Integer defaultVal) {
        if (s == null || s.trim().isEmpty())
            return defaultVal;
        String t = s.trim().replace(",", "");
        try {
            return Integer.parseInt(t);
        } catch (NumberFormatException ex) {
            try {
                Double d = Double.parseDouble(t);
                return d.intValue();
            } catch (NumberFormatException ex2) {
                return defaultVal;
            }
        }
    }

    private static Boolean parseBooleanSafe(String s, Boolean defaultVal) {
        if (s == null || s.trim().isEmpty())
            return defaultVal;
        String t = s.trim().toLowerCase();
        if (t.equals("true") || t.equals("yes") || t.equals("1"))
            return true;
        if (t.equals("false") || t.equals("no") || t.equals("0"))
            return false;
        return defaultVal;
    }
}
