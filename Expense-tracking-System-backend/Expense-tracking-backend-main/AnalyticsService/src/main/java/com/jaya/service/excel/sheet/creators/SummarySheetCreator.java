package com.jaya.service.excel.sheet.creators;

import com.jaya.dto.report.ReportData.SummaryData;
import com.jaya.dto.report.ReportData.CategoryData;
import com.jaya.service.excel.chart.ChartDataRange;
import com.jaya.service.excel.chart.ChartPosition;
import com.jaya.service.excel.chart.PieChartBuilder;
import com.jaya.service.excel.sheet.AbstractSheetCreator;
import com.jaya.service.excel.sheet.SheetContext;
import com.jaya.service.excel.style.ExcelStyleFactory;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SummarySheetCreator extends AbstractSheetCreator {

    @Override
    public String getSheetName() {
        return "Summary";
    }

    @Override
    public int getOrder() {
        return 1;
    }

    @Override
    public boolean shouldCreate(SheetContext context) {
        return context.getData().getSummary() != null;
    }

    @Override
    protected String getTitleText(SheetContext context) {
        String title = context.getData().getReportTitle();
        return title != null ? title : "Expense Report";
    }

    @Override
    protected int createContent(XSSFSheet sheet, SheetContext context, int startRow) {
        SummaryData summary = context.getData().getSummary();
        ExcelStyleFactory sf = context.getStyleFactory();

        int rowIdx = startRow;

        // Report period
        Row periodRow = sheet.createRow(rowIdx++);
        periodRow.createCell(0).setCellValue("Report Period: " +
                context.getData().getStartDate().format(DATE_FORMATTER) + " to " +
                context.getData().getEndDate().format(DATE_FORMATTER));

        rowIdx++; // Empty row

        // KPI Section
        rowIdx = createSectionHeader(sheet, rowIdx, "Key Metrics", sf, 2);
        rowIdx = createKpiSection(sheet, rowIdx, summary, sf);

        rowIdx++; // Empty row

        // Budget Summary Section
        rowIdx = createSectionHeader(sheet, rowIdx, "Budget Summary", sf, 2);
        rowIdx = createBudgetSummarySection(sheet, rowIdx, summary, sf);

        // Top category info
        rowIdx++;
        Row topCatRow = sheet.createRow(rowIdx++);
        topCatRow.createCell(0).setCellValue("Top Category");
        topCatRow.createCell(1).setCellValue(summary.getTopCategory());

        // Add chart if enabled
        if (context.isIncludeCharts()) {
            addCategoryPieChart(sheet, context);
        }

        autoSizeColumns(sheet, 4);
        return rowIdx;
    }

    private int createKpiSection(XSSFSheet sheet, int rowIdx, SummaryData summary, ExcelStyleFactory sf) {
        XSSFCellStyle labelStyle = sf.createKpiLabelStyle();
        XSSFCellStyle valueStyle = sf.createKpiCurrencyStyle();

        rowIdx = addKpiRow(sheet, rowIdx, "Total Expenses", summary.getTotalExpenses(), labelStyle, valueStyle);
        rowIdx = addKpiRow(sheet, rowIdx, "Total Income", summary.getTotalIncome(), labelStyle, valueStyle);
        rowIdx = addKpiRow(sheet, rowIdx, "Net Balance", summary.getNetBalance(), labelStyle, valueStyle);
        rowIdx = addKpiRow(sheet, rowIdx, "Average Expense", summary.getAverageExpense(), labelStyle, valueStyle);

        Row countRow = sheet.createRow(rowIdx++);
        countRow.createCell(0).setCellValue("Transaction Count");
        countRow.getCell(0).setCellStyle(labelStyle);
        countRow.createCell(1).setCellValue(summary.getTransactionCount());

        rowIdx = addKpiRow(sheet, rowIdx, "Max Expense", summary.getMaxExpense(), labelStyle, valueStyle);
        rowIdx = addKpiRow(sheet, rowIdx, "Min Expense", summary.getMinExpense(), labelStyle, valueStyle);
        rowIdx = addKpiRow(sheet, rowIdx, "Credit Due", summary.getTotalCreditDue(), labelStyle, valueStyle);

        return rowIdx;
    }

    private int createBudgetSummarySection(XSSFSheet sheet, int rowIdx, SummaryData summary, ExcelStyleFactory sf) {
        XSSFCellStyle labelStyle = sf.createKpiLabelStyle();
        XSSFCellStyle valueStyle = sf.createKpiCurrencyStyle();

        rowIdx = addKpiRow(sheet, rowIdx, "Budget Allocated", summary.getTotalBudgetAllocated(), labelStyle,
                valueStyle);
        rowIdx = addKpiRow(sheet, rowIdx, "Budget Used", summary.getTotalBudgetUsed(), labelStyle, valueStyle);

        Row utilizationRow = sheet.createRow(rowIdx++);
        utilizationRow.createCell(0).setCellValue("Budget Utilization");
        utilizationRow.getCell(0).setCellStyle(labelStyle);
        Cell utilizationCell = utilizationRow.createCell(1);
        utilizationCell.setCellValue(summary.getBudgetUtilizationPercent() / 100.0);
        utilizationCell.setCellStyle(sf.createPercentageStyle());

        return rowIdx;
    }

    private void addCategoryPieChart(XSSFSheet sheet, SheetContext context) {
        List<CategoryData> categories = context.getData().getCategoryBreakdown();
        if (categories == null || categories.isEmpty())
            return;

        int chartDataStartRow = 4;
        int chartDataCol = CHART_START_COL + 10;

        sheet.createRow(chartDataStartRow).createCell(chartDataCol).setCellValue("Category");
        sheet.getRow(chartDataStartRow).createCell(chartDataCol + 1).setCellValue("Amount");

        int dataRow = chartDataStartRow + 1;
        for (CategoryData cat : categories) {
            Row row = sheet.getRow(dataRow);
            if (row == null)
                row = sheet.createRow(dataRow);
            row.createCell(chartDataCol).setCellValue(cat.getCategoryName());
            row.createCell(chartDataCol + 1).setCellValue(cat.getTotalAmount());
            dataRow++;
        }

        ChartDataRange pieDataRange = ChartDataRange.simple(
                "Summary", chartDataStartRow + 1, dataRow - 1, chartDataCol, chartDataCol + 1);
        ChartPosition piePosition = ChartPosition.custom(CHART_START_COL, 4, 8, 12);

        new PieChartBuilder(sheet, "Expense by Category", piePosition, pieDataRange)
                .with3D(false)
                .withPercentage(true)
                .build();
    }
}
