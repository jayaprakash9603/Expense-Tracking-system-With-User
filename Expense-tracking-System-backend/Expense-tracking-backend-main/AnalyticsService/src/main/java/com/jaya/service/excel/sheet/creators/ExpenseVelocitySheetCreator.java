package com.jaya.service.excel.sheet.creators;

import com.jaya.dto.report.ReportData.ExpenseVelocityData;
import com.jaya.service.excel.sheet.AbstractSheetCreator;
import com.jaya.service.excel.sheet.SheetContext;
import com.jaya.service.excel.style.ExcelStyleFactory;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.springframework.stereotype.Component;

@Component
public class ExpenseVelocitySheetCreator extends AbstractSheetCreator {

    @Override
    public String getSheetName() {
        return "Expense Velocity";
    }

    @Override
    public int getOrder() {
        return 11;
    }

    @Override
    public boolean shouldCreate(SheetContext context) {
        return context.getData().getExpenseVelocity() != null;
    }

    @Override
    protected String getTitleText(SheetContext context) {
        return "Expense Velocity & Trends";
    }

    @Override
    protected int getTitleMergeColumns() {
        return 3;
    }

    @Override
    protected int createContent(XSSFSheet sheet, SheetContext context, int startRow) {
        ExpenseVelocityData velocity = context.getData().getExpenseVelocity();
        ExcelStyleFactory sf = context.getStyleFactory();

        int rowIdx = startRow;

        rowIdx = createAveragesSection(sheet, rowIdx, velocity, sf);
        rowIdx++;

        rowIdx = createRecentActivitySection(sheet, rowIdx, velocity, sf);
        rowIdx++;

        rowIdx = createProjectionsSection(sheet, rowIdx, velocity, sf);

        setColumnWidths(sheet, 6000, 5000);
        return rowIdx;
    }

    private int createAveragesSection(XSSFSheet sheet, int rowIdx, ExpenseVelocityData velocity, ExcelStyleFactory sf) {
        rowIdx = createSectionHeader(sheet, rowIdx, "Spending Averages", sf, 2);

        XSSFCellStyle labelStyle = sf.createKpiLabelStyle();
        XSSFCellStyle valueStyle = sf.createKpiCurrencyStyle();

        rowIdx = addKpiRow(sheet, rowIdx, "Daily Average", velocity.getDailyAverage(), labelStyle, valueStyle);
        rowIdx = addKpiRow(sheet, rowIdx, "Weekly Average", velocity.getWeeklyAverage(), labelStyle, valueStyle);
        rowIdx = addKpiRow(sheet, rowIdx, "Monthly Average", velocity.getMonthlyAverage(), labelStyle, valueStyle);

        return rowIdx;
    }

    private int createRecentActivitySection(XSSFSheet sheet, int rowIdx, ExpenseVelocityData velocity,
            ExcelStyleFactory sf) {
        rowIdx = createSectionHeader(sheet, rowIdx, "Recent Activity", sf, 2);

        XSSFCellStyle labelStyle = sf.createKpiLabelStyle();
        XSSFCellStyle valueStyle = sf.createKpiCurrencyStyle();

        rowIdx = addKpiRow(sheet, rowIdx, "Last 7 Days Total", velocity.getLast7DaysTotal(), labelStyle, valueStyle);
        rowIdx = addKpiRow(sheet, rowIdx, "Last 30 Days Total", velocity.getLast30DaysTotal(), labelStyle, valueStyle);
        Row change7Row = sheet.createRow(rowIdx++);
        change7Row.createCell(0).setCellValue("7-Day Change");
        change7Row.getCell(0).setCellStyle(labelStyle);
        Cell change7Cell = change7Row.createCell(1);
        change7Cell.setCellValue(velocity.getLast7DaysChange() / 100.0);
        change7Cell.setCellStyle(sf.createPercentageStyle());

        Row change30Row = sheet.createRow(rowIdx++);
        change30Row.createCell(0).setCellValue("30-Day Change");
        change30Row.getCell(0).setCellStyle(labelStyle);
        Cell change30Cell = change30Row.createCell(1);
        change30Cell.setCellValue(velocity.getLast30DaysChange() / 100.0);
        change30Cell.setCellStyle(sf.createPercentageStyle());

        return rowIdx;
    }

    private int createProjectionsSection(XSSFSheet sheet, int rowIdx, ExpenseVelocityData velocity,
            ExcelStyleFactory sf) {
        rowIdx = createSectionHeader(sheet, rowIdx, "Projections & Trends", sf, 2);

        XSSFCellStyle labelStyle = sf.createKpiLabelStyle();
        XSSFCellStyle valueStyle = sf.createKpiCurrencyStyle();
        Row trendRow = sheet.createRow(rowIdx++);
        trendRow.createCell(0).setCellValue("Spending Trend");
        trendRow.getCell(0).setCellStyle(labelStyle);
        Cell trendCell = trendRow.createCell(1);
        trendCell.setCellValue(velocity.getTrend());
        trendCell.setCellStyle(getTrendStyle(velocity.getTrend(), sf));

        rowIdx = addKpiRow(sheet, rowIdx, "Projected Monthly Spend", velocity.getProjectedMonthlySpend(), labelStyle,
                valueStyle);

        return rowIdx;
    }

    private XSSFCellStyle getTrendStyle(String trend, ExcelStyleFactory sf) {
        switch (trend) {
            case "INCREASING":
                return sf.createWarningStyle();
            case "DECREASING":
                return sf.createSuccessStyle();
            default:
                return sf.createDataStyle();
        }
    }
}
