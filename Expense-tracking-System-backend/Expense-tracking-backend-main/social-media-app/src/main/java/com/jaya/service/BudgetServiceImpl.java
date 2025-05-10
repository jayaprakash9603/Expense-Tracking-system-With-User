package com.jaya.service;

import com.jaya.dto.BudgetReport;
import com.jaya.exceptions.UserException;
import com.jaya.models.Budget;
import com.jaya.models.Expense;
import com.jaya.models.User;
import com.jaya.repository.BudgetRepository;
import com.jaya.repository.ExpenseRepository;
import com.jaya.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

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

        budget.setUser(user);
        Set<Integer> validExpenseIds = new HashSet<>();

        for (Integer expenseId : budget.getExpenseIds()) {
            Expense expense = expenseRepository.findByUserIdAndId(userId, expenseId);

            if (expense != null) {
                LocalDate expenseDate = expense.getDate();
                boolean isWithinDateRange = !expenseDate.isBefore(budget.getStartDate()) && !expenseDate.isAfter(budget.getEndDate());

                if (isWithinDateRange) {
                    validExpenseIds.add(expenseId);
                }
            }
        }

        budget.setExpenseIds(validExpenseIds);
        budget.setBudgetHasExpenses(!validExpenseIds.isEmpty());

        Budget savedBudget = budgetRepository.save(budget);

        for (Integer expenseId : savedBudget.getExpenseIds()) {
            Expense expense = expenseRepository.findByUserIdAndId(userId, expenseId);
            if (expense != null) {
                if (expense.getBudgetIds() == null) {
                    expense.setBudgetIds(new HashSet<>());
                }

                if (!expense.getBudgetIds().contains(savedBudget.getId())) {
                    expense.getBudgetIds().add(savedBudget.getId());
                    expenseRepository.save(expense);
                }
            }
        }

        auditExpenseService.logAudit(user, savedBudget.getId(), "Budget Created", budget.getName());
        return savedBudget;
    }






    @Override
    @Transactional
    public Budget editBudget(Integer budgetId, Budget budget, Integer userId) throws Exception {
        Optional<Budget> existingBudgetOpt = budgetRepository.findByUserIdAndId(userId, budgetId);

        if (existingBudgetOpt.isEmpty()) {
            throw new RuntimeException("Budget not found");
        }

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

        // Remove old associations
        Set<Integer> oldExpenseIds = existingBudget.getExpenseIds() != null
                ? new HashSet<>(existingBudget.getExpenseIds())
                : new HashSet<>();

        for (Integer oldExpenseId : oldExpenseIds) {
            Expense oldExpense = expenseRepository.findByUserIdAndId(userId, oldExpenseId);
            if (oldExpense != null && oldExpense.getBudgetIds() != null) {
                oldExpense.getBudgetIds().remove(budgetId);
                expenseRepository.save(oldExpense);
            }
        }

        // Filter and add only valid new expenses
        Set<Integer> validExpenseIds = new HashSet<>();
        for (Integer newExpenseId : budget.getExpenseIds()) {
            Expense expense = expenseRepository.findByUserIdAndId(userId, newExpenseId);
            if (expense != null) {
                LocalDate expenseDate = expense.getDate();
                boolean isWithinRange = !expenseDate.isBefore(budget.getStartDate()) && !expenseDate.isAfter(budget.getEndDate());

                if (isWithinRange) {
                    validExpenseIds.add(newExpenseId);

                    if (expense.getBudgetIds() == null) {
                        expense.setBudgetIds(new HashSet<>());
                    }

                    if (!expense.getBudgetIds().contains(budgetId)) {
                        expense.getBudgetIds().add(budgetId);
                        expenseRepository.save(expense);
                    }
                }
            }
        }

        existingBudget.setExpenseIds(validExpenseIds);
        existingBudget.setBudgetHasExpenses(!validExpenseIds.isEmpty());

        BudgetReport budgetReport = calculateBudgetReport(userId, budgetId);
        existingBudget.setRemainingAmount(budgetReport.getRemainingAmount());

        auditExpenseService.logAudit(
                userService.findUserById(userId),
                existingBudget.getId(),
                "Budget Edited",
                existingBudget.getName()
        );

        return budgetRepository.save(existingBudget);
    }





    @Override
    @Transactional
    public void deleteBudget(Integer budgetId, Integer userId) throws UserException {
        Optional<Budget> existingBudgetOpt = budgetRepository.findByUserIdAndId(userId, budgetId);

        if (existingBudgetOpt.isEmpty()) {
            throw new RuntimeException("Budget not found");
        }

        Budget budget = existingBudgetOpt.get();

        Set<Integer> expenseIds = budget.getExpenseIds();
        if (expenseIds != null) {
            for (Integer expenseId : expenseIds) {
                Expense expense = expenseRepository.findByUserIdAndId(userId, expenseId);
                if (expense != null && expense.getBudgetIds() != null) {
                    expense.getBudgetIds().remove(budgetId);
                    expenseRepository.save(expense);
                }
            }
        }

        budgetRepository.delete(budget);

        auditExpenseService.logAudit(
                userService.findUserById(userId),
                budgetId,
                "Budget Deleted",
                budget.getName()
        );
    }


    @Override
    @Transactional
    public void deleteAllBudget(Integer userId) throws UserException {
        List<Budget> budgets = budgetRepository.findByUserId(userId);

        if (budgets.isEmpty()) {
            throw new RuntimeException("No budgets found");
        }

        for (Budget budget : budgets) {
            Set<Integer> expenseIds = budget.getExpenseIds();
            if (expenseIds != null) {
                for (Integer expenseId : expenseIds) {
                    Expense expense = expenseRepository.findByUserIdAndId(userId, expenseId);
                    if (expense != null && expense.getBudgetIds() != null) {
                        expense.getBudgetIds().remove(budget.getId());
                        expenseRepository.save(expense);
                    }
                }
            }
        }

        budgetRepository.deleteAll(budgets);

        auditExpenseService.logAudit(
                userService.findUserById(userId),
                null,
                "Budget Deleted",
                "All budgets were deleted for the user"
        );
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


    @Override
    public List<Budget> getBudgetsByDate(LocalDate date, Integer userId) {
        return budgetRepository.findBudgetsByDate(date, userId);
    }



    @Override
    public List<Budget> getBudgetsByExpenseId(Integer expenseId, Integer userId, LocalDate expenseDate) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found with ID: " + expenseId));

        // Use the passed expenseDate instead of reading from the DB expense
        List<Budget> budgets = budgetRepository.findBudgetsByDate(expenseDate, userId);

        Set<Integer> linkedBudgetIds = expense.getBudgetIds() != null ? expense.getBudgetIds() : new HashSet<>();

        for (Budget budget : budgets) {
            budget.setIncludeInBudget(linkedBudgetIds.contains(budget.getId()));
        }

        return budgets;
    }


}