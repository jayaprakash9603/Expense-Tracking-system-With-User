package com.jaya.service;

import com.jaya.dto.BudgetReport;
import com.jaya.exceptions.UserException;
import com.jaya.models.Budget;
import com.jaya.models.Expense;

import java.util.List;

public interface BudgetService {

    // Create a new budget
    Budget createBudget(Budget budget,Integer userId) throws UserException;

    // Edit an existing budget
    Budget editBudget(Integer budgetId, Budget budget,Integer userId);

    // Delete a budget by ID
    void deleteBudget(Integer budgetId,Integer userId);

    // Get all budgets for a specific user
    List<Budget> getBudgetsForUser(Integer userId);

    Budget getBudgetById(Integer budgetId,Integer userId) throws Exception;

    // Deduct amount from the budget
    Budget deductAmount(Integer userId, Integer budgetId, double expenseAmount);


    List<Expense> getExpensesForUserWithinBudgetDates(Integer userId, Integer budgetId) throws Exception;

    BudgetReport calculateBudgetReport(Integer userId, Integer budgetId) throws Exception;

    List<Budget> getAllBudgetForUser(Integer userId);

    List<BudgetReport> getAllBudgetReportsForUser(Integer userId) throws Exception;
}