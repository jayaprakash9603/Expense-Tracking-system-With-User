package com.jaya.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpendingSummaryDTO {

    private LocalDate periodStart;
    private LocalDate periodEnd;
    private double totalSpending;
    private double totalIncome;
    private double netAmount;
    private Map<String, Double> categoryWiseSpending;
    private Map<String, Double> paymentMethodWiseSpending;
    private String topCategory;
    private double topCategoryAmount;
    private String mostUsedPaymentMethod;
    private int totalTransactions;
    private double averageTransactionAmount;
    private String spendingTrend; // INCREASING, DECREASING, STABLE
    private String comparisonWithPreviousPeriod;
}