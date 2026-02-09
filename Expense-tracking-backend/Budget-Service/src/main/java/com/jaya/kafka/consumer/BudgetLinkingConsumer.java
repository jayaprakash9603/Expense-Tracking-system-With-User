package com.jaya.kafka.consumer;

import com.jaya.dto.BulkBudgetRequest;
import com.jaya.dto.ExpenseBudgetLinkingEvent;
import com.jaya.models.Budget;
import com.jaya.service.BulkBudgetLinkingService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
@Slf4j
public class BudgetLinkingConsumer {

    @Autowired
    private BulkBudgetLinkingService bulkBudgetLinkingService;

    private Map<Long, Long> oldToNewExpenseIds = new HashMap<>();

    @KafkaListener(topics = "expense-budget-linking-events", groupId = "budget-service-linking-group", containerFactory = "expenseBudgetLinkingKafkaListenerContainerFactory")
    public void consumeLinkingEvent(ExpenseBudgetLinkingEvent event) {
        try {
            log.info("Received linking event in Budget Service: {}", event.getEventType());

            switch (event.getEventType()) {
                case EXPENSE_CREATED_WITH_OLD_BUDGETS:
                    handleExpenseCreatedWithOldBudgets(event);
                    break;

                case EXPENSE_CREATED_WITH_EXISTING_BUDGETS:
                    handleExpenseCreatedWithExistingBudgets(event);
                    break;

                case BUDGET_CREATED_WITH_OLD_EXPENSES:
                    handleBudgetCreatedWithOldExpenses(event);
                    break;

                case BUDGET_EXPENSE_LINK_UPDATE:
                    log.info("Budget-Expense link update (internal handling)");
                    break;

                default:
                    log.warn("Unhandled event type in Budget Service: {}", event.getEventType());
            }

        } catch (Exception e) {
            log.error("Error processing linking event in Budget Service", e);
        }
    }

    private void handleExpenseCreatedWithOldBudgets(ExpenseBudgetLinkingEvent event) {
        try {
            if (event.getOldExpenseId() != null && event.getNewExpenseId() != null) {
                oldToNewExpenseIds.put(event.getOldExpenseId(), event.getNewExpenseId());
            }

            if (event.getOldBudgetIds() != null && !event.getOldBudgetIds().isEmpty()) {
                bulkBudgetLinkingService.handleExpenseCreatedWithOldBudgets(
                        event.getNewExpenseId(),
                        event.getOldExpenseId(),
                        event.getOldBudgetIds(),
                        event.getUserId().intValue());
            }

            log.info("Handled expense created event: new expense {} for old budgets {}",
                    event.getNewExpenseId(), event.getOldBudgetIds());

        } catch (Exception e) {
            log.error("Error handling expense created with old budgets", e);
        }
    }

    private void handleExpenseCreatedWithExistingBudgets(ExpenseBudgetLinkingEvent event) {
        try {
            log.info("Handling expense created with existing budgets: newExpenseId={}, oldExpenseId={}, budgets={}",
                    event.getNewExpenseId(), event.getOldExpenseId(), event.getOldBudgetIds());

            bulkBudgetLinkingService.replaceOldExpenseIdWithNew(
                    event.getOldExpenseId(),
                    event.getNewExpenseId(),
                    event.getOldBudgetIds(),
                    event.getUserId().intValue());

        } catch (Exception e) {
            log.error("Error handling expense created with existing budgets", e);
        }
    }

    private void handleBudgetCreatedWithOldExpenses(ExpenseBudgetLinkingEvent event) {
        try {
            if (event.getBudgetDetails() != null && event.getOldBudgetId() != null) {
                ExpenseBudgetLinkingEvent.BudgetDetails details = event.getBudgetDetails();

                Budget existingBudget = bulkBudgetLinkingService.findBudgetById(
                        event.getOldBudgetId().intValue(),
                        event.getUserId().intValue());

                if (existingBudget != null) {
                    log.info("Budget with ID {} already exists, using it for mapping instead of creating new",
                            event.getOldBudgetId());

                    Long existingBudgetId = existingBudget.getId().longValue();

                    bulkBudgetLinkingService.storeBudgetIdMapping(event.getOldBudgetId(), existingBudgetId);

                    if (event.getNewBudgetIds() != null && !event.getNewBudgetIds().isEmpty()) {
                        bulkBudgetLinkingService.addExpensesToExistingBudget(
                                existingBudgetId,
                                event.getNewBudgetIds(),
                                event.getUserId().intValue());
                    }
                } else {
                    log.info("Budget with ID {} not found, creating new budget", event.getOldBudgetId());

                    BulkBudgetRequest.BudgetWithOldExpenses budgetData = new BulkBudgetRequest.BudgetWithOldExpenses();
                    budgetData.setOldBudgetId(event.getOldBudgetId());
                    budgetData.setName(details.getName());
                    budgetData.setDescription(details.getDescription());
                    budgetData.setAmount(details.getAmount());
                    budgetData.setStartDate(details.getStartDate());
                    budgetData.setEndDate(details.getEndDate());
                    budgetData.setIncludeInBudget(details.getIncludeInBudget());
                    budgetData.setRemainingAmount(details.getRemainingAmount());
                    budgetData.setOldExpenseIds(details.getExpenseIds());
                    budgetData.setNewExpenseIds(event.getNewBudgetIds());

                    Budget createdBudget = bulkBudgetLinkingService.createBudgetWithOldExpenseMapping(
                            budgetData,
                            event.getUserId().intValue(),
                            oldToNewExpenseIds);

                    Long newBudgetId = createdBudget.getId().longValue();

                    bulkBudgetLinkingService.storeBudgetIdMapping(event.getOldBudgetId(), newBudgetId);

                    log.info("Created budget with ID {} from old budget ID {}", newBudgetId, event.getOldBudgetId());
                }
            } else {
                if (event.getOldBudgetId() != null && event.getNewBudgetId() != null) {
                    bulkBudgetLinkingService.storeBudgetIdMapping(
                            event.getOldBudgetId(),
                            event.getNewBudgetId());
                    log.info("Stored budget mapping: old={}, new={}",
                            event.getOldBudgetId(), event.getNewBudgetId());
                } else {
                    log.warn("Budget creation event missing required data");
                }
            }

        } catch (Exception e) {
            log.error("Error handling budget created with old expenses", e);
        }
    }

    public Long getNewExpenseId(Long oldExpenseId) {
        return oldToNewExpenseIds.get(oldExpenseId);
    }
}
