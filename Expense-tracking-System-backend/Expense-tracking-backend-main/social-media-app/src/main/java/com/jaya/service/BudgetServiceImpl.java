package com.jaya.service;

import com.jaya.dto.BudgetReport;
import com.jaya.exceptions.UserException;
import com.jaya.models.Budget;
import com.jaya.models.Expense;
import com.jaya.models.User;
import com.jaya.repository.BudgetRepository;
import com.jaya.repository.ExpenseRepository;
import com.jaya.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class BudgetServiceImpl implements BudgetService {

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private UserService userService;

    @Override
    public Budget createBudget(Budget budget,Integer userId) throws UserException {
        User user = userService.findUserById(userId);
        budget.setUser(user);
        return budgetRepository.save(budget);
    }

    @Override
    public Budget editBudget(Integer budgetId, Budget budget,Integer userId) {
        Optional<Budget> existingBudgetOpt = budgetRepository.findByUserIdAndId(userId, budgetId);

        if (existingBudgetOpt.isPresent()) {
            Budget existingBudget = existingBudgetOpt.get();
            existingBudget.setAmount(budget.getAmount());
            existingBudget.setStartDate(budget.getStartDate());
            existingBudget.setEndDate(budget.getEndDate());
            return budgetRepository.save(existingBudget);
        } else {
            throw new RuntimeException("Budget not found");
        }
    }

    @Override
    public void deleteBudget(Integer budgetId,Integer userId) {
        Optional<Budget> existingBudgetOpt = budgetRepository.findByUserIdAndId(userId, budgetId);
        if (existingBudgetOpt.isPresent()) {
            budgetRepository.delete(existingBudgetOpt.get());
        } else {
            throw new RuntimeException("Budget not found");
        }
    }

    @Override
    public List<Budget> getBudgetsForUser(Integer userId) {
        return budgetRepository.findByUserIdAndStartDateBeforeAndEndDateAfter(userId, LocalDate.now(), LocalDate.now());
    }

    @Override
    public Budget getBudgetById(Integer budgetId, Integer userId) throws Exception {
        Optional<Budget> expense=  budgetRepository.findById(budgetId);
        if(expense.isEmpty())
        {
            throw new Exception("budget is not present"+budgetId);
        }
        if(!expense.get().getUser().getId().equals(userId))
        {
            throw new Exception("you cant get other users budget");
        }
        return expense.get();
    }


    @Override
    public Budget deductAmount(Integer userId, Integer budgetId, double expenseAmount) {
        Optional<Budget> budgetOpt = budgetRepository.findByUserIdAndId(userId, budgetId);

        if (budgetOpt.isPresent()) {
            Budget budget = budgetOpt.get();
            if (budget.isBudgetValid()) {
                budget.deductAmount(expenseAmount);
                return budgetRepository.save(budget);
            } else {
                throw new RuntimeException("Budget is no longer valid");
            }
        } else {
            throw new RuntimeException("Budget not found");
        }
    }



    @Override
    public List<Expense> getExpensesForUserWithinBudgetDates(Integer userId, Integer budgetId) throws Exception {
        Budget budget = budgetRepository.findById(budgetId).orElseThrow(() -> new Exception("Budget not found"));
        if (!budget.getUser().getId().equals(userId)) {
            throw new Exception("You can't access another user's budget");
        }
        return expenseRepository.findByUserIdAndDateBetween(userId, budget.getStartDate(), budget.getEndDate());
    }


        @Override
        public BudgetReport calculateBudgetReport(Integer userId, Integer budgetId) throws Exception {
            Budget budget = budgetRepository.findById(budgetId)
                    .orElseThrow(() -> new Exception("Budget not found"));

            if (!budget.getUser().getId().equals(userId)) {
                throw new Exception("You do not have access to this budget.");
            }

            List<Expense> expenses = expenseRepository.findByUserIdAndDateBetween(userId, budget.getStartDate(), budget.getEndDate());

            double totalCashLosses = expenses.stream()
                    .filter(expense -> "cash".equals(expense.getExpense().getPaymentMethod()) && "loss".equals(expense.getExpense().getType()))
                    .mapToDouble(expense -> expense.getExpense().getAmount())
                    .sum();

            double totalCreditLosses = expenses.stream()
                    .filter(expense -> "creditNeedToPaid".equals(expense.getExpense().getPaymentMethod()) && "loss".equals(expense.getExpense().getType()))
                    .mapToDouble(expense -> expense.getExpense().getAmount())
                    .sum();

            double totalExpenses = expenses.stream()
                    .mapToDouble(expense -> expense.getExpense().getAmount())
                    .sum();
            double remainingAmount = budget.getAmount() - totalExpenses;
            boolean isBudgetValid = budget.isBudgetValid();

            return new BudgetReport(
                    budget.getId(),
                    budget.getAmount(),
                    budget.getStartDate(),
                    budget.getEndDate(),
                    remainingAmount,
                    isBudgetValid,
                    totalCashLosses,
                    totalCreditLosses
            );
        }

    @Override
    public List<Budget> getAllBudgetForUser(Integer userId) {
        return budgetRepository.findByUserId(userId);
    }


    @Override
    public List<BudgetReport> getAllBudgetReportsForUser(Integer userId) throws Exception {
        List<Budget> budgets = budgetRepository.findByUserId(userId);
        List<BudgetReport> budgetReports = new ArrayList<>();
        for (Budget budget : budgets) {
            BudgetReport report = calculateBudgetReport(userId, budget.getId());
            budgetReports.add(report);
        }
        return budgetReports;
    }

}