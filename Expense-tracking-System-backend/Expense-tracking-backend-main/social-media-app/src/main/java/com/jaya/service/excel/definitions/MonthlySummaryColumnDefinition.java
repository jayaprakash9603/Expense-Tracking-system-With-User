package com.jaya.service.excel.definitions;

import com.jaya.models.MonthlySummary;
import com.jaya.service.excel.ExcelColumn;
import com.jaya.service.excel.ExcelColumnDefinition;

import java.util.Arrays;
import java.util.List;

/**
 * Column definition for MonthlySummary entity
 */
public class MonthlySummaryColumnDefinition implements ExcelColumnDefinition<MonthlySummary> {

    @Override
    public String getSheetName() {
        return "Monthly Summary";
    }

    @Override
    public List<ExcelColumn<MonthlySummary>> getColumns() {
        return Arrays.asList(
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
                new ExcelColumn<>("Credit Due Message", MonthlySummary::getCreditDueMessage));
    }
}
