package com.jaya.service.excel.sheet.creators;

import com.jaya.dto.report.ReportData.CategoryData;
import com.jaya.service.excel.chart.ChartDataRange;
import com.jaya.service.excel.chart.ChartPosition;
import com.jaya.service.excel.chart.PieChartBuilder;
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
public class CategorySheetCreator extends AbstractSheetCreator {

    private static final String[] HEADERS = {
            "Category", "Total Amount", "Transactions", "Percentage", "Avg per Transaction"
    };

    @Override
    public String getSheetName() {
        return "Category Breakdown";
    }

    @Override
    public int getOrder() {
        return 3;
    }

    @Override
    public boolean shouldCreate(SheetContext context) {
        List<CategoryData> categories = context.getData().getCategoryBreakdown();
        return categories != null && !categories.isEmpty();
    }

    @Override
    protected int createContent(XSSFSheet sheet, SheetContext context, int startRow) {
        List<CategoryData> categories = context.getData().getCategoryBreakdown();
        ExcelStyleFactory sf = context.getStyleFactory();

        int rowIdx = createTableHeaders(sheet, startRow, HEADERS, sf);

        // Create data rows using functional approach
        rowIdx = createDataTable(sheet, startRow, categories, HEADERS, sf, Arrays.asList(
                textCell(CategoryData::getCategoryName),
                currencyCell(CategoryData::getTotalAmount),
                intCell(CategoryData::getTransactionCount),
                percentCell(CategoryData::getPercentage),
                currencyCell(CategoryData::getAverageAmount)));

        // Add pie chart
        if (context.isIncludeCharts() && categories.size() > 1) {
            addCategoryChart(sheet, startRow + 1, rowIdx - 1);
        }

        autoSizeColumns(sheet, HEADERS.length);
        return rowIdx;
    }

    private void addCategoryChart(XSSFSheet sheet, int dataStartRow, int dataEndRow) {
        ChartDataRange dataRange = ChartDataRange.simple("Category Breakdown", dataStartRow, dataEndRow, 0, 1);
        ChartPosition position = ChartPosition.standard(CHART_START_COL, 2);
        PieChartBuilder.create(sheet, "Spending by Category", position, dataRange);
    }
}
