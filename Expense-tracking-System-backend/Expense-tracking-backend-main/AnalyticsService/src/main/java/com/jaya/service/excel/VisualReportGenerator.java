package com.jaya.service.excel;

import com.jaya.dto.report.ReportData;
import com.jaya.dto.report.ReportData.*;
import com.jaya.service.excel.chart.*;
import com.jaya.service.excel.formula.ExcelFormulaBuilder;
import com.jaya.service.excel.style.ConditionalFormattingHelper;
import com.jaya.service.excel.style.ExcelStyleFactory;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.*;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Generates beautiful Excel reports with charts, formulas, and conditional formatting.
 * Creates multi-sheet workbooks with visual representations of expense/budget data.
 * 
 * Follows Single Responsibility Principle - delegates to specialized builders.
 */
@Slf4j
@Component
public class VisualReportGenerator {
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final int CHART_START_COL = 5;  // Column F
    
    /**
     * Generate a comprehensive visual Excel report
     * 
     * @param data Report data containing all analytics
     * @param includeCharts Whether to include charts
     * @param includeFormulas Whether to include dynamic formulas
     * @param includeConditionalFormatting Whether to include conditional formatting
     * @return ByteArrayInputStream containing the Excel file
     */
    public ByteArrayInputStream generateReport(ReportData data, 
                                               boolean includeCharts,
                                               boolean includeFormulas,
                                               boolean includeConditionalFormatting) throws IOException {
        
        log.info("Generating visual report: {} to {}", data.getStartDate(), data.getEndDate());
        
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            ExcelStyleFactory styleFactory = new ExcelStyleFactory(workbook);
            
            // Create sheets
            createSummarySheet(workbook, data, styleFactory, includeCharts, includeFormulas);
            createExpenseSheet(workbook, data, styleFactory, includeFormulas, includeConditionalFormatting);
            createCategorySheet(workbook, data, styleFactory, includeCharts, includeFormulas);
            createMonthlyTrendsSheet(workbook, data, styleFactory, includeCharts, includeFormulas);
            createDailySpendingSheet(workbook, data, styleFactory, includeCharts);
            createBudgetSheet(workbook, data, styleFactory, includeCharts, includeConditionalFormatting);
            createPaymentMethodSheet(workbook, data, styleFactory, includeCharts);
            
            if (data.getInsights() != null && !data.getInsights().isEmpty()) {
                createInsightsSheet(workbook, data, styleFactory);
            }
            
            workbook.write(out);
            log.info("Visual report generated successfully");
            return new ByteArrayInputStream(out.toByteArray());
        }
    }
    
    // ==================== SUMMARY SHEET ====================
    
    private void createSummarySheet(XSSFWorkbook workbook, ReportData data, 
                                    ExcelStyleFactory styleFactory,
                                    boolean includeCharts, boolean includeFormulas) {
        XSSFSheet sheet = workbook.createSheet("Summary");
        SummaryData summary = data.getSummary();
        if (summary == null) return;
        
        int rowIdx = 0;
        
        // Title
        Row titleRow = sheet.createRow(rowIdx++);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue(data.getReportTitle() != null ? data.getReportTitle() : "Expense Report");
        titleCell.setCellStyle(styleFactory.createTitleStyle());
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 3));
        
        // Report period
        Row periodRow = sheet.createRow(rowIdx++);
        periodRow.createCell(0).setCellValue("Report Period: " + 
            data.getStartDate().format(DATE_FORMATTER) + " to " + data.getEndDate().format(DATE_FORMATTER));
        
        rowIdx++; // Empty row
        
        // KPI Section Header
        Row kpiHeaderRow = sheet.createRow(rowIdx++);
        Cell kpiHeader = kpiHeaderRow.createCell(0);
        kpiHeader.setCellValue("Key Metrics");
        kpiHeader.setCellStyle(styleFactory.createSectionHeaderStyle());
        sheet.addMergedRegion(new CellRangeAddress(rowIdx - 1, rowIdx - 1, 0, 1));
        
        // KPIs
        XSSFCellStyle labelStyle = styleFactory.createKpiLabelStyle();
        XSSFCellStyle valueStyle = styleFactory.createKpiCurrencyStyle();
        
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
        
        rowIdx++; // Empty row
        
        // Budget Summary
        Row budgetHeaderRow = sheet.createRow(rowIdx++);
        Cell budgetHeader = budgetHeaderRow.createCell(0);
        budgetHeader.setCellValue("Budget Summary");
        budgetHeader.setCellStyle(styleFactory.createSectionHeaderStyle());
        sheet.addMergedRegion(new CellRangeAddress(rowIdx - 1, rowIdx - 1, 0, 1));
        
        rowIdx = addKpiRow(sheet, rowIdx, "Budget Allocated", summary.getTotalBudgetAllocated(), labelStyle, valueStyle);
        rowIdx = addKpiRow(sheet, rowIdx, "Budget Used", summary.getTotalBudgetUsed(), labelStyle, valueStyle);
        
        Row utilizationRow = sheet.createRow(rowIdx++);
        utilizationRow.createCell(0).setCellValue("Budget Utilization");
        utilizationRow.getCell(0).setCellStyle(labelStyle);
        Cell utilizationCell = utilizationRow.createCell(1);
        utilizationCell.setCellValue(summary.getBudgetUtilizationPercent() / 100.0);
        utilizationCell.setCellStyle(styleFactory.createPercentageStyle());
        
        // Top category info
        rowIdx++;
        Row topCatRow = sheet.createRow(rowIdx++);
        topCatRow.createCell(0).setCellValue("Top Category");
        topCatRow.createCell(1).setCellValue(summary.getTopCategory());
        
        // Add charts if enabled
        if (includeCharts && data.getCategoryBreakdown() != null && !data.getCategoryBreakdown().isEmpty()) {
            // Create a small data table for the chart
            int chartDataStartRow = 4;
            int chartDataCol = CHART_START_COL + 10;
            
            sheet.createRow(chartDataStartRow).createCell(chartDataCol).setCellValue("Category");
            sheet.getRow(chartDataStartRow).createCell(chartDataCol + 1).setCellValue("Amount");
            
            int dataRow = chartDataStartRow + 1;
            for (CategoryData cat : data.getCategoryBreakdown()) {
                Row row = sheet.getRow(dataRow);
                if (row == null) row = sheet.createRow(dataRow);
                row.createCell(chartDataCol).setCellValue(cat.getCategoryName());
                row.createCell(chartDataCol + 1).setCellValue(cat.getTotalAmount());
                dataRow++;
            }
            
            // Create pie chart
            ChartDataRange pieDataRange = ChartDataRange.simple(
                    "Summary", chartDataStartRow + 1, dataRow - 1, chartDataCol, chartDataCol + 1);
            ChartPosition piePosition = ChartPosition.custom(CHART_START_COL, 4, 8, 12);
            
            new PieChartBuilder(sheet, "Expense by Category", piePosition, pieDataRange)
                    .with3D(false)
                    .withPercentage(true)
                    .build();
        }
        
        // Auto-size columns
        for (int i = 0; i <= 3; i++) {
            sheet.autoSizeColumn(i);
        }
    }
    
    private int addKpiRow(Sheet sheet, int rowIdx, String label, double value, 
                          CellStyle labelStyle, CellStyle valueStyle) {
        Row row = sheet.createRow(rowIdx);
        Cell labelCell = row.createCell(0);
        labelCell.setCellValue(label);
        labelCell.setCellStyle(labelStyle);
        
        Cell valueCell = row.createCell(1);
        valueCell.setCellValue(value);
        valueCell.setCellStyle(valueStyle);
        
        return rowIdx + 1;
    }
    
    // ==================== EXPENSES SHEET ====================
    
    private void createExpenseSheet(XSSFWorkbook workbook, ReportData data,
                                    ExcelStyleFactory styleFactory,
                                    boolean includeFormulas, boolean includeConditionalFormatting) {
        if (data.getExpenses() == null || data.getExpenses().isEmpty()) return;
        
        XSSFSheet sheet = workbook.createSheet("Transactions");
        List<ExpenseRow> expenses = data.getExpenses();
        
        // Headers
        String[] headers = {"Date", "Name", "Amount", "Category", "Payment Method", "Type", "Notes", "Credit Amount"};
        Row headerRow = sheet.createRow(0);
        XSSFCellStyle headerStyle = styleFactory.createTableHeaderStyle();
        
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // Data rows
        XSSFCellStyle dateStyle = styleFactory.createDateStyle();
        XSSFCellStyle currencyStyle = styleFactory.createCurrencyStyle();
        XSSFCellStyle dataStyle = styleFactory.createDataStyle();
        
        int rowIdx = 1;
        for (ExpenseRow expense : expenses) {
            Row row = sheet.createRow(rowIdx++);
            
            Cell dateCell = row.createCell(0);
            dateCell.setCellValue(expense.getDate().format(DATE_FORMATTER));
            dateCell.setCellStyle(dateStyle);
            
            row.createCell(1).setCellValue(expense.getName());
            
            Cell amountCell = row.createCell(2);
            amountCell.setCellValue(expense.getAmount());
            amountCell.setCellStyle(currencyStyle);
            
            row.createCell(3).setCellValue(expense.getCategory());
            row.createCell(4).setCellValue(expense.getPaymentMethod());
            row.createCell(5).setCellValue(expense.getType());
            row.createCell(6).setCellValue(expense.getNotes() != null ? expense.getNotes() : "");
            
            Cell creditCell = row.createCell(7);
            creditCell.setCellValue(expense.getCreditAmount());
            creditCell.setCellStyle(currencyStyle);
        }
        
        // Add formulas for totals
        if (includeFormulas) {
            int lastDataRow = rowIdx - 1;
            Row totalRow = sheet.createRow(rowIdx + 1);
            
            Cell totalLabelCell = totalRow.createCell(1);
            totalLabelCell.setCellValue("TOTAL");
            totalLabelCell.setCellStyle(styleFactory.createTotalRowStyle());
            
            Cell totalAmountCell = totalRow.createCell(2);
            totalAmountCell.setCellFormula(ExcelFormulaBuilder.sum("C", 2, lastDataRow + 1));
            totalAmountCell.setCellStyle(styleFactory.createTotalCurrencyStyle());
            
            Cell totalCreditCell = totalRow.createCell(7);
            totalCreditCell.setCellFormula(ExcelFormulaBuilder.sum("H", 2, lastDataRow + 1));
            totalCreditCell.setCellStyle(styleFactory.createTotalCurrencyStyle());
            
            // Average row
            Row avgRow = sheet.createRow(rowIdx + 2);
            avgRow.createCell(1).setCellValue("AVERAGE");
            Cell avgCell = avgRow.createCell(2);
            avgCell.setCellFormula(ExcelFormulaBuilder.average("C", 2, lastDataRow + 1));
            avgCell.setCellStyle(currencyStyle);
            
            // Count row
            Row countRow = sheet.createRow(rowIdx + 3);
            countRow.createCell(1).setCellValue("COUNT");
            Cell countCell = countRow.createCell(2);
            countCell.setCellFormula(ExcelFormulaBuilder.count("C", 2, lastDataRow + 1));
        }
        
        // Conditional formatting
        if (includeConditionalFormatting && expenses.size() > 1) {
            ConditionalFormattingHelper cfHelper = new ConditionalFormattingHelper(workbook, sheet);
            
            // Highlight high expenses (> $500)
            cfHelper.highlightHighAmounts(1, expenses.size(), 2, 500);
            
            // Alternating row colors
            cfHelper.applyAlternatingRowColors(1, expenses.size(), 0, 7);
        }
        
        // Auto-filter
        sheet.setAutoFilter(new CellRangeAddress(0, expenses.size(), 0, headers.length - 1));
        
        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }
    
    // ==================== CATEGORY BREAKDOWN SHEET ====================
    
    private void createCategorySheet(XSSFWorkbook workbook, ReportData data,
                                     ExcelStyleFactory styleFactory,
                                     boolean includeCharts, boolean includeFormulas) {
        if (data.getCategoryBreakdown() == null || data.getCategoryBreakdown().isEmpty()) return;
        
        XSSFSheet sheet = workbook.createSheet("Category Breakdown");
        List<CategoryData> categories = data.getCategoryBreakdown();
        
        // Title
        Row titleRow = sheet.createRow(0);
        titleRow.createCell(0).setCellValue("Category Breakdown");
        titleRow.getCell(0).setCellStyle(styleFactory.createTitleStyle());
        
        // Headers
        String[] headers = {"Category", "Total Amount", "Transactions", "Percentage", "Avg per Transaction"};
        Row headerRow = sheet.createRow(2);
        XSSFCellStyle headerStyle = styleFactory.createTableHeaderStyle();
        
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // Data rows
        XSSFCellStyle currencyStyle = styleFactory.createCurrencyStyle();
        XSSFCellStyle percentStyle = styleFactory.createPercentageStyle();
        
        int rowIdx = 3;
        for (CategoryData cat : categories) {
            Row row = sheet.createRow(rowIdx++);
            
            row.createCell(0).setCellValue(cat.getCategoryName());
            
            Cell amountCell = row.createCell(1);
            amountCell.setCellValue(cat.getTotalAmount());
            amountCell.setCellStyle(currencyStyle);
            
            row.createCell(2).setCellValue(cat.getTransactionCount());
            
            Cell percentCell = row.createCell(3);
            percentCell.setCellValue(cat.getPercentage() / 100.0);
            percentCell.setCellStyle(percentStyle);
            
            Cell avgCell = row.createCell(4);
            avgCell.setCellValue(cat.getAverageAmount());
            avgCell.setCellStyle(currencyStyle);
        }
        
        // Add pie chart
        if (includeCharts && categories.size() > 1) {
            ChartDataRange dataRange = ChartDataRange.simple("Category Breakdown", 3, rowIdx - 1, 0, 1);
            ChartPosition position = ChartPosition.standard(CHART_START_COL, 2);
            
            PieChartBuilder.create(sheet, "Spending by Category", position, dataRange);
        }
        
        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }
    
    // ==================== MONTHLY TRENDS SHEET ====================
    
    private void createMonthlyTrendsSheet(XSSFWorkbook workbook, ReportData data,
                                          ExcelStyleFactory styleFactory,
                                          boolean includeCharts, boolean includeFormulas) {
        if (data.getMonthlyTrends() == null || data.getMonthlyTrends().isEmpty()) return;
        
        XSSFSheet sheet = workbook.createSheet("Monthly Trends");
        List<MonthlyTrendData> trends = data.getMonthlyTrends();
        
        // Title
        Row titleRow = sheet.createRow(0);
        titleRow.createCell(0).setCellValue("Monthly Spending Trends");
        titleRow.getCell(0).setCellStyle(styleFactory.createTitleStyle());
        
        // Headers
        String[] headers = {"Month", "Total Amount", "Transactions", "Avg Daily", "Change", "Change %"};
        Row headerRow = sheet.createRow(2);
        XSSFCellStyle headerStyle = styleFactory.createTableHeaderStyle();
        
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // Data rows
        XSSFCellStyle currencyStyle = styleFactory.createCurrencyStyle();
        XSSFCellStyle percentStyle = styleFactory.createPercentageStyle();
        
        int rowIdx = 3;
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
        
        // Add bar chart for monthly trends
        if (includeCharts && trends.size() > 1) {
            ChartDataRange dataRange = ChartDataRange.simple("Monthly Trends", 3, rowIdx - 1, 0, 1);
            ChartPosition position = ChartPosition.large(CHART_START_COL + 1, 2);
            
            BarChartBuilder.createVertical(sheet, "Monthly Spending", position, dataRange, 
                    "Month", "Amount ($)");
        }
        
        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }
    
    // ==================== DAILY SPENDING SHEET ====================
    
    private void createDailySpendingSheet(XSSFWorkbook workbook, ReportData data,
                                          ExcelStyleFactory styleFactory, boolean includeCharts) {
        if (data.getDailySpending() == null || data.getDailySpending().isEmpty()) return;
        
        XSSFSheet sheet = workbook.createSheet("Daily Spending");
        List<DailySpendingData> daily = data.getDailySpending();
        
        // Title
        Row titleRow = sheet.createRow(0);
        titleRow.createCell(0).setCellValue("Daily Spending Pattern");
        titleRow.getCell(0).setCellStyle(styleFactory.createTitleStyle());
        
        // Headers
        String[] headers = {"Date", "Day", "Amount", "Transactions", "Top Category"};
        Row headerRow = sheet.createRow(2);
        XSSFCellStyle headerStyle = styleFactory.createTableHeaderStyle();
        
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // Data rows
        XSSFCellStyle dateStyle = styleFactory.createDateStyle();
        XSSFCellStyle currencyStyle = styleFactory.createCurrencyStyle();
        
        int rowIdx = 3;
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
        
        // Add line chart for daily trends
        if (includeCharts && daily.size() > 7) {
            ChartDataRange dataRange = ChartDataRange.simple("Daily Spending", 3, rowIdx - 1, 0, 2);
            ChartPosition position = ChartPosition.large(CHART_START_COL, 2);
            
            new LineChartBuilder(sheet, "Daily Spending Trend", position, dataRange)
                    .withMarkers(true)
                    .withCategoryAxisTitle("Date")
                    .withValueAxisTitle("Amount ($)")
                    .build();
        }
        
        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }
    
    // ==================== BUDGET SHEET ====================
    
    private void createBudgetSheet(XSSFWorkbook workbook, ReportData data,
                                   ExcelStyleFactory styleFactory,
                                   boolean includeCharts, boolean includeConditionalFormatting) {
        if (data.getBudgets() == null || data.getBudgets().isEmpty()) return;
        
        XSSFSheet sheet = workbook.createSheet("Budget Analysis");
        List<BudgetData> budgets = data.getBudgets();
        
        // Title
        Row titleRow = sheet.createRow(0);
        titleRow.createCell(0).setCellValue("Budget Analysis");
        titleRow.getCell(0).setCellStyle(styleFactory.createTitleStyle());
        
        // Headers
        String[] headers = {"Budget Name", "Allocated", "Used", "Remaining", "Utilization %", "Status", "Days Left"};
        Row headerRow = sheet.createRow(2);
        XSSFCellStyle headerStyle = styleFactory.createTableHeaderStyle();
        
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // Data rows
        XSSFCellStyle currencyStyle = styleFactory.createCurrencyStyle();
        XSSFCellStyle percentStyle = styleFactory.createPercentageStyle();
        
        int rowIdx = 3;
        for (BudgetData budget : budgets) {
            Row row = sheet.createRow(rowIdx++);
            
            row.createCell(0).setCellValue(budget.getBudgetName());
            
            Cell allocatedCell = row.createCell(1);
            allocatedCell.setCellValue(budget.getAllocatedAmount());
            allocatedCell.setCellStyle(currencyStyle);
            
            Cell usedCell = row.createCell(2);
            usedCell.setCellValue(budget.getUsedAmount());
            usedCell.setCellStyle(currencyStyle);
            
            Cell remainingCell = row.createCell(3);
            remainingCell.setCellValue(budget.getRemainingAmount());
            remainingCell.setCellStyle(currencyStyle);
            
            Cell utilizationCell = row.createCell(4);
            utilizationCell.setCellValue(budget.getUtilizationPercent() / 100.0);
            utilizationCell.setCellStyle(percentStyle);
            
            // Status with conditional styling
            Cell statusCell = row.createCell(5);
            statusCell.setCellValue(budget.getStatus());
            
            // Apply status-based styling
            if ("EXCEEDED".equals(budget.getStatus())) {
                statusCell.setCellStyle(styleFactory.createDangerStyle());
            } else if ("WARNING".equals(budget.getStatus())) {
                statusCell.setCellStyle(styleFactory.createWarningStyle());
            } else {
                statusCell.setCellStyle(styleFactory.createSuccessStyle());
            }
            
            row.createCell(6).setCellValue(budget.getDaysRemaining());
        }
        
        // Apply conditional formatting to utilization column
        if (includeConditionalFormatting && budgets.size() > 0) {
            ConditionalFormattingHelper cfHelper = new ConditionalFormattingHelper(workbook, sheet);
            cfHelper.applyBudgetStatusRules(3, rowIdx - 1, 4); // Column E (utilization %)
        }
        
        // Add bar chart for budget comparison
        if (includeCharts && budgets.size() > 1) {
            ChartDataRange dataRange = ChartDataRange.builder()
                    .sheetName("Budget Analysis")
                    .categoryStartRow(3)
                    .categoryEndRow(rowIdx - 1)
                    .categoryColumn(0)
                    .valueStartRow(3)
                    .valueEndRow(rowIdx - 1)
                    .valueColumn(4) // Utilization %
                    .build();
            ChartPosition position = ChartPosition.standard(CHART_START_COL + 1, 2);
            
            new BarChartBuilder(sheet, "Budget Utilization", position, dataRange)
                    .horizontal(true)
                    .withCategoryAxisTitle("Budget")
                    .withValueAxisTitle("Utilization %")
                    .build();
        }
        
        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }
    
    // ==================== PAYMENT METHOD SHEET ====================
    
    private void createPaymentMethodSheet(XSSFWorkbook workbook, ReportData data,
                                          ExcelStyleFactory styleFactory, boolean includeCharts) {
        if (data.getPaymentMethods() == null || data.getPaymentMethods().isEmpty()) return;
        
        XSSFSheet sheet = workbook.createSheet("Payment Methods");
        List<PaymentMethodData> methods = data.getPaymentMethods();
        
        // Title
        Row titleRow = sheet.createRow(0);
        titleRow.createCell(0).setCellValue("Payment Method Distribution");
        titleRow.getCell(0).setCellStyle(styleFactory.createTitleStyle());
        
        // Headers
        String[] headers = {"Payment Method", "Total Amount", "Transactions", "Percentage"};
        Row headerRow = sheet.createRow(2);
        XSSFCellStyle headerStyle = styleFactory.createTableHeaderStyle();
        
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // Data rows
        XSSFCellStyle currencyStyle = styleFactory.createCurrencyStyle();
        XSSFCellStyle percentStyle = styleFactory.createPercentageStyle();
        
        int rowIdx = 3;
        for (PaymentMethodData method : methods) {
            Row row = sheet.createRow(rowIdx++);
            
            row.createCell(0).setCellValue(method.getDisplayName() != null ? 
                    method.getDisplayName() : method.getMethodName());
            
            Cell amountCell = row.createCell(1);
            amountCell.setCellValue(method.getTotalAmount());
            amountCell.setCellStyle(currencyStyle);
            
            row.createCell(2).setCellValue(method.getTransactionCount());
            
            Cell percentCell = row.createCell(3);
            percentCell.setCellValue(method.getPercentage() / 100.0);
            percentCell.setCellStyle(percentStyle);
        }
        
        // Add pie chart
        if (includeCharts && methods.size() > 1) {
            ChartDataRange dataRange = ChartDataRange.simple("Payment Methods", 3, rowIdx - 1, 0, 1);
            ChartPosition position = ChartPosition.standard(CHART_START_COL, 2);
            
            PieChartBuilder.create(sheet, "Payment Method Distribution", position, dataRange);
        }
        
        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }
    
    // ==================== INSIGHTS SHEET ====================
    
    private void createInsightsSheet(XSSFWorkbook workbook, ReportData data, ExcelStyleFactory styleFactory) {
        XSSFSheet sheet = workbook.createSheet("Insights");
        List<InsightData> insights = data.getInsights();
        
        // Title
        Row titleRow = sheet.createRow(0);
        titleRow.createCell(0).setCellValue("Financial Insights & Recommendations");
        titleRow.getCell(0).setCellStyle(styleFactory.createTitleStyle());
        
        int rowIdx = 2;
        for (InsightData insight : insights) {
            Row row = sheet.createRow(rowIdx++);
            
            // Icon/Type indicator
            Cell typeCell = row.createCell(0);
            typeCell.setCellValue(insight.getType());
            
            // Apply color based on type
            switch (insight.getType()) {
                case "WARNING":
                    typeCell.setCellStyle(styleFactory.createWarningStyle());
                    break;
                case "SUCCESS":
                    typeCell.setCellStyle(styleFactory.createSuccessStyle());
                    break;
                case "SUGGESTION":
                    typeCell.setCellStyle(styleFactory.createColoredStyle(ExcelStyleFactory.COLOR_PRIMARY));
                    break;
                default:
                    typeCell.setCellStyle(styleFactory.createDataStyle());
            }
            
            row.createCell(1).setCellValue(insight.getTitle());
            row.createCell(2).setCellValue(insight.getMessage());
            
            if (insight.getValue() != null) {
                Cell valueCell = row.createCell(3);
                valueCell.setCellValue(insight.getValue());
                valueCell.setCellStyle(styleFactory.createCurrencyStyle());
            }
            
            rowIdx++; // Extra space between insights
        }
        
        // Auto-size columns
        sheet.setColumnWidth(0, 4000);
        sheet.setColumnWidth(1, 8000);
        sheet.setColumnWidth(2, 15000);
        sheet.setColumnWidth(3, 4000);
    }
}
