package com.jaya.service.excel.sheet.creators;

import com.jaya.dto.report.ReportData.TopExpenseData;
import com.jaya.service.excel.sheet.AbstractSheetCreator;
import com.jaya.service.excel.sheet.SheetContext;
import com.jaya.service.excel.style.ExcelStyleFactory;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Creates the Top Expenses sheet showing largest transactions.
 */
@Component
public class TopExpensesSheetCreator extends AbstractSheetCreator {

    private static final String[] HEADERS = { "Rank", "Expense Name", "Amount", "Date", "Category", "Payment Method" };

    @Override
    public String getSheetName() {
        return "Top Expenses";
    }

    @Override
    public int getOrder() {
        return 10;
    }

    @Override
    public boolean shouldCreate(SheetContext context) {
        List<TopExpenseData> topExpenses = context.getData().getTopExpenses();
        return topExpenses != null && !topExpenses.isEmpty();
    }

    @Override
    protected String getTitleText(SheetContext context) {
        return "Top 10 Largest Expenses";
    }

    @Override
    protected int getTitleMergeColumns() {
        return 6;
    }

    @Override
    protected int createContent(XSSFSheet sheet, SheetContext context, int startRow) {
        List<TopExpenseData> topExpenses = context.getData().getTopExpenses();
        ExcelStyleFactory sf = context.getStyleFactory();

        int dataStartRow = createTableHeaders(sheet, startRow, HEADERS, sf);
        int rowIdx = createDataRows(sheet, dataStartRow, topExpenses, sf);

        autoSizeColumns(sheet, HEADERS.length);
        return rowIdx;
    }

    private int createDataRows(XSSFSheet sheet, int startRow, List<TopExpenseData> topExpenses, ExcelStyleFactory sf) {
        int rowIdx = startRow;
        int rank = 1;

        for (TopExpenseData expense : topExpenses) {
            Row row = sheet.createRow(rowIdx++);

            Cell rankCell = row.createCell(0);
            rankCell.setCellValue("#" + rank++);
            rankCell.setCellStyle(sf.createColoredStyle(ExcelStyleFactory.COLOR_PRIMARY));

            row.createCell(1).setCellValue(expense.getName() != null ? expense.getName() : "-");

            Cell amountCell = row.createCell(2);
            amountCell.setCellValue(expense.getAmount());
            amountCell.setCellStyle(sf.createCurrencyStyle());

            Cell dateCell = row.createCell(3);
            if (expense.getDate() != null) {
                dateCell.setCellValue(expense.getDate().format(DATE_FORMATTER));
            }
            dateCell.setCellStyle(sf.createDateStyle());

            row.createCell(4).setCellValue(expense.getCategory() != null ? expense.getCategory() : "-");
            row.createCell(5).setCellValue(expense.getPaymentMethod() != null ? expense.getPaymentMethod() : "-");
        }

        return rowIdx;
    }
}
