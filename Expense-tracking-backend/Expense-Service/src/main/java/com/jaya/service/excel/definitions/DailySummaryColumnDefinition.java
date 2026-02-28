package com.jaya.service.excel.definitions;

import com.jaya.models.DailySummary;
import com.jaya.service.excel.ExcelColumn;
import com.jaya.service.excel.ExcelColumnDefinition;

import java.util.Arrays;
import java.util.List;




public class DailySummaryColumnDefinition implements ExcelColumnDefinition<DailySummary> {

    @Override
    public String getSheetName() {
        return "Daily Summaries";
    }

    @Override
    public List<ExcelColumn<DailySummary>> getColumns() {
        return Arrays.asList(
                new ExcelColumn<>("Date", summary -> summary.getDate() != null ? summary.getDate().toString() : ""),
                new ExcelColumn<>("Total Amount",
                        summary -> summary.getTotalAmount() != null ? summary.getTotalAmount().toString() : "0"),
                new ExcelColumn<>("Balance Remaining",
                        summary -> summary.getBalanceRemaining() != null ? summary.getBalanceRemaining().toString()
                                : "0"),
                new ExcelColumn<>("Current Month Credit Due",
                        summary -> summary.getCurrentMonthCreditDue() != null
                                ? summary.getCurrentMonthCreditDue().toString()
                                : "0"),
                new ExcelColumn<>("Credit Paid",
                        summary -> summary.getCreditPaid() != null ? summary.getCreditPaid().toString() : "0"),
                new ExcelColumn<>("Credit Due",
                        summary -> summary.getCreditDue() != null ? summary.getCreditDue().toString() : "0"),
                new ExcelColumn<>("Credit Due ExpenseMessage", DailySummary::getCreditDueMessage));
    }
}

