package com.jaya.service.excel.parser;

import com.jaya.models.Expense;
import com.jaya.models.ExpenseDetails;
import com.jaya.service.excel.util.DataParser;
import com.jaya.service.excel.util.ExcelCellReader;
import com.jaya.service.excel.util.ExcelColumnMapper;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Parser for Expense entities from Excel files
 * Follows Single Responsibility Principle - only handles Expense parsing
 */
@Component
public class ExpenseExcelParser {

    /**
     * Parse expenses from an Excel file
     */
    public List<Expense> parseExpenses(MultipartFile file) throws IOException {
        List<Expense> expenses = new ArrayList<>();

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            FormulaEvaluator evaluator = workbook.getCreationHelper().createFormulaEvaluator();

            // Map column headers to indices
            Row headerRow = sheet.getRow(0);
            if (headerRow == null) {
                return expenses;
            }

            ExcelColumnMapper columnMapper = new ExcelColumnMapper(headerRow, evaluator);

            // Parse each row
            for (Row row : sheet) {
                if (row.getRowNum() == 0) {
                    continue; // Skip header
                }

                Expense expense = parseExpenseRow(row, columnMapper, evaluator);
                if (expense != null) {
                    expenses.add(expense);
                }
            }
        }

        return expenses;
    }

    /**
     * Parse a single expense from a row
     */
    private Expense parseExpenseRow(Row row, ExcelColumnMapper columnMapper, FormulaEvaluator evaluator) {
        // Date is required
        LocalDate date = parseDate(row, columnMapper, evaluator);
        if (date == null) {
            return null; // Skip row if date is missing
        }

        // Amount is required
        Double amount = parseAmount(row, columnMapper, evaluator);
        if (amount == null) {
            return null; // Skip row if amount is missing
        }

        // Create expense entity
        Expense expense = new Expense();
        ExpenseDetails details = new ExpenseDetails();

        expense.setDate(date);
        details.setAmount(amount);

        // Parse optional fields
        details.setExpenseName(columnMapper.getCellValue(row, evaluator,
                "Expense Name", "Description", "Name", "Expense"));

        details.setType(columnMapper.getCellValue(row, evaluator, "Type"));

        details.setPaymentMethod(columnMapper.getCellValue(row, evaluator,
                "Payment Method", "Payment", "Method"));

        // Net Amount defaults to Amount if not provided
        Cell netAmountCell = columnMapper.getCell(row, "Net Amount", "Net");
        Double netAmount = ExcelCellReader.getCellValueAsDouble(netAmountCell, evaluator);
        details.setNetAmount(netAmount != null ? netAmount : amount);

        details.setComments(columnMapper.getCellValue(row, evaluator,
                "Comments", "Comment", "Notes", "Remark"));

        // Credit Due defaults to 0.0
        Cell creditDueCell = columnMapper.getCell(row, "Credit Due", "Credit_Due", "CreditDue", "Credit");
        Double creditDue = ExcelCellReader.getCellValueAsDouble(creditDueCell, evaluator);
        details.setCreditDue(creditDue != null ? creditDue : 0.0);

        // Category fields
        Cell categoryIdCell = columnMapper.getCell(row, "Category ID", "Category_Id", "CategoryId");
        expense.setCategoryId(ExcelCellReader.getCellValueAsInteger(categoryIdCell, evaluator));

        expense.setCategoryName(columnMapper.getCellValue(row, evaluator,
                "Category Name", "Category", "CategoryName"));

        // Link entities
        expense.setExpense(details);
        details.setExpense(expense);

        return expense;
    }

    /**
     * Parse date from row with flexible handling
     */
    private LocalDate parseDate(Row row, ExcelColumnMapper columnMapper, FormulaEvaluator evaluator) {
        Cell dateCell = columnMapper.getCell(row, "Date", "Transaction Date", "Day");
        return ExcelCellReader.getCellValueAsLocalDate(dateCell, evaluator);
    }

    /**
     * Parse amount from row
     */
    private Double parseAmount(Row row, ExcelColumnMapper columnMapper, FormulaEvaluator evaluator) {
        Cell amountCell = columnMapper.getCell(row, "Amount", "Amt", "Value", "Price");
        return ExcelCellReader.getCellValueAsDouble(amountCell, evaluator);
    }
}
