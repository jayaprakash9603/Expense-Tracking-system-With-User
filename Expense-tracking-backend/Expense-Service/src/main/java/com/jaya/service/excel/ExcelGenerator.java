package com.jaya.service.excel;

import com.jaya.service.excel.util.ExcelCellWriter;
import com.jaya.service.excel.util.ExcelStyleFactory;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;








public class ExcelGenerator<T> {

    private final ExcelColumnDefinition<T> columnDefinition;

    public ExcelGenerator(ExcelColumnDefinition<T> columnDefinition) {
        this.columnDefinition = columnDefinition;
    }

    


    public ByteArrayInputStream generate(List<T> entities) throws IOException {
        try (Workbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet(columnDefinition.getSheetName());
            CellStyle headerStyle = ExcelStyleFactory.createHeaderStyle(workbook);

            
            createHeaderRow(sheet, headerStyle);

            
            createDataRows(sheet, entities);

            
            autoSizeColumns(sheet);

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    


    public ByteArrayInputStream generateSingle(T entity) throws IOException {
        return generate(List.of(entity));
    }

    


    public ByteArrayInputStream generateEmpty() throws IOException {
        return generate(List.of());
    }

    


    private void createHeaderRow(Sheet sheet, CellStyle headerStyle) {
        Row headerRow = sheet.createRow(0);
        List<ExcelColumn<T>> columns = columnDefinition.getColumns();

        for (int i = 0; i < columns.size(); i++) {
            ExcelCellWriter.createHeaderCell(headerRow, i, columns.get(i).getHeader(), headerStyle);
        }
    }

    


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
