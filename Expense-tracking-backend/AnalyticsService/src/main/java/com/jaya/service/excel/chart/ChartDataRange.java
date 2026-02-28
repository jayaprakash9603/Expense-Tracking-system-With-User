package com.jaya.service.excel.chart;

import lombok.Builder;
import lombok.Data;
import org.apache.poi.ss.util.CellRangeAddress;

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

    public CellRangeAddress getCategoryRange() {
        return new CellRangeAddress(categoryStartRow, categoryEndRow, categoryColumn, categoryColumn);
    }

    public CellRangeAddress getValueRange() {
        return new CellRangeAddress(valueStartRow, valueEndRow, valueColumn, valueColumn);
    }

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
