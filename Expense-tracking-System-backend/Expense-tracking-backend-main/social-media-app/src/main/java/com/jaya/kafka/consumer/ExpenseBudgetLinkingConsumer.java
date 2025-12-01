package com.jaya.kafka.consumer;

import com.jaya.dto.ExpenseBudgetLinkingEvent;
import com.jaya.service.BulkExpenseBudgetService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Collections;

/**
 * Kafka consumer for handling expense-budget linking events
 */
@Component
@Slf4j
public class ExpenseBudgetLinkingConsumer {

    @Autowired
    private BulkExpenseBudgetService bulkExpenseBudgetService;

    /**
     * Listen for expense-budget linking events
     */
    @KafkaListener(
        topics = "expense-budget-linking-events",
        groupId = "expense-service-linking-group",
        containerFactory = "expenseBudgetLinkingKafkaListenerContainerFactory"
    )
    public void consumeLinkingEvent(ExpenseBudgetLinkingEvent event) {
        try {
            log.info("====== Expense Service Kafka Consumer ======");
            log.info("Received linking event: type={}, expenseId={}, budgetId={}, userId={}", 
                event.getEventType(), 
                event.getNewExpenseId(), 
                event.getNewBudgetId(),
                event.getUserId());
            
            switch (event.getEventType()) {
                case EXPENSE_BUDGET_LINK_UPDATE:
                    // Budget Service is telling us to update expense with new budget ID
                    handleExpenseBudgetLinkUpdate(event);
                    break;
                    
                case BUDGET_DELETED_REMOVE_FROM_EXPENSES:
                    // Budget Service is telling us to remove budget IDs from expense
                    handleBudgetDeletedRemoveFromExpenses(event);
                    break;
                    
                case BUDGET_EXPENSE_LINK_UPDATE:
                    // This would be handled by Budget Service, but we log it for awareness
                    log.info("Budget-Expense link update event (handled by Budget Service): expense={}, budget={}", 
                        event.getNewExpenseId(), event.getNewBudgetId());
                    break;
                    
                case EXPENSE_CREATED_WITH_OLD_BUDGETS:
                    // This event is sent TO Budget Service, not consumed by Expense Service
                    log.debug("EXPENSE_CREATED_WITH_OLD_BUDGETS event (handled by Budget Service): expense={}", 
                        event.getNewExpenseId());
                    break;
                    
                case EXPENSE_CREATED_WITH_EXISTING_BUDGETS:
                    // This event is sent TO Budget Service, not consumed by Expense Service
                    log.debug("EXPENSE_CREATED_WITH_EXISTING_BUDGETS event (handled by Budget Service): expense={}", 
                        event.getNewExpenseId());
                    break;
                    
                case BUDGET_CREATED_WITH_OLD_EXPENSES:
                    // This event is sent TO Budget Service, not consumed by Expense Service
                    log.debug("BUDGET_CREATED_WITH_OLD_EXPENSES event (handled by Budget Service): budget={}", 
                        event.getOldBudgetId());
                    break;
                    
                default:
                    log.warn("Unhandled event type: {}", event.getEventType());
            }
            
        } catch (Exception e) {
            log.error("Error processing linking event", e);
        }
    }

    /**
     * Handle expense-budget link update event
     */
    private void handleExpenseBudgetLinkUpdate(ExpenseBudgetLinkingEvent event) {
        try {
            log.info(">>> Handling EXPENSE_BUDGET_LINK_UPDATE event");
            log.info(">>> Event details: expenseId={}, budgetId={}, userId={}",
                event.getNewExpenseId(), event.getNewBudgetId(), event.getUserId());
            
            if (event.getNewExpenseId() == null || event.getNewBudgetId() == null) {
                log.warn("Invalid event data - missing expense or budget ID");
                return;
            }

            log.info(">>> Calling updateExpenseWithNewBudgetIds...");
            // Update expense with the new budget ID
            bulkExpenseBudgetService.updateExpenseWithNewBudgetIds(
                event.getNewExpenseId(),
                Collections.singletonList(event.getNewBudgetId()),
                event.getUserId().intValue()
            );

            log.info(">>> Successfully updated expense {} with budget {}", 
                event.getNewExpenseId(), event.getNewBudgetId());
                
        } catch (Exception e) {
            log.error("Error handling expense-budget link update", e);
        }
    }

    /**
     * Handle budget deleted remove from expenses event
     */
    private void handleBudgetDeletedRemoveFromExpenses(ExpenseBudgetLinkingEvent event) {
        try {
            log.info(">>> Handling BUDGET_DELETED_REMOVE_FROM_EXPENSES event");
            log.info(">>> Event details: expenseId={}, budgetsToRemove={}, userId={}",
                event.getNewExpenseId(), 
                event.getBudgetIdsToRemove() != null ? event.getBudgetIdsToRemove().size() : 0,
                event.getUserId());
            
            if (event.getNewExpenseId() == null || event.getBudgetIdsToRemove() == null || 
                event.getBudgetIdsToRemove().isEmpty()) {
                log.warn("Invalid event data - missing expense ID or budget IDs to remove");
                return;
            }

            log.info(">>> Calling removeBudgetIdsFromExpense...");
            // Remove budget IDs from expense
            bulkExpenseBudgetService.removeBudgetIdsFromExpense(
                event.getNewExpenseId(),
                event.getBudgetIdsToRemove(),
                event.getUserId().intValue()
            );

            log.info(">>> Successfully removed {} budget IDs from expense {}", 
                event.getBudgetIdsToRemove().size(), event.getNewExpenseId());
                
        } catch (Exception e) {
            log.error("Error handling budget deleted remove from expenses", e);
        }
    }
}