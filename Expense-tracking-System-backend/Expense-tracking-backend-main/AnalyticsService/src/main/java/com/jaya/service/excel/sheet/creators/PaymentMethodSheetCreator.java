package com.jaya.service.excel.sheet.creators;

import com.jaya.dto.report.ReportData.PaymentMethodData;
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

import java.util.List;

@Component
public class PaymentMethodSheetCreator extends AbstractSheetCreator {

    private static final String[] HEADERS = { "Payment Method", "Total Amount", "Transactions", "Percentage" };

    @Override
    public String getSheetName() {
        return "Payment Methods";
    }

    @Override
    public int getOrder() {
        return 7;
    }

    @Override
    public boolean shouldCreate(SheetContext context) {
        List<PaymentMethodData> methods = context.getData().getPaymentMethods();
        return methods != null && !methods.isEmpty();
    }

    @Override
    protected String getTitleText(SheetContext context) {
        return "Payment Method Distribution";
    }

    @Override
    protected int createContent(XSSFSheet sheet, SheetContext context, int startRow) {
        List<PaymentMethodData> methods = context.getData().getPaymentMethods();
        ExcelStyleFactory sf = context.getStyleFactory();

        int dataStartRow = createTableHeaders(sheet, startRow, HEADERS, sf);
        int rowIdx = createDataRows(sheet, dataStartRow, methods, sf);
        if (context.isIncludeCharts() && methods.size() > 1) {
            ChartDataRange dataRange = ChartDataRange.simple("Payment Methods", dataStartRow, rowIdx - 1, 0, 1);
            ChartPosition position = ChartPosition.standard(CHART_START_COL, 2);
            PieChartBuilder.create(sheet, "Payment Method Distribution", position, dataRange);
        }

        autoSizeColumns(sheet, HEADERS.length);
        return rowIdx;
    }

    private int createDataRows(XSSFSheet sheet, int startRow, List<PaymentMethodData> methods, ExcelStyleFactory sf) {
        XSSFCellStyle currencyStyle = sf.createCurrencyStyle();
        XSSFCellStyle percentStyle = sf.createPercentageStyle();

        int rowIdx = startRow;
        for (PaymentMethodData method : methods) {
            Row row = sheet.createRow(rowIdx++);

            row.createCell(0).setCellValue(
                    method.getDisplayName() != null ? method.getDisplayName() : method.getMethodName());

            Cell amountCell = row.createCell(1);
            amountCell.setCellValue(method.getTotalAmount());
            amountCell.setCellStyle(currencyStyle);

            row.createCell(2).setCellValue(method.getTransactionCount());

            Cell percentCell = row.createCell(3);
            percentCell.setCellValue(method.getPercentage() / 100.0);
            percentCell.setCellStyle(percentStyle);
        }

        return rowIdx;
    }
}
