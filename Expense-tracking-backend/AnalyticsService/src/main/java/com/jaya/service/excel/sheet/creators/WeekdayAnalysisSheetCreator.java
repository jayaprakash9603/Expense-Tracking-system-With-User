package com.jaya.service.excel.sheet.creators;

import com.jaya.dto.report.ReportData.WeekdaySpendingData;
import com.jaya.service.excel.chart.BarChartBuilder;
import com.jaya.service.excel.chart.ChartDataRange;
import com.jaya.service.excel.chart.ChartPosition;
import com.jaya.service.excel.sheet.AbstractSheetCreator;
import com.jaya.service.excel.sheet.SheetContext;
import com.jaya.service.excel.style.ExcelStyleFactory;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class WeekdayAnalysisSheetCreator extends AbstractSheetCreator {

    private static final String[] HEADERS = { "Day", "Total Amount", "Transactions", "Average", "% of Total" };

    @Override
    public String getSheetName() {
        return "Weekday Analysis";
    }

    @Override
    public int getOrder() {
        return 8;
    }

    @Override
    public boolean shouldCreate(SheetContext context) {
        List<WeekdaySpendingData> weekday = context.getData().getWeekdaySpending();
        return weekday != null && !weekday.isEmpty();
    }

    @Override
    protected String getTitleText(SheetContext context) {
        return "Spending by Day of Week";
    }

    @Override
    protected int getTitleMergeColumns() {
        return 5;
    }

    @Override
    protected int createContent(XSSFSheet sheet, SheetContext context, int startRow) {
        List<WeekdaySpendingData> weekdayData = context.getData().getWeekdaySpending();
        ExcelStyleFactory sf = context.getStyleFactory();

        int dataStartRow = createTableHeaders(sheet, startRow, HEADERS, sf);
        int rowIdx = createDataRows(sheet, dataStartRow, weekdayData, sf);
        if (context.isIncludeCharts() && weekdayData.size() > 1) {
            ChartDataRange dataRange = ChartDataRange.simple("Weekday Spending", dataStartRow, rowIdx - 1, 0, 1);
            ChartPosition position = ChartPosition.standard(CHART_START_COL, 2);
            BarChartBuilder.createVertical(sheet, "Spending by Day of Week", position, dataRange, "Day", "Amount (₹)");
        }

        autoSizeColumns(sheet, HEADERS.length);
        return rowIdx;
    }

    private int createDataRows(XSSFSheet sheet, int startRow, List<WeekdaySpendingData> weekdayData,
            ExcelStyleFactory sf) {
        int rowIdx = startRow;

        for (WeekdaySpendingData day : weekdayData) {
            Row row = sheet.createRow(rowIdx++);

            row.createCell(0).setCellValue(day.getDayName());

            Cell amountCell = row.createCell(1);
            amountCell.setCellValue(day.getTotalAmount());
            amountCell.setCellStyle(sf.createCurrencyStyle());

            row.createCell(2).setCellValue(day.getTransactionCount());

            Cell avgCell = row.createCell(3);
            avgCell.setCellValue(day.getAverageAmount());
            avgCell.setCellStyle(sf.createCurrencyStyle());

            Cell pctCell = row.createCell(4);
            pctCell.setCellValue(day.getPercentage() / 100.0);
            pctCell.setCellStyle(sf.createPercentageStyle());
        }

        return rowIdx;
    }
}
