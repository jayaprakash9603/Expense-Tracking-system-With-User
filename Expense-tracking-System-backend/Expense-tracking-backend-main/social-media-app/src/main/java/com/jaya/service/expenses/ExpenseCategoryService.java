//package com.jaya.service.expenses;
//
//
//import com.jaya.models.Category;
//import com.jaya.models.Expense;
//import java.time.LocalDate;
//import java.util.List;
//import java.util.Map;
//
///**
// * Service for expense category operations
// */
//public interface ExpenseCategoryService {
//
//    // Category-based expense retrieval
//    List<Expense> getExpensesByCategoryId(Integer categoryId, Integer userId);
//    Map<Category, List<Expense>> getAllExpensesByCategories(Integer userId);
//
//    // Filtered category operations
//    Map<String, Object> getFilteredExpensesByCategories(Integer userId, String rangeType, int offset, String flowType);
//    Map<String, Object> getFilteredExpensesByDateRange(Integer userId, LocalDate fromDate, LocalDate toDate, String flowType);
//    Map<String, Object> getFilteredExpensesByPaymentMethod(Integer userId, LocalDate fromDate, LocalDate toDate, String flowType);
//    Map<String, Object> getFilteredExpensesByPaymentMethod(Integer userId, String rangeType, int offset, String flowType);
//
//    // Category totals
//    List<Map<String, Object>> getTotalByCategory(Integer userId);
//
//    // Budget integration
//    List<Expense> getExpensesInBudgetRangeWithIncludeFlag(LocalDate startDate, LocalDate endDate,
//                                                          Integer budgetId, Integer userId) throws Exception;
//    List<Expense> findByUserIdAndDateBetweenAndIncludeInBudgetTrue(LocalDate from, LocalDate to, Integer userId);
//}