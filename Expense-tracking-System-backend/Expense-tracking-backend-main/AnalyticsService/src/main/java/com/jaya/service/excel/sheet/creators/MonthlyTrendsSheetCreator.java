package com.jaya.service.excel.sheet.creators;

import com.jaya.dto.report.ReportData.MonthlyTrendData;
import com.jaya.service.excel.chart.BarChartBuilder;
import com.jaya.service.excel.chart.ChartDataRange;
import com.jaya.service.excel.chart.ChartPosition;
import com.jaya.service.excel.sheet.AbstractSheetCreator;
import com.jaya.service.excel.sheet.SheetContext;
import com.jaya.service.excel.style.ExcelStyleFactory;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class MonthlyTrendsSheetCreator extends AbstractSheetCreator {

    private static final String[] HEADERS = {
            "Month", "Total Amount", "Transactions", "Avg Daily", "Change", "Change %"
    };

    @Override
    public String getSheetName() {
        return "Monthly Trends";
    }

    @Override
    public int getOrder() {
        return 4;
    }

    @Override
    public boolean shouldCreate(SheetContext context) {
        List<MonthlyTrendData> trends = context.getData().getMonthlyTrends();
        return trends != null && !trends.isEmpty();
    }

    @Override
    protected String getTitleText(SheetContext context) {
        return "Monthly Spending Trends";
    }

    @Override
    protected int createContent(XSSFSheet sheet, SheetContext context, int startRow) {
        List<MonthlyTrendData> trends = context.getData().getMonthlyTrends();
        ExcelStyleFactory sf = context.getStyleFactory();

        int dataStartRow = createTableHeaders(sheet, startRow, HEADERS, sf);
        int rowIdx = createDataRows(sheet, dataStartRow, trends, sf);

        // Add chart
        if (context.isIncludeCharts() && trends.size() > 1) {
            ChartDataRange dataRange = ChartDataRange.simple("Monthly Trends", dataStartRow, rowIdx - 1, 0, 1);
            ChartPosition position = ChartPosition.large(CHART_START_COL + 1, 2);
            BarChartBuilder.createVertical(sheet, "Monthly Spending", position, dataRange, "Month", "Amount ($)");
        }

        autoSizeColumns(sheet, HEADERS.length);
        return rowIdx;
    }

    private int createDataRows(XSSFSheet sheet, int startRow, List<MonthlyTrendData> trends, ExcelStyleFactory sf) {
        XSSFCellStyle currencyStyle = sf.createCurrencyStyle();
        XSSFCellStyle percentStyle = sf.createPercentageStyle();

        int rowIdx = startRow;
        for (MonthlyTrendData trend : trends) {
            Row row = sheet.createRow(rowIdx++);

            row.createCell(0).setCellValue(trend.getMonth());

            Cell amountCell = row.createCell(1);
            amountCell.setCellValue(trend.getTotalAmount());
            amountCell.setCellStyle(currencyStyle);

            row.createCell(2).setCellValue(trend.getTransactionCount());

            Cell avgDailyCell = row.createCell(3);
            avgDailyCell.setCellValue(trend.getAverageDaily());
            avgDailyCell.setCellStyle(currencyStyle);

            Cell changeCell = row.createCell(4);
            changeCell.setCellValue(trend.getChangeFromPreviousMonth());
            changeCell.setCellStyle(currencyStyle);

            Cell changePercentCell = row.createCell(5);
            changePercentCell.setCellValue(trend.getChangePercent() / 100.0);
            changePercentCell.setCellStyle(percentStyle);
        }

        return rowIdx;
    }
}
