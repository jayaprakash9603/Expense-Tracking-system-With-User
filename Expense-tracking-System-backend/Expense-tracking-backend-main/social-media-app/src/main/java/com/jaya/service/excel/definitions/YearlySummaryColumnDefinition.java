package com.jaya.service.excel.definitions;

import com.jaya.models.MonthlySummary;
import com.jaya.service.excel.ExcelColumn;
import com.jaya.service.excel.ExcelColumnDefinition;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Map;




public class YearlySummaryColumnDefinition implements ExcelColumnDefinition<Map.Entry<String, MonthlySummary>> {

    @Override
    public String getSheetName() {
        return "Yearly Summary";
    }

    @Override
    public List<ExcelColumn<Map.Entry<String, MonthlySummary>>> getColumns() {
        return Arrays.asList(
                new ExcelColumn<>("Month", Map.Entry::getKey),
                new ExcelColumn<>("Total Amount",
                        entry -> entry.getValue().getTotalAmount() != null
                                ? entry.getValue().getTotalAmount().toString()
                                : "0"),
                new ExcelColumn<>("Balance Remaining",
                        entry -> entry.getValue().getBalanceRemaining() != null
                                ? entry.getValue().getBalanceRemaining().toString()
                                : "0"),
                new ExcelColumn<>("Current Month Credit Due",
                        entry -> entry.getValue().getCurrentMonthCreditDue() != null
                                ? entry.getValue().getCurrentMonthCreditDue().toString()
                                : "0"),
                new ExcelColumn<>("Credit Paid",
                        entry -> entry.getValue().getCreditPaid() != null ? entry.getValue().getCreditPaid().toString()
                                : "0"),
                new ExcelColumn<>("Credit Due",
                        entry -> entry.getValue().getCreditDue() != null ? entry.getValue().getCreditDue().toString()
                                : "0"),
                new ExcelColumn<>("Credit Due Message", entry -> entry.getValue().getCreditDueMessage()));
    }
}
