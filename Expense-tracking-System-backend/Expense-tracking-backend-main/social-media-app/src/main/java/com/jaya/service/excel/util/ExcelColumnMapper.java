package com.jaya.service.excel.util;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.FormulaEvaluator;
import org.apache.poi.ss.usermodel.Row;

import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;





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

    


    public Integer findColumn(String... synonyms) {
        for (String synonym : synonyms) {
            Integer index = columnIndices.get(DataParser.normalizeHeader(synonym));
            if (index != null) {
                return index;
            }
        }
        return null;
    }

    


    public boolean hasColumn(String... synonyms) {
        return findColumn(synonyms) != null;
    }

    


    public String getCellValue(Row row, FormulaEvaluator evaluator, String... synonyms) {
        Integer colIndex = findColumn(synonyms);
        if (colIndex == null) {
            return "";
        }
        Cell cell = row.getCell(colIndex);
        return ExcelCellReader.getCellValueAsString(cell, evaluator);
    }

    


    public Cell getCell(Row row, String... synonyms) {
        Integer colIndex = findColumn(synonyms);
        if (colIndex == null) {
            return null;
        }
        return row.getCell(colIndex);
    }

    


    public Map<String, Integer> getColumnIndices() {
        return new HashMap<>(columnIndices);
    }
}
