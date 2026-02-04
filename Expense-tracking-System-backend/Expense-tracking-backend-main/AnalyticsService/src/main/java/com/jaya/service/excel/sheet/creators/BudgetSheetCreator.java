package com.jaya.service.excel.sheet.creators;

import com.jaya.dto.report.ReportData.BudgetData;
import com.jaya.service.excel.chart.BarChartBuilder;
import com.jaya.service.excel.chart.ChartDataRange;
import com.jaya.service.excel.chart.ChartPosition;
import com.jaya.service.excel.sheet.AbstractSheetCreator;
import com.jaya.service.excel.sheet.SheetContext;
import com.jaya.service.excel.style.ConditionalFormattingHelper;
import com.jaya.service.excel.style.ExcelStyleFactory;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class BudgetSheetCreator extends AbstractSheetCreator {

    private static final String[] HEADERS = {
            "Budget Name", "Allocated", "Used", "Remaining", "Utilization %", "Status",
            "Cash Spent", "Credit Spent", "Expenses", "Daily Budget", "Daily Spend Rate",
            "Days Left", "Period", "Projected Overspend"
    };

    @Override
    public String getSheetName() {
        return "Budget Analysis";
    }

    @Override
    public int getOrder() {
        return 6;
    }

    @Override
    public boolean shouldCreate(SheetContext context) {
        List<BudgetData> budgets = context.getData().getBudgets();
        return budgets != null && !budgets.isEmpty();
    }

    @Override
    protected int getTitleMergeColumns() {
        return 6;
    }

    @Override
    protected int createContent(XSSFSheet sheet, SheetContext context, int startRow) {
        List<BudgetData> budgets = context.getData().getBudgets();
        ExcelStyleFactory sf = context.getStyleFactory();

        int rowIdx = startRow;

        // Summary Section
        rowIdx = createBudgetSummarySection(sheet, rowIdx, budgets, sf);
        rowIdx++; // Empty row

        // Status Breakdown Section
        rowIdx = createStatusBreakdownSection(sheet, rowIdx, budgets, sf);
        rowIdx += 2; // Empty rows

        // Detailed Budget Table
        rowIdx = createSectionHeader(sheet, rowIdx, "Detailed Budget Analysis", sf, 6);
        int dataStartRow = createTableHeaders(sheet, rowIdx, HEADERS, sf);
        int dataEndRow = createBudgetDataRows(sheet, dataStartRow, budgets, sf);

        // Apply conditional formatting
        if (context.isIncludeConditionalFormatting() && budgets.size() > 0) {
            ConditionalFormattingHelper cfHelper = new ConditionalFormattingHelper(context.getWorkbook(), sheet);
            cfHelper.applyBudgetStatusRules(dataStartRow, dataEndRow - 1, 4);
        }

        // Add chart
        if (context.isIncludeCharts() && budgets.size() > 1) {
            addBudgetChart(sheet, dataStartRow, dataEndRow - 1);
        }

        autoSizeColumns(sheet, HEADERS.length);
        return dataEndRow;
    }

    private int createBudgetSummarySection(XSSFSheet sheet, int rowIdx, List<BudgetData> budgets,
            ExcelStyleFactory sf) {
        rowIdx = createSectionHeader(sheet, rowIdx, "Budget Overview Summary", sf, 4);

        // Calculate metrics
        double totalAllocated = budgets.stream().mapToDouble(BudgetData::getAllocatedAmount).sum();
        double totalUsed = budgets.stream().mapToDouble(BudgetData::getUsedAmount).sum();
        double totalRemaining = budgets.stream().mapToDouble(BudgetData::getRemainingAmount).sum();
        double overallUtilization = totalAllocated > 0 ? (totalUsed / totalAllocated) * 100 : 0;

        XSSFCellStyle labelStyle = sf.createKpiLabelStyle();
        XSSFCellStyle valueStyle = sf.createKpiCurrencyStyle();

        rowIdx = addKpiRowInt(sheet, rowIdx, "Total Budgets", budgets.size(), labelStyle, sf.createKpiValueStyle());
        rowIdx = addKpiRow(sheet, rowIdx, "Total Allocated", totalAllocated, labelStyle, valueStyle);
        rowIdx = addKpiRow(sheet, rowIdx, "Total Used", totalUsed, labelStyle, valueStyle);
        rowIdx = addKpiRow(sheet, rowIdx, "Total Remaining", totalRemaining, labelStyle, valueStyle);

        // Utilization row
        Row utilizationRow = sheet.createRow(rowIdx++);
        utilizationRow.createCell(0).setCellValue("Overall Utilization");
        utilizationRow.getCell(0).setCellStyle(labelStyle);
        Cell utilizationCell = utilizationRow.createCell(1);
        utilizationCell.setCellValue(overallUtilization / 100.0);
        utilizationCell.setCellStyle(sf.createPercentageStyle());

        return rowIdx;
    }

    private int createStatusBreakdownSection(XSSFSheet sheet, int rowIdx, List<BudgetData> budgets,
            ExcelStyleFactory sf) {
        rowIdx = createSectionHeader(sheet, rowIdx, "Budget Status Breakdown", sf, 2);

        long activeCount = budgets.stream().filter(b -> "ACTIVE".equals(b.getStatus())).count();
        long warningCount = budgets.stream().filter(b -> "WARNING".equals(b.getStatus())).count();
        long exceededCount = budgets.stream().filter(b -> "EXCEEDED".equals(b.getStatus())).count();
        long expiredCount = budgets.stream().filter(b -> "EXPIRED".equals(b.getStatus())).count();

        rowIdx = createStatusRow(sheet, rowIdx, "Active (Healthy)", activeCount, sf.createSuccessStyle());
        rowIdx = createStatusRow(sheet, rowIdx, "Warning (80%+)", warningCount, sf.createWarningStyle());
        rowIdx = createStatusRow(sheet, rowIdx, "Exceeded (100%+)", exceededCount, sf.createDangerStyle());

        Row expiredRow = sheet.createRow(rowIdx++);
        expiredRow.createCell(0).setCellValue("Expired");
        expiredRow.createCell(1).setCellValue(expiredCount);

        return rowIdx;
    }

    private int createStatusRow(XSSFSheet sheet, int rowIdx, String label, long count, XSSFCellStyle style) {
        Row row = sheet.createRow(rowIdx);
        row.createCell(0).setCellValue(label);
        Cell countCell = row.createCell(1);
        countCell.setCellValue(count);
        countCell.setCellStyle(style);
        return rowIdx + 1;
    }

    private int createBudgetDataRows(XSSFSheet sheet, int startRow, List<BudgetData> budgets, ExcelStyleFactory sf) {
        XSSFCellStyle currencyStyle = sf.createCurrencyStyle();
        XSSFCellStyle percentStyle = sf.createPercentageStyle();

        int rowIdx = startRow;
        for (BudgetData budget : budgets) {
            Row row = sheet.createRow(rowIdx++);

            // Budget Name
            String budgetName = budget.getBudgetName();
            row.createCell(0).setCellValue(
                    budgetName != null && !budgetName.isEmpty() ? budgetName : "Budget #" + budget.getBudgetId());

            createCurrencyCell(row, 1, budget.getAllocatedAmount(), currencyStyle);
            createCurrencyCell(row, 2, budget.getUsedAmount(), currencyStyle);
            createCurrencyCell(row, 3, budget.getRemainingAmount(), currencyStyle);

            Cell utilizationCell = row.createCell(4);
            utilizationCell.setCellValue(budget.getUtilizationPercent() / 100.0);
            utilizationCell.setCellStyle(percentStyle);

            // Status with conditional styling
            Cell statusCell = row.createCell(5);
            statusCell.setCellValue(budget.getStatus());
            statusCell.setCellStyle(getStatusStyle(budget.getStatus(), sf));

            createCurrencyCell(row, 6, budget.getCashSpent(), currencyStyle);
            createCurrencyCell(row, 7, budget.getCreditSpent(), currencyStyle);
            row.createCell(8).setCellValue(budget.getExpenseCount());
            createCurrencyCell(row, 9, budget.getDailyBudget(), currencyStyle);
            createCurrencyCell(row, 10, budget.getDailySpendRate(), currencyStyle);
            row.createCell(11).setCellValue(budget.getDaysRemaining());

            // Period
            String period = "";
            if (budget.getStartDate() != null && budget.getEndDate() != null) {
                period = budget.getStartDate().format(DATE_FORMATTER) + " to " +
                        budget.getEndDate().format(DATE_FORMATTER);
            }
            row.createCell(12).setCellValue(period);

            // Projected Overspend
            Cell overspendCell = row.createCell(13);
            overspendCell.setCellValue(budget.getProjectedOverspend());
            overspendCell.setCellStyle(budget.getProjectedOverspend() > 0 ? sf.createDangerStyle() : currencyStyle);
        }

        return rowIdx;
    }

    private void createCurrencyCell(Row row, int colIdx, double value, XSSFCellStyle style) {
        Cell cell = row.createCell(colIdx);
        cell.setCellValue(value);
        cell.setCellStyle(style);
    }

    private XSSFCellStyle getStatusStyle(String status, ExcelStyleFactory sf) {
        switch (status) {
            case "EXCEEDED":
                return sf.createDangerStyle();
            case "WARNING":
            case "EXPIRED":
                return sf.createWarningStyle();
            default:
                return sf.createSuccessStyle();
        }
    }

    private void addBudgetChart(XSSFSheet sheet, int dataStartRow, int dataEndRow) {
        ChartDataRange dataRange = ChartDataRange.builder()
                .sheetName("Budget Analysis")
                .categoryStartRow(dataStartRow)
                .categoryEndRow(dataEndRow)
                .categoryColumn(0)
                .valueStartRow(dataStartRow)
                .valueEndRow(dataEndRow)
                .valueColumn(4)
                .build();
        ChartPosition position = ChartPosition.standard(CHART_START_COL + 8, 2);

        new BarChartBuilder(sheet, "Budget Utilization", position, dataRange)
                .horizontal(true)
                .withCategoryAxisTitle("Budget")
                .withValueAxisTitle("Utilization %")
                .build();
    }
}
