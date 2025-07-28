//package com.jaya.service.expenses;
//
//
//import com.jaya.exceptions.UserException;
//import com.jaya.models.Expense;
//import com.jaya.dto.ExpenseDTO;
//import java.time.LocalDate;
//import java.util.List;
//
///**
// * Core expense service for basic CRUD operations
// */
//public interface ExpenseCoreService {
//
//    // Basic CRUD Operations
//    Expense addExpense(Expense expense, Integer userId) throws Exception;
//    Expense copyExpense(Integer userId, Integer expenseId) throws Exception;
//    Expense getExpenseById(Integer id, Integer userId);
//    Expense updateExpense(Integer id, Expense expense, Integer userId) throws Exception;
//    void deleteExpense(Integer id, Integer userId) throws Exception;
//
//    // Bulk Operations
//    List<Expense> addMultipleExpenses(List<Expense> expenses, Integer userId) throws Exception;
//    List<Expense> updateMultipleExpenses(Integer userId, List<Expense> expenses) throws Exception;
//    void deleteExpensesByIds(List<Integer> ids, Integer userId) throws Exception;
//
//    // Basic Queries
//    List<Expense> getAllExpenses(Integer userId);
//    List<Expense> getAllExpenses(Integer userId, String sortOrder);
//    List<Expense> getExpensesByUserAndSort(Integer userId, String sortOrder) throws UserException;
//    List<Expense> getExpensesByIds(List<Integer> ids);
//    List<Expense> saveExpenses(List<Expense> expenses);
//    List<Expense> saveExpenses(List<ExpenseDTO> expenseDTOs, Integer userId) throws Exception;
//}