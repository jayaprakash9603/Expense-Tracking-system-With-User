package com.jaya.service;

import com.jaya.dto.BudgetReport;
import com.jaya.exceptions.UserException;
import com.jaya.models.Budget;
import com.jaya.models.Expense;

import java.time.LocalDate;
import java.util.List;

public interface BudgetService {

    // Create a new budget
    Budget createBudget(Budget budget,Integer userId) throws UserException;

    // Edit an existing budget
    Budget editBudget(Integer budgetId, Budget budget,Integer userId) throws Exception;

    // Delete a budget by ID
    void deleteBudget(Integer budgetId,Integer userId) throws UserException;

    // Get all budgets for a specific user
    List<Budget> getBudgetsForUser(Integer userId);

    Budget getBudgetById(Integer budgetId,Integer userId) throws Exception;

    List<Budget> getBudgetsByDate(LocalDate date, Integer userId);

    // Deduct amount from the budget
    Budget deductAmount(Integer userId, Integer budgetId, double expenseAmount);


    List<Expense> getExpensesForUserWithinBudgetDates(Integer userId, Integer budgetId) throws Exception;


    List<Expense> getExpensesForUserByBudgetId(Integer userId, Integer budgetId) throws Exception;
    BudgetReport calculateBudgetReport(Integer userId, Integer budgetId) throws Exception;

    List<Budget> getAllBudgetForUser(Integer userId);

    List<BudgetReport> getAllBudgetReportsForUser(Integer userId) throws Exception;

    List<Budget> getBudgetsForDate(Integer userId, LocalDate date);

    boolean isBudgetValid(Integer budgetId);
    void deleteAllBudget(Integer userId) throws UserException;


    List<Budget> getBudgetsByExpenseId(Integer expenseId, Integer userId, LocalDate expenseDate);
}