package com.jaya.common.service.client;

import com.jaya.common.dto.ExpenseDTO;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

/**
 * Interface for Expense Service client operations.
 * Implementations:
 * - FeignExpenseServiceClient: @Profile("!monolithic") - calls remote EXPENSE-SERVICE
 * - LocalExpenseServiceClient: @Profile("monolithic") - calls ExpenseService bean directly
 */
public interface IExpenseServiceClient {

    /**
     * Save an expense.
     *
     * @param expense the expense to save
     * @return the saved expense
     */
    ExpenseDTO save(ExpenseDTO expense);

    /**
     * Get expense by ID.
     *
     * @param expenseId the expense ID
     * @param userId the user ID
     * @return the expense
     */
    ExpenseDTO getExpenseById(Integer expenseId, Integer userId);

    /**
     * Find expenses by user ID and date range for budget calculations.
     *
     * @param startDate the start date
     * @param endDate the end date
     * @param userId the user ID
     * @return list of expenses within the date range
     */
    List<ExpenseDTO> findByUserIdAndDateBetweenAndIncludeInBudgetTrue(
            LocalDate startDate, LocalDate endDate, Integer userId);

    /**
     * Get all expenses for a user.
     *
     * @param userId the user ID
     * @return list of expenses
     */
    List<ExpenseDTO> getAllExpenses(Integer userId);

    /**
     * Get all expenses with sorting.
     *
     * @param userId the user ID
     * @param sort the sort field
     * @return sorted list of expenses
     */
    List<ExpenseDTO> getAllExpensesWithSort(Integer userId, String sort);

    /**
     * Get expenses by IDs.
     *
     * @param userId the user ID
     * @param expenseIds set of expense IDs
     * @return list of expenses
     */
    List<ExpenseDTO> getExpensesByIds(Integer userId, Set<Integer> expenseIds);
}
