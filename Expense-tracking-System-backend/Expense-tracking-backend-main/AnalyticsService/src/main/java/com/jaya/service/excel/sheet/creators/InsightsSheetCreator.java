package com.jaya.service.excel.sheet.creators;

import com.jaya.dto.report.ReportData.InsightData;
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
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Creates the Insights & Recommendations sheet with financial analysis.
 */
@Component
public class InsightsSheetCreator extends AbstractSheetCreator {

    private static final String[] INSIGHT_TYPE_ORDER = { "WARNING", "SUGGESTION", "INFO", "SUCCESS" };

    @Override
    public String getSheetName() {
        return "Insights & Recommendations";
    }

    @Override
    public int getOrder() {
        return 12;
    }

    @Override
    public boolean shouldCreate(SheetContext context) {
        List<InsightData> insights = context.getData().getInsights();
        return insights != null && !insights.isEmpty();
    }

    @Override
    protected String getTitleText(SheetContext context) {
        return "Financial Insights & Recommendations";
    }

    @Override
    protected int createContent(XSSFSheet sheet, SheetContext context, int startRow) {
        List<InsightData> insights = context.getData().getInsights();
        ExcelStyleFactory sf = context.getStyleFactory();

        int rowIdx = startRow;

        // Summary Section
        rowIdx = createInsightSummary(sheet, rowIdx, insights, sf);
        rowIdx += 2;

        // Detailed Insights Section
        rowIdx = createDetailedInsights(sheet, rowIdx, insights, sf);

        setColumnWidths(sheet, 4500, 10000, 20000, 5000);
        return rowIdx;
    }

    private int createInsightSummary(XSSFSheet sheet, int rowIdx, List<InsightData> insights, ExcelStyleFactory sf) {
        rowIdx = createSectionHeader(sheet, rowIdx, "Insight Summary", sf, 4);
        rowIdx++;

        Map<String, Long> countByType = insights.stream()
                .collect(Collectors.groupingBy(InsightData::getType, Collectors.counting()));

        String[] labels = { "⚠️ Warnings/Alerts", "✅ Positive Indicators", "ℹ️ Information", "💡 Suggestions" };
        String[] types = { "WARNING", "SUCCESS", "INFO", "SUGGESTION" };

        for (int i = 0; i < labels.length; i++) {
            Row row = sheet.createRow(rowIdx++);
            Cell labelCell = row.createCell(0);
            labelCell.setCellValue(labels[i]);
            labelCell.setCellStyle(getStyleForType(types[i], sf));

            Cell countCell = row.createCell(1);
            countCell.setCellValue(countByType.getOrDefault(types[i], 0L));
        }

        return rowIdx;
    }

    private int createDetailedInsights(XSSFSheet sheet, int rowIdx, List<InsightData> insights, ExcelStyleFactory sf) {
        rowIdx = createSectionHeader(sheet, rowIdx, "Detailed Insights", sf, 4);
        rowIdx++;

        // Table headers
        String[] headers = { "Status", "Category", "Details", "Value" };
        rowIdx = createTableHeaders(sheet, rowIdx, headers, sf);

        // Group and display insights by type
        for (String type : INSIGHT_TYPE_ORDER) {
            List<InsightData> typeInsights = insights.stream()
                    .filter(i -> type.equals(i.getType()))
                    .collect(Collectors.toList());

            if (typeInsights.isEmpty())
                continue;

            for (InsightData insight : typeInsights) {
                rowIdx = createInsightRow(sheet, rowIdx, insight, sf);
            }
        }

        return rowIdx;
    }

    private int createInsightRow(XSSFSheet sheet, int rowIdx, InsightData insight, ExcelStyleFactory sf) {
        Row row = sheet.createRow(rowIdx);

        // Status icon
        Cell typeCell = row.createCell(0);
        typeCell.setCellValue(getStatusIcon(insight.getType()));
        typeCell.setCellStyle(getStyleForType(insight.getType(), sf));

        // Title
        Cell titleCell = row.createCell(1);
        titleCell.setCellValue(insight.getTitle());
        titleCell.setCellStyle(sf.createTableHeaderStyle());

        // Message
        Cell messageCell = row.createCell(2);
        messageCell.setCellValue(insight.getMessage());
        messageCell.setCellStyle(sf.createDataStyle());

        // Value
        if (insight.getValue() != null) {
            Cell valueCell = row.createCell(3);
            valueCell.setCellValue(insight.getValue());
            valueCell.setCellStyle(sf.createCurrencyStyle());
        }

        return rowIdx + 1;
    }

    private XSSFCellStyle getStyleForType(String type, ExcelStyleFactory sf) {
        switch (type) {
            case "WARNING":
                return sf.createWarningStyle();
            case "SUCCESS":
                return sf.createSuccessStyle();
            case "SUGGESTION":
                return sf.createColoredStyle(ExcelStyleFactory.COLOR_PRIMARY);
            default:
                return sf.createDataStyle();
        }
    }

    private String getStatusIcon(String type) {
        switch (type) {
            case "WARNING":
                return "⚠️ Warning";
            case "SUCCESS":
                return "✅ Success";
            case "SUGGESTION":
                return "💡 Suggestion";
            case "INFO":
                return "ℹ️ Info";
            default:
                return type;
        }
    }
}
