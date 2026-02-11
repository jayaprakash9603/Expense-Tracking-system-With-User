package com.jaya.util;

import com.jaya.dto.ExpenseDTO;
import com.jaya.dto.ExpenseBudgetLinkingEvent;
import com.jaya.models.Budget;
import com.jaya.common.dto.UserDTO;
import com.jaya.service.ExpenseClient;
import com.jaya.common.service.client.IUserServiceClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@Slf4j
public class ServiceHelper {

    @Autowired
    private IUserServiceClient userService;

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    private static final String EXPENSE_BUDGET_LINKING_TOPIC = "expense-budget-linking-events";

    public static final String DEFAULT_TYPE = "loss";
    public static final String DEFAULT_PAYMENT_METHOD = "cash";
    public static final String DEFAULT_COMMENT = "";

    public UserDTO validateUser(Integer userId) throws Exception {

        UserDTO reqUser = userService.getUserById(userId);
        if (reqUser == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        return reqUser;
    }

    private UserDTO authenticate(String jwt) {
        UserDTO reqUser = userService.getUserProfile(jwt);
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

    public Set<Integer> getValidBudgetIds(Budget budget, Integer userId, ExpenseClient expenseService) {
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

    public void addBudgetIdInExpenses(Budget budget, ExpenseClient expenseService, Integer userId) {
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
                log.warn("Expense with ID {} not found, skipping budget link", expenseId);
                continue;
            }
        }
    }

    public void deleteBudgetIdInExpenses(Budget budget, ExpenseClient expenseService, Integer userId,
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
                    log.warn("Expense with ID {} not found, skipping budget unlink", expenseId);
                    continue;
                }
            }
        }
    }

    public void removeBudgetsIdsInAllExpenses(List<Budget> budgets, ExpenseClient expenseService, Integer userId) {
        for (Budget budget : budgets) {
            deleteBudgetIdInExpenses(budget, expenseService, userId, budget.getId());
        }
    }

    @Async
    public void removeBudgetsIdsInAllExpensesAsync(List<Budget> budgets, Integer userId) {
        log.info("====== Async Budget Removal Started ======");
        log.info("Removing {} budgets from all expenses for userId={}", budgets.size(), userId);

        List<Long> budgetIdsToRemove = budgets.stream()
                .map(budget -> budget.getId().longValue())
                .collect(Collectors.toList());

        Set<Integer> allExpenseIds = new HashSet<>();
        for (Budget budget : budgets) {
            if (budget.getExpenseIds() != null && !budget.getExpenseIds().isEmpty()) {
                allExpenseIds.addAll(budget.getExpenseIds());
            }
        }

        log.info("Found {} unique expenses to update with budget removal", allExpenseIds.size());

        if (allExpenseIds.isEmpty()) {
            log.info("No expenses to update, skipping event publishing");
            return;
        }

        int eventCount = 0;
        for (Integer expenseId : allExpenseIds) {
            try {
                ExpenseBudgetLinkingEvent event = ExpenseBudgetLinkingEvent.builder()
                        .eventType(ExpenseBudgetLinkingEvent.EventType.BUDGET_DELETED_REMOVE_FROM_EXPENSES)
                        .userId(userId.longValue())
                        .newExpenseId(expenseId.longValue())
                        .budgetIdsToRemove(budgetIdsToRemove)
                        .timestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
                        .build();

                kafkaTemplate.send(EXPENSE_BUDGET_LINKING_TOPIC, event);
                eventCount++;

                log.debug("Published budget removal event for expenseId={}, budgetsToRemove={}",
                        expenseId, budgetIdsToRemove.size());

            } catch (Exception e) {
                log.error("Failed to publish budget removal event for expenseId={}: {}",
                        expenseId, e.getMessage());
            }
        }

        log.info("====== Async Budget Removal Completed ======");
        log.info("Published {} events to remove {} budgets from {} expenses",
                eventCount, budgetIdsToRemove.size(), allExpenseIds.size());
    }
}
