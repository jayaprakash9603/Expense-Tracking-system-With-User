package com.jaya.automation.data.excel;

import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public final class ExcelWorkbookReader {
    private final DataFormatter dataFormatter = new DataFormatter();

    public List<ExcelRow> readRows(Path workbookPath, String sheetName) {
        try (Workbook workbook = WorkbookFactory.create(Files.newInputStream(workbookPath))) {
            Sheet sheet = selectSheet(workbook, sheetName);
            List<String> headers = readHeaders(sheet);
            ExcelSchemaValidator.validateHeaders(headers);
            return readDataRows(sheet, headers);
        } catch (IOException ex) {
            throw new IllegalStateException("Unable to read workbook: " + workbookPath, ex);
        }
    }

    private Sheet selectSheet(Workbook workbook, String sheetName) {
        Sheet sheet = workbook.getSheet(sheetName);
        if (sheet != null) {
            return sheet;
        }
        if (workbook.getNumberOfSheets() == 0) {
            throw new IllegalStateException("Workbook does not contain any sheet");
        }
        return workbook.getSheetAt(0);
    }

    private List<String> readHeaders(Sheet sheet) {
        Row headerRow = sheet.getRow(sheet.getFirstRowNum());
        if (headerRow == null) {
            return List.of();
        }
        List<String> headers = new ArrayList<>();
        int lastCell = Math.max(0, headerRow.getLastCellNum());
        for (int cellIndex = 0; cellIndex < lastCell; cellIndex++) {
            String rawHeader = dataFormatter.formatCellValue(headerRow.getCell(cellIndex));
            headers.add(rawHeader == null ? "" : rawHeader.trim().toLowerCase());
        }
        return headers;
    }

    private List<ExcelRow> readDataRows(Sheet sheet, List<String> headers) {
        List<ExcelRow> rows = new ArrayList<>();
        int start = sheet.getFirstRowNum() + 1;
        int end = sheet.getLastRowNum();
        for (int rowIndex = start; rowIndex <= end; rowIndex++) {
            Row row = sheet.getRow(rowIndex);
            if (row == null) {
                continue;
            }
            Map<String, String> values = extractValues(headers, row);
            if (isEmpty(values)) {
                continue;
            }
            rows.add(new ExcelRow(rowIndex + 1, values));
        }
        return rows;
    }

    private Map<String, String> extractValues(List<String> headers, Row row) {
        Map<String, String> values = new LinkedHashMap<>();
        for (int cellIndex = 0; cellIndex < headers.size(); cellIndex++) {
            String key = headers.get(cellIndex);
            if (key.isBlank()) {
                continue;
            }
            String value = dataFormatter.formatCellValue(row.getCell(cellIndex));
            values.put(key, value == null ? "" : value.trim());
        }
        return values;
    }

    private boolean isEmpty(Map<String, String> values) {
        return values.values().stream().allMatch(String::isBlank);
    }
}
