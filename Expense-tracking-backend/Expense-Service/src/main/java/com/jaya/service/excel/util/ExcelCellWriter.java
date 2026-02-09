package com.jaya.service.excel.util;

import org.apache.poi.ss.usermodel.*;




public class ExcelCellWriter {

    


    public static void writeCellValue(Cell cell, Object value) {
        if (value == null) {
            cell.setBlank();
            return;
        }

        if (value instanceof String) {
            cell.setCellValue((String) value);
        } else if (value instanceof Integer) {
            cell.setCellValue((Integer) value);
        } else if (value instanceof Long) {
            cell.setCellValue((Long) value);
        } else if (value instanceof Double) {
            cell.setCellValue((Double) value);
        } else if (value instanceof Float) {
            cell.setCellValue((Float) value);
        } else if (value instanceof Boolean) {
            cell.setCellValue((Boolean) value);
        } else if (value instanceof java.util.Date) {
            cell.setCellValue((java.util.Date) value);
        } else if (value instanceof java.time.LocalDate) {
            cell.setCellValue(value.toString());
        } else if (value instanceof java.time.LocalDateTime) {
            cell.setCellValue(value.toString());
        } else {
            cell.setCellValue(value.toString());
        }
    }

    


    public static Cell createAndWriteCell(Row row, int columnIndex, Object value) {
        Cell cell = row.createCell(columnIndex);
        writeCellValue(cell, value);
        return cell;
    }

    


    public static Cell createHeaderCell(Row row, int columnIndex, String value, CellStyle headerStyle) {
        Cell cell = row.createCell(columnIndex);
        cell.setCellValue(value);
        if (headerStyle != null) {
            cell.setCellStyle(headerStyle);
        }
        return cell;
    }
}
