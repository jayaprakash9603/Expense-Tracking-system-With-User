package com.jaya.service.excel.sheet.creators;

import com.jaya.dto.report.ReportData.YearlyComparisonData;
import com.jaya.service.excel.chart.BarChartBuilder;
import com.jaya.service.excel.chart.ChartDataRange;
import com.jaya.service.excel.chart.ChartPosition;
import com.jaya.service.excel.sheet.AbstractSheetCreator;
import com.jaya.service.excel.sheet.SheetContext;
import com.jaya.service.excel.style.ExcelStyleFactory;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Creates the Year-over-Year Comparison sheet with annual spending analysis.
 */
@Component
public class YearlyComparisonSheetCreator extends AbstractSheetCreator {

    private static final String[] HEADERS = {
            "Year", "Total Spent", "Transactions", "Avg Monthly", "YoY Change", "Change %", "Top Category"
    };

    @Override
    public String getSheetName() {
        return "Year-over-Year";
    }

    @Override
    public int getOrder() {
        return 9;
    }

    @Override
    public boolean shouldCreate(SheetContext context) {
        List<YearlyComparisonData> yearly = context.getData().getYearlyComparison();
        return yearly != null && !yearly.isEmpty();
    }

    @Override
    protected String getTitleText(SheetContext context) {
        return "Year-over-Year Comparison";
    }

    @Override
    protected int getTitleMergeColumns() {
        return 7;
    }

    @Override
    protected int createContent(XSSFSheet sheet, SheetContext context, int startRow) {
        List<YearlyComparisonData> yearlyData = context.getData().getYearlyComparison();
        ExcelStyleFactory sf = context.getStyleFactory();

        int dataStartRow = createTableHeaders(sheet, startRow, HEADERS, sf);
        int rowIdx = createDataRows(sheet, dataStartRow, yearlyData, sf);

        // Add bar chart
        if (context.isIncludeCharts() && yearlyData.size() > 1) {
            ChartDataRange dataRange = ChartDataRange.simple("Yearly Totals", dataStartRow, rowIdx - 1, 0, 1);
            ChartPosition position = ChartPosition.standard(CHART_START_COL + 2, 2);
            BarChartBuilder.createVertical(sheet, "Yearly Spending Comparison", position, dataRange, "Year",
                    "Amount (₹)");
        }

        autoSizeColumns(sheet, HEADERS.length);
        return rowIdx;
    }

    private int createDataRows(XSSFSheet sheet, int startRow, List<YearlyComparisonData> yearlyData,
            ExcelStyleFactory sf) {
        int rowIdx = startRow;

        for (YearlyComparisonData year : yearlyData) {
            Row row = sheet.createRow(rowIdx++);

            row.createCell(0).setCellValue(year.getYear());

            Cell totalCell = row.createCell(1);
            totalCell.setCellValue(year.getTotalAmount());
            totalCell.setCellStyle(sf.createCurrencyStyle());

            row.createCell(2).setCellValue(year.getTransactionCount());

            Cell avgCell = row.createCell(3);
            avgCell.setCellValue(year.getAverageMonthlySpend());
            avgCell.setCellStyle(sf.createCurrencyStyle());

            Cell changeCell = row.createCell(4);
            changeCell.setCellValue(year.getChangeFromPreviousYear());
            changeCell.setCellStyle(sf.createCurrencyStyle());

            Cell changePctCell = row.createCell(5);
            changePctCell.setCellValue(year.getChangePercent() / 100.0);
            changePctCell.setCellStyle(sf.createPercentageStyle());

            row.createCell(6).setCellValue(year.getTopCategory() != null ? year.getTopCategory() : "-");
        }

        return rowIdx;
    }
}
