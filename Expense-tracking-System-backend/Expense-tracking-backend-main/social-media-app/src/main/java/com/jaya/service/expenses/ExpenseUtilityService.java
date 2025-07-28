//package com.jaya.service.expenses;
//
//import com.jaya.dto.ExpenseDTO;
//import java.util.List;
//import java.util.Map;
//import java.util.Set;
//
///**
// * Service for expense utility operations and data processing
// */
//public interface ExpenseUtilityService {
//
//    // Data processing utilities
//    List<ExpenseDTO> validateAndProcessExpenses(List<ExpenseDTO> expenses);
//    double calculateTotalAmount(Map<String, Map<String, Double>> categorizedExpenses);
//    Map<String, Map<String, Double>> categorizeExpenses(List<ExpenseDTO> processedExpenses);
//    double calculateTotalCreditDue(List<ExpenseDTO> processedExpenses);
//
//    // Top items extraction
//    List<String> findTopExpenseNames(List<ExpenseDTO> expenses, int topN);
//    String findTopPaymentMethod(List<ExpenseDTO> expenses);
//    List<String> getTopExpenseNames(int topN, Integer userId);
//    List<String> getTopPaymentMethods(Integer userId);
//    List<String> getUniqueTopExpensesByGain(Integer userId, int limit);
//    List<String> getUniqueTopExpensesByLoss(Integer userId, int limit);
//
//    // Payment method utilities
//    List<String> getPaymentMethods(Integer userId);
//    Set<String> getPaymentMethodNames(List<ExpenseDTO> expenses);
//    Map<String, Map<String, Double>> getPaymentMethodSummary(Integer userId);
//
//    // Dropdown and configuration data
//    List<String> getDropdownValues();
//    List<String> getSummaryTypes();
//    List<String> getDailySummaryTypes();
//    List<String> getExpensesTypes();
//
//    // Data grouping utilities
//    Map<String, List<Map<String, Object>>> getExpensesGroupedByDate(Integer userId, String sortOrder);
//    Map<String, List<Map<String, Object>>> getExpensesGroupedByDateWithPagination(Integer userId, String sortOrder,
//                                                                                  int page, int size, String sortBy) throws Exception;
//}