package com.jaya.service;

import com.jaya.dto.ExpenseViewDTO;
import com.jaya.common.dto.UserDTO;
import com.jaya.models.BudgetModel;
import com.jaya.models.ExpenseCategory;
import com.jaya.models.Expense;
import com.jaya.models.ExpenseDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;






@Service
@RequiredArgsConstructor
@Slf4j
public class ExpenseViewService {

    private final ExpenseService expenseService;
    private final BudgetServices budgetService;
    private final CategoryServiceWrapper categoryService;

    






    public ExpenseViewDTO getExpenseDetailedView(Integer expenseId, Integer userId) {
        log.debug("Building detailed view for expense {} UserDTO {}", expenseId, userId);

        
        Expense expense = expenseService.getExpenseById(expenseId, userId);
        if (expense == null) {
            throw new RuntimeException("Expense not found with ID: " + expenseId);
        }

        ExpenseDetails details = expense.getExpense();

        
        ExpenseViewDTO.ExpenseViewDTOBuilder builder = ExpenseViewDTO.builder()
                .id(expense.getId())
                .date(expense.getDate())
                .includeInBudget(expense.isIncludeInBudget())
                .isBill(expense.isBill())
                .userId(expense.getUserId());

        
        if (details != null) {
            builder.expenseName(details.getExpenseName())
                    .amount(details.getAmount())
                    .netAmount(details.getNetAmount())
                    .type(details.getType())
                    .paymentMethod(details.getPaymentMethod())
                    .comments(details.getComments())
                    .creditDue(details.getCreditDue());
        }

        
        builder.category(buildCategoryInfo(expense, userId));

        
        builder.paymentMethodInfo(buildPaymentMethodInfo(expense, userId));

        
        builder.linkedBudgets(buildBudgetInfoList(expense, userId));

        
        builder.occurrenceInfo(buildOccurrenceInfo(expense, userId));

        return builder.build();
    }

    


    private ExpenseViewDTO.CategoryInfo buildCategoryInfo(Expense expense, Integer userId) {
        if (expense.getCategoryId() == null || expense.getCategoryId() == 0) {
            return ExpenseViewDTO.CategoryInfo.builder()
                    .id(0)
                    .name("Uncategorized")
                    .build();
        }

        try {
            ExpenseCategory category = categoryService.getById(expense.getCategoryId(), userId);
            if (category == null) {
                return ExpenseViewDTO.CategoryInfo.builder()
                        .id(expense.getCategoryId())
                        .name(expense.getCategoryName() != null ? expense.getCategoryName() : "Unknown")
                        .build();
            }

            
            List<Expense> categoryExpenses = expenseService.getExpensesByCategoryId(expense.getCategoryId(), userId);
            long totalCount = categoryExpenses != null ? categoryExpenses.size() : 0;

            
            List<Expense> allUserExpenses = expenseService.getAllExpenses(userId);
            long totalUserExpenses = allUserExpenses != null ? allUserExpenses.size() : 0;
            double percentageOfTotal = totalUserExpenses > 0 ? (totalCount * 100.0 / totalUserExpenses) : 0;

            
            DoubleSummaryStatistics amountStats = new DoubleSummaryStatistics();
            LocalDate firstExpense = null;
            LocalDate lastExpense = null;
            LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
            long expensesThisMonth = 0;

            if (categoryExpenses != null && !categoryExpenses.isEmpty()) {
                amountStats = categoryExpenses.stream()
                        .filter(e -> e.getExpense() != null)
                        .mapToDouble(e -> e.getExpense().getAmount())
                        .summaryStatistics();

                firstExpense = categoryExpenses.stream()
                        .map(Expense::getDate)
                        .filter(Objects::nonNull)
                        .min(LocalDate::compareTo)
                        .orElse(null);

                lastExpense = categoryExpenses.stream()
                        .map(Expense::getDate)
                        .filter(Objects::nonNull)
                        .max(LocalDate::compareTo)
                        .orElse(null);

                expensesThisMonth = categoryExpenses.stream()
                        .filter(e -> e.getDate() != null && !e.getDate().isBefore(startOfMonth))
                        .count();
            }

            return ExpenseViewDTO.CategoryInfo.builder()
                    .id(category.getId())
                    .name(category.getName())
                    .color(category.getColor())
                    .icon(category.getIcon())
                    .totalExpensesInCategory(totalCount)
                    .totalAmountInCategory(amountStats.getCount() > 0 ? amountStats.getSum() : 0.0)
                    .averageAmountInCategory(
                            amountStats.getCount() > 0 ? Math.round(amountStats.getAverage() * 100.0) / 100.0 : 0.0)
                    .minAmountInCategory(amountStats.getCount() > 0 ? amountStats.getMin() : 0.0)
                    .maxAmountInCategory(amountStats.getCount() > 0 ? amountStats.getMax() : 0.0)
                    .expensesThisMonthInCategory(expensesThisMonth)
                    .percentageOfTotalExpenses(Math.round(percentageOfTotal * 100.0) / 100.0)
                    .firstExpenseInCategory(firstExpense)
                    .lastExpenseInCategory(lastExpense)
                    .build();
        } catch (Exception e) {
            log.warn("Error fetching category info for categoryId {}: {}", expense.getCategoryId(), e.getMessage());
            return ExpenseViewDTO.CategoryInfo.builder()
                    .id(expense.getCategoryId())
                    .name(expense.getCategoryName() != null ? expense.getCategoryName() : "Unknown")
                    .build();
        }
    }

    


    private ExpenseViewDTO.PaymentMethodInfo buildPaymentMethodInfo(Expense expense, Integer userId) {
        ExpenseDetails details = expense.getExpense();
        if (details == null || details.getPaymentMethod() == null) {
            return null;
        }

        String paymentMethod = details.getPaymentMethod();

        try {
            
            List<Expense> pmExpenses = expenseService.getExpensesByPaymentMethod(paymentMethod, userId);
            long totalCount = pmExpenses != null ? pmExpenses.size() : 0;

            
            List<Expense> allUserExpenses = expenseService.getAllExpenses(userId);
            long totalUserExpenses = allUserExpenses != null ? allUserExpenses.size() : 0;
            double percentageOfTotal = totalUserExpenses > 0 ? (totalCount * 100.0 / totalUserExpenses) : 0;

            
            DoubleSummaryStatistics amountStats = new DoubleSummaryStatistics();
            LocalDate firstExpense = null;
            LocalDate lastExpense = null;
            LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
            long expensesThisMonth = 0;

            if (pmExpenses != null && !pmExpenses.isEmpty()) {
                amountStats = pmExpenses.stream()
                        .filter(e -> e.getExpense() != null)
                        .mapToDouble(e -> e.getExpense().getAmount())
                        .summaryStatistics();

                firstExpense = pmExpenses.stream()
                        .map(Expense::getDate)
                        .filter(Objects::nonNull)
                        .min(LocalDate::compareTo)
                        .orElse(null);

                lastExpense = pmExpenses.stream()
                        .map(Expense::getDate)
                        .filter(Objects::nonNull)
                        .max(LocalDate::compareTo)
                        .orElse(null);

                expensesThisMonth = pmExpenses.stream()
                        .filter(e -> e.getDate() != null && !e.getDate().isBefore(startOfMonth))
                        .count();
            }

            return ExpenseViewDTO.PaymentMethodInfo.builder()
                    .name(paymentMethod)
                    .displayName(formatPaymentMethodName(paymentMethod))
                    .totalExpensesWithMethod(totalCount)
                    .totalAmountWithMethod(amountStats.getCount() > 0 ? amountStats.getSum() : 0.0)
                    .averageAmountWithMethod(
                            amountStats.getCount() > 0 ? Math.round(amountStats.getAverage() * 100.0) / 100.0 : 0.0)
                    .minAmountWithMethod(amountStats.getCount() > 0 ? amountStats.getMin() : 0.0)
                    .maxAmountWithMethod(amountStats.getCount() > 0 ? amountStats.getMax() : 0.0)
                    .expensesThisMonthWithMethod(expensesThisMonth)
                    .percentageOfTotalExpenses(Math.round(percentageOfTotal * 100.0) / 100.0)
                    .firstExpenseWithMethod(firstExpense)
                    .lastExpenseWithMethod(lastExpense)
                    .build();
        } catch (Exception e) {
            log.warn("Error fetching payment method info: {}", e.getMessage());
            return ExpenseViewDTO.PaymentMethodInfo.builder()
                    .name(paymentMethod)
                    .displayName(formatPaymentMethodName(paymentMethod))
                    .build();
        }
    }

    


    private List<ExpenseViewDTO.BudgetInfo> buildBudgetInfoList(Expense expense, Integer userId) {
        Set<Integer> budgetIds = expense.getBudgetIds();
        if (budgetIds == null || budgetIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<ExpenseViewDTO.BudgetInfo> budgetInfoList = new ArrayList<>();

        for (Integer budgetId : budgetIds) {
            try {
                BudgetModel BudgetModel = budgetService.getBudgetById(budgetId, userId);
                if (BudgetModel != null) {
                    double usedAmount = BudgetModel.getAmount() - BudgetModel.getRemainingAmount();
                    double percentageUsed = BudgetModel.getAmount() > 0
                            ? (usedAmount / BudgetModel.getAmount()) * 100
                            : 0;

                    String status = determineBudgetStatus(BudgetModel);

                    budgetInfoList.add(ExpenseViewDTO.BudgetInfo.builder()
                            .id(BudgetModel.getId())
                            .name(BudgetModel.getName())
                            .description(BudgetModel.getDescription())
                            .startDate(BudgetModel.getStartDate())
                            .endDate(BudgetModel.getEndDate())
                            .amount(BudgetModel.getAmount())
                            .remainingAmount(BudgetModel.getRemainingAmount())
                            .usedAmount(usedAmount)
                            .percentageUsed(Math.round(percentageUsed * 100.0) / 100.0)
                            .status(status)
                            .build());
                }
            } catch (Exception e) {
                log.warn("Error fetching BudgetModel {}: {}", budgetId, e.getMessage());
            }
        }

        return budgetInfoList;
    }

    


    private ExpenseViewDTO.OccurrenceInfo buildOccurrenceInfo(Expense expense, Integer userId) {
        ExpenseDetails details = expense.getExpense();
        if (details == null || details.getExpenseName() == null || details.getExpenseName().isEmpty()) {
            return ExpenseViewDTO.OccurrenceInfo.builder()
                    .totalOccurrences(1L)
                    .build();
        }

        String expenseName = details.getExpenseName();

        try {
            
            List<Expense> similarExpenses = expenseService.searchExpensesByName(expenseName, userId);

            if (similarExpenses == null || similarExpenses.isEmpty()) {
                return ExpenseViewDTO.OccurrenceInfo.builder()
                        .totalOccurrences(1L)
                        .firstOccurrence(expense.getDate())
                        .lastOccurrence(expense.getDate())
                        .averageAmount(details.getAmount())
                        .totalAmountAllTime(details.getAmount())
                        .minAmount(details.getAmount())
                        .maxAmount(details.getAmount())
                        .build();
            }

            
            LocalDate now = LocalDate.now();
            LocalDate startOfMonth = now.withDayOfMonth(1);
            LocalDate startOfYear = now.withDayOfYear(1);

            long totalOccurrences = similarExpenses.size();

            long occurrencesThisMonth = similarExpenses.stream()
                    .filter(e -> e.getDate() != null && !e.getDate().isBefore(startOfMonth))
                    .count();

            long occurrencesThisYear = similarExpenses.stream()
                    .filter(e -> e.getDate() != null && !e.getDate().isBefore(startOfYear))
                    .count();

            LocalDate firstOccurrence = similarExpenses.stream()
                    .map(Expense::getDate)
                    .filter(Objects::nonNull)
                    .min(LocalDate::compareTo)
                    .orElse(expense.getDate());

            LocalDate lastOccurrence = similarExpenses.stream()
                    .map(Expense::getDate)
                    .filter(Objects::nonNull)
                    .max(LocalDate::compareTo)
                    .orElse(expense.getDate());

            
            DoubleSummaryStatistics amountStats = similarExpenses.stream()
                    .filter(e -> e.getExpense() != null)
                    .mapToDouble(e -> e.getExpense().getAmount())
                    .summaryStatistics();

            return ExpenseViewDTO.OccurrenceInfo.builder()
                    .totalOccurrences(totalOccurrences)
                    .occurrencesThisMonth(occurrencesThisMonth)
                    .occurrencesThisYear(occurrencesThisYear)
                    .firstOccurrence(firstOccurrence)
                    .lastOccurrence(lastOccurrence)
                    .averageAmount(
                            amountStats.getCount() > 0 ? Math.round(amountStats.getAverage() * 100.0) / 100.0 : 0.0)
                    .totalAmountAllTime(amountStats.getSum())
                    .minAmount(amountStats.getCount() > 0 ? amountStats.getMin() : 0.0)
                    .maxAmount(amountStats.getCount() > 0 ? amountStats.getMax() : 0.0)
                    .build();
        } catch (Exception e) {
            log.warn("Error building occurrence info: {}", e.getMessage());
            return ExpenseViewDTO.OccurrenceInfo.builder()
                    .totalOccurrences(1L)
                    .firstOccurrence(expense.getDate())
                    .lastOccurrence(expense.getDate())
                    .build();
        }
    }

    


    private String formatPaymentMethodName(String paymentMethod) {
        if (paymentMethod == null)
            return "Unknown";

        switch (paymentMethod.toLowerCase()) {
            case "cash":
                return "Cash";
            case "creditneedtopaid":
                return "Credit (Pending)";
            case "creditpaid":
                return "Credit (Paid)";
            case "upi":
                return "UPI";
            case "debitcard":
                return "Debit Card";
            case "creditcard":
                return "Credit Card";
            case "netbanking":
                return "Net Banking";
            default:
                
                return paymentMethod.replaceAll("([A-Z])", " $1")
                        .trim()
                        .substring(0, 1).toUpperCase() +
                        paymentMethod.replaceAll("([A-Z])", " $1")
                                .trim()
                                .substring(1);
        }
    }

    


    private String determineBudgetStatus(BudgetModel BudgetModel) {
        LocalDate now = LocalDate.now();

        if (BudgetModel.getEndDate() != null && BudgetModel.getEndDate().isBefore(now)) {
            return "EXPIRED";
        }

        if (BudgetModel.getRemainingAmount() <= 0) {
            return "EXCEEDED";
        }

        double percentageUsed = BudgetModel.getAmount() > 0
                ? ((BudgetModel.getAmount() - BudgetModel.getRemainingAmount()) / BudgetModel.getAmount()) * 100
                : 0;

        if (percentageUsed >= 90) {
            return "CRITICAL";
        } else if (percentageUsed >= 75) {
            return "WARNING";
        }

        return "ACTIVE";
    }
}


