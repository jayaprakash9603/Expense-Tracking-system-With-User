package com.jaya.service.excel;

import com.jaya.service.excel.util.ExcelCellWriter;
import com.jaya.service.excel.util.ExcelStyleFactory;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

/**
 * Generic Excel generator that can create Excel files for any entity type
 * Follows Single Responsibility Principle - only handles Excel generation
 * Follows Open/Closed Principle - extensible via ExcelColumnDefinition
 *
 * @param <T> The entity type to generate Excel for
 */
public class ExcelGenerator<T> {

    private final ExcelColumnDefinition<T> columnDefinition;

    public ExcelGenerator(ExcelColumnDefinition<T> columnDefinition) {
        this.columnDefinition = columnDefinition;
    }

    /**
     * Generate Excel file from a list of entities
     */
    public ByteArrayInputStream generate(List<T> entities) throws IOException {
        try (Workbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet(columnDefinition.getSheetName());
            CellStyle headerStyle = ExcelStyleFactory.createHeaderStyle(workbook);

            // Create header row
            createHeaderRow(sheet, headerStyle);

            // Create data rows
            createDataRows(sheet, entities);

            // Auto-size columns for better readability
            autoSizeColumns(sheet);

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    /**
     * Generate Excel file from a single entity
     */
    public ByteArrayInputStream generateSingle(T entity) throws IOException {
        return generate(List.of(entity));
    }

    /**
     * Generate an empty Excel file with just headers
     */
    public ByteArrayInputStream generateEmpty() throws IOException {
        return generate(List.of());
    }

    /**
     * Create header row with column names
     */
    private void createHeaderRow(Sheet sheet, CellStyle headerStyle) {
        Row headerRow = sheet.createRow(0);
        List<ExcelColumn<T>> columns = columnDefinition.getColumns();

        for (int i = 0; i < columns.size(); i++) {
            ExcelCellWriter.createHeaderCell(headerRow, i, columns.get(i).getHeader(), headerStyle);
        }
    }

    /**
     * Create data rows for all entities
     */
    private void createDataRows(Sheet sheet, List<T> entities) {
        int rowIndex = 1;
        List<ExcelColumn<T>> columns = columnDefinition.getColumns();

        for (T entity : entities) {
            Row row = sheet.createRow(rowIndex++);

            for (int colIndex = 0; colIndex < columns.size(); colIndex++) {
                ExcelColumn<T> column = columns.get(colIndex);
                Object value = column.extractValue(entity);
                ExcelCellWriter.createAndWriteCell(row, colIndex, value);
            }
        }
    }

    /**
     * Auto-size all columns
     */
    private void autoSizeColumns(Sheet sheet) {
        if (sheet.getPhysicalNumberOfRows() > 0) {
            Row headerRow = sheet.getRow(0);
            if (headerRow != null) {
                for (int i = 0; i < headerRow.getPhysicalNumberOfCells(); i++) {
                    sheet.autoSizeColumn(i);
                }
            }
        }
    }
}
