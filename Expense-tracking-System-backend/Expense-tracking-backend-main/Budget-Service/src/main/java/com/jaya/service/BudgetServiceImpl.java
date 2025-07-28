package com.jaya.service;

import com.jaya.dto.BudgetReport;
import com.jaya.dto.ExpenseDTO;
import com.jaya.models.Budget;
import com.jaya.models.UserDto;
import com.jaya.repository.BudgetRepository;
import com.jaya.util.ServiceHelper;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;


@Service
public class BudgetServiceImpl implements BudgetService {

    @Autowired
    private BudgetRepository budgetRepository;


    @Autowired
    private ServiceHelper helper;




    @Autowired
    @Lazy
    private ExpenseService expenseService;


    @Override
    public Budget createBudget(Budget budget, Integer userId) throws Exception {
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

        UserDto user = helper.validateUser(userId);
        if (user == null) {
            throw new Exception("User not found.");
        }

        budget.setUserId(userId);
        Set<Integer> validExpenseIds = new HashSet<>();

        for (Integer expenseId : budget.getExpenseIds()) {
            ExpenseDTO expense = expenseService.getExpenseById(expenseId,userId);

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
            ExpenseDTO expense = expenseService.getExpenseById(expenseId,userId);
            if (expense != null) {
                if (expense.getBudgetIds() == null) {
                    expense.setBudgetIds(new HashSet<>());
                }

                if (!expense.getBudgetIds().contains(savedBudget.getId())) {
                    expense.getBudgetIds().add(savedBudget.getId());
                    expenseService.save(expense);
                }
            }
        }

        // auditExpenseService.logAudit(convertToAuditEvent(user, savedBudget.getId(), "Budget Created", budget.getName()));
        return savedBudget;
    }


    @Override
    public Set<Budget> getBudgetsByBudgetIds(Set<Integer> budgetIds, Integer userId) throws Exception {
        Set<Budget> budgets = new HashSet<>();
        for(Integer budgetId : budgetIds) {
            Budget budgetOpt = getBudgetById(budgetId, userId);
            if (budgetOpt != null) {
                budgets.add(budgetOpt);
            } else {
                throw new RuntimeException("Budget not found with ID: " + budgetId);
            }
        }
        return budgets; // Return the populated list instead of List.of()
    }


    @Override
    @Transactional
    public Set<Budget> editBudgetWithExpenseId(Set<Integer> budgetIds, Integer expenseId, Integer userId) throws Exception {
        Set<Budget> budgets = getBudgetsByBudgetIds(budgetIds, userId);
        Set<Budget> updatedBudgets = new HashSet<>();

        for (Budget budget : budgets) {
            // Add the expense ID to the budget's expense list
            if (budget.getExpenseIds() == null) {
                budget.setExpenseIds(new HashSet<>());
            }
            budget.getExpenseIds().add(expenseId);



            budget.setBudgetHasExpenses(!budget.getExpenseIds().isEmpty());

            // Save the updated budget
            Budget savedBudget = budgetRepository.save(budget);
            updatedBudgets.add(savedBudget);

            System.out.println("Added expense ID: " + expenseId + " to budget ID: " + budget.getId());
        }


        System.out.println("Successfully updated " + updatedBudgets.size() + " budgets with expense ID: " + expenseId);
        return updatedBudgets;
    }

    @Override
    public Budget save(Budget budget) {
        return budgetRepository.save(budget);
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
            ExpenseDTO oldExpense = expenseService.getExpenseById(oldExpenseId,userId);
            if (oldExpense != null && oldExpense.getBudgetIds() != null) {
                oldExpense.getBudgetIds().remove(budgetId);
                expenseService.save(oldExpense);
            }
        }

        // Filter and add only valid new expenses
        Set<Integer> validExpenseIds = new HashSet<>();
        for (Integer newExpenseId : budget.getExpenseIds()) {
            ExpenseDTO expense = expenseService.getExpenseById(newExpenseId,userId);
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
                        expenseService.save(expense);
                    }
                }
            }
        }

        existingBudget.setExpenseIds(validExpenseIds);
        existingBudget.setBudgetHasExpenses(!validExpenseIds.isEmpty());

        BudgetReport budgetReport = calculateBudgetReport(userId, budgetId);
        existingBudget.setRemainingAmount(budgetReport.getRemainingAmount());



        return budgetRepository.save(existingBudget);
    }





    @Override
    @Transactional
    public void deleteBudget(Integer budgetId, Integer userId) {
        Optional<Budget> existingBudgetOpt = budgetRepository.findByUserIdAndId(userId, budgetId);

        if (existingBudgetOpt.isEmpty()) {
            throw new RuntimeException("Budget not found");
        }

        Budget budget = existingBudgetOpt.get();

        Set<Integer> expenseIds = budget.getExpenseIds();
        if (expenseIds != null) {
            for (Integer expenseId : expenseIds) {
                ExpenseDTO expense = expenseService.getExpenseById(expenseId,userId);
                if (expense != null && expense.getBudgetIds() != null) {
                    expense.getBudgetIds().remove(budgetId);
                    expenseService.save(expense);
                }
            }
        }

        budgetRepository.delete(budget);


    }


    @Override
    @Transactional
    public void deleteAllBudget(Integer userId) {
        List<Budget> budgets = budgetRepository.findByUserId(userId);

        if (budgets.isEmpty()) {
            throw new RuntimeException("No budgets found");
        }

        for (Budget budget : budgets) {
            Set<Integer> expenseIds = budget.getExpenseIds();
            if (expenseIds != null) {
                for (Integer expenseId : expenseIds) {
                    ExpenseDTO expense = expenseService.getExpenseById(expenseId,userId);
                    if (expense != null && expense.getBudgetIds() != null) {
                        expense.getBudgetIds().remove(budget.getId());
                        expenseService.save(expense);
                    }
                }
            }
        }

        budgetRepository.deleteAll(budgets);


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
        if(!expense.get().getUserId().equals(userId))
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
    public List<ExpenseDTO> getExpensesForUserWithinBudgetDates(Integer userId, Integer budgetId) throws Exception {
        Budget budget = budgetRepository.findById(budgetId).orElseThrow(() -> new Exception("Budget not found"));
        if (!budget.getUserId().equals(userId)) {
            throw new Exception("You can't access another user's budget");
        }
        return expenseService.findByUserIdAndDateBetweenAndIncludeInBudgetTrue( budget.getStartDate(), budget.getEndDate(),userId);
    }

    @Override
    public List<ExpenseDTO> getExpensesForUserByBudgetId(Integer userId, Integer budgetId) throws Exception {
        Budget budget = budgetRepository.findByUserIdAndId(userId, budgetId)
                .orElseThrow(() -> new RuntimeException("Budget not found"));

        Set<Integer> expenseIds = budget.getExpenseIds();
        if (expenseIds == null || expenseIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<ExpenseDTO> expenses = expenseService.getExpensesByIds(userId, expenseIds);
        for (ExpenseDTO expense : expenses) {
            expense.setIncludeInBudget(true);
        }
        return expenses;
    }


    @Override
    public BudgetReport calculateBudgetReport(Integer userId, Integer budgetId) throws Exception {
        Optional<Budget> optionalBudget = budgetRepository.findByUserIdAndId(userId, budgetId);

        if (!optionalBudget.isPresent()) {
            throw new Exception("Budget not found.");
        }

        Budget budget = optionalBudget.get();

        if (!budget.getUserId().equals(userId)) {
            throw new Exception("You do not have access to this budget.");
        }

        List<ExpenseDTO> expenses = expenseService.findByUserIdAndDateBetweenAndIncludeInBudgetTrue(
                budget.getStartDate(),
                budget.getEndDate(),
                userId
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
        ExpenseDTO expense = expenseService.getExpenseById(expenseId,userId);

        // Use the passed expenseDate instead of reading from the DB expense
        List<Budget> budgets = budgetRepository.findBudgetsByDate(expenseDate, userId);

        Set<Integer> linkedBudgetIds = expense.getBudgetIds() != null ? expense.getBudgetIds() : new HashSet<>();

        for (Budget budget : budgets) {
            budget.setIncludeInBudget(linkedBudgetIds.contains(budget.getId()));
        }

        return budgets;
    }


}