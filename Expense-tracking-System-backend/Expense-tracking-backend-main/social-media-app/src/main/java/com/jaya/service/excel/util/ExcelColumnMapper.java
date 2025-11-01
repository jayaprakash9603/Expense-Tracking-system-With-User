package com.jaya.service.excel.util;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.FormulaEvaluator;
import org.apache.poi.ss.usermodel.Row;

import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Utility to map Excel column headers to their indices
 * Supports flexible header matching with synonyms
 */
public class ExcelColumnMapper {

    private final Map<String, Integer> columnIndices;

    public ExcelColumnMapper(Row headerRow, FormulaEvaluator evaluator) {
        this.columnIndices = new HashMap<>();
        if (headerRow != null) {
            for (Cell cell : headerRow) {
                String header = ExcelCellReader.getCellValueAsString(cell, evaluator).trim();
                if (!header.isEmpty()) {
                    columnIndices.put(DataParser.normalizeHeader(header), cell.getColumnIndex());
                }
            }
        }
    }

    /**
     * Find column index by trying multiple synonym variations
     */
    public Integer findColumn(String... synonyms) {
        for (String synonym : synonyms) {
            Integer index = columnIndices.get(DataParser.normalizeHeader(synonym));
            if (index != null) {
                return index;
            }
        }
        return null;
    }

    /**
     * Check if a column exists
     */
    public boolean hasColumn(String... synonyms) {
        return findColumn(synonyms) != null;
    }

    /**
     * Get cell value from row using column synonyms
     */
    public String getCellValue(Row row, FormulaEvaluator evaluator, String... synonyms) {
        Integer colIndex = findColumn(synonyms);
        if (colIndex == null) {
            return "";
        }
        Cell cell = row.getCell(colIndex);
        return ExcelCellReader.getCellValueAsString(cell, evaluator);
    }

    /**
     * Get cell from row using column synonyms
     */
    public Cell getCell(Row row, String... synonyms) {
        Integer colIndex = findColumn(synonyms);
        if (colIndex == null) {
            return null;
        }
        return row.getCell(colIndex);
    }

    /**
     * Get all mapped columns
     */
    public Map<String, Integer> getColumnIndices() {
        return new HashMap<>(columnIndices);
    }
}
