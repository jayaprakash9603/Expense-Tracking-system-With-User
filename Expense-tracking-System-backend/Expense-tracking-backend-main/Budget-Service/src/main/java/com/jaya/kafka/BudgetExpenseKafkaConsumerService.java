package com.jaya.kafka;

import com.jaya.events.BudgetExpenseEvent;
import com.jaya.models.Budget;
import com.jaya.service.BudgetService;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class BudgetExpenseKafkaConsumerService {

    private static final Logger logger = LoggerFactory.getLogger(BudgetExpenseKafkaConsumerService.class);

    private final BudgetService budgetService;

    @KafkaListener(
            topics = "budget-expense-events",
            groupId = "budget-expense-group",
            containerFactory = "budgetExpenseKafkaListenerContainerFactory"
    )
    @Transactional
    public void handleBudgetExpenseEventDirect(BudgetExpenseEvent event) {
        try {
            logger.info("Direct consumption - Expense ID: {}, Budget IDs: {}, Action: {}, User: {}",
                    event.getExpenseId(), event.getBudgetIds(), event.getAction(), event.getUserId());

            // Validate event data
            if (event.getBudgetIds() == null || event.getBudgetIds().isEmpty()) {
                logger.warn("No budget IDs provided for expense ID: {}", event.getExpenseId());
                return;
            }

            switch (event.getAction()) {
                case "ADD":
                    addExpenseToBudgets(event);
                    break;
                case "UPDATE":
                    updateBudgetExpenseLinks(event);
                    break;
                case "REMOVE":
                    handleExpenseRemoval(event);
                    break;
                default:
                    logger.warn("Unknown action: {} for budget expense event", event.getAction());
            }

            logger.info("Successfully processed budget expense event for expense ID: {}", event.getExpenseId());

        } catch (Exception e) {
            logger.error("Failed to process budget expense event for expense ID: {}", event.getExpenseId(), e);
        }
    }

    private void addExpenseToBudgets(BudgetExpenseEvent event) throws Exception {
        logger.info("Adding expense ID: {} to budgets: {} for user: {}",
                event.getExpenseId(), event.getBudgetIds(), event.getUserId());

        budgetService.editBudgetWithExpenseId(event.getBudgetIds(), event.getExpenseId(),event.getUserId());
    }

    private void updateBudgetExpenseLinks(BudgetExpenseEvent event) throws Exception {
        removeExpenseFromAllBudgets(event.getExpenseId(), event.getUserId());
        addExpenseToBudgets(event);
    }

    private void handleExpenseRemoval(BudgetExpenseEvent event) throws Exception {
        for (Integer budgetId : event.getBudgetIds()) {
            Budget budget = budgetService.getBudgetById(budgetId, event.getUserId());
            if (budget != null && budget.getExpenseIds() != null) {
                budget.getExpenseIds().remove(event.getExpenseId());
                budget.setBudgetHasExpenses(!budget.getExpenseIds().isEmpty());
                budgetService.save(budget);
                logger.info("Removed expense {} from budget {}", event.getExpenseId(), budgetId);
            }
        }
    }

    private void removeExpenseFromAllBudgets(Integer expenseId, Integer userId) throws Exception {
        var allBudgets = budgetService.getAllBudgetForUser(userId);
        for (Budget budget : allBudgets) {
            if (budget.getExpenseIds() != null && budget.getExpenseIds().contains(expenseId)) {
                budget.getExpenseIds().remove(expenseId);
                budgetService.editBudget(budget.getId(), budget, userId);
                logger.info("Removed expense ID: {} from budget ID: {} during update for user: {}",
                        expenseId, budget.getId(), userId);
            }
        }
    }
}
