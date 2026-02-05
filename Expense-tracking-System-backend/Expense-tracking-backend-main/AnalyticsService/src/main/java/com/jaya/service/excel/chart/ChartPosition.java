package com.jaya.service.excel.chart;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChartPosition {
    private int col1;
    private int row1;
    private int col2;
    private int row2;

    public static ChartPosition standard(int startCol, int startRow) {
        return ChartPosition.builder()
                .col1(startCol)
                .row1(startRow)
                .col2(startCol + 8)
                .row2(startRow + 15)
                .build();
    }

    public static ChartPosition custom(int startCol, int startRow, int width, int height) {
        return ChartPosition.builder()
                .col1(startCol)
                .row1(startRow)
                .col2(startCol + width)
                .row2(startRow + height)
                .build();
    }

    public static ChartPosition small(int startCol, int startRow) {
        return custom(startCol, startRow, 6, 10);
    }

    public static ChartPosition large(int startCol, int startRow) {
        return custom(startCol, startRow, 12, 20);
    }
}
