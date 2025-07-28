//package com.jaya.service.expenses;
//
//
//import com.jaya.models.Expense;
//import com.jaya.models.ExpenseDetails;
//import java.time.LocalDate;
//import java.util.List;
//import java.util.Map;
//
///**
// * Service for complex expense queries and filtering
// */
//public interface ExpenseQueryService {
//
//    // Date-based queries
//    List<Expense> getExpensesByDate(LocalDate date, Integer userId);
//    List<Expense> getExpensesByDateRange(LocalDate from, LocalDate to, Integer userId);
//    List<Expense> getExpensesForToday(Integer userId);
//    List<Expense> getExpensesForCurrentMonth(Integer userId);
//    List<Expense> getExpensesForLastMonth(Integer userId);
//    List<Expense> getExpensesByCurrentWeek(Integer userId);
//    List<Expense> getExpensesByLastWeek(Integer userId);
//    List<Expense> getExpensesByMonthAndYear(int month, int year, Integer userId);
//
//    // Search and filter
//    List<Expense> searchExpensesByName(String expenseName, Integer userId);
//    List<Expense> filterExpenses(String expenseName, LocalDate startDate, LocalDate endDate,
//                                 String type, String paymentMethod, Double minAmount, Double maxAmount, Integer userId);
//
//    // Type and payment method queries
//    List<Expense> getExpensesByType(String type, Integer userId);
//    List<Expense> getExpensesByPaymentMethod(String paymentMethod, Integer userId);
//    List<Expense> getExpensesByTypeAndPaymentMethod(String type, String paymentMethod, Integer userId);
//
//    // Top/ranking queries
//    List<Expense> getTopNExpenses(int n, Integer userId);
//    List<Expense> getTopGains(Integer userId);
//    List<Expense> getTopLosses(Integer userId);
//    List<Expense> getLossExpenses(Integer userId);
//
//    // Amount-based queries
//    List<ExpenseDetails> getExpenseDetailsByAmount(double amount, Integer userId);
//    List<Expense> getExpenseDetailsByAmountRange(double minAmount, double maxAmount, Integer userId);
//    List<ExpenseDetails> getExpensesByName(String expenseName, Integer userId);
//
//    // Specialized queries
//    Expense getExpensesBeforeDate(Integer userId, String expenseName, LocalDate date);
//    List<Expense> getExpensesWithinRange(Integer userId, LocalDate startDate, LocalDate endDate, String flowType);
//}