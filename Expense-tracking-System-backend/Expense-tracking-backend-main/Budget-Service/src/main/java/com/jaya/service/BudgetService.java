package com.jaya.service;

import com.jaya.dto.BudgetReport;
import com.jaya.dto.DetailedBudgetReport;
import com.jaya.dto.ExpenseDTO;
import com.jaya.models.Budget;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;

public interface BudgetService {

    // Create a new budget
    Budget createBudget(Budget budget, Integer userId) throws Exception;

    Budget createBudgetForFriend(Budget budget, Integer userId, Integer friendId) throws Exception;

    Set<Budget> editBudgetWithExpenseId(Set<Integer> budgetIds, Integer expenseId, Integer userId) throws Exception;

    Budget save(Budget budget);

    Set<Budget> getBudgetsByBudgetIds(Set<Integer> budgetIds, Integer userId) throws Exception;

    // Edit an existing budget
    Budget editBudget(Integer budgetId, Budget budget, Integer userId) throws Exception;

    // Delete a budget by ID
    void deleteBudget(Integer budgetId, Integer userId) throws Exception;

    // Get all budgets for a specific user
    List<Budget> getBudgetsForUser(Integer userId);

    Budget getBudgetById(Integer budgetId, Integer userId) throws Exception;

    List<Budget> getBudgetsByDate(LocalDate date, Integer userId);

    // Deduct amount from the budget
    Budget deductAmount(Integer userId, Integer budgetId, double expenseAmount);

    List<ExpenseDTO> getExpensesForUserWithinBudgetDates(Integer userId, Integer budgetId) throws Exception;

    List<ExpenseDTO> getExpensesForUserByBudgetId(Integer userId, Integer budgetId) throws Exception;

    BudgetReport calculateBudgetReport(Integer userId, Integer budgetId) throws Exception;

    List<Budget> getAllBudgetForUser(Integer userId);

    List<BudgetReport> getAllBudgetReportsForUser(Integer userId) throws Exception;

    List<Budget> getBudgetsForDate(Integer userId, LocalDate date);

    boolean isBudgetValid(Integer budgetId);

    void deleteAllBudget(Integer userId) throws Exception;

    List<Budget> getBudgetsByExpenseId(Integer expenseId, Integer userId, LocalDate expenseDate);

    // Calculate detailed budget report with all analytics
    DetailedBudgetReport calculateDetailedBudgetReport(Integer userId, Integer budgetId) throws Exception;

    /**
     * Get all budgets for a user with their filtered expenses aggregated.
     * Supports either an explicit date range (fromDate & toDate) or a relative
     * range
     * using rangeType + offset (e.g., week/month with offset navigation).
     * Optionally filter by flowType (loss/gain/all) similar to expense endpoints.
     *
     * @param userId    the user whose budgets to fetch
     * @param fromDate  optional start date (inclusive) when explicit range used
     * @param toDate    optional end date (inclusive) when explicit range used
     * @param rangeType optional relative range type (e.g., day, week, month, year)
     * @param offset    relative offset for the range (0 current, -1 previous, +1
     *                  next)
     * @param flowType  optional flow filter (loss, gain, all/null)
     * @return Map containing summary and list of budgets with expense breakdowns
     * @throws Exception on validation or data access errors
     */
    Map<String, Object> getFilteredBudgetsWithExpenses(Integer userId,
            LocalDate fromDate,
            LocalDate toDate,
            String rangeType,
            int offset,
            String flowType) throws Exception;

    /**
     * Get single budget detailed report with expenses grouped by expense name.
     * Similar to getFilteredBudgetsWithExpenses but for a single budget.
     *
     * @param userId    the user whose budget to fetch
     * @param budgetId  the specific budget ID
     * @param fromDate  optional start date filter
     * @param toDate    optional end date filter
     * @param rangeType optional range type (day/week/month/year/all)
     * @param offset    offset for range type
     * @param flowType  optional flow type filter (loss/gain/all)
     * @return Map containing summary and expenses grouped by expense name
     * @throws Exception on validation or data access errors
     */
    Map<String, Object> getSingleBudgetDetailedReport(Integer userId, Integer budgetId, LocalDate fromDate,
            LocalDate toDate, String rangeType, int offset, String flowType) throws Exception;
}