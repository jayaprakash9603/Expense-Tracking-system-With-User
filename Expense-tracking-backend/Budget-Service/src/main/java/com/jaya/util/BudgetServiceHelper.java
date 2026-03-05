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
import java.util.*;
import java.util.stream.Collectors;

/**
 * Budget-service-specific helper. Named BudgetServiceHelper to avoid
 * conflict with com.jaya.util.ServiceHelper from other services in monolithic mode.
 */
@Component("budgetServiceHelper")
@Slf4j
public class BudgetServiceHelper {

    @Autowired
    private IUserServiceClient userService;

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    private static final String EXPENSE_BUDGET_LINKING_TOPIC = "expense-budget-linking-events";
    private static final String EXPENSE_SERVICE_LINKING_TOPIC = "expense-BudgetModel-linking-events";

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
        Set<Integer> requestedIds = budget.getExpenseIds();

        if (requestedIds == null || requestedIds.isEmpty()) {
            return validExpenseIds;
        }

        List<ExpenseDTO> expenses;
        try {
            expenses = expenseService.getExpensesByIds(userId, requestedIds);
        } catch (Exception e) {
            log.error("Failed to batch fetch expenses for validation: {}", e.getMessage());
            return validExpenseIds;
        }

        if (expenses == null) {
            return validExpenseIds;
        }

        for (ExpenseDTO expense : expenses) {
            LocalDate expenseDate = expense.getDate() != null ? LocalDate.parse(expense.getDate()) : null;
            boolean isWithinDateRange = expenseDate != null
                    && !expenseDate.isBefore(budget.getStartDate())
                    && !expenseDate.isAfter(budget.getEndDate());

            if (isWithinDateRange) {
                validExpenseIds.add(expense.getId());
            } else {
                log.debug("Expense {} is outside budget date range, excluding", expense.getId());
            }
        }

        log.info("Validated {} out of {} expense IDs for budget",
                validExpenseIds.size(), requestedIds.size());
        return validExpenseIds;
    }

    public void addBudgetIdInExpenses(Budget budget, ExpenseClient expenseService, Integer userId) {
        Set<Integer> expenseIds = budget.getExpenseIds();
        if (expenseIds == null || expenseIds.isEmpty()) {
            return;
        }

        List<Long> expenseIdList = expenseIds.stream()
                .map(Integer::longValue)
                .collect(Collectors.toList());

        ExpenseBudgetLinkingEvent event = ExpenseBudgetLinkingEvent.builder()
                .eventType(ExpenseBudgetLinkingEvent.EventType.BUDGET_EXPENSE_BATCH_LINK_UPDATE)
                .userId(userId.longValue())
                .expenseIds(expenseIdList)
                .newBudgetId(budget.getId().longValue())
                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
                .build();

        kafkaTemplate.send(EXPENSE_BUDGET_LINKING_TOPIC, event);
        kafkaTemplate.send(EXPENSE_SERVICE_LINKING_TOPIC, event);
        log.info("Published batch link event for {} expenses to budget {}", expenseIds.size(), budget.getId());
    }

    public void deleteBudgetIdInExpenses(Budget budget, ExpenseClient expenseService, Integer userId,
            Integer budgetId) {
        Set<Integer> expenseIds = budget.getExpenseIds();
        if (expenseIds == null || expenseIds.isEmpty()) {
            return;
        }

        List<Long> expenseIdList = expenseIds.stream()
                .map(Integer::longValue)
                .collect(Collectors.toList());

        ExpenseBudgetLinkingEvent event = ExpenseBudgetLinkingEvent.builder()
                .eventType(ExpenseBudgetLinkingEvent.EventType.BUDGET_EXPENSE_BATCH_REMOVE)
                .userId(userId.longValue())
                .expenseIds(expenseIdList)
                .budgetIdsToRemove(Collections.singletonList(budgetId.longValue()))
                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
                .build();

        kafkaTemplate.send(EXPENSE_BUDGET_LINKING_TOPIC, event);
        kafkaTemplate.send(EXPENSE_SERVICE_LINKING_TOPIC, event);
        log.info("Published batch remove event for {} expenses from budget {}", expenseIds.size(), budgetId);
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

        int eventCount = 0;
        for (Budget budget : budgets) {
            Set<Integer> expenseIds = budget.getExpenseIds();
            if (expenseIds == null || expenseIds.isEmpty()) {
                continue;
            }

            List<Long> expenseIdList = expenseIds.stream()
                    .map(Integer::longValue)
                    .collect(Collectors.toList());

            try {
                ExpenseBudgetLinkingEvent event = ExpenseBudgetLinkingEvent.builder()
                        .eventType(ExpenseBudgetLinkingEvent.EventType.BUDGET_EXPENSE_BATCH_REMOVE)
                        .userId(userId.longValue())
                        .expenseIds(expenseIdList)
                        .budgetIdsToRemove(Collections.singletonList(budget.getId().longValue()))
                        .timestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
                        .build();

                kafkaTemplate.send(EXPENSE_BUDGET_LINKING_TOPIC, event);
                kafkaTemplate.send(EXPENSE_SERVICE_LINKING_TOPIC, event);
                eventCount++;

                log.debug("Published batch removal event for budget={}, expenses={}",
                        budget.getId(), expenseIds.size());

            } catch (Exception e) {
                log.error("Failed to publish batch removal event for budget={}: {}",
                        budget.getId(), e.getMessage());
            }
        }

        log.info("====== Async Budget Removal Completed ======");
        log.info("Published {} batch events to remove {} budgets' expenses",
                eventCount, budgets.size());
    }
}
