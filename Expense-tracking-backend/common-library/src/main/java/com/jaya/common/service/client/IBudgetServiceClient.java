package com.jaya.common.service.client;

import com.jaya.common.dto.BudgetDTO;

import java.util.List;

/**
 * Interface for Budget Service client operations.
 * Implementations:
 * - FeignBudgetServiceClient: @Profile("!monolithic") - calls remote BUDGET-SERVICE
 * - LocalBudgetServiceClient: @Profile("monolithic") - calls BudgetService bean directly
 */
public interface IBudgetServiceClient {

    /**
     * Get budget by ID.
     *
     * @param budgetId the budget ID
     * @param userId the user ID
     * @return the budget
     */
    BudgetDTO getBudgetById(Integer budgetId, Integer userId);

    /**
     * Save a budget.
     *
     * @param budget the budget to save
     * @return the saved budget
     */
    BudgetDTO save(BudgetDTO budget);

    /**
     * Get all budgets for a user.
     *
     * @param userId the user ID
     * @return list of budgets
     */
    List<BudgetDTO> getAllBudgetForUser(Integer userId);
}
