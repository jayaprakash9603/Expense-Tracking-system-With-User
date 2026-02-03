package com.jaya.service.interfaces;

import com.jaya.dto.ExpenseDTO;
import com.jaya.models.Category;

import java.util.List;
import java.util.Set;

/**
 * Interface for category-expense association operations.
 * Follows Interface Segregation Principle (ISP).
 */
public interface ICategoryExpenseService {

    /**
     * Associate expenses with a category.
     *
     * @param categoryId The category ID
     * @param userId     The user ID
     * @param expenseIds The expense IDs to associate
     * @return The updated category
     */
    Category associateExpenses(Integer categoryId, Integer userId, Set<Integer> expenseIds);

    /**
     * Remove expenses from a category.
     *
     * @param categoryId The category ID
     * @param userId     The user ID
     * @param expenseIds The expense IDs to remove
     * @return The updated category
     */
    Category disassociateExpenses(Integer categoryId, Integer userId, Set<Integer> expenseIds);

    /**
     * Get all expenses in a category for a user.
     *
     * @param categoryId The category ID
     * @param userId     The user ID
     * @return List of expenses
     */
    List<ExpenseDTO> getExpensesInCategory(Integer categoryId, Integer userId);

    /**
     * Move expenses from one category to another.
     *
     * @param fromCategoryId The source category ID
     * @param toCategoryId   The destination category ID
     * @param userId         The user ID
     * @param expenseIds     The expense IDs to move
     */
    void moveExpenses(Integer fromCategoryId, Integer toCategoryId, Integer userId, Set<Integer> expenseIds);
}
