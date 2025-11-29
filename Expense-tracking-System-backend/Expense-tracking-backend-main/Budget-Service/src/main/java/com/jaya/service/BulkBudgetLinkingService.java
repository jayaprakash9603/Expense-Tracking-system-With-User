package com.jaya.service;

import com.jaya.dto.BulkBudgetRequest;
import com.jaya.dto.ExpenseBudgetLinkingEvent;
import com.jaya.models.Budget;
import com.jaya.repository.BudgetRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for handling bulk budget operations with expense linking
 */
@Service
@Slf4j
public class BulkBudgetLinkingService {

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private BudgetService budgetService;

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    private static final String EXPENSE_BUDGET_LINKING_TOPIC = "expense-budget-linking-events";

    // Map to track old budget ID to new budget ID mappings (in-memory cache)
    private Map<Long, Long> budgetIdMappings = new HashMap<>();
    
    // Store pending expense-budget links (for expenses that arrive before budgets are created)
    private Map<Long, List<PendingExpenseLink>> pendingExpenseLinks = new HashMap<>();
    
    /**
     * Helper class to store pending expense links
     */
    private static class PendingExpenseLink {
        Long newExpenseId;
        Long oldExpenseId;
        Integer userId;
        
        PendingExpenseLink(Long newExpenseId, Long oldExpenseId, Integer userId) {
            this.newExpenseId = newExpenseId;
            this.oldExpenseId = oldExpenseId;
            this.userId = userId;
        }
    }

    /**
     * Create budget from old budget data with old expense IDs
     * When expenses are already created (new IDs known), links them directly
     * Otherwise, waits for expense creation events
     */
    @Transactional
    public Budget createBudgetWithOldExpenseMapping(
        BulkBudgetRequest.BudgetWithOldExpenses budgetData,
        Integer userId,
        Map<Long, Long> oldToNewExpenseIds
    ) throws Exception {
        log.info("Creating budget from old budget ID: {}", budgetData.getOldBudgetId());

        // Create new budget
        Budget budget = new Budget();
        budget.setName(budgetData.getName());
        budget.setDescription(budgetData.getDescription());
        budget.setAmount(budgetData.getAmount());
        budget.setStartDate(LocalDate.parse(budgetData.getStartDate()));
        budget.setEndDate(LocalDate.parse(budgetData.getEndDate()));
        budget.setUserId(userId);
        budget.setIncludeInBudget(budgetData.getIncludeInBudget() != null ? budgetData.getIncludeInBudget() : false);
        budget.setRemainingAmount(budgetData.getRemainingAmount() != null ? budgetData.getRemainingAmount() : budgetData.getAmount());
        budget.setBudgetHasExpenses(false);

        // Convert new expense IDs to Integer Set
        Set<Integer> newExpenseIdsSet = new HashSet<>();
        if (budgetData.getNewExpenseIds() != null) {
            newExpenseIdsSet = budgetData.getNewExpenseIds().stream()
                .map(Long::intValue)
                .collect(Collectors.toSet());
        } else if (budgetData.getOldExpenseIds() != null && oldToNewExpenseIds != null) {
            // Try to map old expense IDs to new ones
            for (Long oldExpenseId : budgetData.getOldExpenseIds()) {
                Long newExpenseId = oldToNewExpenseIds.get(oldExpenseId);
                if (newExpenseId != null) {
                    newExpenseIdsSet.add(newExpenseId.intValue());
                }
            }
        }

        budget.setExpenseIds(newExpenseIdsSet);
        budget.setBudgetHasExpenses(!newExpenseIdsSet.isEmpty());

        // Save budget
        Budget savedBudget = budgetService.createBudget(budget, userId);
        Long newBudgetId = savedBudget.getId().longValue();

        log.info("Created budget with new ID: {} from old ID: {}", newBudgetId, budgetData.getOldBudgetId());

        // Store mapping
        budgetIdMappings.put(budgetData.getOldBudgetId(), newBudgetId);

        // If we have expense IDs, notify Expense Service to update them
        if (!newExpenseIdsSet.isEmpty()) {
            log.info("Notifying Expense Service to link {} expenses to budget {}", 
                newExpenseIdsSet.size(), newBudgetId);
            for (Integer expenseId : newExpenseIdsSet) {
                try {
                    publishExpenseBudgetLinkUpdate(expenseId.longValue(), newBudgetId, userId);
                    log.debug("Published link update for expense {} to budget {}", expenseId, newBudgetId);
                } catch (Exception e) {
                    log.error("Failed to publish link update for expense {} to budget {}", 
                        expenseId, newBudgetId, e);
                    // Continue with other expenses even if one fails
                }
            }
        } else {
            log.info("No mapped expenses to link for budget {}", newBudgetId);
        }

        // If we have old expense IDs that haven't been mapped yet, store them for later
        if (budgetData.getOldExpenseIds() != null && !budgetData.getOldExpenseIds().isEmpty()) {
            List<Long> unmappedOldExpenseIds = budgetData.getOldExpenseIds().stream()
                .filter(oldId -> oldToNewExpenseIds == null || !oldToNewExpenseIds.containsKey(oldId))
                .collect(Collectors.toList());

            if (!unmappedOldExpenseIds.isEmpty()) {
                log.info("Budget {} has {} unmapped old expense IDs, will wait for expense creation events",
                    newBudgetId, unmappedOldExpenseIds.size());
                // We'll handle these via Kafka consumer when expenses are created
            }
        }

        return savedBudget;
    }

    /**
     * Update budget with new expense IDs when expenses are created
     */
    @Transactional
    public void updateBudgetWithNewExpenseIds(
        Long oldBudgetId,
        Long newBudgetId,
        List<Long> oldExpenseIds,
        Map<Long, Long> oldToNewExpenseIds,
        Integer userId
    ) throws Exception {
        log.info("Updating budget {} with new expense IDs", newBudgetId);

        Budget budget = budgetRepository.findById(newBudgetId.intValue())
            .orElseThrow(() -> new RuntimeException("Budget not found: " + newBudgetId));

        if (!budget.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to budget: " + newBudgetId);
        }

        // Map old expense IDs to new ones
        Set<Integer> newExpenseIdsSet = oldExpenseIds.stream()
            .map(oldId -> oldToNewExpenseIds.getOrDefault(oldId, oldId))
            .map(Long::intValue)
            .collect(Collectors.toSet());

        // Add to existing expense IDs
        budget.getExpenseIds().addAll(newExpenseIdsSet);
        budget.setBudgetHasExpenses(!budget.getExpenseIds().isEmpty());

        budgetRepository.save(budget);

        log.info("Updated budget {} with {} new expense IDs", newBudgetId, newExpenseIdsSet.size());

        // Notify Expense Service to update each expense with this budget ID
        for (Integer expenseId : newExpenseIdsSet) {
            publishExpenseBudgetLinkUpdate(expenseId.longValue(), newBudgetId, userId);
        }
    }

    /**
     * Handle expense created event - find budgets that reference old expense ID
     */
    @Transactional
    public void handleExpenseCreatedWithOldBudgets(
        Long newExpenseId,
        Long oldExpenseId,
        List<Long> oldBudgetIds,
        Integer userId
    ) {
        log.info("Handling expense created event: new={}, old={}, budgets={}", 
            newExpenseId, oldExpenseId, oldBudgetIds);

        for (Long oldBudgetId : oldBudgetIds) {
            // Check if we have a new budget ID for this old budget ID
            Long newBudgetId = budgetIdMappings.get(oldBudgetId);

            if (newBudgetId != null) {
                try {
                    // Update budget with the new expense ID
                    Budget budget = budgetRepository.findById(newBudgetId.intValue()).orElse(null);
                    if (budget != null && budget.getUserId().equals(userId)) {
                        budget.getExpenseIds().add(newExpenseId.intValue());
                        budget.setBudgetHasExpenses(true);
                        budgetRepository.save(budget);

                        // Notify Expense Service to add this budget ID
                        publishExpenseBudgetLinkUpdate(newExpenseId, newBudgetId, userId);

                        log.info("Linked expense {} to budget {}", newExpenseId, newBudgetId);
                    }
                } catch (Exception e) {
                    log.error("Error linking expense {} to budget {}", newExpenseId, newBudgetId, e);
                }
            } else {
                // Budget not created yet - store as pending
                log.info("Budget {} not created yet, queuing expense {} for later linking", 
                    oldBudgetId, newExpenseId);
                pendingExpenseLinks.computeIfAbsent(oldBudgetId, k -> new ArrayList<>())
                    .add(new PendingExpenseLink(newExpenseId, oldExpenseId, userId));
            }
        }
    }

    /**
     * Publish event to notify Expense Service to update expense with budget ID
     */
    private void publishExpenseBudgetLinkUpdate(Long expenseId, Long budgetId, Integer userId) {
        ExpenseBudgetLinkingEvent event = ExpenseBudgetLinkingEvent.builder()
            .eventType(ExpenseBudgetLinkingEvent.EventType.EXPENSE_BUDGET_LINK_UPDATE)
            .userId(userId.longValue())
            .newExpenseId(expenseId)
            .newBudgetId(budgetId)
            .timestamp(LocalDateTime.now().toString())
            .build();

        kafkaTemplate.send(EXPENSE_BUDGET_LINKING_TOPIC, event);
        log.info("Published expense-budget link update: expense={}, budget={}", expenseId, budgetId);
    }

    /**
     * Get new budget ID for an old budget ID
     */
    public Long getNewBudgetId(Long oldBudgetId) {
        return budgetIdMappings.get(oldBudgetId);
    }

    /**
     * Store budget ID mapping and process any pending expense links
     */
    public void storeBudgetIdMapping(Long oldBudgetId, Long newBudgetId) {
        budgetIdMappings.put(oldBudgetId, newBudgetId);
        log.info("Stored budget ID mapping: {} -> {}", oldBudgetId, newBudgetId);
        
        // Process any pending expense links for this budget
        List<PendingExpenseLink> pendingLinks = pendingExpenseLinks.remove(oldBudgetId);
        if (pendingLinks != null && !pendingLinks.isEmpty()) {
            log.info("Processing {} pending expense links for budget {}", pendingLinks.size(), newBudgetId);
            for (PendingExpenseLink link : pendingLinks) {
                try {
                    // Link the pending expense to the newly created budget
                    handleExpenseCreatedWithOldBudgets(
                        link.newExpenseId,
                        link.oldExpenseId,
                        List.of(oldBudgetId),
                        link.userId
                    );
                } catch (Exception e) {
                    log.error("Error processing pending link for expense {} to budget {}", 
                        link.newExpenseId, newBudgetId, e);
                }
            }
        }
    }

    /**
     * Replace old expense ID with new expense ID in existing budgets
     * This is called when an expense is created and its budgets already exist
     */
    @Transactional
    public void replaceOldExpenseIdWithNew(
        Long oldExpenseId,
        Long newExpenseId,
        List<Long> oldBudgetIds,
        Integer userId
    ) {
        log.info("Replacing old expense ID {} with new ID {} in {} budgets", 
            oldExpenseId, newExpenseId, oldBudgetIds.size());
        
        for (Long oldBudgetId : oldBudgetIds) {
            try {
                // Find the budget by old budget ID
                Budget budget = budgetRepository.findById(oldBudgetId.intValue()).orElse(null);
                
                if (budget == null) {
                    log.warn("Budget not found with ID: {}", oldBudgetId);
                    continue;
                }
                
                if (!budget.getUserId().equals(userId)) {
                    log.warn("Unauthorized access to budget: {}", oldBudgetId);
                    continue;
                }
                
                // Replace old expense ID with new expense ID
                Set<Integer> expenseIds = budget.getExpenseIds();
                if (expenseIds.remove(oldExpenseId.intValue())) {
                    expenseIds.add(newExpenseId.intValue());
                    budget.setBudgetHasExpenses(!expenseIds.isEmpty());
                    budgetRepository.save(budget);
                    
                    log.info("Replaced expense ID {} with {} in budget {}", 
                        oldExpenseId, newExpenseId, oldBudgetId);
                    
                    // Notify Expense Service to link this budget to the expense
                    publishExpenseBudgetLinkUpdate(newExpenseId, oldBudgetId, userId);
                    
                } else {
                    log.warn("Old expense ID {} not found in budget {}", oldExpenseId, oldBudgetId);
                }
                
            } catch (Exception e) {
                log.error("Error replacing expense ID in budget {}", oldBudgetId, e);
            }
        }
    }

    /**
     * Find budget by ID and user ID
     */
    public Budget findBudgetById(Integer budgetId, Integer userId) {
        try {
            Budget budget = budgetRepository.findById(budgetId).orElse(null);
            if (budget != null && budget.getUserId().equals(userId)) {
                return budget;
            }
            return null;
        } catch (Exception e) {
            log.error("Error finding budget with ID: {}", budgetId, e);
            return null;
        }
    }

    /**
     * Add expenses to an existing budget
     */
    @Transactional
    public void addExpensesToExistingBudget(
        Long budgetId,
        List<Long> newExpenseIds,
        Integer userId
    ) {
        try {
            Budget budget = budgetRepository.findById(budgetId.intValue()).orElse(null);
            
            if (budget == null) {
                log.warn("Budget not found with ID: {}", budgetId);
                return;
            }
            
            if (!budget.getUserId().equals(userId)) {
                log.warn("Unauthorized access to budget: {}", budgetId);
                return;
            }
            
            // Add new expense IDs to the budget
            Set<Integer> expenseIds = budget.getExpenseIds();
            for (Long expenseId : newExpenseIds) {
                expenseIds.add(expenseId.intValue());
            }
            
            budget.setBudgetHasExpenses(!expenseIds.isEmpty());
            budgetRepository.save(budget);
            
            log.info("Added {} expenses to existing budget {}", newExpenseIds.size(), budgetId);
            
            // Notify Expense Service to link this budget to each expense
            for (Long expenseId : newExpenseIds) {
                publishExpenseBudgetLinkUpdate(expenseId, budgetId, userId);
            }
            
        } catch (Exception e) {
            log.error("Error adding expenses to budget {}", budgetId, e);
        }
    }
}
