package com.jaya.service;

import com.jaya.dto.BudgetReport;
import com.jaya.dto.BudgetSearchDTO;
import com.jaya.dto.DetailedBudgetReport;
import com.jaya.dto.ExpenseDTO;
import com.jaya.models.Budget;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;

public interface BudgetService {

        Budget createBudget(Budget budget, Integer userId) throws Exception;

        Budget createBudgetForFriend(Budget budget, Integer userId, Integer friendId) throws Exception;

        Set<Budget> editBudgetWithExpenseId(Set<Integer> budgetIds, Integer expenseId, Integer userId) throws Exception;

        Budget save(Budget budget);

        Set<Budget> getBudgetsByBudgetIds(Set<Integer> budgetIds, Integer userId) throws Exception;

        Budget editBudget(Integer budgetId, Budget budget, Integer userId) throws Exception;

        void deleteBudget(Integer budgetId, Integer userId) throws Exception;

        List<Budget> getBudgetsForUser(Integer userId);

        Budget getBudgetById(Integer budgetId, Integer userId) throws Exception;

        List<Budget> getBudgetsByDate(LocalDate date, Integer userId);

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

        DetailedBudgetReport calculateDetailedBudgetReport(Integer userId, Integer budgetId) throws Exception;

        Map<String, Object> getFilteredBudgetsWithExpenses(Integer userId,
                        LocalDate fromDate,
                        LocalDate toDate,
                        String rangeType,
                        int offset,
                        String flowType) throws Exception;

        Map<String, Object> getSingleBudgetDetailedReport(Integer userId, Integer budgetId, LocalDate fromDate,
                        LocalDate toDate, String rangeType, int offset, String flowType) throws Exception;

        List<BudgetSearchDTO> searchBudgets(Integer userId, String query, int limit);
}