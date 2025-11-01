package com.jaya.service.expenses.strategy.impl;

import com.jaya.models.Expense;
import com.jaya.models.ExpenseDetails;
import com.jaya.models.CashSummary;
import com.jaya.service.expenses.constants.ExpenseConstants;
import com.jaya.service.expenses.strategy.ExpenseCalculationStrategy;
import com.jaya.service.expenses.vo.ExpenseCalculationResult;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Standard expense calculation strategy
 * Calculates gains, losses, credit paid, and category breakdowns
 */
@Component
public class StandardExpenseCalculationStrategy implements ExpenseCalculationStrategy {

    @Override
    public ExpenseCalculationResult calculate(List<Expense> expenses) {
        BigDecimal totalGain = BigDecimal.ZERO;
        BigDecimal totalLoss = BigDecimal.ZERO;
        BigDecimal totalCreditPaid = BigDecimal.ZERO;
        Map<String, BigDecimal> categoryBreakdown = new HashMap<>();

        BigDecimal cashGain = BigDecimal.ZERO;
        BigDecimal cashLoss = BigDecimal.ZERO;

        for (Expense expense : expenses) {
            if (expense == null || expense.getExpense() == null) {
                continue;
            }

            ExpenseDetails details = expense.getExpense();
            String type = details.getType();
            String paymentMethod = details.getPaymentMethod();
            Double amount = details.getAmount();
            String category = expense.getCategoryName() != null ? expense.getCategoryName()
                    : ExpenseConstants.CATEGORY_UNCATEGORIZED;

            if (amount == null || amount == 0) {
                continue;
            }

            BigDecimal amountDecimal = BigDecimal.valueOf(amount);

            // Calculate gains and losses
            if (ExpenseConstants.TYPE_GAIN.equalsIgnoreCase(type)) {
                totalGain = totalGain.add(amountDecimal);
                if (ExpenseConstants.PAYMENT_CASH.equalsIgnoreCase(paymentMethod)) {
                    cashGain = cashGain.add(amountDecimal);
                }
            } else if (ExpenseConstants.TYPE_LOSS.equalsIgnoreCase(type)) {
                totalLoss = totalLoss.add(amountDecimal);

                if (ExpenseConstants.PAYMENT_CASH.equalsIgnoreCase(paymentMethod)) {
                    cashLoss = cashLoss.add(amountDecimal);
                }
            }

            // Track credit paid
            if (ExpenseConstants.CREDIT_PAID.equalsIgnoreCase(paymentMethod)) {
                totalCreditPaid = totalCreditPaid.add(amountDecimal);
            }

            // Category breakdown
            categoryBreakdown.merge(category, amountDecimal, BigDecimal::add);
        }

        // Build cash summary
        CashSummary cashSummary = new CashSummary();
        cashSummary.setGain(cashGain);
        cashSummary.setLoss(cashLoss.negate()); // Loss is stored as negative value
        cashSummary.calculateDifference(); // Calculate gain + loss

        return ExpenseCalculationResult.builder()
                .totalGain(totalGain)
                .totalLoss(totalLoss)
                .totalCreditPaid(totalCreditPaid)
                .categoryBreakdown(categoryBreakdown)
                .cashSummary(cashSummary)
                .build();
    }

    @Override
    public String getStrategyName() {
        return "STANDARD_CALCULATION";
    }
}
