package com.jaya.kafka.consumer;

import com.jaya.dto.ExpenseBudgetLinkingEvent;
import com.jaya.service.BulkExpenseBudgetService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Collections;




@Component
@Slf4j
public class ExpenseBudgetLinkingConsumer {

    @Autowired
    private BulkExpenseBudgetService bulkExpenseBudgetService;

    


    @KafkaListener(
        topics = "expense-BudgetModel-linking-events",
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
                    
                    handleExpenseBudgetLinkUpdate(event);
                    break;
                    
                case BUDGET_DELETED_REMOVE_FROM_EXPENSES:
                    
                    handleBudgetDeletedRemoveFromExpenses(event);
                    break;
                    
                case BUDGET_EXPENSE_LINK_UPDATE:
                    
                    log.info("BudgetModel-Expense link update event (handled by BudgetModel Service): expense={}, BudgetModel={}", 
                        event.getNewExpenseId(), event.getNewBudgetId());
                    break;
                    
                case EXPENSE_CREATED_WITH_OLD_BUDGETS:
                    
                    log.debug("EXPENSE_CREATED_WITH_OLD_BUDGETS event (handled by BudgetModel Service): expense={}", 
                        event.getNewExpenseId());
                    break;
                    
                case EXPENSE_CREATED_WITH_EXISTING_BUDGETS:
                    
                    log.debug("EXPENSE_CREATED_WITH_EXISTING_BUDGETS event (handled by BudgetModel Service): expense={}", 
                        event.getNewExpenseId());
                    break;
                    
                case BUDGET_CREATED_WITH_OLD_EXPENSES:
                    
                    log.debug("BUDGET_CREATED_WITH_OLD_EXPENSES event (handled by BudgetModel Service): BudgetModel={}", 
                        event.getOldBudgetId());
                    break;

                case BUDGET_EXPENSE_BATCH_LINK_UPDATE:
                    handleBatchExpenseBudgetLink(event);
                    break;

                case BUDGET_EXPENSE_BATCH_REMOVE:
                    handleBatchExpenseBudgetRemove(event);
                    break;

                case EXPENSE_EDITED_ADD_TO_BUDGETS:
                    log.debug("EXPENSE_EDITED_ADD_TO_BUDGETS event (handled by Budget Service): expense={}",
                        event.getNewExpenseId());
                    break;

                case EXPENSE_EDITED_REMOVE_FROM_BUDGETS:
                    log.debug("EXPENSE_EDITED_REMOVE_FROM_BUDGETS event (handled by Budget Service): expense={}",
                        event.getNewExpenseId());
                    break;
                    
                default:
                    log.warn("Unhandled event type: {}", event.getEventType());
            }
            
        } catch (Exception e) {
            log.error("Error processing linking event", e);
        }
    }

    


    private void handleExpenseBudgetLinkUpdate(ExpenseBudgetLinkingEvent event) {
        try {
            log.info(">>> Handling EXPENSE_BUDGET_LINK_UPDATE event");
            log.info(">>> Event details: expenseId={}, budgetId={}, userId={}",
                event.getNewExpenseId(), event.getNewBudgetId(), event.getUserId());
            
            if (event.getNewExpenseId() == null || event.getNewBudgetId() == null) {
                log.warn("Invalid event data - missing expense or BudgetModel ID");
                return;
            }

            log.info(">>> Calling updateExpenseWithNewBudgetIds...");
            
            bulkExpenseBudgetService.updateExpenseWithNewBudgetIds(
                event.getNewExpenseId(),
                Collections.singletonList(event.getNewBudgetId()),
                event.getUserId().intValue()
            );

            log.info(">>> Successfully updated expense {} with BudgetModel {}", 
                event.getNewExpenseId(), event.getNewBudgetId());
                
        } catch (Exception e) {
            log.error("Error handling expense-BudgetModel link update", e);
        }
    }

    


    private void handleBatchExpenseBudgetLink(ExpenseBudgetLinkingEvent event) {
        try {
            log.info(">>> Handling BUDGET_EXPENSE_BATCH_LINK_UPDATE event");
            log.info(">>> Event details: {} expenses, budgetId={}, userId={}",
                event.getExpenseIds() != null ? event.getExpenseIds().size() : 0,
                event.getNewBudgetId(),
                event.getUserId());

            if (event.getExpenseIds() == null || event.getExpenseIds().isEmpty() || event.getNewBudgetId() == null) {
                log.warn("Invalid batch link event data - missing expense IDs or budget ID");
                return;
            }

            bulkExpenseBudgetService.batchAddBudgetIdToExpenses(
                event.getExpenseIds(),
                event.getNewBudgetId(),
                event.getUserId()
            );

            log.info(">>> Successfully batch linked {} expenses to budget {}",
                event.getExpenseIds().size(), event.getNewBudgetId());

        } catch (Exception e) {
            log.error("Error handling batch expense-budget link update", e);
        }
    }

    private void handleBatchExpenseBudgetRemove(ExpenseBudgetLinkingEvent event) {
        try {
            log.info(">>> Handling BUDGET_EXPENSE_BATCH_REMOVE event");
            log.info(">>> Event details: {} expenses, budgetsToRemove={}, userId={}",
                event.getExpenseIds() != null ? event.getExpenseIds().size() : 0,
                event.getBudgetIdsToRemove() != null ? event.getBudgetIdsToRemove().size() : 0,
                event.getUserId());

            if (event.getExpenseIds() == null || event.getExpenseIds().isEmpty()
                    || event.getBudgetIdsToRemove() == null || event.getBudgetIdsToRemove().isEmpty()) {
                log.warn("Invalid batch remove event data - missing expense IDs or budget IDs to remove");
                return;
            }

            bulkExpenseBudgetService.batchRemoveBudgetIdFromExpenses(
                event.getExpenseIds(),
                event.getBudgetIdsToRemove(),
                event.getUserId()
            );

            log.info(">>> Successfully batch removed budgets from {} expenses",
                event.getExpenseIds().size());

        } catch (Exception e) {
            log.error("Error handling batch expense-budget remove", e);
        }
    }

    private void handleBudgetDeletedRemoveFromExpenses(ExpenseBudgetLinkingEvent event) {
        try {
            log.info(">>> Handling BUDGET_DELETED_REMOVE_FROM_EXPENSES event");
            log.info(">>> Event details: expenseId={}, budgetsToRemove={}, userId={}",
                event.getNewExpenseId(), 
                event.getBudgetIdsToRemove() != null ? event.getBudgetIdsToRemove().size() : 0,
                event.getUserId());
            
            if (event.getNewExpenseId() == null || event.getBudgetIdsToRemove() == null || 
                event.getBudgetIdsToRemove().isEmpty()) {
                log.warn("Invalid event data - missing expense ID or BudgetModel IDs to remove");
                return;
            }

            log.info(">>> Calling removeBudgetIdsFromExpense...");
            
            bulkExpenseBudgetService.removeBudgetIdsFromExpense(
                event.getNewExpenseId(),
                event.getBudgetIdsToRemove(),
                event.getUserId().intValue()
            );

            log.info(">>> Successfully removed {} BudgetModel IDs from expense {}", 
                event.getBudgetIdsToRemove().size(), event.getNewExpenseId());
                
        } catch (Exception e) {
            log.error("Error handling BudgetModel deleted remove from expenses", e);
        }
    }
}
