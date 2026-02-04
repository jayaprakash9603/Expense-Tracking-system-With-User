package com.jaya.service.excel.sheet.creators;

import com.jaya.dto.report.ReportData.DailySpendingData;
import com.jaya.service.excel.chart.ChartDataRange;
import com.jaya.service.excel.chart.ChartPosition;
import com.jaya.service.excel.chart.LineChartBuilder;
import com.jaya.service.excel.sheet.AbstractSheetCreator;
import com.jaya.service.excel.sheet.SheetContext;
import com.jaya.service.excel.style.ExcelStyleFactory;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DailySpendingSheetCreator extends AbstractSheetCreator {

    private static final String[] HEADERS = { "Date", "Day", "Amount", "Transactions", "Top Category" };

    @Override
    public String getSheetName() {
        return "Daily Spending";
    }

    @Override
    public int getOrder() {
        return 5;
    }

    @Override
    public boolean shouldCreate(SheetContext context) {
        List<DailySpendingData> daily = context.getData().getDailySpending();
        return daily != null && !daily.isEmpty();
    }

    @Override
    protected String getTitleText(SheetContext context) {
        return "Daily Spending Pattern";
    }

    @Override
    protected int createContent(XSSFSheet sheet, SheetContext context, int startRow) {
        List<DailySpendingData> daily = context.getData().getDailySpending();
        ExcelStyleFactory sf = context.getStyleFactory();

        int dataStartRow = createTableHeaders(sheet, startRow, HEADERS, sf);
        int rowIdx = createDataRows(sheet, dataStartRow, daily, sf);

        // Add line chart
        if (context.isIncludeCharts() && daily.size() > 7) {
            ChartDataRange dataRange = ChartDataRange.simple("Daily Spending", dataStartRow, rowIdx - 1, 0, 2);
            ChartPosition position = ChartPosition.large(CHART_START_COL, 2);

            new LineChartBuilder(sheet, "Daily Spending Trend", position, dataRange)
                    .withMarkers(true)
                    .withCategoryAxisTitle("Date")
                    .withValueAxisTitle("Amount ($)")
                    .build();
        }

        autoSizeColumns(sheet, HEADERS.length);
        return rowIdx;
    }

    private int createDataRows(XSSFSheet sheet, int startRow, List<DailySpendingData> daily, ExcelStyleFactory sf) {
        XSSFCellStyle dateStyle = sf.createDateStyle();
        XSSFCellStyle currencyStyle = sf.createCurrencyStyle();

        int rowIdx = startRow;
        for (DailySpendingData day : daily) {
            Row row = sheet.createRow(rowIdx++);

            Cell dateCell = row.createCell(0);
            dateCell.setCellValue(day.getDate().format(DATE_FORMATTER));
            dateCell.setCellStyle(dateStyle);

            row.createCell(1).setCellValue(day.getDayName());

            Cell amountCell = row.createCell(2);
            amountCell.setCellValue(day.getAmount());
            amountCell.setCellStyle(currencyStyle);

            row.createCell(3).setCellValue(day.getTransactionCount());
            row.createCell(4).setCellValue(day.getTopCategory() != null ? day.getTopCategory() : "");
        }

        return rowIdx;
    }
}
