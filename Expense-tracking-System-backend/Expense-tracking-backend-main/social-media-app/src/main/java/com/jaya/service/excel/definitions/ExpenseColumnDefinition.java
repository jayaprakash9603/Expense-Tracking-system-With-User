package com.jaya.service.excel.definitions;

import com.jaya.models.Expense;
import com.jaya.service.excel.ExcelColumn;
import com.jaya.service.excel.ExcelColumnDefinition;

import java.util.Arrays;
import java.util.List;

/**
 * Column definition for Expense entity
 */
public class ExpenseColumnDefinition implements ExcelColumnDefinition<Expense> {

    @Override
    public String getSheetName() {
        return "Expenses";
    }

    @Override
    public List<ExcelColumn<Expense>> getColumns() {
        return Arrays.asList(
                new ExcelColumn<>("ID", expense -> expense.getId()),
                new ExcelColumn<>("Date", expense -> expense.getDate() != null ? expense.getDate().toString() : ""),
                new ExcelColumn<>("Expense Name",
                        expense -> expense.getExpense() != null ? expense.getExpense().getExpenseName() : ""),
                new ExcelColumn<>("Amount",
                        expense -> expense.getExpense() != null ? expense.getExpense().getAmount() : 0.0),
                new ExcelColumn<>("Type",
                        expense -> expense.getExpense() != null ? expense.getExpense().getType() : ""),
                new ExcelColumn<>("Payment Method",
                        expense -> expense.getExpense() != null ? expense.getExpense().getPaymentMethod() : ""),
                new ExcelColumn<>("Net Amount",
                        expense -> expense.getExpense() != null ? expense.getExpense().getNetAmount() : 0.0),
                new ExcelColumn<>("Comments",
                        expense -> expense.getExpense() != null ? expense.getExpense().getComments() : ""),
                new ExcelColumn<>("Credit Due",
                        expense -> expense.getExpense() != null ? expense.getExpense().getCreditDue() : 0.0));
    }
}
