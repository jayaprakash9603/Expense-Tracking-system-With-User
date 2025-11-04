package com.jaya.util;

import com.jaya.models.Budget;
import com.jaya.repository.BudgetRepository;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Utility class providing optimized batch operations for Budget entities.
 * 
 * This class demonstrates best practices for avoiding N+1 query problems
 * by leveraging the optimized repository methods.
 * 
 * @author Budget Service Team
 */
@Component
public class BudgetBatchOperations {

    private final BudgetRepository budgetRepository;

    public BudgetBatchOperations(BudgetRepository budgetRepository) {
        this.budgetRepository = budgetRepository;
    }

    /**
     * Fetch multiple budgets efficiently using batch query
     * 
     * ❌ BAD: Looping and calling findById N times (N+1 problem)
     * ✅ GOOD: Single batch query
     * 
     * @param budgetIds List of budget IDs to fetch
     * @param userId    User ID for security filtering
     * @return Map of budgetId to Budget entity
     */
    public Map<Integer, Budget> fetchBudgetsByIds(List<Integer> budgetIds, Integer userId) {
        if (budgetIds == null || budgetIds.isEmpty()) {
            return Collections.emptyMap();
        }

        // Single query fetches all budgets at once
        List<Budget> budgets = budgetRepository.findByIdInAndUserId(budgetIds, userId);

        // Convert to map for easy lookup
        return budgets.stream()
                .collect(Collectors.toMap(Budget::getId, budget -> budget));
    }

    /**
     * Fetch budgets by IDs and return as a list
     * 
     * @param budgetIds Set of budget IDs to fetch
     * @param userId    User ID for security filtering
     * @return List of Budget entities
     */
    public List<Budget> fetchBudgetsAsList(Set<Integer> budgetIds, Integer userId) {
        if (budgetIds == null || budgetIds.isEmpty()) {
            return Collections.emptyList();
        }

        return budgetRepository.findByIdInAndUserId(new ArrayList<>(budgetIds), userId);
    }

    /**
     * Check if all budget IDs exist for a user
     * 
     * @param budgetIds List of budget IDs to check
     * @param userId    User ID for security filtering
     * @return true if all budgets exist, false otherwise
     */
    public boolean validateBudgetIdsExist(List<Integer> budgetIds, Integer userId) {
        if (budgetIds == null || budgetIds.isEmpty()) {
            return true;
        }

        List<Budget> foundBudgets = budgetRepository.findByIdInAndUserId(budgetIds, userId);
        return foundBudgets.size() == budgetIds.size();
    }

    /**
     * Get missing budget IDs (IDs that don't exist in database)
     * 
     * @param budgetIds List of budget IDs to check
     * @param userId    User ID for security filtering
     * @return Set of missing budget IDs
     */
    public Set<Integer> getMissingBudgetIds(List<Integer> budgetIds, Integer userId) {
        if (budgetIds == null || budgetIds.isEmpty()) {
            return Collections.emptySet();
        }

        List<Budget> foundBudgets = budgetRepository.findByIdInAndUserId(budgetIds, userId);
        Set<Integer> foundIds = foundBudgets.stream()
                .map(Budget::getId)
                .collect(Collectors.toSet());

        return budgetIds.stream()
                .filter(id -> !foundIds.contains(id))
                .collect(Collectors.toSet());
    }

    /**
     * Example: Optimize the getBudgetsByBudgetIds method in BudgetServiceImpl
     * 
     * BEFORE (N+1 problem):
     * 
     * <pre>
     * Set<Budget> budgets = new HashSet<>();
     * for (Integer budgetId : budgetIds) {
     *     Budget budget = getBudgetById(budgetId, userId); // N queries
     *     if (budget != null) {
     *         budgets.add(budget);
     *     }
     * }
     * </pre>
     * 
     * AFTER (Single query):
     * 
     * <pre>
     * List<Budget> budgets = budgetRepository.findByIdInAndUserId(
     *         new ArrayList<>(budgetIds), userId); // 1 query
     * return new HashSet<>(budgets);
     * </pre>
     */
    public Set<Budget> getBudgetsByIdsOptimized(Set<Integer> budgetIds, Integer userId) {
        if (budgetIds == null || budgetIds.isEmpty()) {
            return Collections.emptySet();
        }

        List<Budget> budgets = budgetRepository.findByIdInAndUserId(
                new ArrayList<>(budgetIds), userId);
        return new HashSet<>(budgets);
    }
}
