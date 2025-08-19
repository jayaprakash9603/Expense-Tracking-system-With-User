package com.jaya.service.expenses;

import com.jaya.models.Category;
import com.jaya.models.Expense;
import java.util.List;
import java.util.Map;

/**
 * Service for expense category-related operations 11 methods
 */
public interface ExpenseCategoryService {

    // Category-based queries
    List<Expense> getExpensesByCategoryId(Integer categoryId, Integer userId);
    Map<Category, List<Expense>> getAllExpensesByCategories(Integer userId) throws Exception;

    // Category analytics
    List<Map<String, Object>> getTotalByCategory(Integer userId);
//    Map<String, Object> getCategoryDistribution(Integer userId);
//    Map<String, Double> getCategoryWiseTotals(Integer userId);

    // Category filtering
//    Map<String, Object> getFilteredExpensesByCategories(
//            Integer userId,
//            List<Integer> categoryIds,
//            String dateRange,
//            String flowType
//    ) throws Exception;

    // Category insights
//    List<Map<String, Object>> getTopCategoriesByAmount(Integer userId, int limit);
//    List<Map<String, Object>> getCategoryTrends(Integer userId, int year);
//    Map<String, Object> getCategoryComparison(Integer userId, int year1, int year2);

    // Category validation
//    boolean isCategoryValid(Integer categoryId);
//    boolean canUserAccessCategory(Integer categoryId, Integer userId);
}