package com.jaya.dto.cashflow;

import com.jaya.dto.ExpenseDTO;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@Data
public class CashflowChartBucketDTO {
    private String day;
    private String month;
    private String label;
    private String isoDate;
    private double amount;
    private int expenseCount;
    private List<ExpenseDTO> expenses = new ArrayList<>();

    public void addExpense(ExpenseDTO expense, double delta) {
        if (expense != null) {
            this.expenses.add(expense);
        }
        this.amount += delta;
        this.expenseCount = this.expenses.size();
    }
}
