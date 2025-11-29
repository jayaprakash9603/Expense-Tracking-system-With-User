package com.jaya.util;

import com.jaya.dto.ExpenseDTO;
import com.jaya.models.Budget;
import com.jaya.models.UserDto;
import com.jaya.service.ExpenseService;
import com.jaya.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@Slf4j
public class ServiceHelper {

    @Autowired
    private UserService userService;

    public static final String DEFAULT_TYPE = "loss";
    public static final String DEFAULT_PAYMENT_METHOD = "cash";
    public static final String DEFAULT_COMMENT = "";

    public UserDto validateUser(Integer userId) throws Exception {

        UserDto reqUser = userService.getUserProfileById(userId);
        if (reqUser == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        return reqUser;
    }

    private UserDto authenticate(String jwt) {
        UserDto reqUser = userService.getuserProfile(jwt);
        if (reqUser == null) {
            throw new com.jaya.exceptions.UnauthorizedException("Invalid or expired token");
        }
        return reqUser;
    }

    public Budget validateBudget(Budget budget, Integer userId) throws Exception {
        if (budget.getStartDate() == null || budget.getEndDate() == null) {
            throw new IllegalArgumentException("Start date and end date must not be null.");
        }

        if (budget.getStartDate().isAfter(budget.getEndDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date.");
        }

        if (budget.getAmount() < 0) {
            throw new IllegalArgumentException("Budget amount cannot be negative.");
        }

        if (budget.getName() == null || budget.getName().isEmpty()) {
            throw new IllegalArgumentException("Budget name cannot be empty.");
        }

        if (budget.getRemainingAmount() <= 0) {
            budget.setRemainingAmount(budget.getAmount());
        }

        if (userId != null || userId >= 0) {
            budget.setUserId(userId);
        }
        return budget;
    }

    public Set<Integer> getValidBudgetIds(Budget budget, Integer userId, ExpenseService expenseService) {
        Set<Integer> validExpenseIds = new HashSet<>();

        for (Integer expenseId : budget.getExpenseIds()) {
            ExpenseDTO expense;
            try {
                expense = expenseService.getExpenseById(expenseId, userId);
            } catch (Exception e) {
                log.warn("Expense with ID {} not found or error occurred, excluding from budget: {}",
                        expenseId, e.getMessage());
                continue;
            }

            if (expense != null) {
                LocalDate expenseDate = expense.getDate();
                boolean isWithinDateRange = !expenseDate.isBefore(budget.getStartDate())
                        && !expenseDate.isAfter(budget.getEndDate());

                if (isWithinDateRange) {
                    validExpenseIds.add(expenseId);
                } else {
                    log.debug("Expense {} is outside budget date range, excluding", expenseId);
                }
            }
        }
        log.info("Validated {} out of {} expense IDs for budget",
                validExpenseIds.size(), budget.getExpenseIds().size());
        return validExpenseIds;
    }

    public void addBudgetIdInExpenses(Budget budget, ExpenseService expenseService, Integer userId) {
        for (Integer expenseId : budget.getExpenseIds()) {
            try {
                ExpenseDTO expense = expenseService.getExpenseById(expenseId, userId);
                if (expense != null) {
                    if (expense.getBudgetIds() == null) {
                        expense.setBudgetIds(new HashSet<>());
                    }

                    if (!expense.getBudgetIds().contains(budget.getId())) {
                        expense.getBudgetIds().add(budget.getId());
                        expenseService.save(expense);
                    }
                }
            } catch (Exception e) {
                // Expense not found - skip it gracefully
                log.warn("Expense with ID {} not found, skipping budget link", expenseId);
                continue;
            }
        }
    }

    public void deleteBudgetIdInExpenses(Budget budget, ExpenseService expenseService, Integer userId,
            Integer budgetId) {
        Set<Integer> expenseIds = budget.getExpenseIds();
        if (expenseIds != null) {
            for (Integer expenseId : expenseIds) {
                try {
                    ExpenseDTO expense = expenseService.getExpenseById(expenseId, userId);
                    if (expense != null && expense.getBudgetIds() != null) {
                        expense.getBudgetIds().remove(budgetId);
                        expenseService.save(expense);
                    }
                } catch (Exception e) {
                    // Expense not found - skip it gracefully
                    log.warn("Expense with ID {} not found, skipping budget unlink", expenseId);
                    continue;
                }
            }
        }
    }

    public void removeBudgetsIdsInAllExpenses(List<Budget> budgets, ExpenseService expenseService, Integer userId) {
        for (Budget budget : budgets) {
            deleteBudgetIdInExpenses(budget, expenseService, userId, budget.getId());
        }
    }
}
