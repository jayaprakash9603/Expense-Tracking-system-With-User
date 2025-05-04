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
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class BudgetServiceImpl implements BudgetService {

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private AuditExpenseService auditExpenseService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    @Lazy
    private ExpenseService expenseService;

    @Autowired
    private UserService userService;

    @Override
    public Budget createBudget(Budget budget, Integer userId) throws UserException {
        if (budget.getStartDate() == null || budget.getEndDate() == null) {
            throw new IllegalArgumentException("Start date and end date must not be null.");
        }

        if (budget.getStartDate().isAfter(budget.getEndDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date.");
        }

        if (budget.getAmount() < 0) {
            throw new IllegalArgumentException("Budget amount cannot be negative.");
        }

        if (budget.getName() == null || budget.getName().isEmpty()) {
            throw new IllegalArgumentException("Budget name cannot be empty.");
        }

        if (budget.getRemainingAmount() <= 0) {
            budget.setRemainingAmount(budget.getAmount());
        }

        User user = userService.findUserById(userId);
        if (user == null) {
            throw new UserException("User not found.");
        }

        List<Expense> expenses = expenseRepository.findByUserIdAndDateBetweenAndIncludeInBudgetTrue(
                userId, budget.getStartDate(), budget.getEndDate()
        );

        budget.setBudgetHasExpenses(!expenses.isEmpty());
        budget.setUser(user);

        Budget savedBudget = budgetRepository.save(budget);
        auditExpenseService.logAudit(user, savedBudget.getId(), "Budget Created", budget.getName());
        return savedBudget;
    }





    @Override
    public Budget editBudget(Integer budgetId, Budget budget, Integer userId) throws Exception {
        Optional<Budget> existingBudgetOpt = budgetRepository.findByUserIdAndId(userId, budgetId);

        if (existingBudgetOpt.isPresent()) {
            Budget existingBudget = existingBudgetOpt.get();

            if (budget.getStartDate().isAfter(budget.getEndDate())) {
                throw new IllegalArgumentException("Start date cannot be after end date.");
            }

            if (budget.getAmount() < 0) {
                throw new IllegalArgumentException("Budget amount cannot be negative.");
            }

            if (budget.getName() == null || budget.getName().isEmpty()) {
                throw new IllegalArgumentException("Budget name cannot be empty.");
            }

            existingBudget.setAmount(budget.getAmount());
            existingBudget.setStartDate(budget.getStartDate());
            existingBudget.setEndDate(budget.getEndDate());
            existingBudget.setDescription(budget.getDescription());
            existingBudget.setName(budget.getName());

            List<Expense> expenses = expenseRepository.findByUserIdAndDateBetweenAndIncludeInBudgetTrue(
                    userId, budget.getStartDate(), budget.getEndDate()
            );
            existingBudget.setBudgetHasExpenses(!expenses.isEmpty());

            BudgetReport budgetReport = calculateBudgetReport(userId, budgetId);
            existingBudget.setRemainingAmount(budgetReport.getRemainingAmount());

            auditExpenseService.logAudit(
                    userService.findUserById(userId),
                    existingBudget.getId(),
                    "Budget Edited",
                    existingBudget.getName()
            );

            return budgetRepository.save(existingBudget);
        } else {
            throw new RuntimeException("Budget not found");
        }
    }



    @Override
    public void deleteBudget(Integer budgetId,Integer userId) throws UserException {
        Optional<Budget> existingBudgetOpt = budgetRepository.findByUserIdAndId(userId, budgetId);
        if (existingBudgetOpt.isPresent()) {
            budgetRepository.delete(existingBudgetOpt.get());
            auditExpenseService.logAudit( userService.findUserById(userId), budgetId, "Budget Deleted", existingBudgetOpt.get().getName());
        } else {
            throw new RuntimeException("Budget not found");
        }
    }

    @Override
    public void deleteAllBudget(Integer userId) throws UserException {
        List<Budget> budgets = budgetRepository.findByUserId(userId);
        if (!budgets.isEmpty()) {
            budgetRepository.deleteAll(budgets);
            auditExpenseService.logAudit(
                    userService.findUserById(userId),
                    null,
                    "Budget Deleted",
                    "All Budgets are deleted"
            );
        } else {
            throw new RuntimeException("Budget not found");
        }
    }

    @Override
    public boolean isBudgetValid(Integer budgetId) {
        Optional<Budget> budgetOpt = budgetRepository.findById(budgetId);
        if (budgetOpt.isPresent()) {
            Budget budget = budgetOpt.get();
            LocalDate today = LocalDate.now();
            return today.isAfter(budget.getStartDate()) && today.isBefore(budget.getEndDate());
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
            if (isBudgetValid(budgetId)) {
                budget.deductAmount( expenseAmount);
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
        return expenseRepository.findByUserIdAndDateBetweenAndIncludeInBudgetTrue(userId, budget.getStartDate(), budget.getEndDate());
    }


    @Override
    public BudgetReport calculateBudgetReport(Integer userId, Integer budgetId) throws Exception {
        Optional<Budget> optionalBudget = budgetRepository.findByUserIdAndId(userId, budgetId);

        if (!optionalBudget.isPresent()) {
            throw new Exception("Budget not found.");
        }

        Budget budget = optionalBudget.get();

        if (!budget.getUser().getId().equals(userId)) {
            throw new Exception("You do not have access to this budget.");
        }

        List<Expense> expenses = expenseRepository.findByUserIdAndDateBetweenAndIncludeInBudgetTrue(
                userId,
                budget.getStartDate(),
                budget.getEndDate()
        );

        double totalCashLosses = expenses.stream()
                .filter(expense ->
                        "cash".equalsIgnoreCase(expense.getExpense().getPaymentMethod()) &&
                                "loss".equalsIgnoreCase(expense.getExpense().getType()))
                .mapToDouble(expense -> expense.getExpense().getAmount())
                .sum();

        double totalCreditLosses = expenses.stream()
                .filter(expense ->
                        "creditNeedToPaid".equalsIgnoreCase(expense.getExpense().getPaymentMethod()) &&
                                "loss".equalsIgnoreCase(expense.getExpense().getType()))
                .mapToDouble(expense -> expense.getExpense().getAmount())
                .sum();

        double totalExpenses = expenses.stream()
                .mapToDouble(expense -> expense.getExpense().getAmount())
                .sum();

        double remainingAmount = budget.getAmount() - totalExpenses;

        boolean isBudgetValid = isBudgetValid(budgetId);

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

    @Override
    public List<Budget> getBudgetsForDate(Integer userId, LocalDate date) {
        return budgetRepository.findByUserIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(userId, date, date);
    }


}