package com.jaya.service.excel.chart;

import lombok.Builder;
import lombok.Data;

/**
 * Defines the position and size of a chart in an Excel sheet.
 * Uses cell-based coordinates (col1, row1) to (col2, row2).
 */
@Data
@Builder
public class ChartPosition {
    private int col1; // Starting column (0-based)
    private int row1; // Starting row (0-based)
    private int col2; // Ending column (0-based)
    private int row2; // Ending row (0-based)

    /**
     * Create a chart position with standard size (8 columns x 15 rows)
     */
    public static ChartPosition standard(int startCol, int startRow) {
        return ChartPosition.builder()
                .col1(startCol)
                .row1(startRow)
                .col2(startCol + 8)
                .row2(startRow + 15)
                .build();
    }

    /**
     * Create a chart position with custom size
     */
    public static ChartPosition custom(int startCol, int startRow, int width, int height) {
        return ChartPosition.builder()
                .col1(startCol)
                .row1(startRow)
                .col2(startCol + width)
                .row2(startRow + height)
                .build();
    }

    /**
     * Create a small chart (6 columns x 10 rows)
     */
    public static ChartPosition small(int startCol, int startRow) {
        return custom(startCol, startRow, 6, 10);
    }

    /**
     * Create a large chart (12 columns x 20 rows)
     */
    public static ChartPosition large(int startCol, int startRow) {
        return custom(startCol, startRow, 12, 20);
    }
}
