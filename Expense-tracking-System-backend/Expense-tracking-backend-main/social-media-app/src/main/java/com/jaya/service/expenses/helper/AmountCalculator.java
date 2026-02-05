package com.jaya.service.expenses.helper;

import com.jaya.models.Expense;
import com.jaya.service.expenses.constants.ExpenseConstants;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Collectors;





@Component
public class AmountCalculator {

    


    public BigDecimal calculateTotal(List<Expense> expenses) {
        if (expenses == null || expenses.isEmpty()) {
            return BigDecimal.ZERO;
        }

        return expenses.stream()
                .filter(expense -> expense.getExpense() != null)
                .map(expense -> expense.getExpense().getAmount())
                .filter(amount -> amount != null && amount > 0)
                .map(BigDecimal::valueOf)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    


    public BigDecimal calculateTotalByType(List<Expense> expenses, String type) {
        if (expenses == null || expenses.isEmpty()) {
            return BigDecimal.ZERO;
        }

        return expenses.stream()
                .filter(expense -> expense.getExpense() != null)
                .filter(expense -> type.equalsIgnoreCase(expense.getExpense().getType()))
                .map(expense -> expense.getExpense().getAmount())
                .filter(amount -> amount != null && amount > 0)
                .map(BigDecimal::valueOf)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    


    public BigDecimal calculateTotalGains(List<Expense> expenses) {
        return calculateTotalByType(expenses, ExpenseConstants.TYPE_GAIN);
    }

    


    public BigDecimal calculateTotalLosses(List<Expense> expenses) {
        return calculateTotalByType(expenses, ExpenseConstants.TYPE_LOSS);
    }

    


    public BigDecimal calculateNetAmount(List<Expense> expenses) {
        BigDecimal gains = calculateTotalGains(expenses);
        BigDecimal losses = calculateTotalLosses(expenses);
        return gains.subtract(losses);
    }

    


    public BigDecimal calculateTotalByPaymentMethod(List<Expense> expenses, String paymentMethod) {
        if (expenses == null || expenses.isEmpty()) {
            return BigDecimal.ZERO;
        }

        return expenses.stream()
                .filter(expense -> expense.getExpense() != null)
                .filter(expense -> paymentMethod.equalsIgnoreCase(expense.getExpense().getPaymentMethod()))
                .map(expense -> expense.getExpense().getAmount())
                .filter(amount -> amount != null && amount > 0)
                .map(BigDecimal::valueOf)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    


    public BigDecimal calculateTotalCreditDue(List<Expense> expenses) {
        if (expenses == null || expenses.isEmpty()) {
            return BigDecimal.ZERO;
        }

        return expenses.stream()
                .filter(expense -> expense.getExpense() != null)
                .map(expense -> expense.getExpense().getCreditDue())
                .filter(creditDue -> creditDue != null && creditDue > 0)
                .map(BigDecimal::valueOf)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    


    public BigDecimal calculateTotalCreditPaid(List<Expense> expenses) {
        return calculateTotalByPaymentMethod(expenses, ExpenseConstants.CREDIT_PAID);
    }

    


    public Map<String, BigDecimal> calculateTotalsByPaymentMethod(List<Expense> expenses) {
        if (expenses == null || expenses.isEmpty()) {
            return Map.of();
        }

        return expenses.stream()
                .filter(expense -> expense.getExpense() != null)
                .filter(expense -> expense.getExpense().getPaymentMethod() != null)
                .collect(Collectors.groupingBy(
                        expense -> String.valueOf(expense.getExpense().getPaymentMethod()),
                        Collectors.reducing(
                                BigDecimal.ZERO,
                                expense -> BigDecimal.valueOf(expense.getExpense().getAmount()),
                                BigDecimal::add)));
    }

    


    public Map<String, BigDecimal> calculateTotalsByCategory(List<Expense> expenses) {
        if (expenses == null || expenses.isEmpty()) {
            return Map.of();
        }

        return expenses.stream()
                .filter(expense -> expense.getExpense() != null)
                .collect(Collectors.groupingBy(
                        expense -> expense.getCategoryName() != null ? expense.getCategoryName()
                                : ExpenseConstants.CATEGORY_UNCATEGORIZED,
                        Collectors.reducing(
                                BigDecimal.ZERO,
                                expense -> BigDecimal.valueOf(expense.getExpense().getAmount()),
                                BigDecimal::add)));
    }

    


    public BigDecimal calculateAverage(List<Expense> expenses) {
        if (expenses == null || expenses.isEmpty()) {
            return BigDecimal.ZERO;
        }

        BigDecimal total = calculateTotal(expenses);
        int count = expenses.size();

        if (count == 0) {
            return BigDecimal.ZERO;
        }

        return total.divide(BigDecimal.valueOf(count), ExpenseConstants.DECIMAL_SCALE, RoundingMode.HALF_UP);
    }

    


    public BigDecimal round(BigDecimal amount) {
        return amount.setScale(ExpenseConstants.DECIMAL_SCALE, RoundingMode.HALF_UP);
    }

    


    public BigDecimal toBigDecimal(Double value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.valueOf(value).setScale(ExpenseConstants.DECIMAL_SCALE, RoundingMode.HALF_UP);
    }
}
