package com.jaya.service.excel.chart;

import lombok.Builder;
import lombok.Data;
import org.apache.poi.ss.util.CellRangeAddress;

/**
 * Helper class for defining data ranges used in Excel charts.
 * Encapsulates the cell range addresses for categories (labels) and values
 * (data).
 */
@Data
@Builder
public class ChartDataRange {
    private String sheetName;
    private int categoryStartRow;
    private int categoryEndRow;
    private int categoryColumn;
    private int valueStartRow;
    private int valueEndRow;
    private int valueColumn;

    /**
     * Create a CellRangeAddress for the category (label) data
     */
    public CellRangeAddress getCategoryRange() {
        return new CellRangeAddress(categoryStartRow, categoryEndRow, categoryColumn, categoryColumn);
    }

    /**
     * Create a CellRangeAddress for the value data
     */
    public CellRangeAddress getValueRange() {
        return new CellRangeAddress(valueStartRow, valueEndRow, valueColumn, valueColumn);
    }

    /**
     * Factory method for creating a simple data range where categories and values
     * are in adjacent columns starting from the same row
     */
    public static ChartDataRange simple(String sheetName, int startRow, int endRow,
            int categoryCol, int valueCol) {
        return ChartDataRange.builder()
                .sheetName(sheetName)
                .categoryStartRow(startRow)
                .categoryEndRow(endRow)
                .categoryColumn(categoryCol)
                .valueStartRow(startRow)
                .valueEndRow(endRow)
                .valueColumn(valueCol)
                .build();
    }
}
