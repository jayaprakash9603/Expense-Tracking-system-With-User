package com.jaya.models;

import java.math.BigDecimal;
import java.util.Map;

import lombok.Data;

@Data
public class MonthlySummary {

    private BigDecimal totalAmount;
    private Map<String, BigDecimal> categoryBreakdown;  
    private BigDecimal balanceRemaining;
    private BigDecimal currentMonthCreditDue = BigDecimal.ZERO;
    private CashSummary cash;
    private BigDecimal creditPaid = BigDecimal.ZERO;
    private BigDecimal creditDue = BigDecimal.ZERO;
    private String creditDueMessage;
}
