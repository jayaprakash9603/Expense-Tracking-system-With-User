package com.jaya.controller;

import com.jaya.exceptions.UserException;
import com.jaya.models.*;
import com.jaya.repository.BudgetRepository;
import com.jaya.repository.ExpenseRepository;
import com.jaya.service.*;
import org.apache.commons.collections4.map.HashedMap;
import org.hibernate.query.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.jaya.dto.ExpenseDTO;

import jakarta.mail.MessagingException;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.Year;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;
   
    @Autowired
    private AuditExpenseService auditExpenseService;


    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private UserService userService;
    

    @Autowired
    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
       
		
    }

    @PostMapping("/add-expense")
    public ResponseEntity<Expense> addExpense(@Validated @RequestBody Expense expense,@RequestHeader("Authorization") String jwt) throws Exception {

        User reqUser=userService.findUserByJwt(jwt);
        Expense createExpense=expenseService.addExpense(expense,reqUser);
        if(createExpense!=null)
        {
            auditExpenseService.logAudit(reqUser,expense.getId(), "create", "Expense created with ID: " + expense.getId());

        }
        return ResponseEntity.ok(createExpense);
    }

    @PostMapping("/add-multiple")
    public ResponseEntity<?> addMultipleExpenses(@RequestHeader("Authorization") String jwt, @RequestBody List<Expense> expenses) {
        User user = userService.findUserByJwt(jwt); // Get the user by JWT
        if (user == null) {
            return ResponseEntity.status(404).body("User not found");
        }

        List<String> errorMessages = new ArrayList<>();

        for (Expense expense : expenses) {
            // Reset ID to treat it as a new entity
            expense.setId(null);
            expense.setUser(user);

            // Reset ExpenseDetails and link back
            if (expense.getExpense() != null) {
                expense.getExpense().setId(null);
                expense.getExpense().setExpense(expense);
            }

            // Clean budget IDs based on user and date range
            Set<Integer> validBudgetIds = new HashSet<>();
            if (expense.getBudgetIds() != null) {
                for (Integer budgetId : expense.getBudgetIds()) {
                    Optional<Budget> optionalBudget = budgetRepository.findByUserIdAndId(user.getId(), budgetId);
                    if (optionalBudget.isPresent()) {
                        Budget budget = optionalBudget.get();
                        if (expense.getDate() != null &&
                                !expense.getDate().isBefore(budget.getStartDate()) &&
                                !expense.getDate().isAfter(budget.getEndDate())) {
                            validBudgetIds.add(budgetId);
                        }
                    }
                }
            }
            expense.setBudgetIds(validBudgetIds);
        }

        // Save the new expenses
        List<Expense> savedExpenses = expenseService.saveExpenses(expenses);

        // Update corresponding Budgets with new expense IDs
        for (Expense savedExpense : savedExpenses) {
            for (Integer budgetId : savedExpense.getBudgetIds()) {
                Budget budget = budgetRepository.findByUserIdAndId(user.getId(), budgetId).orElse(null);
                if (budget != null) {
                    if (budget.getExpenseIds() == null) budget.setExpenseIds(new HashSet<>());
                    budget.getExpenseIds().add(savedExpense.getId());
                    budget.setBudgetHasExpenses(true);
                    budgetRepository.save(budget);
                }
            }

            // Audit log
            ExpenseDetails details = savedExpense.getExpense();
            String logMessage = String.format(
                    "Expense created with ID %d. Details: Name - %s, Amount - %.2f, Type - %s, Payment Method - %s",
                    savedExpense.getId(),
                    details.getExpenseName(),
                    details.getAmount(),
                    details.getType(),
                    details.getPaymentMethod()
            );
            auditExpenseService.logAudit(user, savedExpense.getId(), "create", logMessage);
        }

        return ResponseEntity.status(201).body(savedExpenses);
    }



    @DeleteMapping("/delete-all")
    public ResponseEntity<String> deleteAllExpenses(@RequestHeader("Authorization") String jwt) {
        try {
            User reqUser=userService.findUserByJwt(jwt);
            List<Expense> allExpenses = expenseService.getAllExpenses(reqUser);

            if (!allExpenses.isEmpty()) {
                for (Expense expense : allExpenses) {
                    String expenseDetails = String.format(
                        "Deleting Expense with ID %d. Details: Name - %s, Amount - %.2f, Type - %s, Payment Method - %s",
                        expense.getId(), expense.getExpense().getExpenseName(), expense.getExpense().getAmount(),
                        expense.getExpense().getType(), expense.getExpense().getPaymentMethod()
                    );
                    auditExpenseService.logAudit( reqUser,expense.getId(), "delete", expenseDetails);
                }
                expenseService.deleteAllExpenses(reqUser,allExpenses);
                auditExpenseService.logAudit(reqUser,null, "delete", "All expenses deleted successfully.");
            } else {
                auditExpenseService.logAudit(reqUser,null, "delete", "Attempted to delete expenses, but no expenses were found.");
            }

            return ResponseEntity.ok("All expenses have been deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/expense/{id}")
    public ResponseEntity<Expense> getExpenseById(@PathVariable Integer id ,@RequestHeader("Authorization") String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        Expense expense = expenseService.getExpenseById(id,reqUser);
        if(expense==null)
        {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body(expense);
        }
        return ResponseEntity.ok(expense);
    }

    @GetMapping("/fetch-expenses-by-date")
    public ResponseEntity<List<Expense>> getExpensesByDateRange(
            @RequestParam LocalDate from,
            @RequestParam LocalDate to
    ,@RequestHeader("Authorization")String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        List<Expense> expenses = expenseService.getExpensesByDateRange(from, to,reqUser);
        return ResponseEntity.ok(expenses);
    }

    @Autowired
    ExpenseRepository expenseRepository;
    @GetMapping("/fetch-expenses")
    public ResponseEntity<List<Expense>> getAllExpenses(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(defaultValue = "desc") String sort
    ) {
        User reqUser = userService.findUserByJwt(jwt);
        List<Expense> expenses = sort.equalsIgnoreCase("asc")
                ? expenseRepository.findByUserOrderByDateAsc(reqUser)
                : expenseRepository.findByUserOrderByDateDesc(reqUser);
        return ResponseEntity.ok(expenses);
    }

    @GetMapping("/summary-expenses")
    public ResponseEntity<Map<String, Object>> summary(@RequestHeader("Authorization") String jwt) {
        User reqUser = userService.findUserByJwt(jwt);
        List<Expense> expenses = expenseService.getAllExpenses(reqUser);

        LocalDate today = LocalDate.now();

        // Common period: 17th last month to 16th this month
        LocalDate periodStart = today.minusMonths(1).withDayOfMonth(17);
        LocalDate periodEnd = today.withDayOfMonth(16);

        double totalGains = 0.0;
        double totalLosses = 0.0;
        double totalCreditDue = 0.0;
        double totalCreditPaid = 0.0;
        double todayExpenses = 0.0;

        Map<String, Double> lossesByPaymentMethod = new HashMap<>();

        List<Expense> lastFiveExpenses = expenses.stream()
                .sorted(Comparator.comparing(Expense::getDate).reversed())
                .limit(5)
                .collect(Collectors.toList());

        for (Expense expense : expenses) {
            ExpenseDetails details = expense.getExpense();
            if (details == null) continue;

            LocalDate date = expense.getDate();
            if (date == null) continue;

            String type = details.getType();
            String paymentMethod = details.getPaymentMethod();

            // === Total Salary Amount (for Remaining Budget) ===
            // Exclude gain/loss entries with paymentMethod "creditNeedToPaid"
            if ((type.equalsIgnoreCase("gain") || type.equalsIgnoreCase("loss")) &&
                    !"creditNeedToPaid".equalsIgnoreCase(paymentMethod)) {
                totalGains += details.getNetAmount();  // No null check needed (primitive)
            }

            // === Losses from 17th last month to 16th this month (only cash) ===
            if (!date.isBefore(periodStart) && !date.isAfter(periodEnd)) {
                if ("loss".equalsIgnoreCase(type) && "cash".equalsIgnoreCase(paymentMethod)) {
                    totalLosses += details.getAmount();
                    lossesByPaymentMethod.merge(
                            paymentMethod.toLowerCase(),
                            details.getAmount(),
                            Double::sum
                    );
                }
            }

            // === Today's total expenses (all types) ===
            if (date.isEqual(today) && "loss".equalsIgnoreCase(type)) {
                todayExpenses += details.getAmount();
            }

            // === Credit Due Calculation ===
            // Matches JS logic:
            // +amount for creditNeedToPaid
            // -amount for creditPaid
            if ("creditNeedToPaid".equalsIgnoreCase(paymentMethod)) {
                totalCreditDue += details.getAmount();
            } else if ("creditPaid".equalsIgnoreCase(paymentMethod)) {
                totalCreditDue -= details.getAmount();
                totalCreditPaid += details.getAmount();
            }
        }

        double remainingBudget = totalGains - totalLosses;

        Map<String, Object> response = new HashMap<>();
        response.put("totalGains", totalGains);
        response.put("totalLosses", totalLosses);
        response.put("totalCreditDue", totalCreditDue);
        response.put("totalCreditPaid", totalCreditPaid);
        response.put("lossesByPaymentMethod", lossesByPaymentMethod);
        response.put("lastFiveExpenses", lastFiveExpenses);
        response.put("todayExpenses", todayExpenses);
        response.put("remainingBudget", remainingBudget);

        return ResponseEntity.ok(response);
    }












    @PutMapping("/edit-expense/{id}")
    public ResponseEntity<String> updateExpense(@PathVariable Integer id, @RequestBody Expense expense,@RequestHeader("Authorization") String jwt) {
        try {
            User reqUser=userService.findUserByJwt(jwt);
            Expense existingExpense = expenseService.getExpenseById(id,reqUser);

            if (existingExpense != null) {
                String beforeUpdateDetails = String.format(
                    "Before Update - Name: %s, Amount: %.2f, Type: %s, Payment Method: %s",
                    existingExpense.getExpense().getExpenseName(), existingExpense.getExpense().getAmount(),
                    existingExpense.getExpense().getType(), existingExpense.getExpense().getPaymentMethod()
                );

                expenseService.updateExpense(id, expense);

                String afterUpdateDetails = String.format(
                    "After Update - Name: %s, Amount: %.2f, Type: %s, Payment Method: %s",
                    expense.getExpense().getExpenseName(), expense.getExpense().getAmount(),
                    expense.getExpense().getType(), expense.getExpense().getPaymentMethod()
                );

                String logDetails = String.format(
                    "Expense with ID %d updated. %s | %s", 
                    id, beforeUpdateDetails, afterUpdateDetails
                );

                auditExpenseService.logAudit(reqUser,id, "update", logDetails);
                return ResponseEntity.ok("Expense updated successfully");
            } else {
                auditExpenseService.logAudit(reqUser,id, "update", "Attempted to update non-existent expense with ID " + id);

            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Expense Not found");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }


    @PutMapping("/edit-multiple")
    public ResponseEntity<String> updateMultipleExpenses(@RequestBody List<Expense> expenses,@RequestHeader("Authorization") String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        expenseService.updateMultipleExpenses(reqUser,expenses);
        return ResponseEntity.ok("Expenses updated successfully.");
    }
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteExpense(@PathVariable Integer id,@RequestHeader("Authorization") String jwt) {
        try {
            User reqUser=userService.findUserByJwt(jwt);
            Expense expense = expenseService.getExpenseById(id,reqUser);
            
            if (expense != null) {
                String expenseDetails = String.format(
                    "Expense deleted with ID %d. Details: Name - %s, Amount - %.2f, Type - %s, Payment Method - %s",
                    expense.getId(), expense.getExpense().getExpenseName(), expense.getExpense().getAmount(),
                    expense.getExpense().getType(), expense.getExpense().getPaymentMethod()
                );
                auditExpenseService.logAudit(reqUser,id, "delete", expenseDetails);
            } else {
                auditExpenseService.logAudit(reqUser,id, "delete", "Attempted to delete non-existent expense with ID " + id);
            }

            expenseService.deleteExpense(id,reqUser);
            return ResponseEntity.ok("Expense deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }


    @DeleteMapping("/delete-multiple")
    public ResponseEntity<String> deleteMultipleExpenses(@RequestBody List<Integer> ids,@RequestHeader("Authorization") String jwt) {
        try {
            User reqUser=userService.findUserByJwt(jwt);
            for (Integer id : ids) {
                // Retrieve the expense details before deletion
                Expense expenseOpt = expenseService.getExpenseById(id,reqUser);
                if (expenseOpt!=null) {
                    Expense expense = expenseOpt;
                    String expenseDetails = String.format(
                        "Expense deleted with ID %d. Details: Name - %s, Amount - %.2f, Type - %s, Payment Method - %s",
                        expense.getId(), expense.getExpense().getExpenseName(), expense.getExpense().getAmount(),
                        expense.getExpense().getType(), expense.getExpense().getPaymentMethod()
                    );
                    
                    // Log the deletion action with detailed info
                    auditExpenseService.logAudit(reqUser,id, "delete", expenseDetails);
                } else {
                    // Log an attempt to delete a non-existent expense
                    auditExpenseService.logAudit(reqUser,id, "delete", "Attempted to delete non-existent expense with ID " + id);
                }
            }
            
            // Now delete all specified expenses
            expenseService.deleteExpensesByIds(ids,reqUser);
            return ResponseEntity.ok("Expenses deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }


    
    
    @GetMapping("/monthly-summary/{year}/{month}")
    public ResponseEntity<MonthlySummary> getMonthlySummary(
    		@PathVariable Integer year, 
    	    @PathVariable Integer month,
            @RequestHeader("Authorization") String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        MonthlySummary summary = expenseService.getMonthlySummary(year, month,reqUser);
        return ResponseEntity.ok(summary);
    }
    
    @GetMapping("/yearly-summary/{year}")
    public ResponseEntity<Map<String, MonthlySummary>> getYearlySummary(@PathVariable Integer year,@RequestHeader("Authorization") String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        Map<String, MonthlySummary> yearlySummary = expenseService.getYearlySummary(year,reqUser);
        return ResponseEntity.ok(yearlySummary);
    }
    
    @GetMapping("/between-dates")
    public ResponseEntity<List<MonthlySummary>> getSummaryBetweenDates(
            @RequestParam Integer startYear,
            @RequestParam Integer startMonth,
            @RequestParam Integer endYear,
            @RequestParam Integer endMonth,
            @RequestHeader("Authorization") String jwt) {
User reqUser=userService.findUserByJwt(jwt);
        List<MonthlySummary> summaries = expenseService.getSummaryBetweenDates(startYear, startMonth, endYear, endMonth,reqUser);
        return ResponseEntity.ok(summaries);
    }
    @GetMapping("/top-n")
    public List<Expense> getTopNExpenses(@RequestParam int n,@RequestHeader("Authorization") String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        return expenseService.getTopNExpenses(n,reqUser);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Expense>> searchExpenses(@RequestParam String expenseName,@RequestHeader("Authorization") String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        List<Expense> expenses = expenseService.searchExpensesByName(expenseName,reqUser);
        return ResponseEntity.ok(expenses);
    }
    
    
    @GetMapping("/filter")
    public ResponseEntity<List<Expense>> filterExpenses(
            @RequestParam(required = false) String expenseName,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String paymentMethod,
            @RequestParam(required = false) Double minAmount,
            @RequestParam(required = false) Double maxAmount,
            @RequestHeader("Authorization") String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        List<Expense> filteredExpenses = expenseService.filterExpenses(expenseName, startDate, endDate, type, paymentMethod, minAmount, maxAmount,reqUser);
        return ResponseEntity.ok(filteredExpenses);
    }
    
    @GetMapping("/top-expense-names")
    public List<String> getTopExpenseNames(@RequestParam int topN,@RequestHeader("Authorization") String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        return expenseService.getTopExpenseNames(topN,reqUser);
    }
    
    
    @GetMapping("/insights/monthly")
    public Map<String, Object> getMonthlySpendingInsights(@RequestParam("year") int year, @RequestParam("month") int month,@RequestHeader("Authorization") String jwt) {

        User reqUser=userService.findUserByJwt(jwt);
        return expenseService.getMonthlySpendingInsights(year, month,reqUser);
    }
    
    @GetMapping("/payment-method")
    public ResponseEntity<List<String>> getPaymentMethods(@RequestHeader("Authorization") String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        List<String> paymentMethods = expenseService.getPaymentMethods(reqUser);
        return ResponseEntity.ok(paymentMethods);
    }
    
    @GetMapping("/payment-method-summary")
    public ResponseEntity<Map<String, Map<String, Double>>> getPaymentMethodSummary(@RequestHeader("Authorization") String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        Map<String, Map<String, Double>> paymentMethodSummary = expenseService.getPaymentMethodSummary(reqUser);
        return ResponseEntity.ok(paymentMethodSummary);
    }
    
    @GetMapping("/gain")
    public List<Expense> getAllGainExpenses(@RequestHeader("Authorization") String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        return expenseService.getExpensesByType("gain",reqUser);
    }
    
    @GetMapping("/loss")
    public ResponseEntity<List<Expense>> getLossExpenses(@RequestHeader("Authorization") String jwt) {
        User  reqUser=userService.findUserByJwt(jwt);
        List<Expense> lossExpenses = expenseService.getLossExpenses(reqUser);
        if (lossExpenses.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(lossExpenses);
    }
    
    @GetMapping("/payment-method/{paymentMethod}")
    public ResponseEntity<List<Expense>> getExpensesByPaymentMethod(@PathVariable String paymentMethod,@RequestHeader("Authorization") String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        List<Expense> expenses = expenseService.getExpensesByPaymentMethod(paymentMethod,reqUser);
        if (expenses.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(expenses);
    }
    
    @GetMapping("/{type}/{paymentMethod}")
    public ResponseEntity<List<Expense>> getExpensesByTypeAndPaymentMethod(
        @PathVariable String type, 
        @PathVariable String paymentMethod,
        @RequestHeader("Authorization") String jwt) {
User reqUser=userService.findUserByJwt(jwt);
        List<Expense> expenses = expenseService.getExpensesByTypeAndPaymentMethod(type, paymentMethod,reqUser);

        if (expenses.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(expenses);
    }
    

    @GetMapping("/top-payment-methods")
    public List<String> getTopPaymentMethods(@RequestHeader("Authorization")String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        return expenseService.getTopPaymentMethods(reqUser);
    }
    
    @GetMapping("/top-gains")
    public List<Expense> getTopGains(
            @RequestHeader("Authorization") String jwt
    ) {
        User reqUser=userService.findUserByJwt(jwt);
        return expenseService.getTopGains(reqUser);
    }
    
    @GetMapping("/top-losses")
    public List<Expense> getTopLosses(@RequestHeader("Authorization") String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        return expenseService.getTopLosses(reqUser);
    }
    
    
    @GetMapping("/by-month")
    public List<Expense> getExpensesByMonthAndYear(
            @RequestParam int month,
            @RequestParam int year,
            @RequestHeader("Authorization") String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        return expenseService.getExpensesByMonthAndYear(month, year,reqUser);
    }
    
    
    // Endpoint to get top N expenses with type 'gain'
    @GetMapping("/top-gains/unique")
    public List<String> getTopGains(@RequestParam(value = "limit", defaultValue = "10") int limit,@RequestHeader("Authorization")String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        // Fetch the unique top 'gain' expenses
        List<String> topGains = expenseService.getUniqueTopExpensesByGain(reqUser,limit);
        
        // Limit the results based on the 'limit' parameter
        if (topGains.size() > limit) {
            return topGains.subList(0, limit);
        }
        
        return topGains;
    }
    
    @GetMapping("/top-losses/unique")
    public List<String> getTopLosses(@RequestParam(value = "limit", defaultValue = "10") int limit,@RequestHeader("Authorization")String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        // Fetch the unique top 'gain' expenses
        List<String> topLosses = expenseService.getUniqueTopExpensesByLoss(reqUser,limit);
        
        // Limit the results based on the 'limit' parameter
        if (topLosses.size() > limit) {
            return topLosses.subList(0, limit);
        }
        
        return topLosses;
    }
    
    @GetMapping("/today")
    public List<Expense> getExpensesForToday(@RequestHeader("Authorization")String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        return expenseService.getExpensesForToday(reqUser);  // Call the service method to get today's expenses
    }
    
    @GetMapping("/last-month")
    public List<Expense> getExpensesForLastMonth(@RequestHeader("Authorization")String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        return expenseService.getExpensesForLastMonth(reqUser);  // Call the service method to get last month's expenses
    }
    
    @GetMapping("/current-month")
    public List<Expense> getExpensesForCurrentMonth(@RequestHeader("Authorization")String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        return expenseService.getExpensesForCurrentMonth(reqUser);  // Fetch current month's expenses
    }
    
    @GetMapping("/{id}/comments")
    public String getCommentsForExpense(@PathVariable Integer id,@RequestHeader("Authorization")String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        // Call the service to get comments for the expense with the provided id
        return expenseService.getCommentsForExpense(id,reqUser);
    }
    
    @DeleteMapping("/{id}/remove-comment")
    public String removeCommentForExpense(@PathVariable Integer id,@RequestHeader("Authorization")String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        // Call the service to remove the comment for the expense with the provided id
        return expenseService.removeCommentFromExpense(id,reqUser);
    }
    
    @PostMapping("/{id}/generate-report")
    public ResponseEntity<ExpenseReport> generateReport(@PathVariable Integer id,@RequestHeader("Authorization")String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        try {
            // Generate the report using the service layer
            ExpenseReport report = expenseService.generateExpenseReport(id,reqUser);

            // Return the generated report with a success status
            return new ResponseEntity<>(report, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            // Return a 404 status if the expense is not found
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    @PostMapping("/{id}/copy")
    public ResponseEntity<Expense> copyExpense(@PathVariable Integer id,@RequestHeader("Authorization")String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        try {
            Expense copiedExpense = expenseService.copyExpense(id,reqUser);
            return ResponseEntity.ok(copiedExpense);  // Return the copied expense
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(null);  // Return 404 if not found
        }
    }
    @GetMapping("/amount/{amount}")
    public ResponseEntity<List<ExpenseDetails>> getExpenseDetailsByAmount(@PathVariable double amount,@RequestHeader("Authorization")String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        List<ExpenseDetails> expenseDetails = expenseService.getExpenseDetailsByAmount(amount,reqUser);
        if (expenseDetails.isEmpty()) {
            return ResponseEntity.status(404).body(null);  // Return 404 if no data found
        }
        return ResponseEntity.ok(expenseDetails);  // Return the found expense details
    }
    @GetMapping("/amount-range")
    public ResponseEntity<List<Expense>> getExpenseDetailsByAmountRange(
            @RequestParam double minAmount,
            @RequestParam double maxAmount,
            @RequestHeader("Authorization")String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        List<Expense> expenseDetails = expenseService.getExpenseDetailsByAmountRange(minAmount, maxAmount,reqUser);
        if (expenseDetails.isEmpty()) {
            return ResponseEntity.status(404).body(null);  // Return 404 if no data found
        }
        return ResponseEntity.ok(expenseDetails);  // Return the found expense details
    }
    
    
    @GetMapping("/total/{expenseName}")
    public ResponseEntity<String> getExpenseDetailsAndTotalByName(@PathVariable String expenseName,@RequestHeader("Authorization")String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        List<ExpenseDetails> expenses = expenseService.getExpensesByName(expenseName,reqUser);
        Double totalExpense = expenseService.getTotalExpenseByName(expenseName);

        if (expenses.isEmpty()) {
            return ResponseEntity.ok("No expenses found for " + expenseName);
        }

        StringBuilder response = new StringBuilder("Expenses for " + expenseName + ":\n");
        expenses.forEach(expense -> response.append("ID: ").append(expense.getId())
        		.append(", Date: ").append(expense.getExpense().getDate())
                .append(", Name: ").append(expense.getExpenseName())
                .append(", Amount: ").append(expense.getAmount())
                .append(", Type: ").append(expense.getType())
                .append(", Payment Method: ").append(expense.getPaymentMethod())
                .append("\n"));

        response.append("Total expenses for ").append(expenseName).append(": ").append(totalExpense);
        return ResponseEntity.ok(response.toString());
    }

    
    
    @GetMapping("/total-by-category")
    public List<Map<String, Object>> getTotalByCategory(@RequestHeader("Authorization")String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        return expenseService.getTotalByCategory(reqUser);
    }
    
    @GetMapping("/total-by-date")
    public Map<String, Double> getTotalByDate() {
        // Calling the service method to get the total expenses grouped by date
        return expenseService.getTotalByDate();
    }
    
    @GetMapping("/expenses/total-today")
    public Double getTotalForToday() {
        // Calling the service method to get total expenses for today
        return expenseService.getTotalForToday();
    }
    
    @GetMapping("/expenses/total-current-month")
    public Double getTotalForCurrentMonth() {
        // Calling the service method to get total expenses for the current month
        return expenseService.getTotalForCurrentMonth();
    }
    
    @GetMapping("/expenses/total-by-month-year")
    public ResponseEntity<Double> getTotalByMonthAndYear(@RequestParam int month, @RequestParam int year) {
        Double total = expenseService.getTotalForMonthAndYear(month, year);
        
        if (total != null) {
            return ResponseEntity.ok(total);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }
    
    @GetMapping("/expenses/total-by-date-range")
    public ResponseEntity<Double> getTotalByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        Double total = expenseService.getTotalByDateRange(startDate, endDate);
        
        if (total != null) {
            return ResponseEntity.ok(total);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }
    
    @GetMapping("/expenses/payment-wise-total-current-month")
    public Map<String, Double> getPaymentWiseTotalForCurrentMonth() {
        return expenseService.getPaymentWiseTotalForCurrentMonth();
    }
    
    @GetMapping("/expenses/payment-wise-total-last-month")
    public Map<String, Double> getPaymentWiseTotalForLastMonth() {
        return expenseService.getPaymentWiseTotalForLastMonth();
    }
    
    @GetMapping("/expenses/payment-wise-total-from-to")
    public Map<String, Double> getPaymentWiseTotalForDateRange(@RequestParam("startDate") String startDate,
                                                               @RequestParam("endDate") String endDate) {
        // Parse the string date into LocalDate
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        
        // Call the service method to fetch the data
        return expenseService.getPaymentWiseTotalForDateRange(start, end);
    }
    
    @GetMapping("/expenses/payment-wise-total-month")
    public Map<String, Double> getPaymentWiseTotalForMonth(@RequestParam("month") int month,
                                                           @RequestParam("year") int year) {
        // Call the service method to fetch the data for the specified month and year
        return expenseService.getPaymentWiseTotalForMonth(month, year);
    }
    
    
    @GetMapping("/expenses/total-by-expense-payment-method")
    public Map<String, Map<String, Double>> getTotalByExpenseNameAndPaymentMethodForMonth(
            @RequestParam("month") int month, @RequestParam("year") int year) {
        // Call the service method to fetch the data for the specified month and year
        return expenseService.getTotalByExpenseNameAndPaymentMethod(month, year);
    }
    
    @GetMapping("/expenses/total-by-expense-payment-method-range")
    public Map<String, Map<String, Double>> getTotalByExpenseNameAndPaymentMethodForDateRange(
            @RequestParam("startDate") String startDateStr, @RequestParam("endDate") String endDateStr) {
        // Parse the date strings into LocalDate objects
        LocalDate startDate = LocalDate.parse(startDateStr);
        LocalDate endDate = LocalDate.parse(endDateStr);

        // Call the service method to fetch the data for the specified date range
        return expenseService.getTotalByExpenseNameAndPaymentMethodForDateRange(startDate, endDate);
    }
    

    @GetMapping("/expenses/total-expense-payment-method")
    public Map<String, Map<String, Double>> getTotalExpensesGroupedByPaymentMethod() {
        return expenseService.getTotalExpensesGroupedByPaymentMethod();
    }
    


    @GetMapping("/generate-excel-report")
    public String generateExcelReport(@RequestHeader("Authorization")String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        try {
            return expenseService.generateExcelReport(reqUser);
        } catch (IOException e) {
            e.printStackTrace();
            return "Error generating report";
        }
    }

    @GetMapping("/send-excel-report")
    public String sendExcelReport(@RequestParam String toEmail,@RequestHeader("Authorization")String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        try {
            String filePath = expenseService.generateExcelReport(reqUser);
            expenseService.sendEmailWithAttachment(toEmail, "Expense Report", "Please find the attached expense report.", filePath);
            return "Email sent successfully";
        } catch (IOException | MessagingException e) {
            e.printStackTrace();
            return "Error sending email";
        }
    }
    

    @PostMapping("/send-monthly-report")
    public ResponseEntity<String> sendMonthlyReport(@RequestBody ReportRequest request) {
        return expenseService.generateAndSendMonthlyReport(request);
    }
    
   


    @Autowired
    private ExcelService excelService;

    @Autowired
    private EmailService emailService;

    @GetMapping("/current-month/excel")
    public ResponseEntity<InputStreamResource> getCurrentMonthExpensesExcel(@RequestHeader("Authorization")String jwt) throws IOException {
        User reqUser=userService.findUserByJwt(jwt);
        List<Expense> expenses = expenseService.getExpensesForCurrentMonth(reqUser);
        ByteArrayInputStream in = excelService.generateExcel(expenses);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=expenses.xlsx");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(new InputStreamResource(in));
    }

    @GetMapping("/current-month/email")
    public ResponseEntity<String> sendCurrentMonthExpensesEmail(@RequestParam String email,@RequestHeader("Authorization")String jwt) throws IOException, MessagingException {
        User reqUser=userService.findUserByJwt(jwt);
        List<Expense> expenses = expenseService.getExpensesForCurrentMonth(reqUser);
        ByteArrayInputStream in = excelService.generateExcel(expenses);
        byte[] bytes = in.readAllBytes();

        emailService.sendEmailWithAttachment(email, "Current Month Expenses", "Please find attached the current month expenses.", new ByteArrayResource(bytes), "expenses.xlsx");

        return ResponseEntity.ok("Email sent successfully");
    }
    
    @GetMapping("/expenses/last-month/email")
    public ResponseEntity<String> sendLastMonthExpensesEmail(@RequestParam String email,@RequestHeader("Authorization")String jwt) throws IOException, MessagingException {
        User reqUser=userService.findUserByJwt(jwt);
        List<Expense> expenses = expenseService.getExpensesForLastMonth(reqUser);
        ByteArrayInputStream in = excelService.generateExcel(expenses);
        byte[] bytes = in.readAllBytes();

        String subject = "Last Month's Expenses Report";
        emailService.sendEmailWithAttachment(email, subject, "Please find attached the last month's expenses.", new ByteArrayResource(bytes), "last_month_expenses.xlsx");

        return ResponseEntity.ok("Email sent successfully");
    }
    
    @GetMapping("/by-month/email")
    public ResponseEntity<String> sendExpensesByMonthAndYearEmail(
            @RequestParam int month,
            @RequestParam int year,
            @RequestHeader("Authorization") String jwt,
            @RequestParam String email) throws IOException, MessagingException {
User reqUser=userService.findUserByJwt(jwt);
        List<Expense> expenses = expenseService.getExpensesByMonthAndYear(month, year,reqUser);
        ByteArrayInputStream in = excelService.generateExcel(expenses);
        byte[] bytes = in.readAllBytes();

        String subject = "Expenses Report for " + month + "/" + year;
        emailService.sendEmailWithAttachment(email, subject, "Please find attached the expenses report for " + month + "/" + year + ".", new ByteArrayResource(bytes), "expenses_" + month + "_" + year + ".xlsx");

        return ResponseEntity.ok("Email sent successfully");
    }
    
    @GetMapping("/email/all")
    public ResponseEntity<String> sendAllExpensesEmail(@RequestParam String email,@RequestHeader("Authorization")String jwt) throws IOException, MessagingException {
        User reqUser=userService.findUserByJwt(jwt);
        List<Expense> expenses = expenseService.getAllExpenses(reqUser);
        ByteArrayInputStream in = excelService.generateExcel(expenses);
        byte[] bytes = in.readAllBytes();

        String subject = "All Expenses Report";
        emailService.sendEmailWithAttachment(email, subject, "Please find attached the list of all expenses.", new ByteArrayResource(bytes), "all_expenses.xlsx");

        return ResponseEntity.ok("Email sent successfully");
    }
    
    
    @GetMapping("/{type}/{paymentMethod}/email")
    public ResponseEntity<String> sendExpensesByTypeAndPaymentMethodEmail(
            @PathVariable String type,
            @PathVariable String paymentMethod,
            @RequestParam String email,
            @RequestHeader("Authorization") String jwt) throws IOException, MessagingException {
        User reqUser=userService.findUserByJwt(jwt);
        List<Expense> expenses = expenseService.getExpensesByTypeAndPaymentMethod(type, paymentMethod,reqUser);
        if (expenses.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        ByteArrayInputStream in = excelService.generateExcel(expenses);
        byte[] bytes = in.readAllBytes();

        String subject = "Expenses Report for Type: " + type + " and Payment Method: " + paymentMethod;
        emailService.sendEmailWithAttachment(email, subject, "Please find attached the expenses report for type: " + type + " and payment method: " + paymentMethod + ".", new ByteArrayResource(bytes), "expenses_" + type + "_" + paymentMethod + ".xlsx");

        return ResponseEntity.ok("Email sent successfully");
    }
    
    
    @GetMapping("/fetch-expenses-by-date/email")
    public ResponseEntity<String> sendExpensesByDateRangeEmail(
            @RequestParam LocalDate from,
            @RequestParam LocalDate to,
            @RequestHeader("Authorization")String jwt,
            @RequestParam String email) throws IOException, MessagingException {
        User reqUser=userService.findUserByJwt(jwt);
        List<Expense> expenses = expenseService.getExpensesByDateRange(from, to,reqUser);
        if (expenses.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        ByteArrayInputStream in = excelService.generateExcel(expenses);
        byte[] bytes = in.readAllBytes();

        String subject = "Expenses Report from " + from + " to " + to;
        emailService.sendEmailWithAttachment(email, subject, "Please find attached the expenses report from " + from + " to " + to + ".", new ByteArrayResource(bytes), "expenses_" + from + "_to_" + to + ".xlsx");

        return ResponseEntity.ok("Email sent successfully");
    }
    @GetMapping("/expenses/gain/email")
    public ResponseEntity<String> sendGainExpensesEmail(@RequestParam String email,@RequestHeader("Authorization")String jwt) throws IOException, MessagingException {
        User reqUser=userService.findUserByJwt(jwt);
        List<Expense> expenses = expenseService.getExpensesByType("gain",reqUser);
        if (expenses.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        ByteArrayInputStream in = excelService.generateExcel(expenses);
        byte[] bytes = in.readAllBytes();

        String subject = "Gain Expenses Report";
        emailService.sendEmailWithAttachment(email, subject, "Please find attached the gain expenses report.", new ByteArrayResource(bytes), "gain_expenses.xlsx");

        return ResponseEntity.ok("Email sent successfully");
    }

    @GetMapping("/expenses/loss/email")
    public ResponseEntity<String> sendLossExpensesEmail(@RequestParam String email,@RequestHeader("Authorization") String jwt) throws IOException, MessagingException {
        User reqUser=userService.findUserByJwt(jwt);
        List<Expense> expenses = expenseService.getLossExpenses(reqUser);
        if (expenses.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        ByteArrayInputStream in = excelService.generateExcel(expenses);
        byte[] bytes = in.readAllBytes();

        String subject = "Loss Expenses Report";
        emailService.sendEmailWithAttachment(email, subject, "Please find attached the loss expenses report.", new ByteArrayResource(bytes), "loss_expenses.xlsx");

        return ResponseEntity.ok("Email sent successfully");
    }
    
    @GetMapping("/expenses/today/email")
    public ResponseEntity<String> sendExpensesForTodayEmail(@RequestParam String email,@RequestHeader("Authorization")String jwt) throws IOException, MessagingException {
        User reqUser=userService.findUserByJwt(jwt);
        List<Expense> expenses = expenseService.getExpensesForToday(reqUser);

        ByteArrayInputStream in;
        if (expenses.isEmpty()) {
            in = excelService.generateEmptyExcelWithColumns();
        } else {
            in = excelService.generateExcel(expenses);
        }
        byte[] bytes = in.readAllBytes();

        String subject = "Today's Expenses Report";
        emailService.sendEmailWithAttachment(email, subject, "Please find attached today's expenses report.", new ByteArrayResource(bytes), "today_expenses.xlsx");

        return ResponseEntity.ok("Email sent successfully");
    }
    
    @GetMapping("/payment-method/{paymentMethod}/email")
    public ResponseEntity<String> sendExpensesByPaymentMethodEmail(
            @PathVariable String paymentMethod,
            @RequestHeader("Authorization") String jwt,
            @RequestParam String email) throws IOException, MessagingException {
        User reqUser=userService.findUserByJwt(jwt);
        List<Expense> expenses = expenseService.getExpensesByPaymentMethod(paymentMethod,reqUser);

        ByteArrayInputStream in;
        if (expenses.isEmpty()) {
            in = excelService.generateEmptyExcelWithColumns();
        } else {
            in = excelService.generateExcel(expenses);
        }
        byte[] bytes = in.readAllBytes();

        String subject = "Expenses Report for Payment Method: " + paymentMethod;
        emailService.sendEmailWithAttachment(email, subject, "Please find attached the expenses report for payment method: " + paymentMethod + ".", new ByteArrayResource(bytes), "expenses_" + paymentMethod + ".xlsx");

        return ResponseEntity.ok("Email sent successfully");
    }
    
    
    @GetMapping("/expenses/amount-range/email")
    public ResponseEntity<String> sendExpenseDetailsByAmountRangeEmail(
            @RequestParam double minAmount,
            @RequestParam double maxAmount,
            @RequestParam String email,
            @RequestHeader("Authorization")String jwt) throws IOException, MessagingException {
        User reqUser=userService.findUserByJwt(jwt);
        List<Expense> expenseDetails = expenseService.getExpenseDetailsByAmountRange(minAmount, maxAmount,reqUser);

        ByteArrayInputStream in;
        if (expenseDetails.isEmpty()) {
            in = excelService.generateEmptyExcelWithColumns();
        } else {
            in = excelService.generateExpenseDetailsExcel(expenseDetails);
        }
        byte[] bytes = in.readAllBytes();

        String subject = "Expense Details Report for Amount Range: " + minAmount + " - " + maxAmount;
        emailService.sendEmailWithAttachment(email, subject, "Please find attached the expense details report for amount range: " + minAmount + " - " + maxAmount + ".", new ByteArrayResource(bytes), "expense_details_" + minAmount + "_" + maxAmount + ".xlsx");

        return ResponseEntity.ok("Email sent successfully");
    }
    
    
    @GetMapping("/expenses/search/email")
    public ResponseEntity<String> sendSearchExpensesByEmail(
            @RequestParam String expenseName,
            @RequestParam String email,
            @RequestHeader("Authorization") String jwt) throws IOException, MessagingException {
        User reqUser=userService.findUserByJwt(jwt);
        List<Expense> expenses = expenseService.searchExpensesByName(expenseName,reqUser);

        ByteArrayInputStream in;
        if (expenses.isEmpty()) {
            in = excelService.generateEmptyExcelWithColumns();
        } else {
            in = excelService.generateExcel(expenses);
        }
        byte[] bytes = in.readAllBytes();

        String subject = "Expense Search Results for: " + expenseName;
        emailService.sendEmailWithAttachment(email, subject, "Please find attached the expense search results for: " + expenseName + ".", new ByteArrayResource(bytes), "expense_search_results_" + expenseName + ".xlsx");

        return ResponseEntity.ok("Email sent successfully");
    }

    @GetMapping("/monthly-summary/{year}/{month}/email")
    public ResponseEntity<String> sendMonthlySummaryByEmail(
            @PathVariable Integer year, 
            @PathVariable Integer month,
            @RequestParam String email,
            @RequestHeader("Authorization") String jwt) throws IOException, MessagingException {
        User reqUser=userService.findUserByJwt(jwt);
        MonthlySummary summary = expenseService.getMonthlySummary(year, month,reqUser);

        ByteArrayInputStream in = excelService.generateMonthlySummaryExcel(summary);
        byte[] bytes = in.readAllBytes();

        String subject = "Monthly Summary for " + year + "-" + month;
        emailService.sendEmailWithAttachment(email, subject, "Please find attached the monthly summary for " + year + "-" + month + ".", new ByteArrayResource(bytes), "monthly_summary_" + year + "_" + month + ".xlsx");

        return ResponseEntity.ok("Email sent successfully");
    }
    
    
    
    
    @GetMapping("/payment-method-summary/email")
    public ResponseEntity<String> sendPaymentMethodSummaryByEmail(
            @RequestParam String email,
            @RequestHeader("Authorization") String jwt) throws IOException, MessagingException {
        User reqUser=userService.findUserByJwt(jwt);
        Map<String, Map<String, Double>> summary = expenseService.getPaymentMethodSummary(reqUser);

        ByteArrayInputStream in = excelService.generatePaymentMethodSummaryExcel(summary);
        byte[] bytes = in.readAllBytes();

        String subject = "Payment Method Summary";
        emailService.sendEmailWithAttachment(email, subject, "Please find attached the payment method summary.", new ByteArrayResource(bytes), "payment_method_summary.xlsx");

        return ResponseEntity.ok("Email sent successfully");
    }
    
    

    
    
    @GetMapping("/yearly-summary/email")
    public ResponseEntity<String> sendYearlySummaryByEmail(
            @RequestParam Integer year,
            @RequestParam String email,
            @RequestHeader("Authorization") String jwt) throws IOException, MessagingException {
        User reqUser=userService.findUserByJwt(jwt);
        Map<String, MonthlySummary> summary = expenseService.getYearlySummary(year,reqUser);

        ByteArrayInputStream in = excelService.generateYearlySummaryExcel(summary);
        byte[] bytes = in.readAllBytes();

        String subject = "Yearly Summary for " + year;
        emailService.sendEmailWithAttachment(email, subject, "Please find attached the yearly summary for " + year + ".", new ByteArrayResource(bytes), "yearly_summary_" + year + ".xlsx");

        return ResponseEntity.ok("Email sent successfully");
    }
    
    
    @GetMapping("/between-dates/email")
    public ResponseEntity<String> sendSummaryBetweenDatesByEmail(
            @RequestParam Integer startYear,
            @RequestParam Integer startMonth,
            @RequestParam Integer endYear,
            @RequestParam Integer endMonth,
            @RequestParam String email,
            @RequestHeader("Authorization") String jwt) throws IOException, MessagingException {
        User reqUser=userService.findUserByJwt(jwt);

        List<MonthlySummary> summaries = expenseService.getSummaryBetweenDates(startYear, startMonth, endYear, endMonth,reqUser);

        ByteArrayInputStream in = excelService.generateMonthlySummariesExcel(summaries);
        byte[] bytes = in.readAllBytes();

        String subject = "Monthly Summaries from " + startMonth + "/" + startYear + " to " + endMonth + "/" + endYear;
        emailService.sendEmailWithAttachment(email, subject, "Please find attached the monthly summaries.", new ByteArrayResource(bytes), "monthly_summaries.xlsx");

        return ResponseEntity.ok("Email sent successfully");
    }
    
    
    @GetMapping("/dropdown-values")
    public List<String> getDropdownValues() {
        return expenseService.getDropdownValues();
    }
    

    @GetMapping("/expenses/summary-types")
    public List<String> getLogTypes() {
        return expenseService.getSummaryTypes();
    }
    @GetMapping("/expenses/daily-summary-types")
    public List<String> getDailySummaryTypes() {
        return expenseService.getDailySummaryTypes();
    }
    @GetMapping("/expenses/expenses-types")
    public List<String> getExpensesTypes() {
        return expenseService.getExpensesTypes();
    }
    
    
    @GetMapping("/expenses/particular-month")
    public List<Expense> getParticularMonthExpenses(@RequestParam int year, @RequestParam int month) {
        return expenseService.getExpensesByMonth(year, month);
    }

//    @GetMapping("/expenses/today")
//    public List<Expense> getTodayExpenses() {
//        return expenseService.getExpensesByDate(LocalDate.now());
//    }

    @GetMapping("/expenses/yesterday")
    public List<Expense> getYesterdayExpenses(@RequestHeader("Authorization")String jwt){
        User reqUser=userService.findUserByJwt(jwt);
        return expenseService.getExpensesByDate(LocalDate.now().minusDays(1),reqUser);
    }

    @GetMapping("/particular-date")
    public List<Expense> getParticularDateExpenses(@RequestParam String date,@RequestHeader("Authorization")String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        LocalDate specificDate = LocalDate.parse(date);
        return expenseService.getExpensesByDate(specificDate,reqUser);
    }

    @GetMapping("/expenses/current-week")
    public List<Expense> getCurrentWeekExpenses() {
        return expenseService.getExpensesByCurrentWeek();
    }

    @GetMapping("/expenses/last-week")
    public List<Expense> getLastWeekExpenses() {
        return expenseService.getExpensesByLastWeek();
    }
    
//    @GetMapping("/expenses/month/email")
//    public ResponseEntity<String> sendMonthlyExpensesEmail(@RequestParam int month, @RequestParam int year, @RequestParam String email) throws IOException, MessagingException {
//        if (month < 1 || month > 12) {
//            return ResponseEntity.badRequest().body("Invalid month value. Please provide a value between 1 and 12.");
//        }
//        
//        List<Expense> expenses = expenseService.getExpensesByMonth(month, year);
//        System.out.println(expenses);
//        ByteArrayInputStream in = excelService.generateExcel(expenses);
//        byte[] bytes = in.readAllBytes();
//
//        String subject = "Monthly Expenses Report";
//        emailService.sendEmailWithAttachment(email, subject, "Please find attached the list of expenses for the month " + month + "/" + year + ".", new ByteArrayResource(bytes), "monthly_expenses_" + month + "_" + year + ".xlsx");
//
//        return ResponseEntity.ok("Monthly expenses report sent successfully");
//    }


    

    @GetMapping("/expenses/yesterday/email")
    public ResponseEntity<String> sendYesterdayExpensesEmail(@RequestParam String email,@RequestHeader("Authorization")String jwt) throws IOException, MessagingException {
        User reqUser=userService.findUserByJwt(jwt);
        List<Expense> expenses = expenseService.getExpensesByDate(LocalDate.now().minusDays(1),reqUser);
        ByteArrayInputStream in = excelService.generateExcel(expenses);
        byte[] bytes = in.readAllBytes();

        String subject = "Yesterday's Expenses Report";
        emailService.sendEmailWithAttachment(email, subject, "Please find attached the list of expenses for yesterday.", new ByteArrayResource(bytes), "yesterday_expenses.xlsx");

        return ResponseEntity.ok("Yesterday's expenses report sent successfully");
    }

    @GetMapping("/expenses/date/email")
    public ResponseEntity<String> sendDateExpensesEmail(@RequestParam String date, @RequestParam String email,@RequestHeader("Authorization")String jwt) throws IOException, MessagingException {
        User reqUser=userService.findUserByJwt(jwt);
        LocalDate specificDate = LocalDate.parse(date);
        List<Expense> expenses = expenseService.getExpensesByDate(specificDate,reqUser);
        ByteArrayInputStream in = excelService.generateExcel(expenses);
        byte[] bytes = in.readAllBytes();

        String subject = "Expenses Report for " + date;
        emailService.sendEmailWithAttachment(email, subject, "Please find attached the list of expenses for the date " + date + ".", new ByteArrayResource(bytes), "date_expenses_" + date + ".xlsx");

        return ResponseEntity.ok("Expenses report for " + date + " sent successfully");
    }

    @GetMapping("/expenses/current-week/email")
    public ResponseEntity<String> sendCurrentWeekExpensesEmail(@RequestParam String email) throws IOException, MessagingException {
        List<Expense> expenses = expenseService.getExpensesByCurrentWeek();
        ByteArrayInputStream in = excelService.generateExcel(expenses);
        byte[] bytes = in.readAllBytes();

        String subject = "Current Week Expenses Report";
        emailService.sendEmailWithAttachment(email, subject, "Please find attached the list of expenses for the current week.", new ByteArrayResource(bytes), "current_week_expenses.xlsx");

        return ResponseEntity.ok("Current week expenses report sent successfully");
    }

    @GetMapping("/expenses/last-week/email")
    public ResponseEntity<String> sendLastWeekExpensesEmail(@RequestParam String email) throws IOException, MessagingException {
        List<Expense> expenses = expenseService.getExpensesByLastWeek();
        ByteArrayInputStream in = excelService.generateExcel(expenses);
        byte[] bytes = in.readAllBytes();

        String subject = "Last Week Expenses Report";
        emailService.sendEmailWithAttachment(email, subject, "Please find attached the list of expenses for the last week.", new ByteArrayResource(bytes), "last_week_expenses.xlsx");

        return ResponseEntity.ok("Last week expenses report sent successfully");
    }
    
    
    

    @PostMapping("/validate-and-calculate")
    public ResponseEntity<Double> validateAndCalculateExpenses(@RequestBody List<ExpenseDTO> expenses) {
        List<ExpenseDTO> processedExpenses = expenseService.validateAndProcessExpenses(expenses);
        Map<String, Map<String, Double>> categorizedExpenses = expenseService.categorizeExpenses(processedExpenses);
        double totalAmount = expenseService.calculateTotalAmount(categorizedExpenses);
        return ResponseEntity.ok(totalAmount);
    }
    

    @PostMapping("/calculate-credit-due")
    public ResponseEntity<Double> calculateCreditDue(@RequestBody List<ExpenseDTO> expenses) {
        List<ExpenseDTO> processedExpenses = expenseService.validateAndProcessExpenses(expenses);
        double totalCreditDue = expenseService.calculateTotalCreditDue(processedExpenses);
        return ResponseEntity.ok(totalCreditDue);
    }

    @PostMapping("/find-top-expense-names")
    public List<String> findTopExpenseNames(@RequestBody List<ExpenseDTO> expenses, @RequestParam int topN) {
        expenseService.validateAndProcessExpenses(expenses);
        return expenseService.findTopExpenseNames(expenses, topN);
    }

    @PostMapping("/payload/find-top-payment-method")
    public String findTopPaymentMethod(@RequestBody List<ExpenseDTO> expenses) {
        return expenseService.findTopPaymentMethod(expenses);
    }
    
    
    @PostMapping("/payload/payment-method-names")
    public Set<String> getPaymentMethodNames(@RequestBody List<ExpenseDTO> expenses) {
        return expenseService.getPaymentMethodNames(expenses);
    }

    @PostMapping("/save")
    public ResponseEntity<List<Expense>> saveExpenses(
            @RequestBody List<ExpenseDTO> expenses,
            @RequestHeader("Authorization") String jwt) {

        User reqUser = userService.findUserByJwt(jwt);
        List<Expense> saved = expenseService.saveExpenses(expenses, reqUser);
        for (Expense expense : saved) {
            String expenseDetails = String.format(
                    "Expense created with ID %d. Details: Name - %s, Amount - %.2f, Type - %s, Payment Method - %s",
                    expense.getId(),
                    expense.getExpense().getExpenseName(),
                    expense.getExpense().getAmount(),
                    expense.getExpense().getType(),
                    expense.getExpense().getPaymentMethod()
            );

            // Log the creation
            auditExpenseService.logAudit(reqUser, expense.getId(), "create", expenseDetails);
        }
        return ResponseEntity.ok(saved);
    }






    @PostMapping("/upload")
    public ResponseEntity<List<Expense>>getFileContent(@RequestParam("file") MultipartFile file,@RequestHeader("Authorization")String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        try {
            List<Expense> expenses = excelService.parseExcelFile(file);
            int i=0;
            for(Expense expense : expenses) {
                expense.setId(i++);
                expense.getExpense().setId(i);
            }
            return ResponseEntity.ok(expenses);
        } catch (IOException e) {
            return ResponseEntity.status(500).body(null);
        }
    }
    
//    @PostMapping("/delete")
//    public ResponseEntity<Map<String, Object>> deleteEntries(@RequestParam("file") MultipartFile file) {
//        try {
//        	Map<String, Object> deleted= excelService.deleteEntries(file);
//            return ResponseEntity.ok(deleted);
//        } catch (IOException e) {
//        	Map<String,Object>error=new HashedMap<>();
//        	error.put("error occurred", e.getMessage());
//            return ResponseEntity.status(500).body(error);
//        }
//    }
    
    
    @PostMapping("/expenses/fetch-by-ids")
    public ResponseEntity<List<Expense>> getExpensesByIds(@RequestBody List<Integer> ids) {
        List<Expense> expenses = expenseService.getExpensesByIds(ids);
        return ResponseEntity.ok(expenses);
    }
    
    


    @PostMapping("/expenses/delete-and-send")
    public ResponseEntity<List<Map<String, Object>>> deleteExpenses(@RequestBody Map<String, Object> requestBody,@RequestParam("Authorization")String jwt) throws Exception {
        User reqUser=userService.findUserByJwt(jwt);
        List<Integer> ids = (List<Integer>) requestBody.get("deleteid");
        List<Map<String, Object>> expenses = (List<Map<String, Object>>) requestBody.get("expenses");

        // Delete expenses by IDs
        expenseService.deleteExpensesByIds(ids,reqUser);

        // Filter out deleted expenses from the input list
        List<Map<String, Object>> filteredExpenses = expenses.stream()
                .filter(expense -> !ids.contains((Integer) expense.get("id")))
                .collect(Collectors.toList());

        return ResponseEntity.ok(filteredExpenses);
    }
    

    @PostMapping("/expenses/save")
    public ResponseEntity<List<Expense>> saveExpenses(@RequestBody List<ExpenseDTO> expenseDTOs) {
        List<Expense> expenses = expenseDTOs.stream().map(dto -> {
            Expense expense = new Expense();
            expense.setId(dto.getId());
            expense.setDate(LocalDate.parse(dto.getDate()));

            ExpenseDetails details = new ExpenseDetails();
            details.setId(dto.getExpense().getId());
            details.setExpenseName(dto.getExpense().getExpenseName());
            details.setAmount(dto.getExpense().getAmount());
            details.setType(dto.getExpense().getType());
            details.setPaymentMethod(dto.getExpense().getPaymentMethod());
            details.setNetAmount(dto.getExpense().getNetAmount());
            details.setComments(dto.getExpense().getComments());
            details.setCreditDue(dto.getExpense().getCreditDue());
            details.setExpense(expense);

            expense.setExpense(details);
            return expense;
        }).collect(Collectors.toList());

        List<Expense> savedExpenses = expenseService.saveExpenses(expenses);

        return ResponseEntity.ok(savedExpenses);
    }





    @GetMapping("/groupedByDate")
    public ResponseEntity<Map<String, List<Map<String, Object>>>> getGroupedExpenses(
            @RequestHeader("Authorization")String jwt,

            @RequestParam(value = "sortOrder", defaultValue = "desc") String sortOrder) {



        User user = userService.findUserByJwt(jwt);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        Map<String, List<Map<String, Object>>> groupedExpenses = expenseService.getExpensesGroupedByDate(user ,sortOrder);

        return ResponseEntity.ok(groupedExpenses);
    }




    @GetMapping("/sorted")
    public ResponseEntity<Map<String, List<Map<String, Object>>>> getExpensesGroupedByDate(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "date") String sortBy,
            @RequestParam(defaultValue = "asc") String sortOrder) throws Exception {

        User user = userService.findUserByJwt(jwt);
        Map<String, List<Map<String, Object>>> groupedExpenses = expenseService.getExpensesGroupedByDateWithPagination(user, sortOrder, page, size, sortBy);
        return new ResponseEntity<>(groupedExpenses, HttpStatus.OK);
    }




    @GetMapping("/before/{expenseName}/{date}")
    public Expense getExpensesBeforeDate(
            @RequestHeader("Authorization")String jwt,
            @PathVariable String expenseName,
            @PathVariable String date) {
        LocalDate parsedDate = LocalDate.parse(date);
        User reqUser=userService.findUserByJwt(jwt);
        return expenseService.getExpensesBeforeDate(reqUser.getId(), expenseName, parsedDate);
    }


    @GetMapping("/current-month-top-expenses")
    public Map<String, Object> getTopExpensesForCustomMonth(@RequestHeader("Authorization")String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        LocalDate now = LocalDate.now();

        // Calculate the start date (17th of the previous month)
        LocalDate startDate = now.minusMonths(1).withDayOfMonth(17);

        // Calculate the end date (16th of the current month)
        LocalDate endDate = now.withDayOfMonth(16);

        // Fetch all expenses and filter by the custom date range (17th of last month to 16th of current month)
        List<Expense> expenses = expenseService.getAllExpenses(reqUser);

        // Initialize data structures for expense trend, monthly breakdown, and expense distribution
        List<Map<String, Object>> expenseTrend = new ArrayList<>();
        List<Map<String, Object>> monthlyBreakdown = new ArrayList<>();
        List<Map<String, Object>> expenseDistribution = new ArrayList<>();

        // Group expenses by category for the custom month range
        Map<String, Double> categoryTotals = new LinkedHashMap<>();

        // Process the expenses and categorize them by expense category
        for (Expense expense : expenses) {
            LocalDate expenseDate = expense.getDate();

            // Check if the expense date is within the custom month range (17th of last month to 16th of current month)
            if ((expenseDate.isAfter(startDate) || expenseDate.isEqual(startDate)) && (expenseDate.isBefore(endDate) || expenseDate.isEqual(endDate))) {
                ExpenseDetails details = expense.getExpense();
                if (details != null) {
                    String category = details.getExpenseName(); // Expense categories like 'Food', 'Entertainment', etc.
                    double amount = details.getAmount();

                    // Accumulate total for each category
                    categoryTotals.merge(category, amount, Double::sum);
                }
            }
        }

        // Sort the categories by amount and get the top 3
        List<Map.Entry<String, Double>> sortedCategories = new ArrayList<>(categoryTotals.entrySet());
        sortedCategories.sort((e1, e2) -> Double.compare(e2.getValue(), e1.getValue()));

        // Prepare the data for Line Chart and Bar Chart (only top 3 categories)
        Map<String, Object> trendData = new HashMap<>();
        Map<String, Object> monthlyData = new HashMap<>();
        int count = 0;
        for (Map.Entry<String, Double> entry : sortedCategories) {
            if (count == 3) break;  // Only top 3 categories

            String category = entry.getKey();
            Double amount = entry.getValue();

            // For Line Chart and Bar Chart
            trendData.put(category.toLowerCase(), amount);
            monthlyData.put(category, amount);

            // Prepare Pie Chart Data
            Map<String, Object> pieData = new HashMap<>();
            pieData.put("name", category);
            pieData.put("value", amount);
            expenseDistribution.add(pieData);

            count++;
        }

        // Add the data to the response map
        expenseTrend.add(trendData);  // Line Chart data
        monthlyBreakdown.add(monthlyData);  // Bar Chart data

        // Return the combined data for the custom "current month" (Line Chart, Bar Chart, Pie Chart)
        Map<String, Object> result = new HashMap<>();
        result.put("expenseTrend", expenseTrend);  // Line Chart Data
        result.put("monthlyBreakdown", monthlyBreakdown);  // Bar Chart Data
        result.put("expenseDistribution", expenseDistribution);  // Pie Chart Data

        return result;
    }


    @GetMapping("/by-name")
    public Map<String, Object> getExpenseByName(
            @RequestHeader("Authorization")String jwt,
            @RequestParam(value = "year", defaultValue = "0") int year) {
        User reqUser=userService.findUserByJwt(jwt);
        if (year == 0) {
            year = Year.now().getValue();
        }
        return expenseService.getExpenseByName(reqUser,year);
    }

    @GetMapping("/monthly")
    public Map<String, Object> getMonthlyExpenses(
            @RequestHeader("Authorization")String jwt,
            @RequestParam(value = "year", defaultValue = "0") int year) {
        if (year == 0) {
            year = Year.now().getValue();
        }
        User reqUser=userService.findUserByJwt(jwt);
        return expenseService.getMonthlyExpenses(reqUser,year);
    }

    @GetMapping("/trend")
    public Map<String, Object> getExpenseTrend(
            @RequestHeader("Authorization")String jwt,
            @RequestParam(value = "year", defaultValue = "0") int year) {
        if (year == 0) {
            year = Year.now().getValue();
        }
        User reqUser=userService.findUserByJwt(jwt);
        return expenseService.getExpenseTrend(reqUser,year);
    }

    @GetMapping("/payment-methods")
    public Map<String, Object> getPaymentMethodDistribution(
            @RequestHeader("Authorization")String jwt,
            @RequestParam(value = "year", defaultValue = "0") int year) {
        if (year == 0) {
            year = Year.now().getValue();
        }
        User reqUser=userService.findUserByJwt(jwt);
        return expenseService.getPaymentMethodDistribution(reqUser,year);
    }

    @GetMapping("/cumulative")
    public Map<String, Object> getCumulativeExpenses(
            @RequestHeader("Authorization")String jwt,
            @RequestParam(value = "year", defaultValue = "0") int year) {
        if (year == 0) {
            year = Year.now().getValue();
        }
        User reqUser=userService.findUserByJwt(jwt);
        return expenseService.getCumulativeExpenses(reqUser,year);
    }

    @GetMapping("/name-over-time")
    public Map<String, Object> getExpenseNameOverTime(
            @RequestHeader("Authorization")String jwt,
            @RequestParam(value = "year", defaultValue = "0") int year,
            @RequestParam(value = "limit", defaultValue = "5") int limit) {
        if (year == 0) {
            year = Year.now().getValue();
        }
        User reqUser=userService.findUserByJwt(jwt);
        return expenseService.getExpenseNameOverTime(reqUser,year, limit);
    }


    @GetMapping("/current-month/daily-spending")
    public List<Map<String, Object>> getDailySpendingCurrentMonth(@RequestHeader("Authorization")String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        return expenseService.getDailySpendingCurrentMonth(reqUser.getId());
    }

    @GetMapping("/current-month/totals")
    public List<Map<String, Object>> getMonthlySpendingAndIncomeCurrentMonth(@RequestHeader("Authorization")String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        return expenseService.getMonthlySpendingAndIncomeCurrentMonth(reqUser.getId());
    }

    @GetMapping("/current-month/distribution")
    public List<Map<String, Object>> getExpenseDistributionCurrentMonth(@RequestHeader("Authorization")String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        return expenseService.getExpenseDistributionCurrentMonth(reqUser.getId());
    }

    @GetMapping("/included-in-budget/{startDate}/{endDate}")
    public List<Expense> getIncludeInBudgetExpenses(@RequestHeader("Authorization")String jwt,@PathVariable LocalDate startDate, @PathVariable LocalDate endDate) {
        User reqUser=userService.findUserByJwt(jwt);
        return expenseService.findByUserIdAndDateBetweenAndIncludeInBudgetTrue(startDate, endDate, reqUser.getId());
    }


    @GetMapping("/{budgetId}/expenses")
    public ResponseEntity<?> getExpensesForBudgetRange(
            @PathVariable Integer budgetId,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {

        User user = userService.findUserByJwt(jwt);
        if (user == null) {
            return ResponseEntity.status(404).body("User not found");
        }

        try {
            List<Expense> expenses = expenseService.getExpensesInBudgetRangeWithIncludeFlag(
                    startDate,
                    endDate,
                    budgetId,
                    user.getId()
            );
            return ResponseEntity.ok(expenses);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }
}


