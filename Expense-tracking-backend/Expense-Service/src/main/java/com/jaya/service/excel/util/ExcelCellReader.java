package com.jaya.service.excel.util;

import org.apache.poi.ss.usermodel.*;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;




public class ExcelCellReader {

    


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

    


    public static LocalDate getCellValueAsLocalDate(Cell cell, FormulaEvaluator evaluator) {
        if (cell == null)
            return null;

        
        if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
            return cell.getLocalDateTimeCellValue().toLocalDate();
        }

        
        String dateStr = getCellValueAsString(cell, evaluator);
        if (dateStr.isEmpty())
            return null;

        try {
            return LocalDate.parse(dateStr);
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    


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
