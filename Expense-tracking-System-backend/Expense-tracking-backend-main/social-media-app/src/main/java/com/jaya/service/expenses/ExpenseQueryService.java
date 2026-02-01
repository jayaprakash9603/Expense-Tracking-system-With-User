package com.jaya.service.expenses;

import com.jaya.dto.ExpenseSearchDTO;
import com.jaya.models.Expense;
import com.jaya.models.ExpenseDetails;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Service for complex expense queries and filtering 31 methods
 */
public interface ExpenseQueryService {

    // Date-based queries
    List<Expense> getExpensesByDate(LocalDate date, Integer userId);

    List<Expense> getExpensesByDateString(String dateString, Integer userId) throws Exception;

    List<Expense> getExpensesByDateRange(LocalDate from, LocalDate to, Integer userId);

    List<Expense> getExpensesForToday(Integer userId);

    List<Expense> getExpensesForCurrentMonth(Integer userId);

    List<Expense> getExpensesForLastMonth(Integer userId);

    List<Expense> getExpensesByCurrentWeek(Integer userId);

    List<Expense> getExpensesByLastWeek(Integer userId);

    List<Expense> getExpensesByMonthAndYear(int month, int year, Integer userId);

    List<Expense> getExpensesByMonth(int year, int month);

    // Search and filter
    List<Expense> searchExpensesByName(String expenseName, Integer userId);

    List<Expense> filterExpenses(String expenseName, LocalDate startDate, LocalDate endDate,
            String type, String paymentMethod, Double minAmount, Double maxAmount, Integer userId);

    // Type and payment method queries
    List<Expense> getExpensesByType(String type, Integer userId);

    List<Expense> getExpensesByPaymentMethod(String paymentMethod, Integer userId);

    List<Expense> getExpensesByTypeAndPaymentMethod(String type, String paymentMethod, Integer userId);

    List<Expense> getLossExpenses(Integer userId);

    // Top/ranking queries
    List<Expense> getTopNExpenses(int n, Integer userId);

    List<Expense> getTopGains(Integer userId);

    List<Expense> getTopLosses(Integer userId);

    // Amount-based queries
    List<ExpenseDetails> getExpenseDetailsByAmount(double amount, Integer userId);

    List<Expense> getExpenseDetailsByAmountRange(double minAmount, double maxAmount, Integer userId);

    List<ExpenseDetails> getExpensesByName(String expenseName, Integer userId);

    // Specialized queries
    Expense getExpensesBeforeDate(Integer userId, String expenseName, LocalDate date);

    List<Expense> getExpensesWithinRange(Integer userId, LocalDate startDate, LocalDate endDate, String flowType);

    List<Expense> findByUserIdAndDateBetweenAndIncludeInBudgetTrue(LocalDate from, LocalDate to, Integer userId);

    List<Expense> getExpensesInBudgetRangeWithIncludeFlag(LocalDate startDate, LocalDate endDate,
            Integer budgetId, Integer userId) throws Exception;

    // Complex filtered queries
    Map<String, Object> getFilteredExpensesByCategories(Integer userId, String rangeType, int offset, String flowType)
            throws Exception;

    Map<String, Object> getFilteredExpensesByDateRange(Integer userId, LocalDate fromDate, LocalDate toDate,
            String flowType) throws Exception;

    Map<String, Object> getFilteredExpensesByPaymentMethod(Integer userId, LocalDate fromDate, LocalDate toDate,
            String flowType);

    Map<String, Object> getFilteredExpensesByPaymentMethod(Integer userId, String rangeType, int offset,
            String flowType);

    // Pagination and grouping
    Map<String, Object> getExpensesGroupedByDateWithValidation(Integer userId, int page, int size, String sortBy,
            String sortOrder) throws Exception;

    Map<String, List<Map<String, Object>>> getExpensesGroupedByDateWithPagination(Integer userId, String sortOrder,
            int page, int size, String sortBy) throws Exception;

    Map<String, Object> computeFieldFrequency(List<Expense> expenses, String fieldName);

    String getMostFrequentValue(List<Expense> expenses, String fieldName);

    /**
     * Fuzzy search expenses by name, comments, or payment method.
     * Supports partial text matching for typeahead/search functionality.
     * Optimized query - avoids N+1 problem by returning DTOs.
     * 
     * @param userId the user whose expenses to search
     * @param query  the search query (partial match supported)
     * @param limit  maximum number of results to return
     * @return List of ExpenseSearchDTO matching the search criteria
     */
    List<ExpenseSearchDTO> searchExpensesFuzzy(Integer userId, String query, int limit);
}