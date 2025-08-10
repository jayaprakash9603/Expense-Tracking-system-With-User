package com.jaya.controller;

import com.jaya.dto.User;
import com.jaya.exceptions.UserException;
import com.jaya.models.*;
import com.jaya.repository.ExpenseRepository;
import com.jaya.service.*;
import com.jaya.util.UserPermissionHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.InputStreamResource;
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
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    public static String ERROR_SENDING_EMAIL = "Error sending email: ";

    public Logger logger = LoggerFactory.getLogger(ExpenseController.class);


    @Autowired
    private ExpenseServiceHelper helper;

    @Autowired
    private UserService userService;

    @Autowired
    private FriendShipService friendshipService;

    @Autowired
    ExpenseRepository expenseRepository;


    @Autowired
    private ExcelService excelService;

    @Autowired
    private EmailService emailService;


    @Autowired
    private KafkaProducerService producer;


    @Autowired
    private UserPermissionHelper permissionHelper;


    @Autowired
    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;


    }


    /**
     * Handle runtime exceptions consistently
     */

    private ResponseEntity<?> handleRuntimeException(Exception e) {
        if (e.getMessage().contains("not found")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } else if (e.getMessage().contains("permission")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }


    @PostMapping("/add-expense")
    public ResponseEntity<?> addExpense(@Validated @RequestBody Expense expense,
                                        @RequestHeader("Authorization") String jwt,
                                        @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, true);

            Expense createdExpense = expenseService.addExpense(expense, targetUser.getId());

            return ResponseEntity.ok(createdExpense);
        } catch (Exception e) {
            return handleRuntimeException(e);
        }
    }


    @PostMapping("/{expenseId}/copy")
    public ResponseEntity<?> copyExpense(
            @PathVariable Integer expenseId,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, true);

            Expense createdExpense = expenseService.copyExpense(reqUser.getId(), expenseId);

            return ResponseEntity.ok(createdExpense);
        } catch (Exception e) {
            return handleRuntimeException(e);
        }
    }


    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserExpenses(@PathVariable Integer userId,
                                             @RequestHeader("Authorization") String jwt) throws Exception {
        User viewer = helper.authenticateUser(jwt);

        if (viewer.getId().equals(userId)) {
            List<Expense> expenses = expenseService.getAllExpenses(viewer.getId());
            return ResponseEntity.ok(expenses);
        }
        return handleFriendExpenseAccess(userId, viewer);
    }

    private ResponseEntity<?> handleFriendExpenseAccess(Integer userId, User viewer) throws Exception {
        if (!friendshipService.canUserAccessExpenses(userId, viewer.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You don't have permission to view this user's expenses");
        }

        AccessLevel accessLevel = friendshipService.getUserAccessLevel(userId, viewer.getId());
        User targetUser = userService.findUserById(userId);

        if (targetUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        switch (accessLevel) {
            case READ:
            case WRITE:
            case FULL:
                return ResponseEntity.ok(expenseService.getAllExpenses(targetUser.getId()));

            case SUMMARY:
                Map<String, MonthlySummary> yearlySummary = expenseService.getYearlySummary(
                        LocalDate.now().getYear(), targetUser.getId());
                return ResponseEntity.ok(yearlySummary);

            case LIMITED:
                return ResponseEntity.ok(createLimitedExpenseData(targetUser));

            default:
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You don't have permission to view this user's expenses");
        }
    }

    private Map<String, Object> createLimitedExpenseData(User targetUser) {
        MonthlySummary currentMonthSummary = expenseService.getMonthlySummary(
                LocalDate.now().getYear(),
                LocalDate.now().getMonthValue(),
                targetUser.getId());

        Map<String, Double> simplifiedSummary = new HashMap<>();
        simplifiedSummary.put("totalIncome", currentMonthSummary.getTotalAmount().doubleValue());
        simplifiedSummary.put("totalExpense", currentMonthSummary.getCash().getDifference().doubleValue());
        simplifiedSummary.put("balance", currentMonthSummary.getBalanceRemaining().doubleValue());

        Map<String, Object> limitedData = new HashMap<>();
        limitedData.put("currentMonth", simplifiedSummary);
        return limitedData;
    }

    @PostMapping("/add-multiple")
    public ResponseEntity<?> addMultipleExpenses(@RequestHeader("Authorization") String jwt,
                                                 @RequestBody List<Expense> expenses,
                                                 @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = helper.authenticateUser(jwt);
            User targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, true);
            List<Expense> savedExpenses = expenseService.addMultipleExpenses(expenses, targetUser.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(savedExpenses);
        } catch (Exception e) {
            return handleRuntimeException(e);
        }
    }


    @DeleteMapping("/delete-all")
    public ResponseEntity<?> deleteAllExpenses(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, true);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<Expense> allExpenses = expenseService.getAllExpenses(targetUser.getId());


            expenseService.deleteAllExpenses(targetUser.getId(), allExpenses);


            return new ResponseEntity<>("all expense are deleted", HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/expense/{id}")
    public ResponseEntity<?> getExpenseById(@PathVariable Integer id,
                                            @RequestHeader("Authorization") String jwt,
                                            @RequestParam(required = false) Integer targetId) {

        User reqUser = userService.findUserByJwt(jwt);
        User targetUser;

        try {
            targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, true);
        } catch (UserException e) {
            throw new RuntimeException(e);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return new ResponseEntity<>(expenseService.getExpenseById(id, targetUser.getId()), HttpStatus.OK);
    }

    @GetMapping("/fetch-expenses-by-date")
    public ResponseEntity<Object> getExpensesByDateRange(@RequestParam LocalDate from,
                                                         @RequestParam LocalDate to,
                                                         @RequestHeader("Authorization") String jwt,
                                                         @RequestParam(required = false) Integer targetId) {
        User reqUser = userService.findUserByJwt(jwt);
        User targetUser;

        try {
            targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, true);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return new ResponseEntity<>(expenseService.getExpensesByDateRange(from, to, targetUser.getId()), HttpStatus.OK);
    }


    @GetMapping("/fetch-expenses")
    public ResponseEntity<?> getAllExpenses(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(defaultValue = "desc") String sort,
            @RequestParam(required = false) Integer targetId) {

        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<Expense> expenses = sort.equalsIgnoreCase("asc")
                    ? expenseService.getExpensesByUserAndSort(targetUser.getId(), "asc")
                    : expenseService.getExpensesByUserAndSort(targetUser.getId(), "desc");

            return ResponseEntity.ok(expenses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/summary-expenses")
    public ResponseEntity<?> summary(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {

        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<Expense> expenses = expenseService.getAllExpenses(targetUser.getId());

            LocalDate today = LocalDate.now();

            // Common period: 17th last month to 16th this month
            LocalDate periodStart = today.minusMonths(1).withDayOfMonth(17);
            LocalDate periodEnd = today.withDayOfMonth(16);

            double totalGains = 0.0;
            double totalLosses = 0.0;
            double totalCreditDue = 0.0;
            double totalCreditPaid = 0.0;
            double todayExpenses = 0.0;
            double currentMonthLosses = 0.0;
            double currentMonthGains = 0.0;

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
                if ((type.equalsIgnoreCase("gain")) &&
                        paymentMethod.equals("cash")) {
                    totalGains += details.getAmount();
                }

                // === Losses from 17th last month to 16th this month (only cash) ===
                if ("loss".equalsIgnoreCase(type) && "cash".equalsIgnoreCase(paymentMethod)) {
                    totalLosses += details.getAmount();
                    lossesByPaymentMethod.merge(
                            paymentMethod.toLowerCase(),
                            details.getAmount(),
                            Double::sum
                    );
                }

                if (!date.isBefore(periodStart) && !date.isAfter(periodEnd)) {
                    if ("loss".equalsIgnoreCase(type) && "cash".equalsIgnoreCase(paymentMethod)) {
                        currentMonthLosses += details.getAmount();
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

            double remainingBudget = totalGains - totalLosses - totalCreditPaid;

            Map<String, Object> response = new HashMap<>();
            response.put("totalGains", totalGains);
            response.put("totalLosses", totalLosses);
            response.put("totalCreditDue", totalCreditDue);
            response.put("totalCreditPaid", totalCreditPaid);
            response.put("lossesByPaymentMethod", lossesByPaymentMethod);
            response.put("lastFiveExpenses", lastFiveExpenses);
            response.put("todayExpenses", todayExpenses);
            response.put("remainingBudget", remainingBudget);
            response.put("currentMonthLosses", currentMonthLosses);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }


    @PutMapping("/edit-expense/{id}")
    public ResponseEntity<?> updateExpense(
            @PathVariable Integer id,
            @RequestBody Expense expense,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, true);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            Expense existingExpense = expenseService.getExpenseById(id, targetUser.getId());

            if (existingExpense != null) {
                String beforeUpdateDetails = String.format(
                        "Before Update - Name: %s, Amount: %.2f, Type: %s, Payment Method: %s",
                        existingExpense.getExpense().getExpenseName(), existingExpense.getExpense().getAmount(),
                        existingExpense.getExpense().getType(), existingExpense.getExpense().getPaymentMethod()
                );

                // Pass the target user object as the third argument
                Expense updatedExpense = expenseService.updateExpense(id, expense, targetUser.getId());

                String afterUpdateDetails = String.format(
                        "After Update - Name: %s, Amount: %.2f, Type: %s, Payment Method: %s",
                        updatedExpense.getExpense().getExpenseName(), updatedExpense.getExpense().getAmount(),
                        updatedExpense.getExpense().getType(), updatedExpense.getExpense().getPaymentMethod()
                );

                String logDetails = String.format(
                        "Expense with ID %d updated. %s | %s",
                        id, beforeUpdateDetails, afterUpdateDetails
                );

                String auditMessage = targetId != null && !targetId.equals(reqUser.getId())
                        ? "Updated expense ID: " + id + " for user ID: " + targetId
                        : logDetails;


                // Return the updated expense object
                return ResponseEntity.ok(updatedExpense);
            } else {
                String auditMessage = targetId != null && !targetId.equals(reqUser.getId())
                        ? "Attempted to update non-existent expense with ID " + id + " for user ID: " + targetId
                        : "Attempted to update non-existent expense with ID " + id;


                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Expense not found");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }


    @PutMapping("/edit-multiple")
    public ResponseEntity<?> updateMultipleExpenses(
            @RequestBody List<Expense> expenses,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, true);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            // Get existing expenses before update for audit logging
            Map<Integer, Expense> existingExpenses = new HashMap<>();
            for (Expense expense : expenses) {
                if (expense.getId() != null) {
                    Expense existingExpense = expenseService.getExpenseById(expense.getId(), targetUser.getId());
                    if (existingExpense != null) {
                        existingExpenses.put(expense.getId(), existingExpense);
                    }
                }
            }

            // Update the expenses
            List<Expense> updatedExpenses = expenseService.updateMultipleExpenses(targetUser.getId(), expenses);

            // Log audit information for each updated expense
            for (Expense updatedExpense : updatedExpenses) {
                Expense existingExpense = existingExpenses.get(updatedExpense.getId());
                if (existingExpense != null) {
                    String beforeUpdateDetails = String.format(
                            "Before Update - Name: %s, Amount: %.2f, Type: %s, Payment Method: %s",
                            existingExpense.getExpense().getExpenseName(),
                            existingExpense.getExpense().getAmount(),
                            existingExpense.getExpense().getType(),
                            existingExpense.getExpense().getPaymentMethod()
                    );

                    String afterUpdateDetails = String.format(
                            "After Update - Name: %s, Amount: %.2f, Type: %s, Payment Method: %s",
                            updatedExpense.getExpense().getExpenseName(),
                            updatedExpense.getExpense().getAmount(),
                            updatedExpense.getExpense().getType(),
                            updatedExpense.getExpense().getPaymentMethod()
                    );

                    String logDetails;
                    if (targetId != null && !targetId.equals(reqUser.getId())) {
                        logDetails = String.format(
                                "Updated expense ID: %d for user ID: %d. %s | %s",
                                updatedExpense.getId(), targetId, beforeUpdateDetails, afterUpdateDetails
                        );
                    } else {
                        logDetails = String.format(
                                "Expense with ID %d updated. %s | %s",
                                updatedExpense.getId(), beforeUpdateDetails, afterUpdateDetails
                        );
                    }


                }
            }

            return ResponseEntity.ok(updatedExpenses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update expenses: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteExpense(
            @PathVariable Integer id,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


            targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, true);

            Expense expense = expenseService.getExpenseById(id, targetUser.getId());

            expenseService.deleteExpense(id, targetUser.getId());
            return ResponseEntity.ok("Expense deleted successfully");
        } catch (Exception e) {
            return handleRuntimeException(e);
        }
    }


    @DeleteMapping("/delete-multiple")
    public ResponseEntity<?> deleteMultipleExpenses(
            @RequestBody List<Integer> ids,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


            targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, true);

            expenseService.deleteExpensesByIds(ids, targetUser.getId());
            return ResponseEntity.ok("Expenses deleted successfully");
        } catch (Exception e) {
            return handleRuntimeException(e);
        }
    }


    @GetMapping("/monthly-summary/{year}/{month}")
    public ResponseEntity<?> getMonthlySummary(
            @PathVariable Integer year,
            @PathVariable Integer month,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            MonthlySummary summary = expenseService.getMonthlySummary(year, month, targetUser.getId());
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/yearly-summary/{year}")
    public ResponseEntity<?> getYearlySummary(
            @PathVariable Integer year,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


            targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);


            Map<String, MonthlySummary> yearlySummary = expenseService.getYearlySummary(year, targetUser.getId());
            return ResponseEntity.ok(yearlySummary);
        } catch (Exception e) {
            return handleRuntimeException(e);
        }
    }

    @GetMapping("/between-dates")
    public ResponseEntity<?> getSummaryBetweenDates(
            @RequestParam Integer startYear,
            @RequestParam Integer startMonth,
            @RequestParam Integer endYear,
            @RequestParam Integer endMonth,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


            targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);


            List<MonthlySummary> summaries = expenseService.getSummaryBetweenDates(startYear, startMonth, endYear, endMonth, targetUser.getId());
            return ResponseEntity.ok(summaries);
        } catch (Exception e) {
            return handleRuntimeException(e);
        }
    }


    @GetMapping("/top-n")
    public ResponseEntity<?> getTopNExpenses(
            @RequestParam int n,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<Expense> topExpenses = expenseService.getTopNExpenses(n, targetUser.getId());
            return ResponseEntity.ok(topExpenses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }


    @GetMapping("/search")
    public ResponseEntity<?> searchExpenses(
            @RequestParam String expenseName,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<Expense> expenses = expenseService.searchExpensesByName(expenseName, targetUser.getId());
            return ResponseEntity.ok(expenses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }


    @GetMapping("/filter")
    public ResponseEntity<?> filterExpenses(
            @RequestParam(required = false) String expenseName,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String paymentMethod,
            @RequestParam(required = false) Double minAmount,
            @RequestParam(required = false) Double maxAmount,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<Expense> filteredExpenses = expenseService.filterExpenses(expenseName, startDate, endDate, type, paymentMethod, minAmount, maxAmount, targetUser.getId());
            return ResponseEntity.ok(filteredExpenses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/top-expense-names")
    public ResponseEntity<?> getTopExpenseNames(
            @RequestParam int topN,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<String> topExpenseNames = expenseService.getTopExpenseNames(topN, targetUser.getId());
            return ResponseEntity.ok(topExpenseNames);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }


    @GetMapping("/insights/monthly")
    public ResponseEntity<?> getMonthlySpendingInsights(
            @RequestParam("year") int year,
            @RequestParam("month") int month,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            Map<String, Object> insights = expenseService.getMonthlySpendingInsights(year, month, targetUser.getId());
            return ResponseEntity.ok(insights);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/payment-method")
    public ResponseEntity<?> getPaymentMethods(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<String> paymentMethods = expenseService.getPaymentMethods(targetUser.getId());
            return ResponseEntity.ok(paymentMethods);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/payment-method-summary")
    public ResponseEntity<?> getPaymentMethodSummary(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            Map<String, Map<String, Double>> paymentMethodSummary = expenseService.getPaymentMethodSummary(targetUser.getId());
            return ResponseEntity.ok(paymentMethodSummary);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/gain")
    public ResponseEntity<?> getAllGainExpenses(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<Expense> expenses = expenseService.getExpensesByType("gain", targetUser.getId());
            return ResponseEntity.ok(expenses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/loss")
    public ResponseEntity<?> getLossExpenses(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<Expense> lossExpenses = expenseService.getLossExpenses(targetUser.getId());
            if (lossExpenses.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(lossExpenses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/payment-method/{paymentMethod}")
    public ResponseEntity<?> getExpensesByPaymentMethod(
            @PathVariable String paymentMethod,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<Expense> expenses = expenseService.getExpensesByPaymentMethod(paymentMethod, targetUser.getId());
            if (expenses.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(expenses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }


    @GetMapping("/{type}/{paymentMethod}")
    public ResponseEntity<?> getExpensesByTypeAndPaymentMethod(
            @PathVariable String type,
            @PathVariable String paymentMethod,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<Expense> expenses = expenseService.getExpensesByTypeAndPaymentMethod(type, paymentMethod, targetUser.getId());

            if (expenses.isEmpty()) {
                return ResponseEntity.noContent().build();
            }

            return ResponseEntity.ok(expenses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }


    @GetMapping("/top-payment-methods")
    public ResponseEntity<?> getTopPaymentMethods(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<String> topPaymentMethods = expenseService.getTopPaymentMethods(targetUser.getId());
            return ResponseEntity.ok(topPaymentMethods);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/top-gains")
    public ResponseEntity<?> getTopGains(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<Expense> topGains = expenseService.getTopGains(targetUser.getId());
            return ResponseEntity.ok(topGains);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/top-losses")
    public ResponseEntity<?> getTopLosses(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<Expense> topLosses = expenseService.getTopLosses(targetUser.getId());
            return ResponseEntity.ok(topLosses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }


    @GetMapping("/by-month")
    public ResponseEntity<?> getExpensesByMonthAndYear(
            @RequestParam int month,
            @RequestParam int year,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<Expense> expenses = expenseService.getExpensesByMonthAndYear(month, year, targetUser.getId());
            return ResponseEntity.ok(expenses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }


    @GetMapping("/top-gains/unique")
    public ResponseEntity<?> getTopGains(
            @RequestParam(value = "limit", defaultValue = "10") int limit,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            // Fetch the unique top 'gain' expenses
            List<String> topGains = expenseService.getUniqueTopExpensesByGain(targetUser.getId(), limit);

            // Limit the results based on the 'limit' parameter
            if (topGains.size() > limit) {
                topGains = topGains.subList(0, limit);
            }

            return ResponseEntity.ok(topGains);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/top-losses/unique")
    public ResponseEntity<?> getTopLosses(
            @RequestParam(value = "limit", defaultValue = "10") int limit,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            // Fetch the unique top 'loss' expenses
            List<String> topLosses = expenseService.getUniqueTopExpensesByLoss(targetUser.getId(), limit);

            // Limit the results based on the 'limit' parameter
            if (topLosses.size() > limit) {
                topLosses = topLosses.subList(0, limit);
            }

            return ResponseEntity.ok(topLosses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/today")
    public ResponseEntity<?> getExpensesForToday(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<Expense> expenses = expenseService.getExpensesForToday(targetUser.getId());
            return ResponseEntity.ok(expenses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/last-month")
    public ResponseEntity<?> getExpensesForLastMonth(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<Expense> expenses = expenseService.getExpensesForLastMonth(targetUser.getId());
            return ResponseEntity.ok(expenses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/current-month")
    public ResponseEntity<?> getExpensesForCurrentMonth(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<Expense> expenses = expenseService.getExpensesForCurrentMonth(targetUser.getId());
            return ResponseEntity.ok(expenses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<?> getCommentsForExpense(
            @PathVariable Integer id,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            String comments = expenseService.getCommentsForExpense(id, targetUser.getId());
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}/remove-comment")
    public ResponseEntity<?> removeCommentForExpense(
            @PathVariable Integer id,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, true);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            String result = expenseService.removeCommentFromExpense(id, targetUser.getId());


            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PostMapping("/{id}/generate-report")
    public ResponseEntity<?> generateReport(
            @PathVariable Integer id,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            // Generate the report using the service layer
            ExpenseReport report = expenseService.generateExpenseReport(id, targetUser.getId());


            // Return the generated report with a success status
            return new ResponseEntity<>(report, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            // Return a 404 status if the expense is not found
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Expense not found or error generating report: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error generating report: " + e.getMessage());
        }
    }


    @GetMapping("/amount/{amount}")
    public ResponseEntity<?> getExpenseDetailsByAmount(
            @PathVariable double amount,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<ExpenseDetails> expenseDetails = expenseService.getExpenseDetailsByAmount(amount, targetUser.getId());

            if (expenseDetails.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No expenses found with amount: " + amount);
            }


            return ResponseEntity.ok(expenseDetails);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving expenses: " + e.getMessage());
        }
    }


    @GetMapping("/amount-range")
    public ResponseEntity<?> getExpenseDetailsByAmountRange(
            @RequestParam double minAmount,
            @RequestParam double maxAmount,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<Expense> expenseDetails = expenseService.getExpenseDetailsByAmountRange(minAmount, maxAmount, targetUser.getId());

            if (expenseDetails.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No expenses found with amount between " + minAmount + " and " + maxAmount);
            }


            return ResponseEntity.ok(expenseDetails);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving expenses: " + e.getMessage());
        }
    }


    @GetMapping("/total/{expenseName}")
    public ResponseEntity<?> getExpenseDetailsAndTotalByName(
            @PathVariable String expenseName,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<ExpenseDetails> expenses = expenseService.getExpensesByName(expenseName, targetUser.getId());
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
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving expense details: " + e.getMessage());
        }
    }


    @GetMapping("/total-by-category")
    public ResponseEntity<?> getTotalByCategory(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<Map<String, Object>> categoryTotals = expenseService.getTotalByCategory(targetUser.getId());

            return ResponseEntity.ok(categoryTotals);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving category totals: " + e.getMessage());
        }
    }

    @GetMapping("/total-by-date")
    public ResponseEntity<?> getTotalByDate(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            Map<String, Double> totalByDate = expenseService.getTotalByDate(targetUser.getId());

            return ResponseEntity.ok(totalByDate);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving date totals: " + e.getMessage());
        }
    }

    @GetMapping("/expenses/total-today")
    public ResponseEntity<?> getTotalForToday(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            Double totalToday = expenseService.getTotalForToday(targetUser.getId());


            return ResponseEntity.ok(totalToday);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving today's total: " + e.getMessage());
        }
    }

    @GetMapping("/expenses/total-current-month")
    public ResponseEntity<?> getTotalForCurrentMonth(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            Double totalCurrentMonth = expenseService.getTotalForCurrentMonth(targetUser.getId());


            return ResponseEntity.ok(totalCurrentMonth);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving current month's total: " + e.getMessage());
        }
    }

    @GetMapping("/expenses/total-by-month-year")
    public ResponseEntity<?> getTotalByMonthAndYear(
            @RequestParam int month,
            @RequestParam int year,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            Double total = expenseService.getTotalForMonthAndYear(month, year, targetUser.getId());

            if (total != null) {
                return ResponseEntity.ok(total);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No expenses found for the specified month and year");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving total: " + e.getMessage());
        }
    }

    @GetMapping("/expenses/total-by-date-range")
    public ResponseEntity<?> getTotalByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {

        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            Double total = expenseService.getTotalByDateRange(startDate, endDate, targetUser.getId());


            if (total != null) {
                return ResponseEntity.ok(total);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No expenses found for the specified date range");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving total: " + e.getMessage());
        }
    }

    @GetMapping("/expenses/payment-wise-total-current-month")
    public ResponseEntity<?> getPaymentWiseTotalForCurrentMonth(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            Map<String, Double> paymentWiseTotals = expenseService.getPaymentWiseTotalForCurrentMonth(targetUser.getId());

            return ResponseEntity.ok(paymentWiseTotals);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving payment-wise totals: " + e.getMessage());
        }
    }

    @GetMapping("/expenses/payment-wise-total-last-month")
    public ResponseEntity<?> getPaymentWiseTotalForLastMonth(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            Map<String, Double> paymentWiseTotals = expenseService.getPaymentWiseTotalForLastMonth(targetUser.getId());


            return ResponseEntity.ok(paymentWiseTotals);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving payment-wise totals: " + e.getMessage());
        }
    }

    @GetMapping("/expenses/payment-wise-total-from-to")
    public ResponseEntity<?> getPaymentWiseTotalForDateRange(
            @RequestParam("startDate") String startDate,
            @RequestParam("endDate") String endDate,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            // Parse the string date into LocalDate
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);

            // Call the service method to fetch the data
            Map<String, Double> paymentWiseTotals = expenseService.getPaymentWiseTotalForDateRange(start, end, targetUser.getId());


            return ResponseEntity.ok(paymentWiseTotals);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving payment-wise totals: " + e.getMessage());
        }
    }

    @GetMapping("/expenses/payment-wise-total-month")
    public ResponseEntity<?> getPaymentWiseTotalForMonth(
            @RequestParam("month") int month,
            @RequestParam("year") int year,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            Map<String, Double> paymentWiseTotals = expenseService.getPaymentWiseTotalForMonth(month, year, targetUser.getId());


            return ResponseEntity.ok(paymentWiseTotals);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving payment-wise totals: " + e.getMessage());
        }
    }


    @GetMapping("/expenses/total-by-expense-payment-method")
    public ResponseEntity<?> getTotalByExpenseNameAndPaymentMethodForMonth(
            @RequestParam("month") int month,
            @RequestParam("year") int year,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            // Call the service method to fetch the data for the specified month and year
            Map<String, Map<String, Double>> result = expenseService.getTotalByExpenseNameAndPaymentMethod(month, year, targetUser.getId());


            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving expense-payment method totals: " + e.getMessage());
        }
    }

    @GetMapping("/expenses/total-by-expense-payment-method-range")
    public ResponseEntity<?> getTotalByExpenseNameAndPaymentMethodForDateRange(
            @RequestParam("startDate") String startDateStr,
            @RequestParam("endDate") String endDateStr,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            // Parse the date strings into LocalDate objects
            LocalDate startDate = LocalDate.parse(startDateStr);
            LocalDate endDate = LocalDate.parse(endDateStr);

            // Call the service method to fetch the data for the specified date range
            Map<String, Map<String, Double>> result = expenseService.getTotalByExpenseNameAndPaymentMethodForDateRange(startDate, endDate, targetUser.getId());


            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving expense-payment method totals: " + e.getMessage());
        }
    }


    @GetMapping("/expenses/total-expense-payment-method")
    public ResponseEntity<?> getTotalExpensesGroupedByPaymentMethod(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            Map<String, Map<String, Double>> result = expenseService.getTotalExpensesGroupedByPaymentMethod(targetUser.getId());


            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving expense-payment method totals: " + e.getMessage());
        }
    }


    @GetMapping("/generate-excel-report")
    public ResponseEntity<?> generateExcelReport(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            String reportPath = expenseService.generateExcelReport(targetUser.getId());

            return ResponseEntity.ok(reportPath);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error generating report: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error: " + e.getMessage());
        }
    }

    @GetMapping("/send-excel-report")
    public ResponseEntity<?> sendExcelReport(
            @RequestParam String toEmail,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            String filePath = expenseService.generateExcelReport(targetUser.getId());
            expenseService.sendEmailWithAttachment(toEmail, "Expense Report", "Please find the attached expense report.", filePath);


            return ResponseEntity.ok("Email sent successfully");
        } catch (IOException | MessagingException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ERROR_SENDING_EMAIL + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error: " + e.getMessage());
        }
    }


    @PostMapping("/send-monthly-report")
    public ResponseEntity<String> sendMonthlyReport(@RequestBody ReportRequest request) {
        return expenseService.generateAndSendMonthlyReport(request);
    }


    @GetMapping("/current-month/excel")
    public ResponseEntity<?> getCurrentMonthExpensesExcel(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<Expense> expenses = expenseService.getExpensesForCurrentMonth(targetUser.getId());
            ByteArrayInputStream in = excelService.generateExcel(expenses);


            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=expenses.xlsx");

            return ResponseEntity
                    .ok()
                    .headers(headers)
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(new InputStreamResource(in));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error generating Excel: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error: " + e.getMessage());
        }
    }

    @GetMapping("/current-month/email")
    public ResponseEntity<?> sendCurrentMonthExpensesEmail(
            @RequestParam String email,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<Expense> expenses = expenseService.getExpensesForCurrentMonth(targetUser.getId());
            ByteArrayInputStream in = excelService.generateExcel(expenses);
            byte[] bytes = in.readAllBytes();

            // Send the email with attachment
            emailService.sendEmailWithAttachment(
                    email,
                    "Current Month Expenses",
                    "Please find attached the current month expenses.",
                    new ByteArrayResource(bytes),
                    "expenses.xlsx"
            );


            return ResponseEntity.ok("Email sent successfully");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error generating Excel: " + e.getMessage());
        } catch (MessagingException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ERROR_SENDING_EMAIL + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error: " + e.getMessage());
        }
    }

    @GetMapping("/expenses/last-month/email")
    public ResponseEntity<?> sendLastMonthExpensesEmail(
            @RequestParam String email,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<Expense> expenses = expenseService.getExpensesForLastMonth(targetUser.getId());
            ByteArrayInputStream in = excelService.generateExcel(expenses);
            byte[] bytes = in.readAllBytes();

            String subject = "Last Month's Expenses Report";
            emailService.sendEmailWithAttachment(
                    email,
                    subject,
                    "Please find attached the last month's expenses.",
                    new ByteArrayResource(bytes),
                    "last_month_expenses.xlsx"
            );


            return ResponseEntity.ok("Email sent successfully");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error generating Excel: " + e.getMessage());
        } catch (MessagingException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ERROR_SENDING_EMAIL + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error: " + e.getMessage());
        }
    }

    @GetMapping("/by-month/email")
    public ResponseEntity<?> sendExpensesByMonthAndYearEmail(
            @RequestParam int month,
            @RequestParam int year,
            @RequestHeader("Authorization") String jwt,
            @RequestParam String email,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<Expense> expenses = expenseService.getExpensesByMonthAndYear(month, year, targetUser.getId());
            ByteArrayInputStream in = excelService.generateExcel(expenses);
            byte[] bytes = in.readAllBytes();

            String subject = "Expenses Report for " + month + "/" + year;
            emailService.sendEmailWithAttachment(
                    email,
                    subject,
                    "Please find attached the expenses report for " + month + "/" + year + ".",
                    new ByteArrayResource(bytes),
                    "expenses_" + month + "_" + year + ".xlsx"
            );


            return ResponseEntity.ok("Email sent successfully");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error generating Excel: " + e.getMessage());
        } catch (MessagingException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ERROR_SENDING_EMAIL + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error: " + e.getMessage());
        }
    }

    @GetMapping("/email/all")
    public ResponseEntity<?> sendAllExpensesEmail(
            @RequestParam String email,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<Expense> expenses = expenseService.getAllExpenses(targetUser.getId());
            ByteArrayInputStream in = excelService.generateExcel(expenses);
            byte[] bytes = in.readAllBytes();

            String subject = "All Expenses Report";
            emailService.sendEmailWithAttachment(
                    email,
                    subject,
                    "Please find attached the list of all expenses.",
                    new ByteArrayResource(bytes),
                    "all_expenses.xlsx"
            );


            return ResponseEntity.ok("Email sent successfully");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error generating Excel: " + e.getMessage());
        } catch (MessagingException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ERROR_SENDING_EMAIL + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error: " + e.getMessage());
        }
    }


    @GetMapping("/{type}/{paymentMethod}/email")
    public ResponseEntity<?> sendExpensesByTypeAndPaymentMethodEmail(
            @PathVariable String type,
            @PathVariable String paymentMethod,
            @RequestParam String email,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<Expense> expenses = expenseService.getExpensesByTypeAndPaymentMethod(type, paymentMethod, targetUser.getId());
            if (expenses.isEmpty()) {
                return ResponseEntity.noContent().build();
            }

            ByteArrayInputStream in = excelService.generateExcel(expenses);
            byte[] bytes = in.readAllBytes();

            String subject = "Expenses Report for Type: " + type + " and Payment Method: " + paymentMethod;
            emailService.sendEmailWithAttachment(
                    email,
                    subject,
                    "Please find attached the expenses report for type: " + type + " and payment method: " + paymentMethod + ".",
                    new ByteArrayResource(bytes),
                    "expenses_" + type + "_" + paymentMethod + ".xlsx"
            );


            return ResponseEntity.ok("Email sent successfully");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error generating Excel: " + e.getMessage());
        } catch (MessagingException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ERROR_SENDING_EMAIL + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error: " + e.getMessage());
        }
    }


    @GetMapping("/fetch-expenses-by-date/email")
    public ResponseEntity<?> sendExpensesByDateRangeEmail(
            @RequestParam LocalDate from,
            @RequestParam LocalDate to,
            @RequestHeader("Authorization") String jwt,
            @RequestParam String email,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<Expense> expenses = expenseService.getExpensesByDateRange(from, to, targetUser.getId());
            if (expenses.isEmpty()) {
                return ResponseEntity.noContent().build();
            }

            ByteArrayInputStream in = excelService.generateExcel(expenses);
            byte[] bytes = in.readAllBytes();

            String subject = "Expenses Report from " + from + " to " + to;
            emailService.sendEmailWithAttachment(
                    email,
                    subject,
                    "Please find attached the expenses report from " + from + " to " + to + ".",
                    new ByteArrayResource(bytes),
                    "expenses_" + from + "_to_" + to + ".xlsx"
            );


            return ResponseEntity.ok("Email sent successfully");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error generating Excel: " + e.getMessage());
        } catch (MessagingException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ERROR_SENDING_EMAIL + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error: " + e.getMessage());
        }
    }

    @GetMapping("/expenses/gain/email")
    public ResponseEntity<?> sendGainExpensesEmail(
            @RequestParam String email,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<Expense> expenses = expenseService.getExpensesByType("gain", targetUser.getId());
            if (expenses.isEmpty()) {
                return ResponseEntity.noContent().build();
            }

            ByteArrayInputStream in = excelService.generateExcel(expenses);
            byte[] bytes = in.readAllBytes();

            String subject = "Gain Expenses Report";
            emailService.sendEmailWithAttachment(
                    email,
                    subject,
                    "Please find attached the gain expenses report.",
                    new ByteArrayResource(bytes),
                    "gain_expenses.xlsx"
            );


            return ResponseEntity.ok("Email sent successfully");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error generating Excel: " + e.getMessage());
        } catch (MessagingException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ERROR_SENDING_EMAIL + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error: " + e.getMessage());
        }
    }

    @GetMapping("/expenses/loss/email")
    public ResponseEntity<?> sendLossExpensesEmail(
            @RequestParam String email,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<Expense> expenses = expenseService.getLossExpenses(targetUser.getId());
            if (expenses.isEmpty()) {
                return ResponseEntity.noContent().build();
            }

            ByteArrayInputStream in = excelService.generateExcel(expenses);
            byte[] bytes = in.readAllBytes();

            String subject = "Loss Expenses Report";
            emailService.sendEmailWithAttachment(
                    email,
                    subject,
                    "Please find attached the loss expenses report.",
                    new ByteArrayResource(bytes),
                    "loss_expenses.xlsx"
            );


            return ResponseEntity.ok("Email sent successfully");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error generating Excel: " + e.getMessage());
        } catch (MessagingException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ERROR_SENDING_EMAIL + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error: " + e.getMessage());
        }
    }

    @GetMapping("/expenses/today/email")
    public ResponseEntity<?> sendExpensesForTodayEmail(
            @RequestParam String email,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<Expense> expenses = expenseService.getExpensesForToday(targetUser.getId());

            ByteArrayInputStream in;
            if (expenses.isEmpty()) {
                in = excelService.generateEmptyExcelWithColumns();
            } else {
                in = excelService.generateExcel(expenses);
            }
            byte[] bytes = in.readAllBytes();

            String subject = "Today's Expenses Report";
            emailService.sendEmailWithAttachment(
                    email,
                    subject,
                    "Please find attached today's expenses report.",
                    new ByteArrayResource(bytes),
                    "today_expenses.xlsx"
            );


            return ResponseEntity.ok("Email sent successfully");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error generating Excel: " + e.getMessage());
        } catch (MessagingException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ERROR_SENDING_EMAIL + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error: " + e.getMessage());
        }
    }

    @GetMapping("/payment-method/{paymentMethod}/email")
    public ResponseEntity<?> sendExpensesByPaymentMethodEmail(
            @PathVariable String paymentMethod,
            @RequestHeader("Authorization") String jwt,
            @RequestParam String email,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<Expense> expenses = expenseService.getExpensesByPaymentMethod(paymentMethod, targetUser.getId());

            ByteArrayInputStream in;
            if (expenses.isEmpty()) {
                in = excelService.generateEmptyExcelWithColumns();
            } else {
                in = excelService.generateExcel(expenses);
            }
            byte[] bytes = in.readAllBytes();

            String subject = "Expenses Report for Payment Method: " + paymentMethod;
            emailService.sendEmailWithAttachment(
                    email,
                    subject,
                    "Please find attached the expenses report for payment method: " + paymentMethod + ".",
                    new ByteArrayResource(bytes),
                    "expenses_" + paymentMethod + ".xlsx"
            );


            return ResponseEntity.ok("Email sent successfully");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error generating Excel: " + e.getMessage());
        } catch (MessagingException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ERROR_SENDING_EMAIL + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error: " + e.getMessage());
        }
    }

    @GetMapping("/expenses/amount-range/email")
    public ResponseEntity<?> sendExpenseDetailsByAmountRangeEmail(
            @RequestParam double minAmount,
            @RequestParam double maxAmount,
            @RequestParam String email,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<Expense> expenseDetails = expenseService.getExpenseDetailsByAmountRange(minAmount, maxAmount, targetUser.getId());

            ByteArrayInputStream in;
            if (expenseDetails.isEmpty()) {
                in = excelService.generateEmptyExcelWithColumns();
            } else {
                in = excelService.generateExpenseDetailsExcel(expenseDetails);
            }
            byte[] bytes = in.readAllBytes();

            String subject = "Expense Details Report for Amount Range: " + minAmount + " - " + maxAmount;
            emailService.sendEmailWithAttachment(
                    email,
                    subject,
                    "Please find attached the expense details report for amount range: " + minAmount + " - " + maxAmount + ".",
                    new ByteArrayResource(bytes),
                    "expense_details_" + minAmount + "_" + maxAmount + ".xlsx"
            );


            return ResponseEntity.ok("Email sent successfully");
        } catch (MessagingException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ERROR_SENDING_EMAIL + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error: " + e.getMessage());
        }
    }


    @GetMapping("/expenses/search/email")
    public ResponseEntity<?> sendSearchExpensesByEmail(
            @RequestParam String expenseName,
            @RequestParam String email,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<Expense> expenses = expenseService.searchExpensesByName(expenseName, targetUser.getId());

            ByteArrayInputStream in;
            if (expenses.isEmpty()) {
                in = excelService.generateEmptyExcelWithColumns();
            } else {
                in = excelService.generateExcel(expenses);
            }
            byte[] bytes = in.readAllBytes();

            String subject = "Expense Search Results for: " + expenseName;
            emailService.sendEmailWithAttachment(
                    email,
                    subject,
                    "Please find attached the expense search results for: " + expenseName + ".",
                    new ByteArrayResource(bytes),
                    "expense_search_results_" + expenseName + ".xlsx"
            );


            return ResponseEntity.ok("Email sent successfully");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error generating Excel: " + e.getMessage());
        } catch (MessagingException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ERROR_SENDING_EMAIL + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error: " + e.getMessage());
        }
    }

    @GetMapping("/monthly-summary/{year}/{month}/email")
    public ResponseEntity<?> sendMonthlySummaryByEmail(
            @PathVariable Integer year,
            @PathVariable Integer month,
            @RequestParam String email,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            MonthlySummary summary = expenseService.getMonthlySummary(year, month, targetUser.getId());

            ByteArrayInputStream in = excelService.generateMonthlySummaryExcel(summary);
            byte[] bytes = in.readAllBytes();

            String subject = "Monthly Summary for " + year + "-" + month;
            emailService.sendEmailWithAttachment(
                    email,
                    subject,
                    "Please find attached the monthly summary for " + year + "-" + month + ".",
                    new ByteArrayResource(bytes),
                    "monthly_summary_" + year + "_" + month + ".xlsx"
            );


            return ResponseEntity.ok("Email sent successfully");
        } catch (MessagingException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ERROR_SENDING_EMAIL + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error: " + e.getMessage());
        }
    }


    @GetMapping("/payment-method-summary/email")
    public ResponseEntity<?> sendPaymentMethodSummaryByEmail(
            @RequestParam String email,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            Map<String, Map<String, Double>> summary = expenseService.getPaymentMethodSummary(targetUser.getId());

            ByteArrayInputStream in = excelService.generatePaymentMethodSummaryExcel(summary);
            byte[] bytes = in.readAllBytes();

            String subject = "Payment Method Summary";
            emailService.sendEmailWithAttachment(
                    email,
                    subject,
                    "Please find attached the payment method summary.",
                    new ByteArrayResource(bytes),
                    "payment_method_summary.xlsx"
            );

            return ResponseEntity.ok("Email sent successfully");
        } catch (MessagingException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ERROR_SENDING_EMAIL + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error: " + e.getMessage());
        }
    }


    @GetMapping("/yearly-summary/email")
    public ResponseEntity<?> sendYearlySummaryByEmail(
            @RequestParam Integer year,
            @RequestParam String email,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            Map<String, MonthlySummary> summary = expenseService.getYearlySummary(year, targetUser.getId());

            ByteArrayInputStream in = excelService.generateYearlySummaryExcel(summary);
            byte[] bytes = in.readAllBytes();

            String subject = "Yearly Summary for " + year;
            emailService.sendEmailWithAttachment(
                    email,
                    subject,
                    "Please find attached the yearly summary for " + year + ".",
                    new ByteArrayResource(bytes),
                    "yearly_summary_" + year + ".xlsx"
            );


            return ResponseEntity.ok("Email sent successfully");
        } catch (MessagingException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ERROR_SENDING_EMAIL + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error: " + e.getMessage());
        }
    }


    @GetMapping("/between-dates/email")
    public ResponseEntity<?> sendSummaryBetweenDatesByEmail(
            @RequestParam Integer startYear,
            @RequestParam Integer startMonth,
            @RequestParam Integer endYear,
            @RequestParam Integer endMonth,
            @RequestParam String email,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<MonthlySummary> summaries = expenseService.getSummaryBetweenDates(startYear, startMonth, endYear, endMonth, targetUser.getId());

            ByteArrayInputStream in = excelService.generateMonthlySummariesExcel(summaries);
            byte[] bytes = in.readAllBytes();

            String subject = "Monthly Summaries from " + startMonth + "/" + startYear + " to " + endMonth + "/" + endYear;
            emailService.sendEmailWithAttachment(
                    email,
                    subject,
                    "Please find attached the monthly summaries.",
                    new ByteArrayResource(bytes),
                    "monthly_summaries.xlsx"
            );


            return ResponseEntity.ok("Email sent successfully");
        } catch (MessagingException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ERROR_SENDING_EMAIL + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error: " + e.getMessage());
        }
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


    @GetMapping("/expenses/yesterday")
    public ResponseEntity<?> getYesterdayExpenses(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<Expense> expenses = expenseService.getExpensesByDate(LocalDate.now().minusDays(1), targetUser.getId());


            return ResponseEntity.ok(expenses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving yesterday's expenses: " + e.getMessage());
        }
    }

    @GetMapping("/particular-date")
    public ResponseEntity<?> getParticularDateExpenses(
            @RequestParam String date,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            LocalDate specificDate;
            try {
                specificDate = LocalDate.parse(date);
            } catch (DateTimeParseException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid date format. Please use yyyy-MM-dd format.");
            }

            List<Expense> expenses = expenseService.getExpensesByDate(specificDate, targetUser.getId());


            return ResponseEntity.ok(expenses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving expenses for date: " + e.getMessage());
        }
    }

    @GetMapping("/expenses/current-week")
    public List<Expense> getCurrentWeekExpenses(@RequestHeader("Authorization") String jwt) {
        User reqUser = userService.findUserByJwt(jwt);
        return expenseService.getExpensesByCurrentWeek(reqUser.getId());
    }

    @GetMapping("/expenses/last-week")
    public List<Expense> getLastWeekExpenses(@RequestHeader("Authorization") String jwt) {
        User reqUser = userService.findUserByJwt(jwt);
        return expenseService.getExpensesByLastWeek(reqUser.getId());
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
    public ResponseEntity<?> sendYesterdayExpensesEmail(
            @RequestParam String email,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<Expense> expenses = expenseService.getExpensesByDate(LocalDate.now().minusDays(1), targetUser.getId());

            ByteArrayInputStream in;
            if (expenses.isEmpty()) {
                in = excelService.generateEmptyExcelWithColumns();
            } else {
                in = excelService.generateExcel(expenses);
            }
            byte[] bytes = in.readAllBytes();

            String subject = "Yesterday's Expenses Report";
            emailService.sendEmailWithAttachment(
                    email,
                    subject,
                    "Please find attached the list of expenses for yesterday.",
                    new ByteArrayResource(bytes),
                    "yesterday_expenses.xlsx"
            );


            return ResponseEntity.ok("Yesterday's expenses report sent successfully");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error generating Excel: " + e.getMessage());
        } catch (MessagingException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ERROR_SENDING_EMAIL + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error: " + e.getMessage());
        }
    }

    @GetMapping("/expenses/date/email")
    public ResponseEntity<?> sendDateExpensesEmail(
            @RequestParam String date,
            @RequestParam String email,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            LocalDate specificDate;
            try {
                specificDate = LocalDate.parse(date);
            } catch (DateTimeParseException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid date format. Please use yyyy-MM-dd format.");
            }

            List<Expense> expenses = expenseService.getExpensesByDate(specificDate, targetUser.getId());

            ByteArrayInputStream in;
            if (expenses.isEmpty()) {
                in = excelService.generateEmptyExcelWithColumns();
            } else {
                in = excelService.generateExcel(expenses);
            }
            byte[] bytes = in.readAllBytes();

            String subject = "Expenses Report for " + date;
            emailService.sendEmailWithAttachment(
                    email,
                    subject,
                    "Please find attached the list of expenses for the date " + date + ".",
                    new ByteArrayResource(bytes),
                    "date_expenses_" + date + ".xlsx"
            );

            return ResponseEntity.ok("Expenses report for " + date + " sent successfully");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error generating Excel: " + e.getMessage());
        } catch (MessagingException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ERROR_SENDING_EMAIL + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error: " + e.getMessage());
        }
    }

//    @GetMapping("/expenses/current-week/email")
//    public ResponseEntity<?> sendCurrentWeekExpensesEmail(
//            @RequestParam String email,
//            @RequestHeader("Authorization") String jwt,
//            @RequestParam(required = false) Integer targetId) {
//
//        return helper.executeEmailReport(jwt, targetId, email, "current week expenses",
//                expenseService::getExpensesByCurrentWeek,
//                (context, expenses) -> {
//                    ByteArrayInputStream in = expenses.isEmpty()
//                            ? excelService.generateEmptyExcelWithColumns()
//                            : excelService.generateExcel(expenses);
//
//                    byte[] bytes = in.readAllBytes();
//
//                    emailService.sendEmailWithAttachment(
//                            context.getEmail(),
//                            "Current Week Expenses Report",
//                            "Please find attached the list of expenses for the current week.",
//                            new ByteArrayResource(bytes),
//                            "current_week_expenses.xlsx"
//                    );
//
//                    String auditMessage = helper.createAuditMessage(
//                            "Sent current week expenses report via email to %s",
//                            context.getTargetUser().getId(),
//                            context.getReqUser().getId(),
//                            context.getEmail()
//                    );
//
//                    helper.logAudit(context.getReqUser(), null, "report", auditMessage);
//
//                    return "Current week expenses report sent successfully";
//                });
//    }


    @GetMapping("/expenses/last-week/email")
    public ResponseEntity<?> sendLastWeekExpensesEmail(
            @RequestParam String email,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<Expense> expenses = expenseService.getExpensesByLastWeek(targetUser.getId());

            ByteArrayInputStream in;
            if (expenses.isEmpty()) {
                in = excelService.generateEmptyExcelWithColumns();
            } else {
                in = excelService.generateExcel(expenses);
            }
            byte[] bytes = in.readAllBytes();

            String subject = "Last Week Expenses Report";
            emailService.sendEmailWithAttachment(
                    email,
                    subject,
                    "Please find attached the list of expenses for the last week.",
                    new ByteArrayResource(bytes),
                    "last_week_expenses.xlsx"
            );

            return ResponseEntity.ok("Last week expenses report sent successfully");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error generating Excel: " + e.getMessage());
        } catch (MessagingException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ERROR_SENDING_EMAIL + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error: " + e.getMessage());
        }
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
    public ResponseEntity<?> saveExpenses(
            @RequestBody List<Expense> expenses,
            @RequestHeader("Authorization") String jwt) {
        try {
            // Validate input
            if (expenses == null || expenses.isEmpty()) {
                return ResponseEntity.badRequest().body("No expenses provided");
            }

            // Get authenticated user
            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            }

            // Process and save expenses
            List<Expense> saved = expenseService.addMultipleExpenses(expenses, reqUser.getId());

            // Log each expense creation
            for (Expense expense : saved) {
                ExpenseDetails details = expense.getExpense();
                if (details != null) {
                    String expenseDetails = String.format(
                            "Expense created with ID %d. Details: Name - %s, Amount - %.2f, Type - %s, Payment Method - %s, Net Amount - %.2f, Credit Due - %.2f",
                            expense.getId(),
                            details.getExpenseName(),
                            details.getAmount(),
                            details.getType(),
                            details.getPaymentMethod(),
                            details.getNetAmount(),
                            details.getCreditDue()
                    );

                    // Add comments if present
                    if (details.getComments() != null && !details.getComments().isEmpty()) {
                        expenseDetails += String.format(", Comments - %s", details.getComments());
                    }

                }
            }

            // Return success response with saved expenses
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            // Handle validation errors
            return ResponseEntity.badRequest().body("Invalid expense data: " + e.getMessage());
        } catch (Exception e) {
            // Log the error
            System.out.println("Error saving expenses: " + e.getMessage());

            // Return error response
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error saving expenses: " + e.getMessage());
        }
    }


    @PostMapping("/upload")
    public ResponseEntity<?> getFileContent(
            @RequestParam("file") MultipartFile file,
            @RequestHeader("Authorization") String jwt) {
        try {
            // Validate file
            if (file == null || file.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Please upload a valid Excel file");
            }

            // Check file type
            String fileName = file.getOriginalFilename();
            if (fileName == null || !(fileName.endsWith(".xlsx") || fileName.endsWith(".xls"))) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Please upload a valid Excel file (.xlsx or .xls)");
            }

            // Get authenticated user
            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token");
            }

            // Parse the Excel file
            List<Expense> expenses = excelService.parseExcelFile(file);

            // Validate parsed data
            if (expenses.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("No valid expense data found in the uploaded file");
            }

            // Process expenses
            int i = 0;
            for (Expense expense : expenses) {
                expense.setId(i++);
                expense.setCategoryId(expense.getCategoryId());
                expense.setBudgetIds(expense.getBudgetIds());
                expense.setIncludeInBudget(expense.isIncludeInBudget());
                expense.setDate(expense.getDate());

                // Ensure expense details exist
                if (expense.getExpense() != null) {
                    expense.getExpense().setId(i);
                } else {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body("Invalid expense data at row " + i + ": Missing expense details");
                }
            }


            return ResponseEntity.ok(expenses);
        } catch (IOException e) {
            // Log the error
            System.out.println("Error processing Excel file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error processing Excel file: " + e.getMessage());
        } catch (Exception e) {
            // Handle other exceptions
            System.out.println("Unexpected error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unexpected error: " + e.getMessage());
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
    public ResponseEntity<?> deleteExpenses(
            @RequestBody Map<String, Object> requestBody,
            @RequestHeader("Authorization") String jwt) {
        try {
            // Validate input
            if (requestBody == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Request body cannot be empty");
            }

            List<Integer> ids = (List<Integer>) requestBody.get("deleteid");
            if (ids == null || ids.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("No expense IDs provided for deletion");
            }

            List<Map<String, Object>> expenses = (List<Map<String, Object>>) requestBody.get("expenses");
            if (expenses == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Expenses list is required");
            }

            // Get authenticated user
            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token");
            }


            // Delete expenses by IDs
            try {
                expenseService.deleteExpensesByIds(ids, reqUser.getId());
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Error deleting expenses: " + e.getMessage());
            }

            // Filter out deleted expenses from the input list
            List<Map<String, Object>> filteredExpenses = expenses.stream()
                    .filter(expense -> {
                        Integer expenseId = (Integer) expense.get("id");
                        return expenseId != null && !ids.contains(expenseId);
                    })
                    .collect(Collectors.toList());

            // Log successful deletion
            String successMessage = String.format(
                    "Successfully deleted %d expenses. %d expenses remaining.",
                    ids.size(),
                    filteredExpenses.size()
            );
            // producer.sendauditEvent(reqUser, null, "delete-success", successMessage);

            return ResponseEntity.ok(filteredExpenses);
        } catch (ClassCastException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid data format: " + e.getMessage());
        } catch (Exception e) {
            // Log the error
            System.out.println("Error in deleteExpenses: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unexpected error: " + e.getMessage());
        }
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
    public ResponseEntity<?> getGroupedExpenses(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(value = "sortOrder", defaultValue = "desc") String sortOrder,
            @RequestParam(required = false) Integer targetId) {
        try {
            // Validate sort order parameter
            if (!sortOrder.equalsIgnoreCase("asc") && !sortOrder.equalsIgnoreCase("desc")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Invalid sortOrder parameter. Must be 'asc' or 'desc'");
            }

            // Get authenticated user
            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token");
            }

            // Determine target user (if admin is viewing another user's expenses)
            User targetUser;
            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            // Get grouped expenses
            Map<String, List<Map<String, Object>>> groupedExpenses =
                    expenseService.getExpensesGroupedByDate(targetUser.getId(), sortOrder);


            // Return empty result if no expenses found
            if (groupedExpenses.isEmpty()) {
                return ResponseEntity.ok(Collections.emptyMap());
            }

            return ResponseEntity.ok(groupedExpenses);
        } catch (Exception e) {
            // Log the error
            System.out.println("Error retrieving grouped expenses: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving grouped expenses: " + e.getMessage());
        }
    }


    @GetMapping("/sorted")
    public ResponseEntity<?> getExpensesGroupedByDate(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "date") String sortBy,
            @RequestParam(defaultValue = "asc") String sortOrder,
            @RequestParam(required = false) Integer targetId) {

        return helper.executeWithErrorHandling(() -> {
            List<String> validSortFields = Arrays.asList("date", "amount", "expenseName", "paymentMethod");
            ResponseEntity<Map<String, Object>> validation = helper.validatePaginationAndSort(page, size, sortBy, sortOrder, validSortFields);
            if (validation != null) {
                return validation.getBody();
            }

            ResponseEntity<?> contextResponse = helper.setupRequestContext(jwt, targetId,
                    "Retrieved paginated expenses (page %d, size %d, sorted by %s %s)", page, size, sortBy, sortOrder);

            if (!(contextResponse.getBody() instanceof ExpenseServiceHelper.RequestContext)) {
                return contextResponse.getBody();
            }

            ExpenseServiceHelper.RequestContext context = (ExpenseServiceHelper.RequestContext) contextResponse.getBody();
            Map<String, List<Map<String, Object>>> groupedExpenses = null;
            try {
                groupedExpenses = expenseService.getExpensesGroupedByDateWithPagination(
                        context.getTargetUser().getId(), sortOrder, page, size, sortBy);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }

            helper.logAudit(context.getReqUser(), null, "read", context.getAuditMessage());

            if (groupedExpenses.isEmpty()) {
                return Collections.emptyMap();
            }

            return helper.buildPaginatedResponse(groupedExpenses, page, size, sortBy, sortOrder);
        }, "retrieving paginated expenses");
    }


    @GetMapping("/before/{expenseName}/{date}")
    public ResponseEntity<?> getExpensesBeforeDate(
            @RequestHeader("Authorization") String jwt,
            @PathVariable String expenseName,
            @PathVariable String date,
            @RequestParam(required = false) Integer targetId) {
        try {
            // Validate input parameters
            if (expenseName == null || expenseName.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Expense name cannot be empty");
            }

            // Parse and validate date
            LocalDate parsedDate;
            try {
                parsedDate = LocalDate.parse(date);
            } catch (DateTimeParseException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Invalid date format. Please use yyyy-MM-dd format");
            }

            // Get authenticated user
            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token");
            }

            // Determine target user (if admin is viewing another user's expenses)
            User targetUser;
            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            // Get expense before date
            Expense expense = expenseService.getExpensesBeforeDate(targetUser.getId(), expenseName.trim(), parsedDate);

            // Handle case when no expense is found
            if (expense == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(String.format("No expense found with name '%s' before date %s", expenseName, date));
            }


            return ResponseEntity.ok(expense);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid request parameters: " + e.getMessage());
        } catch (Exception e) {
            // Log the error
            System.out.println("Error retrieving expense before date: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving expense before date: " + e.getMessage());
        }
    }


    @GetMapping("/current-month-top-expenses")
    public ResponseEntity<?> getTopExpensesForCustomMonth(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId,
            @RequestParam(required = false, defaultValue = "3") Integer topCount,
            @RequestParam(required = false) Integer customStartDay) {
        try {
            if (topCount <= 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("topCount must be greater than zero");
            }

            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token");
            }

            User targetUser;
            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            LocalDate now = LocalDate.now();
            int startDay = customStartDay != null ? customStartDay : 17;
            if (startDay < 1 || startDay > 28) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("customStartDay must be between 1 and 28");
            }

            LocalDate startDate = now.minusMonths(1).withDayOfMonth(startDay);
            LocalDate endDate = (startDay == 1)
                    ? now.withDayOfMonth(now.lengthOfMonth())
                    : now.withDayOfMonth(startDay - 1);

            List<Expense> expenses = expenseService.getAllExpenses(targetUser.getId());

            List<Map<String, Object>> expenseTrend = new ArrayList<>();
            List<Map<String, Object>> monthlyBreakdown = new ArrayList<>();
            List<Map<String, Object>> expenseDistribution = new ArrayList<>();
            Map<String, Double> categoryTotals = new LinkedHashMap<>();

            for (Expense expense : expenses) {
                LocalDate expenseDate = expense.getDate();
                if ((expenseDate.isAfter(startDate) || expenseDate.isEqual(startDate)) &&
                        (expenseDate.isBefore(endDate) || expenseDate.isEqual(endDate))) {
                    ExpenseDetails details = expense.getExpense();
                    if (details != null) {
                        String category = details.getExpenseName();
                        double amount = details.getAmount();
                        categoryTotals.merge(category, amount, Double::sum);
                    }
                }
            }

            List<Map.Entry<String, Double>> sortedCategories = new ArrayList<>(categoryTotals.entrySet());
            sortedCategories.sort((e1, e2) -> Double.compare(e2.getValue(), e1.getValue()));

            Map<String, Object> trendData = new HashMap<>();
            Map<String, Object> monthlyData = new HashMap<>();
            int count = 0;
            for (Map.Entry<String, Double> entry : sortedCategories) {
                if (count == topCount) break;
                String category = entry.getKey();
                Double amount = entry.getValue();
                trendData.put(category.toLowerCase(), amount);
                monthlyData.put(category, amount);
                Map<String, Object> pieData = new HashMap<>();
                pieData.put("name", category);
                pieData.put("value", amount);
                expenseDistribution.add(pieData);
                count++;
            }

            expenseTrend.add(trendData);
            monthlyBreakdown.add(monthlyData);

            Map<String, Object> result = new HashMap<>();
            result.put("expenseTrend", expenseTrend);
            result.put("monthlyBreakdown", monthlyBreakdown);
            result.put("expenseDistribution", expenseDistribution);


            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid request parameters: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("Error retrieving top expenses for custom month: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving top expenses for custom month: " + e.getMessage());
        }
    }


    @GetMapping("/by-name")
    public ResponseEntity<?> getExpenseByName(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(value = "year", defaultValue = "0") int year,
            @RequestParam(required = false) Integer targetId,
            @RequestParam(required = false) String flowType) {
        try {
            // Get authenticated user
            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token");
            }

            // Determine target user (if admin is viewing another user's expenses)
            User targetUser;
            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            // Use current year if not specified
            if (year == 0) {
                year = Year.now().getValue();
            }

            // Validate year
            if (year < 2000 || year > 2100) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Year must be between 2000 and 2100");
            }

            // Get expense data by name
            Map<String, Object> result = expenseService.getExpenseByName(targetUser.getId(), year);


            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid request parameters: " + e.getMessage());
        } catch (Exception e) {
            // Log the error
            System.out.println("Error retrieving expenses by name: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving expenses by name: " + e.getMessage());
        }
    }

    @GetMapping("/monthly")
    public ResponseEntity<?> getMonthlyExpenses(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(value = "year", defaultValue = "0") int year,
            @RequestParam(required = false) Integer targetId,
            @RequestParam(required = false) String flowType) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token");
            }

            User targetUser;
            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            if (year == 0) {
                year = Year.now().getValue();
            }

            if (year < 2000 || year > 2100) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Year must be between 2000 and 2100");
            }

            Map<String, Object> result = expenseService.getMonthlyExpenses(targetUser.getId(), year);


            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid request parameters: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("Error retrieving monthly expenses: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving monthly expenses: " + e.getMessage());
        }
    }

    @GetMapping("/trend")
    public ResponseEntity<?> getExpenseTrend(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(value = "year", defaultValue = "0") int year,
            @RequestParam(required = false) Integer targetId,
            @RequestParam(required = false) String flowType) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token");
            }

            User targetUser;
            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            if (year == 0) {
                year = Year.now().getValue();
            }
            if (year < 2000 || year > 2100) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Year must be between 2000 and 2100");
            }

            Map<String, Object> result = expenseService.getExpenseTrend(targetUser.getId(), year);


            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid request parameters: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("Error retrieving expense trend: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving expense trend: " + e.getMessage());
        }
    }

    @GetMapping("/payment-methods")
    public ResponseEntity<?> getPaymentMethodDistribution(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(value = "year", defaultValue = "0") int year,
            @RequestParam(required = false) Integer targetId) {
        try {
            if (year == 0) {
                year = Year.now().getValue();
            }
            if (year < 2000 || year > 2100) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Year must be between 2000 and 2100");
            }
            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token");
            }
            User targetUser;
            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }
            Map<String, Object> result = expenseService.getPaymentMethodDistribution(targetUser.getId(), year);


            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid request parameters: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("Error retrieving payment method distribution: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving payment method distribution: " + e.getMessage());
        }
    }

    @GetMapping("/cumulative")
    public ResponseEntity<?> getCumulativeExpenses(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(value = "year", defaultValue = "0") int year,
            @RequestParam(required = false) Integer targetId) {
        try {
            if (year == 0) {
                year = Year.now().getValue();
            }
            if (year < 2000 || year > 2100) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Year must be between 2000 and 2100");
            }
            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token");
            }
            User targetUser;
            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }
            Map<String, Object> result = expenseService.getCumulativeExpenses(targetUser.getId(), year);

            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid request parameters: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("Error retrieving cumulative expenses: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving cumulative expenses: " + e.getMessage());
        }
    }

    @GetMapping("/name-over-time")
    public ResponseEntity<?> getExpenseNameOverTime(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(value = "year", defaultValue = "0") int year,
            @RequestParam(value = "limit", defaultValue = "5") int limit,
            @RequestParam(required = false) Integer targetId) {
        try {
            if (year == 0) {
                year = Year.now().getValue();
            }
            if (year < 2000 || year > 2100) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Year must be between 2000 and 2100");
            }
            if (limit <= 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Limit must be greater than zero");
            }
            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token");
            }
            User targetUser;
            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }
            Map<String, Object> result = expenseService.getExpenseNameOverTime(targetUser.getId(), year, limit);


            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid request parameters: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("Error retrieving expense names over time: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving expense names over time: " + e.getMessage());
        }
    }


    @GetMapping("/current-month/daily-spending")
    public ResponseEntity<?> getDailySpendingCurrentMonth(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token");
            }

            User targetUser;
            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<Map<String, Object>> result = expenseService.getDailySpendingCurrentMonth(targetUser.getId());


            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.out.println("Error retrieving daily spending for current month: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving daily spending for current month: " + e.getMessage());
        }
    }

    @GetMapping("/current-month/totals")
    public ResponseEntity<?> getMonthlySpendingAndIncomeCurrentMonth(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token");
            }

            User targetUser;
            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<Map<String, Object>> result = expenseService.getMonthlySpendingAndIncomeCurrentMonth(targetUser.getId());


            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.out.println("Error retrieving monthly spending and income for current month: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving monthly spending and income for current month: " + e.getMessage());
        }
    }

    @GetMapping("/current-month/distribution")
    public ResponseEntity<?> getExpenseDistributionCurrentMonth(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token");
            }

            User targetUser;
            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<Map<String, Object>> result = expenseService.getExpenseDistributionCurrentMonth(targetUser.getId());


            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.out.println("Error retrieving expense distribution for current month: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving expense distribution for current month: " + e.getMessage());
        }
    }

    @GetMapping("/included-in-budget/{startDate}/{endDate}")
    public ResponseEntity<?> getIncludeInBudgetExpenses(
            @RequestHeader("Authorization") String jwt,
            @PathVariable LocalDate startDate,
            @PathVariable LocalDate endDate,
            @RequestParam(required = false) Integer targetId) {
        try {
            if (startDate == null || endDate == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Start date and end date are required");
            }

            if (endDate.isBefore(startDate)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("End date cannot be before start date");
            }

            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token");
            }

            User targetUser;
            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<Expense> expenses = expenseService.findByUserIdAndDateBetweenAndIncludeInBudgetTrue(
                    startDate, endDate, targetUser.getId());


            return ResponseEntity.ok(expenses);
        } catch (DateTimeParseException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid date format. Please use yyyy-MM-dd format");
        } catch (Exception e) {
            System.out.println("Error retrieving budget-included expenses: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving budget-included expenses: " + e.getMessage());
        }
    }


    @GetMapping("/included-in-budgets/{startDate}/{endDate}")
    public ResponseEntity<List<Expense>> getIncludeInBudgetExpensesWithBudgetService(
            @PathVariable LocalDate startDate,
            @PathVariable LocalDate endDate,
            @RequestParam Integer userId) {

        List<Expense> expenses = expenseService.findByUserIdAndDateBetweenAndIncludeInBudgetTrue(
                startDate, endDate, userId);


        return new ResponseEntity<>(expenses, HttpStatus.OK);

    }

    @PostMapping("get-expenses-by-ids")
    public ResponseEntity<List<Expense>> getExpensesByIdstest(@RequestParam Integer userId, @RequestBody Set<Integer> expenseIds) throws UserException {
        List<Expense> expenses = expenseService.getExpensesByIds(userId, expenseIds);
        return new ResponseEntity<>(expenses, HttpStatus.OK);
    }


    @GetMapping("/{budgetId}/expenses")
    public ResponseEntity<?> getExpensesForBudgetRange(
            @PathVariable Integer budgetId,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestParam(required = false) Integer targetId) {
        try {
            if (budgetId == null || budgetId <= 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Invalid budget ID");
            }

            if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("End date cannot be before start date");
            }

            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token");
            }

            User targetUser;
            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            List<Expense> expenses = expenseService.getExpensesInBudgetRangeWithIncludeFlag(
                    startDate,
                    endDate,
                    budgetId,
                    targetUser.getId()
            );

            // Log the action
            String dateRangeInfo = "";
            if (startDate != null && endDate != null) {
                dateRangeInfo = String.format(" from %s to %s", startDate, endDate);
            } else if (startDate != null) {
                dateRangeInfo = String.format(" from %s onwards", startDate);
            } else if (endDate != null) {
                dateRangeInfo = String.format(" until %s", endDate);
            }


            return ResponseEntity.ok(expenses);
        } catch (DateTimeParseException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid date format. Please use yyyy-MM-dd format");
        } catch (RuntimeException e) {
            return helper.handleRuntimeException(e);
        } catch (Exception e) {
            System.out.println("Unexpected error retrieving expenses for budget: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unexpected error retrieving expenses for budget: " + e.getMessage());
        }
    }


    @GetMapping("/cashflow")
    public ResponseEntity<?> getCashflowExpenses(
            @RequestParam String range,
            @RequestParam Integer offset,
            @RequestParam(required = false) String flowType,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Integer targetId,
            @RequestHeader("Authorization") String jwt) {
        try {
            if (range == null || range.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Range parameter is required");
            }
            if (offset == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Offset parameter is required");
            }
            if (!Arrays.asList("week", "month", "year").contains(range.toLowerCase())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Invalid range parameter. Valid values are: week, month, year");
            }

            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token");
            }

            User targetUser;
            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            LocalDate startDate;
            LocalDate endDate;
            LocalDate now = LocalDate.now();

            switch (range.toLowerCase()) {
                case "week":
                    startDate = now.with(DayOfWeek.MONDAY).plusWeeks(offset);
                    endDate = startDate.plusDays(6);
                    break;
                case "month":
                    startDate = now.withDayOfMonth(1).plusMonths(offset);
                    endDate = startDate.plusMonths(1).minusDays(1);
                    break;
                case "year":
                    startDate = now.withDayOfMonth(1).withMonth(1).plusYears(offset);
                    endDate = startDate.plusYears(1).minusDays(1);
                    break;
                default:
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body("Invalid range parameter");
            }

            List<Expense> expenses = expenseService.getExpensesWithinRange(
                    targetUser.getId(),
                    startDate,
                    endDate,
                    flowType
            );

            if (category != null && !category.isEmpty()) {
                expenses = expenses.stream()
                        .filter(expense -> {
                            if (expense.getExpense() == null || expense.getExpense().getExpenseName() == null) {
                                return false;
                            }
                            String expenseName = expense.getExpense().getExpenseName();
                            return expenseName.toLowerCase().contains(category.toLowerCase());
                        })
                        .collect(Collectors.toList());
            }

            return ResponseEntity.ok(expenses);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid request parameters: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("Error retrieving cashflow expenses: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving cashflow expenses: " + e.getMessage());
        }
    }


    @GetMapping("/range/offset")
    public ResponseEntity<?> getExpensesByRangeOffset(
            @RequestHeader("Authorization") String jwt,
            @RequestParam String rangeType,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(required = false) String flowType,
            @RequestParam(required = false) Integer targetId) {

        return helper.executeWithErrorHandling(() -> {
            ResponseEntity<Map<String, Object>> rangeValidation = helper.validateRangeType(rangeType);
            if (rangeValidation != null) {
                return rangeValidation.getBody();
            }

            ResponseEntity<?> contextResponse = helper.setupRequestContext(jwt, targetId,
                    "Retrieved expenses for %s (offset: %d)%s", rangeType, offset,
                    flowType != null ? " with flow type: " + flowType : "");

            if (!(contextResponse.getBody() instanceof ExpenseServiceHelper.RequestContext)) {
                return contextResponse.getBody();
            }

            ExpenseServiceHelper.RequestContext context = (ExpenseServiceHelper.RequestContext) contextResponse.getBody();
            Map<String, LocalDate> dateRange = helper.calculateDateRange(rangeType, offset);

            List<Expense> expenses = expenseService.getExpensesWithinRange(
                    context.getTargetUser().getId(),
                    dateRange.get("startDate"),
                    dateRange.get("endDate"),
                    flowType
            );


            return expenses;
        }, "retrieving expenses by range offset");
    }


    @GetMapping("/by-category/{categoryId}")
    public ResponseEntity<?> getExpensesByCategoryId(
            @PathVariable Integer categoryId,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            // Get authenticated user
            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token");
            }

            // Determine target user (if admin is viewing another user's expenses)
            User targetUser;
            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            // Get expenses by category ID
            List<Expense> expenses = expenseService.getExpensesByCategoryId(categoryId, targetUser.getId());

            // Return empty result if no expenses found
            if (expenses.isEmpty()) {
                return ResponseEntity.noContent().build();
            }

            return ResponseEntity.ok(expenses);
        } catch (Exception e) {
            // Log the error
            System.out.println("Error retrieving expenses by category ID: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving expenses by category ID: " + e.getMessage());
        }
    }


    @GetMapping("/all-by-categories/detailed")
    public ResponseEntity<?> getAllExpensesByCategoriesDetailed(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            // Get authenticated user
            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token");
            }

            // Determine target user (if admin is viewing another user's data)
            User targetUser;
            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return handleRuntimeException(e);
            }

            // Get all expenses by categories
            Map<Category, List<Expense>> categoryExpensesMap = expenseService.getAllExpensesByCategories(targetUser.getId());

            if (categoryExpensesMap.isEmpty()) {
                return ResponseEntity.noContent().build();
            }

            // Transform the map to have a more JSON-friendly structure
            Map<String, Object> response = new HashMap<>();

            // Summary statistics
            int totalCategories = categoryExpensesMap.size();
            int totalExpenses = 0;
            double totalAmount = 0.0;
            Map<String, Double> categoryTotals = new HashMap<>();

            for (Map.Entry<Category, List<Expense>> entry : categoryExpensesMap.entrySet()) {
                Category category = entry.getKey();
                List<Expense> expenses = entry.getValue();
                totalExpenses += expenses.size();

                // Calculate total amount for this category
                double categoryTotal = 0.0;
                for (Expense expense : expenses) {
                    if (expense.getExpense() != null) {
                        categoryTotal += expense.getExpense().getAmount();
                        totalAmount += expense.getExpense().getAmount();
                    }
                }
                categoryTotals.put(category.getName(), categoryTotal);

                // Create a category details object with all fields from the Category model
                Map<String, Object> categoryDetails = new HashMap<>();
                categoryDetails.put("id", category.getId());
                categoryDetails.put("name", category.getName());
                categoryDetails.put("description", category.getDescription());
                categoryDetails.put("isGlobal", category.isGlobal());

                // Include color and icon if they exist in the model
                if (category.getColor() != null) {
                    categoryDetails.put("color", category.getColor());
                }
                if (category.getIcon() != null) {
                    categoryDetails.put("icon", category.getIcon());
                }

                // Include user IDs information
                categoryDetails.put("userIds", category.getUserIds());
                categoryDetails.put("editUserIds", category.getEditUserIds());

                // Include expense mapping information
                categoryDetails.put("expenseIds", category.getExpenseIds());

                // Format expenses with detailed information
                List<Map<String, Object>> formattedExpenses = new ArrayList<>();
                for (Expense expense : expenses) {
                    Map<String, Object> expenseMap = new HashMap<>();
                    expenseMap.put("id", expense.getId());
                    expenseMap.put("date", expense.getDate());

                    if (expense.getExpense() != null) {
                        ExpenseDetails details = expense.getExpense();
                        Map<String, Object> detailsMap = new HashMap<>();
                        detailsMap.put("id", details.getId());
                        detailsMap.put("expenseName", details.getExpenseName());
                        detailsMap.put("amount", details.getAmount());
                        detailsMap.put("type", details.getType());
                        detailsMap.put("paymentMethod", details.getPaymentMethod());
                        detailsMap.put("netAmount", details.getNetAmount());
                        detailsMap.put("comments", details.getComments());
                        detailsMap.put("creditDue", details.getCreditDue());

                        expenseMap.put("details", detailsMap);
                    }

                    formattedExpenses.add(expenseMap);
                }

                categoryDetails.put("expenses", formattedExpenses);
                categoryDetails.put("totalAmount", categoryTotal);
                categoryDetails.put("expenseCount", expenses.size());

                // Add to response with category name as key
                response.put(category.getName(), categoryDetails);
            }

            // Add summary statistics to the response
            Map<String, Object> summary = new HashMap<>();
            summary.put("totalCategories", totalCategories);
            summary.put("totalExpenses", totalExpenses);
            summary.put("totalAmount", totalAmount);
            summary.put("categoryTotals", categoryTotals);
            response.put("summary", summary);

            // Add metadata to the response
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("userId", targetUser.getId());
            metadata.put("username", targetUser.getFirstName() + " " + targetUser.getLastName());
            metadata.put("generatedAt", LocalDateTime.now());
            response.put("metadata", metadata);


            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Log the error
            System.out.println("Error retrieving detailed expenses by categories: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving detailed expenses by categories: " + e.getMessage());
        }
    }

    @GetMapping("/all-by-categories/detailed/filtered")
    public ResponseEntity<Map<String, Object>> getAllExpensesByCategoriesDetailedFiltered(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String rangeType,
            @RequestParam(required = false, defaultValue = "0") int offset,
            @RequestParam(required = false) String flowType,
            @RequestParam(required = false) Integer targetId) {

        try {
            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid or expired token"));
            }

            User targetUser;
            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return helper.handleRuntimeException(e);
            }

            Map<String, Object> response;
            if (fromDate != null && toDate != null) {
                response = expenseService.getFilteredExpensesByDateRange(targetUser.getId(), fromDate, toDate, flowType);
            } else if (rangeType != null) {
                response = expenseService.getFilteredExpensesByCategories(targetUser.getId(), rangeType, offset, flowType);
            } else {
                return ResponseEntity.badRequest().body(Map.of("error",
                        "Either provide fromDate and toDate, or provide rangeType"));
            }

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }


    @GetMapping("/all-by-payment-method/detailed/filtered")
    public ResponseEntity<Map<String, Object>> getAllExpensesByPaymentMethodDetailedFiltered(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String rangeType,
            @RequestParam(required = false, defaultValue = "0") int offset,
            @RequestParam(required = false) String flowType,
            @RequestParam(required = false) Integer targetId) {

        try {
            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid or expired token"));
            }

            User targetUser;
            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                return helper.handleRuntimeException(e);
            }

            Map<String, Object> response;
            if (fromDate != null && toDate != null) {
                response = expenseService.getFilteredExpensesByPaymentMethod(targetUser.getId(), fromDate, toDate, flowType);
            } else if (rangeType != null) {
                response = expenseService.getFilteredExpensesByPaymentMethod(targetUser.getId(), rangeType, offset, flowType);
            } else {
                return ResponseEntity.badRequest().body(Map.of("error",
                        "Either provide fromDate and toDate, or provide rangeType"));
            }

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }


    @GetMapping("/get-by-id")
    public ResponseEntity<Expense> findByUserIdandExpenseeID(@RequestParam Integer userId, @RequestParam Integer expenseId) {
        try {
            Expense expense = expenseService.getExpenseById(expenseId, userId);
            return ResponseEntity.ok(expense);
        } catch (Exception e) {
            System.out.println("Error retrieving expenses by user ID and expense ID: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }


    @PostMapping("/save-single")
    public ResponseEntity<Expense> saveTheExpense(@RequestBody Expense expense) {
        Expense savedExpense = expenseService.save(expense);

        return new ResponseEntity<>(savedExpense, HttpStatus.OK);
    }

    @PostMapping("/add-expense-with-bill-service")
    public Expense addExpenseWithBillService(@RequestBody Expense expense,@RequestParam Integer userId) throws Exception {
        return expenseService.addExpense(expense, userId);
    }

    @PostMapping("/update-expense-with-bill-service")
    public Expense updateExpenseWithBillService(@RequestParam Integer expenseId,@RequestBody Expense expense,@RequestParam Integer userId) throws Exception {
        return expenseService.updateExpenseWithBillService(expenseId,expense, userId);
    }

    @DeleteMapping("/delete-expenses-with-bill-service")
    public void deleteExpenseWithBillService(@RequestParam List<Integer> expenseIds,@RequestParam Integer userId) throws Exception {
       expenseService.deleteExpensesByIdsWithBillService(expenseIds, userId);
    }

    @GetMapping("/get-all-expenses-with-bill-service")
    public List<Expense> getAllExpense(@RequestParam Integer userId) throws Exception {
        return expenseService.getAllExpenses(userId);
    }

    @GetMapping("/get-all-expenses-sort-with-bill-service")
    public List<Expense> getAllExpensesWithSort(@RequestParam Integer userId,@RequestParam String sort) throws Exception {
        return expenseService.getAllExpenses(userId,sort);
    }
}

