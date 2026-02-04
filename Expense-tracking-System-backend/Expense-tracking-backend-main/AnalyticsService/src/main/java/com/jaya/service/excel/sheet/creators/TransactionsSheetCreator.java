package com.jaya.service.excel.sheet.creators;

import com.jaya.dto.report.ReportData.ExpenseRow;
import com.jaya.service.excel.formula.ExcelFormulaBuilder;
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
public class TransactionsSheetCreator extends AbstractSheetCreator {

    private static final String[] HEADERS = {
            "Date", "Name", "Amount", "Category", "Payment Method", "Type", "Notes", "Credit Amount"
    };

    @Override
    public String getSheetName() {
        return "Transactions";
    }

    @Override
    public int getOrder() {
        return 2;
    }

    @Override
    public boolean shouldCreate(SheetContext context) {
        List<ExpenseRow> expenses = context.getData().getExpenses();
        return expenses != null && !expenses.isEmpty();
    }

    @Override
    protected int createTitle(XSSFSheet sheet, SheetContext context) {
        // Skip title for this sheet - starts directly with headers
        return 0;
    }

    @Override
    protected int createContent(XSSFSheet sheet, SheetContext context, int startRow) {
        List<ExpenseRow> expenses = context.getData().getExpenses();
        ExcelStyleFactory sf = context.getStyleFactory();

        // Create headers
        int rowIdx = createTableHeaders(sheet, startRow, HEADERS, sf);

        // Create data rows
        rowIdx = createDataRows(sheet, rowIdx, expenses, sf);

        // Add formulas if enabled
        if (context.isIncludeFormulas()) {
            addFormulaRows(sheet, rowIdx, expenses.size(), sf);
        }

        // Add conditional formatting
        if (context.isIncludeConditionalFormatting() && expenses.size() > 1) {
            applyConditionalFormatting(context, sheet, expenses.size());
        }

        // Enable auto-filter
        sheet.setAutoFilter(new CellRangeAddress(0, expenses.size(), 0, HEADERS.length - 1));

        autoSizeColumns(sheet, HEADERS.length);
        return rowIdx;
    }

    private int createDataRows(XSSFSheet sheet, int startRow, List<ExpenseRow> expenses, ExcelStyleFactory sf) {
        XSSFCellStyle dateStyle = sf.createDateStyle();
        XSSFCellStyle currencyStyle = sf.createCurrencyStyle();

        int rowIdx = startRow;
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

        return rowIdx;
    }

    private void addFormulaRows(XSSFSheet sheet, int rowIdx, int dataCount, ExcelStyleFactory sf) {
        int lastDataRow = rowIdx - 1;

        // Total row
        Row totalRow = sheet.createRow(rowIdx + 1);
        Cell totalLabelCell = totalRow.createCell(1);
        totalLabelCell.setCellValue("TOTAL");
        totalLabelCell.setCellStyle(sf.createTotalRowStyle());

        Cell totalAmountCell = totalRow.createCell(2);
        totalAmountCell.setCellFormula(ExcelFormulaBuilder.sum("C", 2, lastDataRow + 1));
        totalAmountCell.setCellStyle(sf.createTotalCurrencyStyle());

        Cell totalCreditCell = totalRow.createCell(7);
        totalCreditCell.setCellFormula(ExcelFormulaBuilder.sum("H", 2, lastDataRow + 1));
        totalCreditCell.setCellStyle(sf.createTotalCurrencyStyle());

        // Average row
        Row avgRow = sheet.createRow(rowIdx + 2);
        avgRow.createCell(1).setCellValue("AVERAGE");
        Cell avgCell = avgRow.createCell(2);
        avgCell.setCellFormula(ExcelFormulaBuilder.average("C", 2, lastDataRow + 1));
        avgCell.setCellStyle(sf.createCurrencyStyle());

        // Count row
        Row countRow = sheet.createRow(rowIdx + 3);
        countRow.createCell(1).setCellValue("COUNT");
        Cell countCell = countRow.createCell(2);
        countCell.setCellFormula(ExcelFormulaBuilder.count("C", 2, lastDataRow + 1));
    }

    private void applyConditionalFormatting(SheetContext context, XSSFSheet sheet, int dataCount) {
        ConditionalFormattingHelper cfHelper = new ConditionalFormattingHelper(
                context.getWorkbook(), sheet);

        // Highlight high expenses (> $500)
        cfHelper.highlightHighAmounts(1, dataCount, 2, 500);

        // Alternating row colors
        cfHelper.applyAlternatingRowColors(1, dataCount, 0, 7);
    }
}
