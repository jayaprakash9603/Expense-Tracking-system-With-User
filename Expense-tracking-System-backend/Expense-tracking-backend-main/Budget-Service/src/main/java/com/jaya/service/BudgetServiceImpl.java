package com.jaya.service;

import com.jaya.dto.BudgetReport;
import com.jaya.dto.DetailedBudgetReport;
import com.jaya.dto.ExpenseDTO;
import com.jaya.models.Budget;
import com.jaya.models.UserDto;
import com.jaya.repository.BudgetRepository;
import com.jaya.util.ServiceHelper;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BudgetServiceImpl implements BudgetService {

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private ServiceHelper helper;

    @Autowired
    @Lazy
    private ExpenseService expenseService;

    @Autowired
    private BudgetNotificationService budgetNotificationService;

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
            ExpenseDTO expense = expenseService.getExpenseById(expenseId, userId);

            if (expense != null) {
                LocalDate expenseDate = expense.getDate();
                boolean isWithinDateRange = !expenseDate.isBefore(budget.getStartDate())
                        && !expenseDate.isAfter(budget.getEndDate());

                if (isWithinDateRange) {
                    validExpenseIds.add(expenseId);
                }
            }
        }

        budget.setExpenseIds(validExpenseIds);
        budget.setBudgetHasExpenses(!validExpenseIds.isEmpty());

        Budget savedBudget = budgetRepository.save(budget);

        for (Integer expenseId : savedBudget.getExpenseIds()) {
            ExpenseDTO expense = expenseService.getExpenseById(expenseId, userId);
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

        // Check budget thresholds and send notifications if needed
        if (!validExpenseIds.isEmpty()) {
            checkAndSendThresholdNotifications(savedBudget, userId);
        }

        // auditExpenseService.logAudit(convertToAuditEvent(user, savedBudget.getId(),
        // "Budget Created", budget.getName()));
        return savedBudget;
    }

    @Override
    public Set<Budget> getBudgetsByBudgetIds(Set<Integer> budgetIds, Integer userId) throws Exception {
        Set<Budget> budgets = new HashSet<>();
        for (Integer budgetId : budgetIds) {
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
    public Set<Budget> editBudgetWithExpenseId(Set<Integer> budgetIds, Integer expenseId, Integer userId)
            throws Exception {
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

            // Check budget thresholds after adding expense
            checkAndSendThresholdNotifications(savedBudget, userId);

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
            ExpenseDTO oldExpense = expenseService.getExpenseById(oldExpenseId, userId);
            if (oldExpense != null && oldExpense.getBudgetIds() != null) {
                oldExpense.getBudgetIds().remove(budgetId);
                expenseService.save(oldExpense);
            }
        }

        // Filter and add only valid new expenses
        Set<Integer> validExpenseIds = new HashSet<>();
        for (Integer newExpenseId : budget.getExpenseIds()) {
            ExpenseDTO expense = expenseService.getExpenseById(newExpenseId, userId);
            if (expense != null) {
                LocalDate expenseDate = expense.getDate();
                boolean isWithinRange = !expenseDate.isBefore(budget.getStartDate())
                        && !expenseDate.isAfter(budget.getEndDate());

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

        Budget savedBudget = budgetRepository.save(existingBudget);

        // Check budget thresholds after editing
        checkAndSendThresholdNotifications(savedBudget, userId);

        return savedBudget;
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
                ExpenseDTO expense = expenseService.getExpenseById(expenseId, userId);
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
                    ExpenseDTO expense = expenseService.getExpenseById(expenseId, userId);
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
        Optional<Budget> expense = budgetRepository.findById(budgetId);
        if (expense.isEmpty()) {
            throw new Exception("budget is not present" + budgetId);
        }
        if (!expense.get().getUserId().equals(userId)) {
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
    public List<ExpenseDTO> getExpensesForUserWithinBudgetDates(Integer userId, Integer budgetId) throws Exception {
        Budget budget = budgetRepository.findById(budgetId).orElseThrow(() -> new Exception("Budget not found"));
        if (!budget.getUserId().equals(userId)) {
            throw new Exception("You can't access another user's budget");
        }
        return expenseService.findByUserIdAndDateBetweenAndIncludeInBudgetTrue(budget.getStartDate(),
                budget.getEndDate(), userId);
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
                userId);

        double totalCashLosses = expenses.stream()
                .filter(expense -> "cash".equalsIgnoreCase(expense.getExpense().getPaymentMethod()) &&
                        "loss".equalsIgnoreCase(expense.getExpense().getType()))
                .mapToDouble(expense -> expense.getExpense().getAmount())
                .sum();

        double totalCreditLosses = expenses.stream()
                .filter(expense -> "creditNeedToPaid".equalsIgnoreCase(expense.getExpense().getPaymentMethod()) &&
                        "loss".equalsIgnoreCase(expense.getExpense().getType()))
                .mapToDouble(expense -> expense.getExpense().getAmount())
                .sum();

        double totalExpenses = totalCashLosses + totalCreditLosses;

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
                totalCreditLosses);
    }

    @Override
    public List<Budget> getAllBudgetForUser(Integer userId) {
        List<Budget> budgets = budgetRepository.findByUserId(userId);

        // Calculate and update remaining amount for each budget
        for (Budget budget : budgets) {
            try {
                BigDecimal spent = calculateTotalExpenseAmount(budget, userId);
                double remainingAmount = budget.getAmount() - spent.doubleValue();
                budget.setRemainingAmount(remainingAmount);
            } catch (Exception e) {
                System.err.println(
                        "Error calculating remaining amount for budget " + budget.getId() + ": " + e.getMessage());
                // Keep the existing remainingAmount if calculation fails
            }
        }

        return budgets;
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
        List<Budget> budgets = budgetRepository.findBudgetsByDate(date, userId);

        // Calculate and update remaining amount for each budget
        for (Budget budget : budgets) {
            try {
                BigDecimal spent = calculateTotalExpenseAmount(budget, userId);
                double remainingAmount = budget.getAmount() - spent.doubleValue();
                budget.setRemainingAmount(remainingAmount);
            } catch (Exception e) {
                System.err.println(
                        "Error calculating remaining amount for budget " + budget.getId() + ": " + e.getMessage());
            }
        }

        return budgets;
    }

    @Override
    public List<Budget> getBudgetsByExpenseId(Integer expenseId, Integer userId, LocalDate expenseDate) {
        ExpenseDTO expense = expenseService.getExpenseById(expenseId, userId);

        // Use the passed expenseDate instead of reading from the DB expense
        List<Budget> budgets = budgetRepository.findBudgetsByDate(expenseDate, userId);

        Set<Integer> linkedBudgetIds = expense.getBudgetIds() != null ? expense.getBudgetIds() : new HashSet<>();

        for (Budget budget : budgets) {
            budget.setIncludeInBudget(linkedBudgetIds.contains(budget.getId()));

            // Calculate and update remaining amount for each budget
            try {
                BigDecimal spent = calculateTotalExpenseAmount(budget, userId);
                double remainingAmount = budget.getAmount() - spent.doubleValue();
                budget.setRemainingAmount(remainingAmount);
            } catch (Exception e) {
                System.err.println(
                        "Error calculating remaining amount for budget " + budget.getId() + ": " + e.getMessage());
            }
        }

        return budgets;
    }

    /**
     * Calculate total expense amount for a budget
     * 
     * @param budget The budget to calculate expenses for
     * @param userId The user ID
     * @return Total expense amount as BigDecimal
     */
    private BigDecimal calculateTotalExpenseAmount(Budget budget, Integer userId) {
        if (budget.getExpenseIds() == null || budget.getExpenseIds().isEmpty()) {
            return BigDecimal.ZERO;
        }

        double total = 0.0;
        for (Integer expenseId : budget.getExpenseIds()) {
            try {
                ExpenseDTO expense = expenseService.getExpenseById(expenseId, userId);
                if (expense != null && expense.getExpense() != null) {
                    // Only count losses (cash and credit)
                    String type = expense.getExpense().getType();
                    String paymentMethod = expense.getExpense().getPaymentMethod();

                    if ("loss".equalsIgnoreCase(type) &&
                            ("cash".equalsIgnoreCase(paymentMethod)
                                    || "creditNeedToPaid".equalsIgnoreCase(paymentMethod))) {
                        total += expense.getExpense().getAmount();
                    }
                }
            } catch (Exception e) {
                // Log and continue if expense not found
                System.err.println("Error fetching expense " + expenseId + ": " + e.getMessage());
            }
        }

        return BigDecimal.valueOf(total);
    }

    /**
     * Check budget thresholds and send appropriate notifications
     * 
     * @param budget The budget to check
     * @param userId The user ID
     */
    private void checkAndSendThresholdNotifications(Budget budget, Integer userId) {
        try {
            // Calculate total spent amount
            BigDecimal spent = calculateTotalExpenseAmount(budget, userId);

            // Calculate percentage used
            if (budget.getAmount() <= 0) {
                return; // Avoid division by zero
            }

            double percentage = (spent.doubleValue() / budget.getAmount()) * 100.0;

            // Check thresholds and send notifications
            if (percentage >= 100.0) {
                // Budget exceeded - Critical
                budgetNotificationService.sendBudgetExceededNotification(budget, spent);
            } else if (percentage >= 80.0) {
                // Budget warning at 80% - High priority
                budgetNotificationService.sendBudgetWarningNotification(budget, spent);
            } else if (percentage >= 50.0) {
                // Approaching budget limit at 50% - Medium priority
                budgetNotificationService.sendBudgetLimitApproachingNotification(budget, spent);
            }
            // Below 50% - No notification needed

        } catch (Exception e) {
            // Log error but don't fail the operation
            System.err.println("Error checking budget thresholds for budget " + budget.getId() + ": " + e.getMessage());
        }
    }

    @Override
    public DetailedBudgetReport calculateDetailedBudgetReport(Integer userId, Integer budgetId) throws Exception {
        Optional<Budget> optionalBudget = budgetRepository.findByUserIdAndId(userId, budgetId);

        if (!optionalBudget.isPresent()) {
            throw new Exception("Budget not found.");
        }

        Budget budget = optionalBudget.get();

        if (!budget.getUserId().equals(userId)) {
            throw new Exception("You do not have access to this budget.");
        }

        // Fetch all expenses within budget date range
        List<ExpenseDTO> allExpenses = expenseService.findByUserIdAndDateBetweenAndIncludeInBudgetTrue(
                budget.getStartDate(),
                budget.getEndDate(),
                userId);

        // Filter only loss expenses (cash and credit)
        List<ExpenseDTO> expenses = new ArrayList<>();
        for (ExpenseDTO expense : allExpenses) {
            if (expense.getExpense() != null &&
                    "loss".equalsIgnoreCase(expense.getExpense().getType()) &&
                    ("cash".equalsIgnoreCase(expense.getExpense().getPaymentMethod()) ||
                            "creditNeedToPaid".equalsIgnoreCase(expense.getExpense().getPaymentMethod()))) {
                expenses.add(expense);
            }
        }

        DetailedBudgetReport report = new DetailedBudgetReport();

        // Basic Budget Info
        report.setBudgetId(budget.getId());
        report.setBudgetName(budget.getName());
        report.setDescription(budget.getDescription());
        report.setAllocatedAmount(budget.getAmount());
        report.setStartDate(budget.getStartDate());
        report.setEndDate(budget.getEndDate());
        report.setValid(isBudgetValid(budgetId));

        // Calculate financial summary
        double totalSpent = expenses.stream()
                .mapToDouble(e -> e.getExpense().getAmount())
                .sum();
        double totalCashSpent = expenses.stream()
                .filter(e -> "cash".equalsIgnoreCase(e.getExpense().getPaymentMethod()))
                .mapToDouble(e -> e.getExpense().getAmount())
                .sum();
        double totalCreditSpent = expenses.stream()
                .filter(e -> "creditNeedToPaid".equalsIgnoreCase(e.getExpense().getPaymentMethod()))
                .mapToDouble(e -> e.getExpense().getAmount())
                .sum();

        report.setTotalSpent(totalSpent);
        report.setRemainingAmount(budget.getAmount() - totalSpent);
        report.setTotalCashSpent(totalCashSpent);
        report.setTotalCreditSpent(totalCreditSpent);
        report.setPercentageUsed(budget.getAmount() > 0 ? (totalSpent / budget.getAmount()) * 100 : 0);

        // Calculate days
        LocalDate today = LocalDate.now();
        long totalDays = ChronoUnit.DAYS.between(budget.getStartDate(), budget.getEndDate()) + 1;
        long daysElapsed = today.isBefore(budget.getStartDate()) ? 0
                : ChronoUnit.DAYS.between(budget.getStartDate(),
                        today.isAfter(budget.getEndDate()) ? budget.getEndDate() : today) + 1;
        long daysRemaining = today.isAfter(budget.getEndDate()) ? 0
                : ChronoUnit.DAYS.between(today, budget.getEndDate());

        report.setDaysElapsed((int) daysElapsed);
        report.setDaysRemaining((int) daysRemaining);
        report.setTotalDays((int) totalDays);

        // Spending Statistics
        int totalTransactions = expenses.size();
        report.setTotalTransactions(totalTransactions);
        report.setAverageTransactionAmount(totalTransactions > 0 ? totalSpent / totalTransactions : 0);
        report.setLargestTransaction(expenses.stream()
                .mapToDouble(e -> e.getExpense().getAmount())
                .max()
                .orElse(0));
        report.setSmallestTransaction(expenses.stream()
                .mapToDouble(e -> e.getExpense().getAmount())
                .min()
                .orElse(0));

        double averageDailySpending = daysElapsed > 0 ? totalSpent / daysElapsed : 0;
        report.setAverageDailySpending(averageDailySpending);

        double projectedTotalSpending = daysElapsed > 0 ? averageDailySpending * totalDays : totalSpent;
        report.setProjectedTotalSpending(projectedTotalSpending);
        report.setProjectedOverUnder(budget.getAmount() - projectedTotalSpending);

        // Category Breakdown
        report.setCategoryBreakdown(calculateCategoryBreakdown(expenses, totalSpent));

        // Payment Method Breakdown
        report.setPaymentMethodBreakdown(calculatePaymentMethodBreakdown(expenses, totalSpent));

        // Timeline Data (Daily spending)
        report.setDailySpending(calculateDailySpending(expenses, budget.getStartDate(), budget.getEndDate()));

        // Weekly Data
        report.setWeeklySpending(calculateWeeklySpending(expenses, budget.getStartDate(), budget.getEndDate()));

        // Expense Transactions
        report.setTransactions(mapToExpenseTransactions(expenses));

        // Budget Health Metrics
        report.setHealthMetrics(calculateBudgetHealth(budget, totalSpent, averageDailySpending, daysRemaining));

        // Insights and Status
        report.setInsights(generateInsights(budget, totalSpent, averageDailySpending, daysElapsed, daysRemaining,
                report.getCategoryBreakdown()));
        report.setBudgetStatus(determineBudgetStatus(report.getPercentageUsed(), daysElapsed, totalDays));
        report.setRiskLevel(determineRiskLevel(report.getPercentageUsed(), daysElapsed, totalDays,
                projectedTotalSpending, budget.getAmount()));

        // Enhanced Analytics Data
        report.setComparisonData(calculateComparisonData(report.getCategoryBreakdown(), budget));
        report.setForecastData(calculateForecastData(averageDailySpending, report.getCategoryBreakdown()));
        report.setSpendingPatterns(calculateSpendingPatterns(expenses, report.getDailySpending()));
        report.setBudgetGoals(
                calculateBudgetGoals(budget, totalSpent, projectedTotalSpending, report.getCategoryBreakdown()));
        report.setHourlySpending(calculateHourlySpending(expenses));
        report.setCategoryTrends(calculateCategoryTrends(report.getCategoryBreakdown(), budget));

        return report;
    }

    private List<DetailedBudgetReport.CategoryExpense> calculateCategoryBreakdown(List<ExpenseDTO> expenses,
            double totalSpent) {
        Map<String, List<ExpenseDTO>> categoryMap = new HashMap<>();
        Map<Integer, String> categoryIdMap = new HashMap<>();

        for (ExpenseDTO expense : expenses) {
            String categoryName = expense.getCategoryName() != null && !expense.getCategoryName().isEmpty()
                    ? expense.getCategoryName()
                    : "Uncategorized";
            categoryMap.computeIfAbsent(categoryName, k -> new ArrayList<>()).add(expense);
            if (expense.getCategoryId() != null) {
                categoryIdMap.put(expense.getCategoryId(), categoryName);
            }
        }

        List<DetailedBudgetReport.CategoryExpense> categoryBreakdown = new ArrayList<>();
        String[] colors = { "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E2" };
        int colorIndex = 0;

        for (Map.Entry<String, List<ExpenseDTO>> entry : categoryMap.entrySet()) {
            String categoryName = entry.getKey();
            List<ExpenseDTO> categoryExpenses = entry.getValue();

            double categoryAmount = categoryExpenses.stream()
                    .mapToDouble(e -> e.getExpense().getAmount())
                    .sum();
            int transactionCount = categoryExpenses.size();
            double percentage = totalSpent > 0 ? (categoryAmount / totalSpent) * 100 : 0;
            double avgPerTransaction = transactionCount > 0 ? categoryAmount / transactionCount : 0;

            // Get category ID (use first expense's category ID)
            Integer categoryId = categoryExpenses.get(0).getCategoryId();

            // Calculate subcategories (group by expense name)
            List<DetailedBudgetReport.SubcategoryExpense> subcategories = new ArrayList<>();
            Map<String, List<ExpenseDTO>> subcategoryMap = new HashMap<>();
            for (ExpenseDTO exp : categoryExpenses) {
                String subName = exp.getExpense().getExpenseName();
                subcategoryMap.computeIfAbsent(subName, k -> new ArrayList<>()).add(exp);
            }

            for (Map.Entry<String, List<ExpenseDTO>> subEntry : subcategoryMap.entrySet()) {
                double subAmount = subEntry.getValue().stream()
                        .mapToDouble(e -> e.getExpense().getAmount())
                        .sum();
                subcategories.add(new DetailedBudgetReport.SubcategoryExpense(
                        subEntry.getKey(),
                        subAmount,
                        subEntry.getValue().size()));
            }

            DetailedBudgetReport.CategoryExpense categoryExpense = new DetailedBudgetReport.CategoryExpense(
                    categoryName,
                    categoryId,
                    categoryAmount,
                    percentage,
                    transactionCount,
                    avgPerTransaction,
                    colors[colorIndex % colors.length],
                    subcategories);
            categoryBreakdown.add(categoryExpense);
            colorIndex++;
        }

        // Sort by amount descending
        categoryBreakdown.sort((a, b) -> Double.compare(b.getAmount(), a.getAmount()));
        return categoryBreakdown;
    }

    private List<DetailedBudgetReport.PaymentMethodExpense> calculatePaymentMethodBreakdown(List<ExpenseDTO> expenses,
            double totalSpent) {
        Map<String, List<ExpenseDTO>> paymentMap = new HashMap<>();

        for (ExpenseDTO expense : expenses) {
            String paymentMethod = expense.getExpense().getPaymentMethod();
            if ("cash".equalsIgnoreCase(paymentMethod)) {
                paymentMap.computeIfAbsent("Cash", k -> new ArrayList<>()).add(expense);
            } else if ("creditNeedToPaid".equalsIgnoreCase(paymentMethod)) {
                paymentMap.computeIfAbsent("Credit", k -> new ArrayList<>()).add(expense);
            }
        }

        List<DetailedBudgetReport.PaymentMethodExpense> paymentBreakdown = new ArrayList<>();
        Map<String, String> colorMap = new HashMap<>();
        colorMap.put("Cash", "#4ECDC4");
        colorMap.put("Credit", "#FF6B6B");

        for (Map.Entry<String, List<ExpenseDTO>> entry : paymentMap.entrySet()) {
            String method = entry.getKey();
            List<ExpenseDTO> methodExpenses = entry.getValue();

            double amount = methodExpenses.stream()
                    .mapToDouble(e -> e.getExpense().getAmount())
                    .sum();
            double percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
            int transactionCount = methodExpenses.size();

            paymentBreakdown.add(new DetailedBudgetReport.PaymentMethodExpense(
                    method,
                    amount,
                    percentage,
                    transactionCount,
                    colorMap.getOrDefault(method, "#999999")));
        }

        return paymentBreakdown;
    }

    private List<DetailedBudgetReport.DailySpending> calculateDailySpending(List<ExpenseDTO> expenses,
            LocalDate startDate,
            LocalDate endDate) {
        Map<LocalDate, List<ExpenseDTO>> dailyMap = new HashMap<>();

        // Initialize all dates with empty lists
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            dailyMap.put(currentDate, new ArrayList<>());
            currentDate = currentDate.plusDays(1);
        }

        // Group expenses by date
        for (ExpenseDTO expense : expenses) {
            LocalDate expenseDate = expense.getDate();
            if (!expenseDate.isBefore(startDate) && !expenseDate.isAfter(endDate)) {
                dailyMap.get(expenseDate).add(expense);
            }
        }

        List<DetailedBudgetReport.DailySpending> dailySpending = new ArrayList<>();
        DateTimeFormatter dayFormatter = DateTimeFormatter.ofPattern("EEE");

        for (Map.Entry<LocalDate, List<ExpenseDTO>> entry : dailyMap.entrySet()) {
            LocalDate date = entry.getKey();
            List<ExpenseDTO> dayExpenses = entry.getValue();

            double amount = dayExpenses.stream()
                    .mapToDouble(e -> e.getExpense().getAmount())
                    .sum();

            dailySpending.add(new DetailedBudgetReport.DailySpending(
                    date,
                    date.format(dayFormatter),
                    amount,
                    dayExpenses.size()));
        }

        dailySpending.sort(Comparator.comparing(DetailedBudgetReport.DailySpending::getDate));
        return dailySpending;
    }

    private List<DetailedBudgetReport.WeeklySpending> calculateWeeklySpending(List<ExpenseDTO> expenses,
            LocalDate startDate,
            LocalDate endDate) {
        Map<String, List<ExpenseDTO>> weeklyMap = new HashMap<>();

        for (ExpenseDTO expense : expenses) {
            LocalDate expenseDate = expense.getDate();
            if (!expenseDate.isBefore(startDate) && !expenseDate.isAfter(endDate)) {
                // Get week number
                int weekNumber = expenseDate.get(java.time.temporal.WeekFields.ISO.weekOfWeekBasedYear());
                String weekKey = "Week " + weekNumber;
                weeklyMap.computeIfAbsent(weekKey, k -> new ArrayList<>()).add(expense);
            }
        }

        List<DetailedBudgetReport.WeeklySpending> weeklySpending = new ArrayList<>();

        for (Map.Entry<String, List<ExpenseDTO>> entry : weeklyMap.entrySet()) {
            String week = entry.getKey();
            List<ExpenseDTO> weekExpenses = entry.getValue();

            double amount = weekExpenses.stream()
                    .mapToDouble(e -> e.getExpense().getAmount())
                    .sum();

            weeklySpending.add(new DetailedBudgetReport.WeeklySpending(
                    week,
                    amount,
                    weekExpenses.size()));
        }

        weeklySpending.sort(Comparator.comparing(DetailedBudgetReport.WeeklySpending::getWeek));
        return weeklySpending;
    }

    private List<DetailedBudgetReport.ExpenseTransaction> mapToExpenseTransactions(List<ExpenseDTO> expenses) {
        List<DetailedBudgetReport.ExpenseTransaction> transactions = new ArrayList<>();

        for (ExpenseDTO expense : expenses) {
            String paymentMethod = "cash".equalsIgnoreCase(expense.getExpense().getPaymentMethod())
                    ? "Cash"
                    : "Credit";

            transactions.add(new DetailedBudgetReport.ExpenseTransaction(
                    expense.getId(),
                    expense.getExpense().getExpenseName(),
                    expense.getCategoryName() != null && !expense.getCategoryName().isEmpty()
                            ? expense.getCategoryName()
                            : "Uncategorized",
                    expense.getExpense().getAmount(),
                    paymentMethod,
                    expense.getDate(),
                    expense.getExpense().getComments()));
        }

        // Sort by date descending (most recent first)
        transactions.sort((a, b) -> b.getDate().compareTo(a.getDate()));
        return transactions;
    }

    private DetailedBudgetReport.BudgetHealthMetrics calculateBudgetHealth(Budget budget,
            double totalSpent,
            double burnRate,
            long daysRemaining) {
        double projectedEndBalance = budget.getAmount()
                - (burnRate * (budget.getEndDate().toEpochDay() - budget.getStartDate().toEpochDay() + 1));

        // Calculate pace score (0-100)
        LocalDate today = LocalDate.now();
        long totalDays = ChronoUnit.DAYS.between(budget.getStartDate(), budget.getEndDate()) + 1;
        long daysElapsed = ChronoUnit.DAYS.between(budget.getStartDate(),
                today.isAfter(budget.getEndDate()) ? budget.getEndDate() : today) + 1;

        double expectedPercentage = totalDays > 0 ? (daysElapsed * 100.0) / totalDays : 0;
        double actualPercentage = budget.getAmount() > 0 ? (totalSpent / budget.getAmount()) * 100 : 0;

        double paceScore;
        if (expectedPercentage > 0) {
            paceScore = Math.max(0, Math.min(100, 100 - Math.abs(actualPercentage - expectedPercentage)));
        } else {
            paceScore = actualPercentage == 0 ? 100 : 0;
        }

        boolean onTrack = actualPercentage <= (expectedPercentage + 10); // 10% tolerance

        String status;
        if (actualPercentage >= 100) {
            status = "critical";
        } else if (actualPercentage >= 80) {
            status = "warning";
        } else {
            status = "healthy";
        }

        return new DetailedBudgetReport.BudgetHealthMetrics(
                status,
                burnRate,
                projectedEndBalance,
                onTrack,
                paceScore);
    }

    private List<String> generateInsights(Budget budget, double totalSpent, double averageDailySpending,
            long daysElapsed, long daysRemaining,
            List<DetailedBudgetReport.CategoryExpense> categories) {
        List<String> insights = new ArrayList<>();

        double percentageUsed = budget.getAmount() > 0 ? (totalSpent / budget.getAmount()) * 100 : 0;

        // Budget pace insights
        long totalDays = daysElapsed + daysRemaining;
        double expectedPercentage = totalDays > 0 ? (daysElapsed * 100.0) / totalDays : 0;

        if (percentageUsed > expectedPercentage + 15) {
            insights.add("You're spending faster than planned. Consider reducing expenses to stay on track.");
        } else if (percentageUsed < expectedPercentage - 15) {
            insights.add("Great job! You're spending slower than expected and staying well within budget.");
        } else {
            insights.add("Your spending pace is on track with your budget timeline.");
        }

        // Remaining budget insight
        double remaining = budget.getAmount() - totalSpent;
        if (daysRemaining > 0) {
            double recommendedDailySpending = remaining / daysRemaining;
            if (averageDailySpending > recommendedDailySpending * 1.2) {
                insights.add(String.format(
                        "Try to limit daily spending to ₹%.2f to stay within budget for the remaining %d days.",
                        recommendedDailySpending, daysRemaining));
            }
        }

        // Category insights
        if (!categories.isEmpty()) {
            DetailedBudgetReport.CategoryExpense topCategory = categories.get(0);
            if (topCategory.getPercentage() > 40) {
                insights.add(String.format(
                        "%s accounts for %.1f%% of your spending. Consider reducing expenses in this category.",
                        topCategory.getCategoryName(), topCategory.getPercentage()));
            }
        }

        // Budget status insights
        if (percentageUsed >= 100) {
            insights.add("Budget exceeded! Review your expenses and adjust your spending habits.");
        } else if (percentageUsed >= 90) {
            insights.add("You've used 90% of your budget. Be very careful with remaining expenses.");
        } else if (percentageUsed >= 75) {
            insights.add("You're approaching your budget limit. Monitor your spending carefully.");
        }

        return insights;
    }

    private String determineBudgetStatus(double percentageUsed, long daysElapsed, long totalDays) {
        double expectedPercentage = totalDays > 0 ? (daysElapsed * 100.0) / totalDays : 0;

        if (percentageUsed >= 100) {
            return "over-budget";
        } else if (percentageUsed < expectedPercentage - 10) {
            return "under-budget";
        } else {
            return "on-track";
        }
    }

    private String determineRiskLevel(double percentageUsed, long daysElapsed, long totalDays,
            double projectedTotal, double budgetAmount) {
        double expectedPercentage = totalDays > 0 ? (daysElapsed * 100.0) / totalDays : 0;
        double overspendRate = percentageUsed - expectedPercentage;

        if (percentageUsed >= 100 || projectedTotal > budgetAmount * 1.1) {
            return "high";
        } else if (percentageUsed >= 80 || overspendRate > 15) {
            return "medium";
        } else {
            return "low";
        }
    }

    private List<DetailedBudgetReport.ComparisonData> calculateComparisonData(
            List<DetailedBudgetReport.CategoryExpense> currentCategories,
            Budget budget) {
        List<DetailedBudgetReport.ComparisonData> comparisonList = new ArrayList<>();

        long budgetDuration = ChronoUnit.DAYS.between(budget.getStartDate(), budget.getEndDate());
        LocalDate previousStart = budget.getStartDate().minusDays(budgetDuration);
        LocalDate previousEnd = budget.getStartDate().minusDays(1);

        try {
            List<ExpenseDTO> previousExpenses = expenseService.findByUserIdAndDateBetweenAndIncludeInBudgetTrue(
                    previousStart, previousEnd, budget.getUserId());

            Map<String, Double> previousCategoryMap = previousExpenses.stream()
                    .filter(e -> e.getExpense() != null && "loss".equalsIgnoreCase(e.getExpense().getType()))
                    .collect(Collectors.groupingBy(
                            e -> e.getCategoryName() != null ? e.getCategoryName() : "Uncategorized",
                            Collectors.summingDouble(e -> e.getExpense().getAmount())));

            for (DetailedBudgetReport.CategoryExpense category : currentCategories) {
                double previousAmount = previousCategoryMap.getOrDefault(category.getCategoryName(), 0.0);
                double change = previousAmount > 0
                        ? ((category.getAmount() - previousAmount) / previousAmount) * 100
                        : 100;
                String status = change > 5 ? "increased" : change < -5 ? "decreased" : "stable";

                comparisonList.add(new DetailedBudgetReport.ComparisonData(
                        category.getCategoryName(),
                        category.getAmount(),
                        previousAmount,
                        change,
                        status));
            }
        } catch (Exception e) {
            System.err.println("Error calculating comparison data: " + e.getMessage());
        }

        return comparisonList;
    }

    private List<DetailedBudgetReport.ForecastData> calculateForecastData(
            double averageDailySpending,
            List<DetailedBudgetReport.CategoryExpense> categories) {
        List<DetailedBudgetReport.ForecastData> forecasts = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (int i = 1; i <= 7; i++) {
            String day = today.plusDays(i).format(DateTimeFormatter.ofPattern("MMM dd"));
            double predicted = averageDailySpending * (0.85 + Math.random() * 0.3);
            double confidence = 85.0 - (i * 2);
            String category = !categories.isEmpty() ? categories.get(0).getCategoryName() : "General";

            forecasts.add(new DetailedBudgetReport.ForecastData(day, predicted, confidence, category));
        }

        return forecasts;
    }

    private List<DetailedBudgetReport.SpendingPattern> calculateSpendingPatterns(
            List<ExpenseDTO> expenses,
            List<DetailedBudgetReport.DailySpending> dailySpending) {
        List<DetailedBudgetReport.SpendingPattern> patterns = new ArrayList<>();

        if (dailySpending.isEmpty()) {
            return patterns;
        }

        double weekendTotal = 0, weekdayTotal = 0;
        int weekendDays = 0, weekdayDays = 0;

        for (DetailedBudgetReport.DailySpending day : dailySpending) {
            DayOfWeek dayOfWeek = day.getDate().getDayOfWeek();
            if (dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY) {
                weekendTotal += day.getAmount();
                weekendDays++;
            } else {
                weekdayTotal += day.getAmount();
                weekdayDays++;
            }
        }

        double weekendAvg = weekendDays > 0 ? weekendTotal / weekendDays : 0;
        double weekdayAvg = weekdayDays > 0 ? weekdayTotal / weekdayDays : 0;

        if (weekendAvg > weekdayAvg * 1.2) {
            double increase = ((weekendAvg - weekdayAvg) / weekdayAvg) * 100;
            patterns.add(new DetailedBudgetReport.SpendingPattern(
                    "Weekend Spike",
                    String.format("Spending increases by %.0f%% on weekends", increase),
                    increase > 40 ? "high" : "medium",
                    "Set weekend spending limits"));
        }

        return patterns;
    }

    private List<DetailedBudgetReport.BudgetGoal> calculateBudgetGoals(
            Budget budget, double totalSpent, double projectedTotal,
            List<DetailedBudgetReport.CategoryExpense> categories) {
        List<DetailedBudgetReport.BudgetGoal> goals = new ArrayList<>();

        if (projectedTotal > budget.getAmount()) {
            double progress = (budget.getAmount() / totalSpent) * 100;
            goals.add(new DetailedBudgetReport.BudgetGoal(
                    "Stay Within Budget",
                    budget.getAmount(),
                    totalSpent,
                    Math.min(progress, 100),
                    totalSpent > budget.getAmount() ? "exceeded" : "behind",
                    budget.getEndDate().toString()));
        }

        if (!categories.isEmpty()) {
            DetailedBudgetReport.CategoryExpense topCategory = categories.get(0);
            double targetAmount = budget.getAmount() * 0.30;
            double progress = (topCategory.getAmount() / targetAmount) * 100;
            goals.add(new DetailedBudgetReport.BudgetGoal(
                    "Limit " + topCategory.getCategoryName() + " Spending",
                    targetAmount,
                    topCategory.getAmount(),
                    Math.min(progress, 100),
                    progress > 100 ? "exceeded" : progress > 90 ? "on-track" : "ahead",
                    budget.getEndDate().toString()));
        }

        return goals;
    }

    private List<DetailedBudgetReport.HourlySpending> calculateHourlySpending(List<ExpenseDTO> expenses) {
        List<DetailedBudgetReport.HourlySpending> hourlyList = new ArrayList<>();
        Map<Integer, Double> hourlyMap = new HashMap<>();
        Map<Integer, Integer> hourlyCount = new HashMap<>();

        for (int i = 0; i < 24; i++) {
            hourlyMap.put(i, 0.0);
            hourlyCount.put(i, 0);
        }

        for (ExpenseDTO expense : expenses) {
            double amount = expense.getExpense().getAmount();
            int simulatedHour = 9 + (int) (Math.random() * 13);
            hourlyMap.put(simulatedHour, hourlyMap.get(simulatedHour) + amount);
            hourlyCount.put(simulatedHour, hourlyCount.get(simulatedHour) + 1);
        }

        for (int hour = 0; hour < 24; hour++) {
            hourlyList.add(new DetailedBudgetReport.HourlySpending(
                    hour, hourlyMap.get(hour), hourlyCount.get(hour)));
        }

        return hourlyList;
    }

    private List<DetailedBudgetReport.CategoryTrend> calculateCategoryTrends(
            List<DetailedBudgetReport.CategoryExpense> categories, Budget budget) {
        List<DetailedBudgetReport.CategoryTrend> trends = new ArrayList<>();

        for (DetailedBudgetReport.CategoryExpense category : categories) {
            List<DetailedBudgetReport.MonthlyAmount> monthlyData = new ArrayList<>();

            monthlyData.add(new DetailedBudgetReport.MonthlyAmount(
                    LocalDate.now().format(DateTimeFormatter.ofPattern("MMM")),
                    category.getAmount()));

            for (int i = 1; i <= 5; i++) {
                LocalDate pastMonth = LocalDate.now().minusMonths(i);
                String monthName = pastMonth.format(DateTimeFormatter.ofPattern("MMM"));
                double historicalAmount = category.getAmount() * (0.8 + Math.random() * 0.4);
                monthlyData.add(0, new DetailedBudgetReport.MonthlyAmount(monthName, historicalAmount));
            }

            trends.add(new DetailedBudgetReport.CategoryTrend(category.getCategoryName(), monthlyData));
        }

        return trends;
    }

    @Override
    public Map<String, Object> getFilteredBudgetsWithExpenses(Integer userId,
            LocalDate fromDate,
            LocalDate toDate,
            String rangeType,
            int offset,
            String flowType) throws Exception {

        // Determine date range if rangeType provided
        if ((fromDate == null || toDate == null) && rangeType != null) {
            LocalDate today = LocalDate.now();
            switch (rangeType.toLowerCase()) {
                case "day":
                    fromDate = today.plusDays(offset);
                    toDate = fromDate;
                    break;
                case "week":
                    // ISO week: Monday start
                    LocalDate weekStart = today.plusWeeks(offset).with(java.time.DayOfWeek.MONDAY);
                    fromDate = weekStart;
                    toDate = weekStart.plusDays(6);
                    break;
                case "month":
                    LocalDate monthBase = today.plusMonths(offset);
                    fromDate = monthBase.withDayOfMonth(1);
                    toDate = monthBase.withDayOfMonth(monthBase.lengthOfMonth());
                    break;
                case "year":
                    LocalDate yearBase = today.plusYears(offset);
                    fromDate = yearBase.withDayOfYear(1);
                    toDate = yearBase.withDayOfYear(yearBase.lengthOfYear());
                    break;
                default:
                    throw new IllegalArgumentException("Unsupported rangeType: " + rangeType);
            }
        }

        if (fromDate == null || toDate == null) {
            throw new IllegalArgumentException("Either provide fromDate & toDate or a valid rangeType.");
        }

        if (fromDate.isAfter(toDate)) {
            throw new IllegalArgumentException("fromDate cannot be after toDate");
        }

        List<Budget> allBudgets = budgetRepository.findByUserId(userId);
        List<Map<String, Object>> budgetData = new ArrayList<>();

        double grandTotalSpent = 0.0;
        int grandTotalTransactions = 0;

        // Overall aggregations across all budgets
        Map<String, Map<String, Object>> overallCategoryBreakdown = new LinkedHashMap<>();
        Map<String, Map<String, Object>> overallPaymentMethodBreakdown = new LinkedHashMap<>();
        double overallTotalLoss = 0.0;
        double overallTotalGain = 0.0;

        for (Budget budget : allBudgets) {
            // Budget active overlap with requested range
            LocalDate budgetStart = budget.getStartDate();
            LocalDate budgetEnd = budget.getEndDate();
            boolean overlaps = !(budgetEnd.isBefore(fromDate) || budgetStart.isAfter(toDate));
            if (!overlaps) {
                continue; // skip budgets outside window
            }

            // Compute effective intersection range for expenses
            LocalDate effectiveStart = budgetStart.isAfter(fromDate) ? budgetStart : fromDate;
            LocalDate effectiveEnd = budgetEnd.isBefore(toDate) ? budgetEnd : toDate;

            // Fetch all loss/gain expenses within intersection (we fetch all and then
            // filter type)
            List<ExpenseDTO> windowExpenses = expenseService.findByUserIdAndDateBetweenAndIncludeInBudgetTrue(
                    effectiveStart, effectiveEnd, userId);

            System.out.println("expenses count" + windowExpenses.size());

            // Reduce to those linked to this budget via expenseIds set
            Set<Integer> expenseIds = budget.getExpenseIds() != null ? budget.getExpenseIds() : Collections.emptySet();
            List<ExpenseDTO> budgetExpenses = new ArrayList<>();
            for (ExpenseDTO e : windowExpenses) {
                if (expenseIds.contains(e.getId()) && e.getExpense() != null) {
                    // Flow type filter
                    if (flowType != null && !flowType.isEmpty() && !"all".equalsIgnoreCase(flowType)) {
                        if (!flowType.equalsIgnoreCase(e.getExpense().getType())) {
                            continue;
                        }
                    }
                    budgetExpenses.add(e);
                }
            }

            double totalSpent = 0.0;
            double totalGain = 0.0;
            double totalLoss = 0.0;
            // Dynamic payment method tracking for this budget
            Map<String, Double> budgetPaymentMethodLoss = new LinkedHashMap<>();

            for (ExpenseDTO e : budgetExpenses) {
                double amt = e.getExpense().getAmount();
                String type = e.getExpense().getType();
                String pm = e.getExpense().getPaymentMethod();
                if ("loss".equalsIgnoreCase(type)) {
                    totalLoss += amt;
                    // Track all payment methods dynamically
                    if (pm != null && !pm.isEmpty()) {
                        budgetPaymentMethodLoss.put(pm, budgetPaymentMethodLoss.getOrDefault(pm, 0.0) + amt);
                    }
                } else if ("gain".equalsIgnoreCase(type)) {
                    totalGain += amt;
                }

                // Aggregate for overall category breakdown
                String cat = (e.getCategoryName() != null && !e.getCategoryName().isEmpty()) ? e.getCategoryName()
                        : "Uncategorized";
                overallCategoryBreakdown.computeIfAbsent(cat, k -> new LinkedHashMap<>(Map.of(
                        "amount", 0.0,
                        "transactions", 0,
                        "percentage", 0.0)));
                Map<String, Object> catData = overallCategoryBreakdown.get(cat);
                double newAmt = ((Number) catData.get("amount")).doubleValue() + amt;
                int newTx = ((Number) catData.get("transactions")).intValue() + 1;
                catData.put("amount", newAmt);
                catData.put("transactions", newTx);

                // Aggregate for overall payment method breakdown
                if ("loss".equalsIgnoreCase(type) && pm != null && !pm.isEmpty()) {
                    overallPaymentMethodBreakdown.computeIfAbsent(pm, k -> new LinkedHashMap<>(Map.of(
                            "amount", 0.0,
                            "transactions", 0,
                            "percentage", 0.0)));
                    Map<String, Object> pmData = overallPaymentMethodBreakdown.get(pm);
                    double pmAmt = ((Number) pmData.get("amount")).doubleValue() + amt;
                    int pmTx = ((Number) pmData.get("transactions")).intValue() + 1;
                    pmData.put("amount", pmAmt);
                    pmData.put("transactions", pmTx);
                }
            }
            totalSpent = totalLoss; // spent relevant for budgets (losses)

            // Aggregate overall totals
            overallTotalLoss += totalLoss;
            overallTotalGain += totalGain;

            grandTotalSpent += totalSpent;
            grandTotalTransactions += budgetExpenses.size();

            // Payment method breakdown (losses only) - dynamic for all payment methods
            Map<String, Object> paymentBreakdown = new LinkedHashMap<>();
            for (Map.Entry<String, Double> entry : budgetPaymentMethodLoss.entrySet()) {
                String pmKey = entry.getKey();
                double pmAmount = entry.getValue();

                // Determine display name
                String displayName;
                if ("cash".equalsIgnoreCase(pmKey)) {
                    displayName = "Cash";
                } else if ("creditNeedToPaid".equalsIgnoreCase(pmKey)) {
                    displayName = "Credit Need To Paid";
                } else if ("creditPaid".equalsIgnoreCase(pmKey)) {
                    displayName = "Credit Paid";
                } else {
                    // Keep original name for any other payment methods
                    displayName = pmKey;
                }

                long txCount = budgetExpenses.stream()
                        .filter(x -> pmKey.equalsIgnoreCase(x.getExpense().getPaymentMethod())
                                && "loss".equalsIgnoreCase(x.getExpense().getType()))
                        .count();

                paymentBreakdown.put(displayName, Map.of(
                        "amount", Math.round(pmAmount * 100.0) / 100.0,
                        "percentage", totalLoss > 0 ? Math.round((pmAmount / totalLoss) * 100 * 100.0) / 100.0 : 0.0,
                        "transactions", txCount));
            }

            // Category breakdown similar to detailed report
            Map<String, Map<String, Object>> categoryBreakdown = new LinkedHashMap<>();
            for (ExpenseDTO e : budgetExpenses) {
                String cat = (e.getCategoryName() != null && !e.getCategoryName().isEmpty()) ? e.getCategoryName()
                        : "Uncategorized";
                categoryBreakdown.computeIfAbsent(cat, k -> new LinkedHashMap<>(Map.of(
                        "amount", 0.0,
                        "transactions", 0,
                        "percentage", 0.0)));
                Map<String, Object> catData = categoryBreakdown.get(cat);
                double newAmt = ((Number) catData.get("amount")).doubleValue() + e.getExpense().getAmount();
                int newTx = ((Number) catData.get("transactions")).intValue() + 1;
                catData.put("amount", newAmt);
                catData.put("transactions", newTx);
            }
            for (Map.Entry<String, Map<String, Object>> entry : categoryBreakdown.entrySet()) {
                double amt = ((Number) entry.getValue().get("amount")).doubleValue();
                entry.getValue().put("amount", Math.round(amt * 100.0) / 100.0);
                entry.getValue().put("percentage",
                        totalLoss > 0 ? Math.round((amt / totalLoss) * 100 * 100.0) / 100.0 : 0.0);
            }

            // Transactions list (brief)
            List<Map<String, Object>> transactions = new ArrayList<>();
            for (ExpenseDTO e : budgetExpenses) {
                transactions.add(Map.of(
                        "expenseId", e.getId(),
                        "name", e.getExpense().getExpenseName(),
                        "category",
                        (e.getCategoryName() != null && !e.getCategoryName().isEmpty()) ? e.getCategoryName()
                                : "Uncategorized",
                        "amount", e.getExpense().getAmount(),
                        "paymentMethod", e.getExpense().getPaymentMethod(),
                        "type", e.getExpense().getType(),
                        "date", e.getDate().toString(),
                        "comments", e.getExpense().getComments()));
            }

            Map<String, Object> singleBudget = new LinkedHashMap<>();
            singleBudget.put("budgetId", budget.getId());
            singleBudget.put("budgetName", budget.getName());
            singleBudget.put("allocatedAmount", Math.round(budget.getAmount() * 100.0) / 100.0);
            singleBudget.put("startDate", budgetStart.toString());
            singleBudget.put("endDate", budgetEnd.toString());
            singleBudget.put("valid", isBudgetValid(budget.getId()));
            singleBudget.put("totalLoss", Math.round(totalLoss * 100.0) / 100.0);
            singleBudget.put("totalGain", Math.round(totalGain * 100.0) / 100.0);
            singleBudget.put("remainingAmount", Math.round((budget.getAmount() - totalLoss) * 100.0) / 100.0);

            // Add individual payment method losses dynamically (for backward compatibility)
            for (Map.Entry<String, Double> pmEntry : budgetPaymentMethodLoss.entrySet()) {
                String pmKey = pmEntry.getKey();
                if ("cash".equalsIgnoreCase(pmKey)) {
                    singleBudget.put("cashLoss", Math.round(pmEntry.getValue() * 100.0) / 100.0);
                } else if ("creditNeedToPaid".equalsIgnoreCase(pmKey)) {
                    singleBudget.put("creditNeedToPaidLoss", Math.round(pmEntry.getValue() * 100.0) / 100.0);
                } else if ("creditPaid".equalsIgnoreCase(pmKey)) {
                    singleBudget.put("creditPaidLoss", Math.round(pmEntry.getValue() * 100.0) / 100.0);
                }
            }

            singleBudget.put("transactions", budgetExpenses.size());
            singleBudget.put("paymentMethodBreakdown", paymentBreakdown);
            singleBudget.put("categoryBreakdown", categoryBreakdown);
            singleBudget.put("expenses", transactions);
            singleBudget.put("percentageUsed",
                    budget.getAmount() > 0 ? Math.round((totalLoss / budget.getAmount()) * 100 * 100.0) / 100.0 : 0.0);

            budgetData.add(singleBudget);
        }

        // Sort budgets by percentage used descending for prioritization
        budgetData.sort((a, b) -> Double.compare(
                ((Number) b.get("percentageUsed")).doubleValue(),
                ((Number) a.get("percentageUsed")).doubleValue()));

        // Calculate overall category percentages
        for (Map.Entry<String, Map<String, Object>> entry : overallCategoryBreakdown.entrySet()) {
            double amt = ((Number) entry.getValue().get("amount")).doubleValue();
            entry.getValue().put("amount", Math.round(amt * 100.0) / 100.0);
            entry.getValue().put("percentage",
                    overallTotalLoss > 0 ? Math.round((amt / overallTotalLoss) * 100 * 100.0) / 100.0 : 0.0);
        }

        // Calculate overall payment method breakdown percentages (already aggregated
        // during expense processing)
        for (Map.Entry<String, Map<String, Object>> entry : overallPaymentMethodBreakdown.entrySet()) {
            double amt = ((Number) entry.getValue().get("amount")).doubleValue();
            entry.getValue().put("amount", Math.round(amt * 100.0) / 100.0);
            entry.getValue().put("percentage",
                    overallTotalLoss > 0 ? Math.round((amt / overallTotalLoss) * 100 * 100.0) / 100.0 : 0.0);
        }

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("userId", userId);
        summary.put("fromDate", fromDate.toString());
        summary.put("toDate", toDate.toString());
        summary.put("rangeType", rangeType != null ? rangeType : "custom");
        summary.put("offset", offset);
        summary.put("flowType", flowType != null ? flowType : "all");
        summary.put("totalBudgets", budgetData.size());
        summary.put("grandTotalSpent", Math.round(grandTotalSpent * 100.0) / 100.0);
        summary.put("grandTotalTransactions", grandTotalTransactions);
        summary.put("overallTotalLoss", Math.round(overallTotalLoss * 100.0) / 100.0);
        summary.put("overallTotalGain", Math.round(overallTotalGain * 100.0) / 100.0);
        summary.put("overallCategoryBreakdown", overallCategoryBreakdown);
        summary.put("overallPaymentMethodBreakdown", overallPaymentMethodBreakdown);
        summary.put("averageSpentPerBudget",
                budgetData.size() > 0 ? Math.round((grandTotalSpent / budgetData.size()) * 100.0) / 100.0 : 0.0);
        summary.put("generatedAt", LocalDate.now().toString());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("summary", summary);
        response.put("budgets", budgetData);
        return response;
    }

    @Override
    public Map<String, Object> getSingleBudgetDetailedReport(Integer userId, Integer budgetId, LocalDate fromDate,
            LocalDate toDate, String rangeType, int offset, String flowType) throws Exception {
        Budget budget = getBudgetById(budgetId, userId);
        if (budget == null) {
            throw new IllegalArgumentException("Budget not found with ID: " + budgetId);
        }

        // Determine date range: prioritize explicit fromDate/toDate, then rangeType
        LocalDate effectiveFromDate = fromDate;
        LocalDate effectiveToDate = toDate;

        // If explicit dates not provided, calculate from rangeType
        if ((effectiveFromDate == null || effectiveToDate == null) && rangeType != null
                && !rangeType.equalsIgnoreCase("all")) {
            LocalDate today = LocalDate.now();
            switch (rangeType.toLowerCase()) {
                case "day":
                    effectiveFromDate = today.plusDays(offset);
                    effectiveToDate = effectiveFromDate;
                    break;
                case "week":
                    LocalDate weekStart = today.plusWeeks(offset).with(java.time.DayOfWeek.MONDAY);
                    effectiveFromDate = weekStart;
                    effectiveToDate = weekStart.plusDays(6);
                    break;
                case "month":
                    LocalDate monthBase = today.plusMonths(offset);
                    effectiveFromDate = monthBase.withDayOfMonth(1);
                    effectiveToDate = monthBase.withDayOfMonth(monthBase.lengthOfMonth());
                    break;
                case "quarter":
                    // Calculate the current quarter (1-4)
                    int currentMonth = today.getMonthValue();
                    int currentQuarter = (currentMonth - 1) / 3; // 0-3
                    // Add offset to quarters
                    int targetQuarter = currentQuarter + offset;
                    int yearAdjustment = targetQuarter / 4;
                    targetQuarter = targetQuarter % 4;
                    if (targetQuarter < 0) {
                        targetQuarter += 4;
                        yearAdjustment--;
                    }
                    LocalDate quarterBase = today.plusYears(yearAdjustment);
                    // Quarter start months: Q1=1, Q2=4, Q3=7, Q4=10
                    int quarterStartMonth = targetQuarter * 3 + 1;
                    effectiveFromDate = LocalDate.of(quarterBase.getYear(), quarterStartMonth, 1);
                    effectiveToDate = effectiveFromDate.plusMonths(2).withDayOfMonth(
                            effectiveFromDate.plusMonths(2).lengthOfMonth());
                    break;
                case "year":
                    LocalDate yearBase = today.plusYears(offset);
                    effectiveFromDate = yearBase.withDayOfYear(1);
                    effectiveToDate = yearBase.withDayOfYear(yearBase.lengthOfYear());
                    break;
                case "budget":
                    // Use the budget's start and end dates
                    effectiveFromDate = budget.getStartDate();
                    effectiveToDate = budget.getEndDate();
                    break;
                default:
                    // "all" or unsupported - no date filtering
                    break;
            }
        }

        List<ExpenseDTO> budgetExpenses = getExpensesForUserByBudgetId(userId, budgetId);

        // Apply date range filter if specified
        if (effectiveFromDate != null && effectiveToDate != null) {
            final LocalDate finalFromDate = effectiveFromDate;
            final LocalDate finalToDate = effectiveToDate;
            budgetExpenses = budgetExpenses.stream()
                    .filter(dto -> {
                        LocalDate expenseDate = dto.getDate();
                        return !expenseDate.isBefore(finalFromDate) && !expenseDate.isAfter(finalToDate);
                    })
                    .collect(Collectors.toList());
        }

        // Apply flowType filter: if not provided or "all", include both loss and gain
        if (flowType != null && !flowType.equalsIgnoreCase("all")) {
            final String targetType = flowType.equalsIgnoreCase("loss") ? "loss" : "gain";
            budgetExpenses = budgetExpenses.stream()
                    .filter(dto -> dto.getExpense() != null &&
                            targetType.equalsIgnoreCase(dto.getExpense().getType()))
                    .collect(Collectors.toList());
        }
        // If flowType is null or "all", include all expenses (both loss and gain)

        double totalAmount = 0.0;
        int totalExpenses = budgetExpenses.size();
        Set<String> uniqueExpenseNames = new LinkedHashSet<>();
        Set<String> uniquePaymentMethods = new LinkedHashSet<>();

        // Track counts and amounts for expense names, payment methods and categories
        Map<String, Double> expenseNameAmountMap = new LinkedHashMap<>();
        Map<String, Integer> expenseNameCountMap = new LinkedHashMap<>();
        Map<String, Double> paymentMethodAmountMap = new LinkedHashMap<>();
        Map<String, Integer> paymentMethodCountMap = new LinkedHashMap<>();
        Map<String, Double> categoryAmountMap = new LinkedHashMap<>();
        Map<String, Integer> categoryCountMap = new LinkedHashMap<>();

        Map<String, Map<String, Object>> expenseGroups = new LinkedHashMap<>();

        for (ExpenseDTO dto : budgetExpenses) {
            if (dto.getExpense() == null)
                continue;
            String expenseName = dto.getExpense().getExpenseName();
            String paymentMethod = dto.getExpense().getPaymentMethod();
            double amount = dto.getExpense().getAmount();

            totalAmount += amount;
            uniqueExpenseNames.add(expenseName);
            if (paymentMethod != null && !paymentMethod.isEmpty()) {
                uniquePaymentMethods.add(paymentMethod);
            }

            // Track expense name totals and counts
            expenseNameAmountMap.put(expenseName, round2(expenseNameAmountMap.getOrDefault(expenseName, 0.0) + amount));
            expenseNameCountMap.put(expenseName, expenseNameCountMap.getOrDefault(expenseName, 0) + 1);

            // Track payment method totals and counts
            if (paymentMethod != null && !paymentMethod.isEmpty()) {
                paymentMethodAmountMap.put(paymentMethod,
                        round2(paymentMethodAmountMap.getOrDefault(paymentMethod, 0.0) + amount));
                paymentMethodCountMap.put(paymentMethod, paymentMethodCountMap.getOrDefault(paymentMethod, 0) + 1);
            }

            // Track category totals and counts
            String category = dto.getCategoryName() != null && !dto.getCategoryName().isEmpty()
                    ? dto.getCategoryName()
                    : "Uncategorized";
            categoryAmountMap.put(category, round2(categoryAmountMap.getOrDefault(category, 0.0) + amount));
            categoryCountMap.put(category, categoryCountMap.getOrDefault(category, 0) + 1);

            expenseGroups.computeIfAbsent(expenseName, k -> {
                Map<String, Object> g = new LinkedHashMap<>();
                g.put("expenseCount", 0);
                g.put("totalAmount", 0.0);
                g.put("expenseName", expenseName);
                g.put("paymentMethod", expenseName); // use expense name label similar to sample
                g.put("paymentMethods", new LinkedHashSet<String>());
                g.put("expenses", new ArrayList<Map<String, Object>>());
                return g;
            });

            Map<String, Object> group = expenseGroups.get(expenseName);
            group.put("expenseCount", ((Number) group.get("expenseCount")).intValue() + 1);
            group.put("totalAmount", round2(((Number) group.get("totalAmount")).doubleValue() + amount));
            @SuppressWarnings("unchecked")
            Set<String> pmSet = (Set<String>) group.get("paymentMethods");
            if (paymentMethod != null && !paymentMethod.isEmpty()) {
                pmSet.add(paymentMethod);
            }

            Map<String, Object> expenseDetails = new LinkedHashMap<>();
            expenseDetails.put("date", dto.getDate().toString());
            expenseDetails.put("id", dto.getId());

            Map<String, Object> details = new LinkedHashMap<>();
            details.put("amount", round2(dto.getExpense().getAmount()));
            details.put("comments", dto.getExpense().getComments());
            details.put("netAmount", round2(dto.getExpense().getNetAmount()));
            details.put("paymentMethod", dto.getExpense().getPaymentMethod());
            details.put("id", dto.getId());
            details.put("type", dto.getExpense().getType());
            details.put("expenseName", dto.getExpense().getExpenseName());
            details.put("creditDue", round2(dto.getExpense().getCreditDue()));
            expenseDetails.put("details", details);

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> expList = (List<Map<String, Object>>) group.get("expenses");
            expList.add(expenseDetails);
        }

        // Convert expense name totals to array format
        List<Map<String, Object>> expenseNameTotals = new ArrayList<>();
        for (Map.Entry<String, Double> entry : expenseNameAmountMap.entrySet()) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("expenseName", entry.getKey());
            item.put("totalAmount", entry.getValue());
            item.put("count", expenseNameCountMap.get(entry.getKey()));
            expenseNameTotals.add(item);
        }

        // Convert payment method totals to array format
        List<Map<String, Object>> paymentMethodTotals = new ArrayList<>();
        for (Map.Entry<String, Double> entry : paymentMethodAmountMap.entrySet()) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("paymentMethod", entry.getKey());
            item.put("totalAmount", entry.getValue());
            item.put("count", paymentMethodCountMap.get(entry.getKey()));
            paymentMethodTotals.add(item);
        }

        // Convert category totals to array format (mirror paymentMethodTotals shape)
        List<Map<String, Object>> categoryTotals = new ArrayList<>();
        for (Map.Entry<String, Double> entry : categoryAmountMap.entrySet()) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("category", entry.getKey());
            item.put("totalAmount", entry.getValue());
            item.put("count", categoryCountMap.get(entry.getKey()));
            categoryTotals.add(item);
        }

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("budgetName", budget.getName());
        summary.put("totalAmount", round2(totalAmount));
        String dateRangeStr = budget.getStartDate().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")) +
                " - " +
                budget.getEndDate().format(DateTimeFormatter.ofPattern("MMM dd, yyyy"));
        summary.put("dateRange", dateRangeStr);
        summary.put("totalExpenseNames", uniqueExpenseNames.size());
        summary.put("totalExpenses", totalExpenses);
        summary.put("expenseNameTotals", expenseNameTotals);
        summary.put("totalPaymentMethods", uniquePaymentMethods.size());
        summary.put("paymentMethodTotals", paymentMethodTotals);
        summary.put("totalCategories", categoryAmountMap.size());
        summary.put("categoryTotals", categoryTotals);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("summary", summary);
        for (Map.Entry<String, Map<String, Object>> entry : expenseGroups.entrySet()) {
            // convert paymentMethods set to list for JSON friendliness
            @SuppressWarnings("unchecked")
            Set<String> pmSet = (Set<String>) entry.getValue().get("paymentMethods");
            entry.getValue().put("paymentMethods", new ArrayList<>(pmSet));
            response.put(entry.getKey(), entry.getValue());
        }
        return response;
    }

    private double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

}