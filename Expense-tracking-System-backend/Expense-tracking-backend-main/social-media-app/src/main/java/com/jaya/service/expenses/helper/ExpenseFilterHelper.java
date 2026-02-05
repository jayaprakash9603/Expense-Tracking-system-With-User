package com.jaya.service.expenses.helper;

import com.jaya.models.Expense;
import com.jaya.models.ExpenseDetails;
import com.jaya.service.expenses.constants.ExpenseConstants;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;





@Component
public class ExpenseFilterHelper {

    


    public List<Expense> filterByType(List<Expense> expenses, String type) {
        if (expenses == null || type == null) {
            return expenses;
        }

        return expenses.stream()
                .filter(expense -> expense.getExpense() != null)
                .filter(expense -> type.equalsIgnoreCase(expense.getExpense().getType()))
                .collect(Collectors.toList());
    }

    


    public List<Expense> filterByPaymentMethod(List<Expense> expenses, String paymentMethod) {
        if (expenses == null || paymentMethod == null) {
            return expenses;
        }

        return expenses.stream()
                .filter(expense -> expense.getExpense() != null)
                .filter(expense -> paymentMethod.equalsIgnoreCase(expense.getExpense().getPaymentMethod()))
                .collect(Collectors.toList());
    }

    


    public List<Expense> filterByCategory(List<Expense> expenses, String category) {
        if (expenses == null || category == null) {
            return expenses;
        }

        return expenses.stream()
                .filter(expense -> category.equalsIgnoreCase(expense.getCategoryName()))
                .collect(Collectors.toList());
    }

    


    public List<Expense> filterByExpenseName(List<Expense> expenses, String expenseName) {
        if (expenses == null || expenseName == null || expenseName.trim().isEmpty()) {
            return expenses;
        }

        String searchTerm = expenseName.toLowerCase().trim();
        return expenses.stream()
                .filter(expense -> expense.getExpense() != null)
                .filter(expense -> {
                    String name = expense.getExpense().getExpenseName();
                    return name != null && name.toLowerCase().contains(searchTerm);
                })
                .collect(Collectors.toList());
    }

    


    public List<Expense> filterByAmountRange(List<Expense> expenses, Double minAmount, Double maxAmount) {
        if (expenses == null) {
            return expenses;
        }

        return expenses.stream()
                .filter(expense -> expense.getExpense() != null)
                .filter(expense -> {
                    Double amount = expense.getExpense().getAmount();
                    if (amount == null)
                        return false;

                    boolean aboveMin = minAmount == null || amount >= minAmount;
                    boolean belowMax = maxAmount == null || amount <= maxAmount;

                    return aboveMin && belowMax;
                })
                .collect(Collectors.toList());
    }

    


    public List<Expense> filterGains(List<Expense> expenses) {
        return filterByType(expenses, ExpenseConstants.TYPE_GAIN);
    }

    


    public List<Expense> filterLosses(List<Expense> expenses) {
        return filterByType(expenses, ExpenseConstants.TYPE_LOSS);
    }

    


    public List<Expense> filterWithCreditDue(List<Expense> expenses) {
        if (expenses == null) {
            return expenses;
        }

        return expenses.stream()
                .filter(expense -> expense.getExpense() != null)
                .filter(expense -> {
                    Double creditDue = expense.getExpense().getCreditDue();
                    return creditDue != null && creditDue > 0;
                })
                .collect(Collectors.toList());
    }

    


    public List<Expense> filterIncludedInBudget(List<Expense> expenses) {
        if (expenses == null) {
            return expenses;
        }

        return expenses.stream()
                .filter(Expense::isIncludeInBudget)
                .collect(Collectors.toList());
    }

    


    public List<Expense> filterByCriteria(
            List<Expense> expenses,
            String expenseName,
            LocalDate startDate,
            LocalDate endDate,
            String type,
            String paymentMethod,
            Double minAmount,
            Double maxAmount) {

        if (expenses == null) {
            return expenses;
        }

        return expenses.stream()
                .filter(expense -> expense.getExpense() != null)
                .filter(expense -> matchesExpenseName(expense, expenseName))
                .filter(expense -> matchesDateRange(expense, startDate, endDate))
                .filter(expense -> matchesType(expense, type))
                .filter(expense -> matchesPaymentMethod(expense, paymentMethod))
                .filter(expense -> matchesAmountRange(expense, minAmount, maxAmount))
                .collect(Collectors.toList());
    }

    
    private boolean matchesExpenseName(Expense expense, String expenseName) {
        if (expenseName == null || expenseName.trim().isEmpty()) {
            return true;
        }
        String name = expense.getExpense().getExpenseName();
        return name != null && name.toLowerCase().contains(expenseName.toLowerCase());
    }

    private boolean matchesDateRange(Expense expense, LocalDate startDate, LocalDate endDate) {
        LocalDate expenseDate = expense.getDate();
        if (expenseDate == null)
            return false;

        boolean afterStart = startDate == null || !expenseDate.isBefore(startDate);
        boolean beforeEnd = endDate == null || !expenseDate.isAfter(endDate);

        return afterStart && beforeEnd;
    }

    private boolean matchesType(Expense expense, String type) {
        if (type == null || type.trim().isEmpty()) {
            return true;
        }
        return type.equalsIgnoreCase(expense.getExpense().getType());
    }

    private boolean matchesPaymentMethod(Expense expense, String paymentMethod) {
        if (paymentMethod == null || paymentMethod.trim().isEmpty()) {
            return true;
        }
        return paymentMethod.equalsIgnoreCase(expense.getExpense().getPaymentMethod());
    }

    private boolean matchesAmountRange(Expense expense, Double minAmount, Double maxAmount) {
        Double amount = expense.getExpense().getAmount();
        if (amount == null)
            return false;

        boolean aboveMin = minAmount == null || amount >= minAmount;
        boolean belowMax = maxAmount == null || amount <= maxAmount;

        return aboveMin && belowMax;
    }
}
