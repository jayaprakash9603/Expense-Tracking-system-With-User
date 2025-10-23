package com.jaya.controller;

import com.jaya.dto.User;
import com.jaya.dto.ProgressStatus;
import com.jaya.exceptions.UserException;
import com.jaya.models.*;
import com.jaya.repository.ExpenseRepository;
import com.jaya.service.*;
import com.jaya.util.UserPermissionHelper;
import com.jaya.util.BulkProgressTracker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.task.TaskExecutor;
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

    public static final String INVALID_OR_EXPIRED_TOKEN = "Invalid or expired token";
    private final ExpenseService expenseService;

    public static String ERROR_SENDING_EMAIL = "Error sending email: ";




    private final ExpenseServiceHelper helper;
    private final UserService userService;
    private final FriendShipService friendshipService;
    private final ExcelService excelService;
    private final EmailService emailService;
    private final UserPermissionHelper permissionHelper;
    private final BulkProgressTracker progressTracker;
    private final TaskExecutor taskExecutor;

    @Autowired
    public ExpenseController(ExpenseService expenseService,
                             ExpenseServiceHelper helper,
                             UserService userService,
                             FriendShipService friendshipService,
                             ExpenseRepository expenseRepository,
                             ExcelService excelService,
                             EmailService emailService,
                             KafkaProducerService producer,
                             UserPermissionHelper permissionHelper,
                             BulkProgressTracker progressTracker,
                             TaskExecutor taskExecutor) {
        this.expenseService = expenseService;
        this.helper = helper;
        this.userService = userService;
        this.friendshipService = friendshipService;
        this.excelService = excelService;
        this.emailService = emailService;
        this.permissionHelper = permissionHelper;
        this.progressTracker = progressTracker;
        this.taskExecutor = taskExecutor;
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
    public ResponseEntity<Expense> addExpense(@Validated @RequestBody Expense expense,
                                              @RequestHeader("Authorization") String jwt,
                                              @RequestParam(required = false) Integer targetId) throws Exception {

        User reqUser = userService.findUserByJwt(jwt);
        User targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, true);
        Expense createdExpense = expenseService.addExpense(expense, targetUser.getId());
        return ResponseEntity.ok(createdExpense);

    }


    @PostMapping("/{expenseId}/copy")
    public ResponseEntity<Expense> copyExpense(
            @PathVariable Integer expenseId,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

        User reqUser = userService.findUserByJwt(jwt);
        User targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, true);

        Expense createdExpense = expenseService.copyExpense(targetUser.getId(), expenseId);

        return ResponseEntity.ok(createdExpense);

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
    public ResponseEntity<List<Expense>> addMultipleExpenses(@RequestHeader("Authorization") String jwt,
                                                 @RequestBody List<Expense> expenses,
                                                 @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = helper.authenticateUser(jwt);
            User targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, true);
            List<Expense> savedExpenses = expenseService.addMultipleExpenses(expenses, targetUser.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(savedExpenses);

    }

    // New: start a tracked bulk import and return a jobId for polling
    @PostMapping("/add-multiple/tracked")
    public ResponseEntity<Map<String, String>> addMultipleExpensesTracked(@RequestHeader("Authorization") String jwt,
                                                                          @RequestBody List<Expense> expenses,
                                                                          @RequestParam(required = false) Integer targetId) throws Exception {
        User reqUser = userService.findUserByJwt(jwt);
        User targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, true);

        String jobId = progressTracker.start(targetUser.getId(), expenses != null ? expenses.size() : 0, "Bulk import started");

        // Process asynchronously; frontend polls via /progress
        taskExecutor.execute(() -> {
            try {
                List<Expense> saved;
                try {
                    saved = expenseService.addMultipleExpensesWithProgress(expenses, targetUser.getId(), jobId);
                } catch (Exception ex) {
                    // addMultipleExpensesWithProgress already marks failed; rethrow to outer catch
                    throw ex;
                }
                progressTracker.complete(jobId, "Bulk import completed: " + (saved != null ? saved.size() : 0) + " records");
            } catch (Exception ex) {
                progressTracker.fail(jobId, ex.getMessage());
            }
        });

        Map<String, String> response = new HashMap<>();
        response.put("jobId", jobId);
    return ResponseEntity.accepted().body(response);
    }

    // New: poll progress by jobId
    @GetMapping("/add-multiple/progress/{jobId}")
    public ResponseEntity<ProgressStatus> getAddMultipleProgress(@PathVariable String jobId,
                                                                 @RequestHeader("Authorization") String jwt) throws Exception {
        userService.findUserByJwt(jwt); // ensure token is valid; job is user-scoped in tracker
        ProgressStatus status = progressTracker.get(jobId);
        if (status == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(status);
    }


    @DeleteMapping("/delete-all")
    public ResponseEntity<String> deleteAllExpenses(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

        User reqUser = userService.findUserByJwt(jwt);
        User targetUser;
        targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, true);
        List<Expense> allExpenses = expenseService.getAllExpenses(targetUser.getId());
        expenseService.deleteAllExpenses(targetUser.getId(), allExpenses);
        return new ResponseEntity<>("all expense are deleted", HttpStatus.NO_CONTENT);

    }

    @GetMapping("/expense/{id}")
    public ResponseEntity<Expense> getExpenseById(@PathVariable Integer id,
                                            @RequestHeader("Authorization") String jwt,
                                            @RequestParam(required = false) Integer targetId) throws Exception {

        User reqUser = userService.findUserByJwt(jwt);
        User targetUser;
        targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, true);
        return new ResponseEntity<>(expenseService.getExpenseById(id, targetUser.getId()), HttpStatus.OK);
    }

    @GetMapping("/fetch-expenses-by-date")
    public ResponseEntity<Object> getExpensesByDateRange(@RequestParam LocalDate from,
                                                         @RequestParam LocalDate to,
                                                         @RequestHeader("Authorization") String jwt,
                                                         @RequestParam(required = false) Integer targetId) throws Exception {
        User reqUser = userService.findUserByJwt(jwt);
        User targetUser;
        targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, true);
        return new ResponseEntity<>(expenseService.getExpensesByDateRange(from, to, targetUser.getId()), HttpStatus.OK);
    }


    @GetMapping("/fetch-expenses")
    public ResponseEntity<List<Expense>> getAllExpenses(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(defaultValue = "desc") String sort,
            @RequestParam(required = false) Integer targetId) throws Exception {


            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);

            List<Expense> expenses = sort.equalsIgnoreCase("asc")
                    ? expenseService.getExpensesByUserAndSort(targetUser.getId(), "asc")
                    : expenseService.getExpensesByUserAndSort(targetUser.getId(), "desc");

            return ResponseEntity.ok(expenses);

    }

    @GetMapping("/summary-expenses")
    public ResponseEntity<Map<String,Object>> summary(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {


        User reqUser = userService.findUserByJwt(jwt);
        User targetUser;
        targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
        Map<String, Object> summary = expenseService.generateExpenseSummary(targetUser.getId());
        return ResponseEntity.ok(summary);

    }


    @PutMapping("/edit-expense/{id}")
    public ResponseEntity<Expense> updateExpense(
            @PathVariable Integer id,
            @RequestBody Expense expense,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, true);
                Expense updatedExpense = expenseService.updateExpense(id, expense, targetUser.getId());
                return ResponseEntity.ok(updatedExpense);


    }


    @PutMapping("/edit-multiple")
    public ResponseEntity<List<Expense>> updateMultipleExpenses(
            @RequestBody List<Expense> expenses,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, true);
            List<Expense> updatedExpenses = expenseService.updateMultipleExpenses(targetUser.getId(), expenses);
            return ResponseEntity.ok(updatedExpenses);

    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteExpense(
            @PathVariable Integer id,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;
            targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, true);
            expenseService.deleteExpense(id, targetUser.getId());
            return ResponseEntity.ok("Expense deleted successfully");

    }


    @DeleteMapping("/delete-multiple")
    public ResponseEntity<String> deleteMultipleExpenses(
            @RequestBody List<Integer> ids,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

        User reqUser = userService.findUserByJwt(jwt);
        User targetUser;
        targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, true);
        expenseService.deleteExpensesByIds(ids, targetUser.getId());
        return ResponseEntity.ok("Expenses deleted successfully");

    }


    @GetMapping("/monthly-summary/{year}/{month}")
    public ResponseEntity<MonthlySummary> getMonthlySummary(
            @PathVariable Integer year,
            @PathVariable Integer month,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

        User reqUser = userService.findUserByJwt(jwt);
        User targetUser;


        targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);


        MonthlySummary summary = expenseService.getMonthlySummary(year, month, targetUser.getId());
        return ResponseEntity.ok(summary);

    }

    @GetMapping("/yearly-summary/{year}")
    public ResponseEntity<Map<String, MonthlySummary>> getYearlySummary(
            @PathVariable Integer year,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


            targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);


            Map<String, MonthlySummary> yearlySummary = expenseService.getYearlySummary(year, targetUser.getId());
            return ResponseEntity.ok(yearlySummary);

    }

    @GetMapping("/between-dates")
    public ResponseEntity<List<MonthlySummary>> getSummaryBetweenDates(
            @RequestParam Integer startYear,
            @RequestParam Integer startMonth,
            @RequestParam Integer endYear,
            @RequestParam Integer endMonth,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;
            targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            List<MonthlySummary> summaries = expenseService.getSummaryBetweenDates(startYear, startMonth, endYear, endMonth, targetUser.getId());
            return ResponseEntity.ok(summaries);

    }


    @GetMapping("/top-n")
    public ResponseEntity<List<Expense>> getTopNExpenses(
            @RequestParam int n,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            List<Expense> topExpenses = expenseService.getTopNExpenses(n, targetUser.getId());
            return ResponseEntity.ok(topExpenses);
    }


    @GetMapping("/search")
    public ResponseEntity<List<Expense>> searchExpenses(
            @RequestParam String expenseName,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            List<Expense> expenses = expenseService.searchExpensesByName(expenseName, targetUser.getId());
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
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            List<Expense> filteredExpenses = expenseService.filterExpenses(expenseName, startDate, endDate, type, paymentMethod, minAmount, maxAmount, targetUser.getId());
            return ResponseEntity.ok(filteredExpenses);
    }

    @GetMapping("/top-expense-names")
    public ResponseEntity<List<String>> getTopExpenseNames(
            @RequestParam int topN,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;

                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            List<String> topExpenseNames = expenseService.getTopExpenseNames(topN, targetUser.getId());
            return ResponseEntity.ok(topExpenseNames);
    }


    @GetMapping("/insights/monthly")
    public ResponseEntity<Map<String,Object>> getMonthlySpendingInsights(
            @RequestParam("year") int year,
            @RequestParam("month") int month,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);


            Map<String, Object> insights = expenseService.getMonthlySpendingInsights(year, month, targetUser.getId());
            return ResponseEntity.ok(insights);
    }

    @GetMapping("/payment-method")
    public ResponseEntity<List<String>> getPaymentMethods(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);


            List<String> paymentMethods = expenseService.getPaymentMethods(targetUser.getId());
            return ResponseEntity.ok(paymentMethods);
    }

    @GetMapping("/payment-method-summary")
    public ResponseEntity< Map<String, Map<String, Double>>> getPaymentMethodSummary(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            Map<String, Map<String, Double>> paymentMethodSummary = expenseService.getPaymentMethodSummary(targetUser.getId());
            return ResponseEntity.ok(paymentMethodSummary);
    }

    @GetMapping("/gain")
    public ResponseEntity<List<Expense>> getAllGainExpenses(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);


            List<Expense> expenses = expenseService.getExpensesByType("gain", targetUser.getId());
            return ResponseEntity.ok(expenses);
    }

    @GetMapping("/loss")
    public ResponseEntity<List<Expense>> getLossExpenses(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);


            List<Expense> lossExpenses = expenseService.getLossExpenses(targetUser.getId());
            if (lossExpenses.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(lossExpenses);
    }

    @GetMapping("/payment-method/{paymentMethod}")
    public ResponseEntity<List<Expense>> getExpensesByPaymentMethod(
            @PathVariable String paymentMethod,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);


            List<Expense> expenses = expenseService.getExpensesByPaymentMethod(paymentMethod, targetUser.getId());
            if (expenses.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(expenses);
    }


    @GetMapping("/{type}/{paymentMethod}")
    public ResponseEntity<List<Expense>> getExpensesByTypeAndPaymentMethod(
            @PathVariable String type,
            @PathVariable String paymentMethod,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);


            List<Expense> expenses = expenseService.getExpensesByTypeAndPaymentMethod(type, paymentMethod, targetUser.getId());

            if (expenses.isEmpty()) {
                return ResponseEntity.noContent().build();
            }

            return ResponseEntity.ok(expenses);

    }


    @GetMapping("/top-payment-methods")
    public ResponseEntity<List<String>> getTopPaymentMethods(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);


            List<String> topPaymentMethods = expenseService.getTopPaymentMethods(targetUser.getId());
            return ResponseEntity.ok(topPaymentMethods);
    }

    @GetMapping("/top-gains")
    public ResponseEntity<List<Expense>> getTopGains(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            List<Expense> topGains = expenseService.getTopGains(targetUser.getId());
            return ResponseEntity.ok(topGains);
    }

    @GetMapping("/top-losses")
    public ResponseEntity<List<Expense>> getTopLosses(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);


            List<Expense> topLosses = expenseService.getTopLosses(targetUser.getId());
            return ResponseEntity.ok(topLosses);
    }


    @GetMapping("/by-month")
    public ResponseEntity<List<Expense>> getExpensesByMonthAndYear(
            @RequestParam int month,
            @RequestParam int year,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);

            List<Expense> expenses = expenseService.getExpensesByMonthAndYear(month, year, targetUser.getId());
            return ResponseEntity.ok(expenses);
    }


    @GetMapping("/top-gains/unique")
    public ResponseEntity<List<String>> getTopGains(
            @RequestParam(value = "limit", defaultValue = "10") int limit,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

        User reqUser = userService.findUserByJwt(jwt);
        User targetUser;

        targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);


        // Fetch the unique top 'gain' expenses
        List<String> topGains = expenseService.getUniqueTopExpensesByGain(targetUser.getId(), limit);

        // Limit the results based on the 'limit' parameter
        if (topGains.size() > limit) {
            topGains = topGains.subList(0, limit);
        }

        return ResponseEntity.ok(topGains);

    }

    @GetMapping("/top-losses/unique")
    public ResponseEntity<List<String>> getTopLosses(
            @RequestParam(value = "limit", defaultValue = "10") int limit,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

        User reqUser = userService.findUserByJwt(jwt);
        User targetUser;


        targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);


        List<String> topLosses = expenseService.getUniqueTopExpensesByLoss(targetUser.getId(), limit);

        // Limit the results based on the 'limit' parameter
        if (topLosses.size() > limit) {
            topLosses = topLosses.subList(0, limit);
        }

        return ResponseEntity.ok(topLosses);

    }

    @GetMapping("/today")
    public ResponseEntity<List<Expense>> getExpensesForToday(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

        User reqUser = userService.findUserByJwt(jwt);
        User targetUser;


        targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);


        List<Expense> expenses = expenseService.getExpensesForToday(targetUser.getId());
        return ResponseEntity.ok(expenses);

    }

    @GetMapping("/last-month")
    public ResponseEntity<List<Expense>> getExpensesForLastMonth(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

        User reqUser = userService.findUserByJwt(jwt);
        User targetUser;
        targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
        List<Expense> expenses = expenseService.getExpensesForLastMonth(targetUser.getId());
        return ResponseEntity.ok(expenses);

    }

    @GetMapping("/current-month")
    public ResponseEntity<List<Expense>> getExpensesForCurrentMonth(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

        User reqUser = userService.findUserByJwt(jwt);
        User targetUser;
        targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
        List<Expense> expenses = expenseService.getExpensesForCurrentMonth(targetUser.getId());
        return ResponseEntity.ok(expenses);

    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<String> getCommentsForExpense(
            @PathVariable Integer id,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

        User reqUser = userService.findUserByJwt(jwt);
        User targetUser;


        targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);


        String comments = expenseService.getCommentsForExpense(id, targetUser.getId());
        return ResponseEntity.ok(comments);

    }

    @DeleteMapping("/{id}/remove-comment")
    public ResponseEntity<String> removeCommentForExpense(
            @PathVariable Integer id,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

        User reqUser = userService.findUserByJwt(jwt);
        User targetUser;


        targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, true);


        String result = expenseService.removeCommentFromExpense(id, targetUser.getId());


        return ResponseEntity.ok(result);

    }

    @PostMapping("/{id}/generate-report")
    public ResponseEntity<ExpenseReport> generateReport(
            @PathVariable Integer id,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

        User reqUser = userService.findUserByJwt(jwt);
        User targetUser;


        targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);


        // Generate the report using the service layer
        ExpenseReport report = expenseService.generateExpenseReport(id, targetUser.getId());
        // Return the generated report with a success status
        return new ResponseEntity<>(report, HttpStatus.CREATED);

    }


    @GetMapping("/amount/{amount}")
    public ResponseEntity<List<ExpenseDetails>> getExpenseDetailsByAmount(
            @PathVariable double amount,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            List<ExpenseDetails> expenseDetails = expenseService.getExpenseDetailsByAmount(amount, targetUser.getId());
            return ResponseEntity.ok(expenseDetails);

    }


    @GetMapping("/amount-range")
    public ResponseEntity<List<Expense>> getExpenseDetailsByAmountRange(
            @RequestParam double minAmount,
            @RequestParam double maxAmount,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            List<Expense> expenseDetails = expenseService.getExpenseDetailsByAmountRange(minAmount, maxAmount, targetUser.getId());
            return ResponseEntity.ok(expenseDetails);

    }


    @GetMapping("/total/{expenseName}")
    public ResponseEntity<String> getExpenseDetailsAndTotalByName(
            @PathVariable String expenseName,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);

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
    }


    @GetMapping("/total-by-category")
    public ResponseEntity<List<Map<String,Object>>> getTotalByCategory(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);


            List<Map<String, Object>> categoryTotals = expenseService.getTotalByCategory(targetUser.getId());

            return ResponseEntity.ok(categoryTotals);
    }

    @GetMapping("/total-by-date")
    public ResponseEntity<Map<String,Double>> getTotalByDate(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);

            Map<String, Double> totalByDate = expenseService.getTotalByDate(targetUser.getId());

            return ResponseEntity.ok(totalByDate);
    }

    @GetMapping("/expenses/total-today")
    public ResponseEntity<Double> getTotalForToday(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);

            Double totalToday = expenseService.getTotalForToday(targetUser.getId());


            return ResponseEntity.ok(totalToday);
    }

    @GetMapping("/expenses/total-current-month")
    public ResponseEntity<Double> getTotalForCurrentMonth(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);

            Double totalCurrentMonth = expenseService.getTotalForCurrentMonth(targetUser.getId());


            return ResponseEntity.ok(totalCurrentMonth);
    }

    @GetMapping("/expenses/total-by-month-year")
    public ResponseEntity<?> getTotalByMonthAndYear(
            @RequestParam int month,
            @RequestParam int year,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);


            Double total = expenseService.getTotalForMonthAndYear(month, year, targetUser.getId());

            if (total != null) {
                return ResponseEntity.ok(total);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No expenses found for the specified month and year");
            }
    }

    @GetMapping("/expenses/total-by-date-range")
    public ResponseEntity<Double> getTotalByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            Double total = expenseService.getTotalByDateRange(startDate, endDate, targetUser.getId());
            return new ResponseEntity<>(total, HttpStatus.OK);
    }

    @GetMapping("/expenses/payment-wise-total-current-month")
    public ResponseEntity<Map<String,Double>> getPaymentWiseTotalForCurrentMonth(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);

            Map<String, Double> paymentWiseTotals = expenseService.getPaymentWiseTotalForCurrentMonth(targetUser.getId());

            return ResponseEntity.ok(paymentWiseTotals);
    }

    @GetMapping("/expenses/payment-wise-total-last-month")
    public ResponseEntity<Map<String,Double>> getPaymentWiseTotalForLastMonth(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);

            Map<String, Double> paymentWiseTotals = expenseService.getPaymentWiseTotalForLastMonth(targetUser.getId());


            return ResponseEntity.ok(paymentWiseTotals);
    }

    @GetMapping("/expenses/payment-wise-total-from-to")
    public ResponseEntity<Map<String,Double>> getPaymentWiseTotalForDateRange(
            @RequestParam("startDate") String startDate,
            @RequestParam("endDate") String endDate,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);

            // Parse the string date into LocalDate
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);

            // Call the service method to fetch the data
            Map<String, Double> paymentWiseTotals = expenseService.getPaymentWiseTotalForDateRange(start, end, targetUser.getId());


            return ResponseEntity.ok(paymentWiseTotals);
    }

    @GetMapping("/expenses/payment-wise-total-month")
    public ResponseEntity<Map<String,Double>> getPaymentWiseTotalForMonth(
            @RequestParam("month") int month,
            @RequestParam("year") int year,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            Map<String, Double> paymentWiseTotals = expenseService.getPaymentWiseTotalForMonth(month, year, targetUser.getId());
            return ResponseEntity.ok(paymentWiseTotals);
    }


    @GetMapping("/expenses/total-by-expense-payment-method")
    public ResponseEntity<Map<String, Map<String, Double>>> getTotalByExpenseNameAndPaymentMethodForMonth(
            @RequestParam("month") int month,
            @RequestParam("year") int year,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            Map<String, Map<String, Double>> result = expenseService.getTotalByExpenseNameAndPaymentMethod(month, year, targetUser.getId());
            return ResponseEntity.ok(result);
    }

    @GetMapping("/expenses/total-by-expense-payment-method-range")
    public ResponseEntity<Map<String, Map<String, Double>>> getTotalByExpenseNameAndPaymentMethodForDateRange(
            @RequestParam("startDate") String startDateStr,
            @RequestParam("endDate") String endDateStr,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            LocalDate startDate = LocalDate.parse(startDateStr);
            LocalDate endDate = LocalDate.parse(endDateStr);

            Map<String, Map<String, Double>> result = expenseService.getTotalByExpenseNameAndPaymentMethodForDateRange(startDate, endDate, targetUser.getId());


            return ResponseEntity.ok(result);
    }


    @GetMapping("/expenses/total-expense-payment-method")
    public ResponseEntity<Map<String, Map<String, Double>>> getTotalExpensesGroupedByPaymentMethod(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);

            Map<String, Map<String, Double>> result = expenseService.getTotalExpensesGroupedByPaymentMethod(targetUser.getId());


            return ResponseEntity.ok(result);
    }


    @GetMapping("/generate-excel-report")
    public ResponseEntity<String> generateExcelReport(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);

            String reportPath = expenseService.generateExcelReport(targetUser.getId());

            return ResponseEntity.ok(reportPath);
    }

    @GetMapping("/send-excel-report")
    public ResponseEntity<String> sendExcelReport(
            @RequestParam String toEmail,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            String filePath = expenseService.generateExcelReport(targetUser.getId());
            expenseService.sendEmailWithAttachment(toEmail, "Expense Report", "Please find the attached expense report.", filePath);
            return ResponseEntity.ok("Email sent successfully");

    }


    @PostMapping("/send-monthly-report")
    public ResponseEntity<String> sendMonthlyReport(@RequestBody ReportRequest request) {
        return expenseService.generateAndSendMonthlyReport(request);
    }


    @GetMapping("/current-month/excel")
    public ResponseEntity<InputStreamResource> getCurrentMonthExpensesExcel(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);

            List<Expense> expenses = expenseService.getExpensesForCurrentMonth(targetUser.getId());
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
    public ResponseEntity<String> sendCurrentMonthExpensesEmail(
            @RequestParam String email,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);

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
    public ResponseEntity<String> sendExpensesByMonthAndYearEmail(
            @RequestParam int month,
            @RequestParam int year,
            @RequestHeader("Authorization") String jwt,
            @RequestParam String email,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);


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
    public ResponseEntity<String> sendExpensesByTypeAndPaymentMethodEmail(
            @PathVariable String type,
            @PathVariable String paymentMethod,
            @RequestParam String email,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);


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

    }


    @GetMapping("/fetch-expenses-by-date/email")
    public ResponseEntity<String> sendExpensesByDateRangeEmail(
            @RequestParam LocalDate from,
            @RequestParam LocalDate to,
            @RequestHeader("Authorization") String jwt,
            @RequestParam String email,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);


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

    }

    @GetMapping("/expenses/gain/email")
    public ResponseEntity<String> sendGainExpensesEmail(
            @RequestParam String email,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


            targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);


            List<Expense> expenses = expenseService.getExpensesByType("gain", targetUser.getId());


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

    }

    @GetMapping("/expenses/loss/email")
    public ResponseEntity<String> sendLossExpensesEmail(
            @RequestParam String email,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);


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

    }

    @GetMapping("/expenses/today/email")
    public ResponseEntity<?> sendExpensesForTodayEmail(
            @RequestParam String email,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

        User reqUser = userService.findUserByJwt(jwt);
        User targetUser;


        targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);


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

    }

    @GetMapping("/payment-method/{paymentMethod}/email")
    public ResponseEntity<String> sendExpensesByPaymentMethodEmail(
            @PathVariable String paymentMethod,
            @RequestHeader("Authorization") String jwt,
            @RequestParam String email,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);

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
    }

    @GetMapping("/expenses/amount-range/email")
    public ResponseEntity<String> sendExpenseDetailsByAmountRangeEmail(
            @RequestParam double minAmount,
            @RequestParam double maxAmount,
            @RequestParam String email,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);

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

    }


    @GetMapping("/expenses/search/email")
    public ResponseEntity<String> sendSearchExpensesByEmail(
            @RequestParam String expenseName,
            @RequestParam String email,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);

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
    }

    @GetMapping("/monthly-summary/{year}/{month}/email")
    public ResponseEntity<String> sendMonthlySummaryByEmail(
            @PathVariable Integer year,
            @PathVariable Integer month,
            @RequestParam String email,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);

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
    }


    @GetMapping("/payment-method-summary/email")
    public ResponseEntity<String> sendPaymentMethodSummaryByEmail(
            @RequestParam String email,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);

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
    }


    @GetMapping("/yearly-summary/email")
    public ResponseEntity<String> sendYearlySummaryByEmail(
            @RequestParam Integer year,
            @RequestParam String email,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);

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
    }


    @GetMapping("/between-dates/email")
    public ResponseEntity<String> sendSummaryBetweenDatesByEmail(
            @RequestParam Integer startYear,
            @RequestParam Integer startMonth,
            @RequestParam Integer endYear,
            @RequestParam Integer endMonth,
            @RequestParam String email,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);

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
    public ResponseEntity<List<Expense>> getYesterdayExpenses(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);


            List<Expense> expenses = expenseService.getExpensesByDate(LocalDate.now().minusDays(1), targetUser.getId());


            return ResponseEntity.ok(expenses);

    }

    @GetMapping("/particular-date")
    public ResponseEntity<List<Expense>> getParticularDateExpenses(
            @RequestParam String date,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

        User reqUser = userService.findUserByJwt(jwt);
        User targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);


            List<Expense> expenses = expenseService.getExpensesByDateString(date, targetUser.getId());
            return ResponseEntity.ok(expenses);

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
    public ResponseEntity<String> sendYesterdayExpensesEmail(
            @RequestParam String email,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);


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

    }

    @GetMapping("/expenses/date/email")
    public ResponseEntity<String> sendDateExpensesEmail(
            @RequestParam String date,
            @RequestParam String email,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);

            LocalDate specificDate;

                specificDate = LocalDate.parse(date);


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
    public ResponseEntity<String> sendLastWeekExpensesEmail(
            @RequestParam String email,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            User targetUser;


                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);


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
            @RequestBody List<Expense> expenses,
            @RequestHeader("Authorization") String jwt) throws Exception {




            User reqUser = userService.findUserByJwt(jwt);


            // Process and save expenses
            List<Expense> saved = expenseService.addMultipleExpenses(expenses, reqUser.getId());


            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }


    @PostMapping("/upload")
    public ResponseEntity<List<Expense>> getFileContent(
            @RequestParam("file") MultipartFile file,
            @RequestHeader("Authorization") String jwt) throws IOException {
            userService.findUserByJwt(jwt);
            List<Expense> expenses = excelService.parseExcelFile(file);
            int i = 0;
            for (Expense expense : expenses) {
                expense.setId(i++);
                expense.setCategoryId(expense.getCategoryId());
                expense.setBudgetIds(expense.getBudgetIds());
                expense.setIncludeInBudget(expense.isIncludeInBudget());
                expense.setDate(expense.getDate());
                if (expense.getExpense() != null) {
                    expense.getExpense().setId(i);
                }
            }
            return ResponseEntity.ok(expenses);

    }

    @PostMapping("/upload-categories")
    public ResponseEntity<List<Category>> getCategoryFileContent(
            @RequestParam("file") MultipartFile file,
            @RequestHeader("Authorization") String jwt) throws IOException {
        userService.findUserByJwt(jwt);
        List<Category> categories = excelService.parseCategorySummarySheet(file);
        int i = 0;
        for (Category category : categories) {
            // Mirror the expense upload behavior: assign a transient sequential ID for preview
            category.setId(i++);
            // Keep parsed fields as-is (name, color, icon, description, global, userIds, editUserIds)
        }
        return ResponseEntity.ok(categories);
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
                        .body(INVALID_OR_EXPIRED_TOKEN);
            }
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
    public ResponseEntity<?> getGroupedExpenses(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(value = "sortOrder", defaultValue = "desc") String sortOrder,
            @RequestParam(required = false) Integer targetId) {

            // Validate sort order parameter
            if (!sortOrder.equalsIgnoreCase("asc") && !sortOrder.equalsIgnoreCase("desc")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Invalid sortOrder parameter. Must be 'asc' or 'desc'");
            }

            // Get authenticated user
            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(INVALID_OR_EXPIRED_TOKEN);
            }

            // Determine target user (if admin is viewing another user's expenses)
            User targetUser;
            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (Exception e) {
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

    }


    @GetMapping("/sorted")
    public ResponseEntity<Map<String, Object>> getExpensesGroupedByDate(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "date") String sortBy,
            @RequestParam(defaultValue = "asc") String sortOrder,
            @RequestParam(required = false) Integer targetId) throws Exception {

        User reqUser = userService.findUserByJwt(jwt);
        User targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);


            Map<String, Object> result = expenseService.getExpensesGroupedByDateWithValidation(
                    targetUser.getId(), page, size, sortBy, sortOrder);
            return ResponseEntity.ok(result);

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

            targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);


            // Get expense before date
            Expense expense;
            try {
                expense = expenseService.getExpensesBeforeDate(targetUser.getId(), expenseName.trim(), parsedDate);
            } catch (IndexOutOfBoundsException e) {
                // Handle case when no expenses exist before the given date
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(String.format("No expense found with name '%s' before date %s", expenseName, date));
            }

            // Handle case when no expense is found
            if (expense == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(String.format("No expense found with name '%s' before date %s", expenseName, date));
            }


            return ResponseEntity.ok(expense);

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
            @RequestParam(required = false) Integer customStartDay) throws Exception {

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

                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);

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

            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token");
            }

            User targetUser;
            try {
                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (Exception e) {
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

    }

    @GetMapping("/trend")
    public ResponseEntity<?> getExpenseTrend(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(value = "year", defaultValue = "0") int year,
            @RequestParam(required = false) Integer targetId,
            @RequestParam(required = false) String flowType) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token");
            }

            User targetUser;

                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);


            if (year == 0) {
                year = Year.now().getValue();
            }
            if (year < 2000 || year > 2100) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Year must be between 2000 and 2100");
            }

            Map<String, Object> result = expenseService.getExpenseTrend(targetUser.getId(), year);


            return ResponseEntity.ok(result);

    }



    @GetMapping("/payment-methods")
    public ResponseEntity<?> getPaymentMethodDistribution(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(value = "year", defaultValue = "0") int year,
            @RequestParam(required = false) String flowType,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer targetId) throws Exception {

        User reqUser = userService.findUserByJwt(jwt);

        User targetUser;

        targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);

        // Validate flowType parameter
        if (flowType != null && !flowType.equalsIgnoreCase("inflow") && !flowType.equalsIgnoreCase("outflow")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid flowType. Must be 'inflow' or 'outflow'");
        }

        // Validate type parameter
        if (type != null && !type.equalsIgnoreCase("loss") && !type.equalsIgnoreCase("gain")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid type. Must be 'loss' or 'gain'");
        }

        Map<String, Object> result;

        // If both start and end dates are provided, use date range
        if (fromDate != null && toDate != null) {
            // Validate date range
            if (toDate.isBefore(fromDate)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("End date cannot be before start date");
            }
            result = expenseService.getPaymentMethodDistributionByDateRange(
                    targetUser.getId(), fromDate, toDate, flowType, type);
        } else {
            // Fallback to year-based filtering (existing functionality)
            result = expenseService.getPaymentMethodDistribution(
                    targetUser.getId(), year);
        }

        return ResponseEntity.ok(result);
    }

    // Filtered payment method distribution: supports explicit date range OR dynamic rangeType+offset (week|month|year)
    @GetMapping("/payment-methods/filtered")
    public ResponseEntity<?> getPaymentMethodDistributionFiltered(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String rangeType,
            @RequestParam(required = false, defaultValue = "0") int offset,
            @RequestParam(required = false) String flowType,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer targetId) throws Exception {

        User reqUser = userService.findUserByJwt(jwt);
        if (reqUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired token"));
        }

        User targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);

        // Validate flowType parameter
        if (flowType != null && !flowType.equalsIgnoreCase("inflow") && !flowType.equalsIgnoreCase("outflow")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid flowType. Must be 'inflow' or 'outflow'"));
        }
        // Validate type parameter
        if (type != null && !type.equalsIgnoreCase("loss") && !type.equalsIgnoreCase("gain")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid type. Must be 'loss' or 'gain'"));
        }

        Map<String, Object> result;

        if (fromDate != null && toDate != null) {
            if (toDate.isBefore(fromDate)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "End date cannot be before start date"));
            }
            result = expenseService.getPaymentMethodDistributionByDateRange(
                    targetUser.getId(), fromDate, toDate, flowType, type);
        } else if (rangeType != null) {
            LocalDate now = LocalDate.now();
            LocalDate start;
            LocalDate end;
            switch (rangeType.toLowerCase()) {
                case "week":
                    start = now.with(DayOfWeek.MONDAY).plusWeeks(offset);
                    end = start.plusDays(6);
                    break;
                case "month":
                    start = now.withDayOfMonth(1).plusMonths(offset);
                    end = start.plusMonths(1).minusDays(1);
                    break;
                case "year":
                    start = now.withDayOfMonth(1).withMonth(1).plusYears(offset);
                    end = start.plusYears(1).minusDays(1);
                    break;
                default:
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("error", "Invalid rangeType. Use week, month, or year."));
            }
            result = expenseService.getPaymentMethodDistributionByDateRange(
                    targetUser.getId(), start, end, flowType, type);
        } else {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Provide fromDate & toDate or rangeType"));
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/cumulative")
    public ResponseEntity<Map<String, Object>> getCumulativeExpenses(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(value = "year", defaultValue = "0") int year,
            @RequestParam(required = false) Integer targetId) throws Exception {


            User reqUser = userService.findUserByJwt(jwt);

            User targetUser;

                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);

            Map<String, Object> result = expenseService.getCumulativeExpenses(targetUser.getId(), year);

            return ResponseEntity.ok(result);
    }

    @GetMapping("/name-over-time")
    public ResponseEntity<Map<String, Object>> getExpenseNameOverTime(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(value = "year", defaultValue = "0") int year,
            @RequestParam(value = "limit", defaultValue = "5") int limit,
            @RequestParam(required = false) Integer targetId) throws Exception {


            User reqUser = userService.findUserByJwt(jwt);

            User targetUser;

                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);

            Map<String, Object> result = expenseService.getExpenseNameOverTime(targetUser.getId(), year, limit);


            return ResponseEntity.ok(result);

    }


    @GetMapping("/daily-spending")
    public ResponseEntity<List<Map<String, Object>>> getDailySpending(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String type) throws Exception {

        User reqUser = userService.findUserByJwt(jwt);
        User targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);

        List<Map<String, Object>> result;

        // Check if date range is provided
        if (fromDate != null && toDate != null) {
            result = expenseService.getDailySpendingByDateRange(targetUser.getId(), fromDate, toDate, type);
        }
        // Check if month and year are provided
        else if (month != null && year != null) {
            result = expenseService.getDailySpendingByMonth(targetUser.getId(), month, year, type);
        }
        // Default to current month
        else {
            result = expenseService.getDailySpendingCurrentMonth(targetUser.getId(), type);
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/current-month/totals")
    public ResponseEntity<List<Map<String, Object>>> getMonthlySpendingAndIncomeCurrentMonth(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);


            User targetUser;

                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);


            List<Map<String, Object>> result = expenseService.getMonthlySpendingAndIncomeCurrentMonth(targetUser.getId());


            return ResponseEntity.ok(result);

    }

    @GetMapping("/current-month/distribution")
    public ResponseEntity<List<Map<String, Object>>> getExpenseDistributionCurrentMonth(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);


            User targetUser;

                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);


            List<Map<String, Object>> result = expenseService.getExpenseDistributionCurrentMonth(targetUser.getId());


            return ResponseEntity.ok(result);

    }

    @GetMapping("/included-in-budget/{startDate}/{endDate}")
    public ResponseEntity<?> getIncludeInBudgetExpenses(
            @RequestHeader("Authorization") String jwt,
            @PathVariable LocalDate startDate,
            @PathVariable LocalDate endDate,
            @RequestParam(required = false) Integer targetId) throws Exception {

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

                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);


            List<Expense> expenses = expenseService.findByUserIdAndDateBetweenAndIncludeInBudgetTrue(
                    startDate, endDate, targetUser.getId());


            return ResponseEntity.ok(expenses);

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
            @RequestParam(required = false) Integer targetId) throws Exception {

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
            } catch (Exception e) {
                return handleRuntimeException(e);
            }

            List<Expense> expenses = expenseService.getExpensesInBudgetRangeWithIncludeFlag(
                    startDate,
                    endDate,
                    budgetId,
                    targetUser.getId()
            );

            return ResponseEntity.ok(expenses);

    }


    @GetMapping("/cashflow")
    public ResponseEntity<?> getCashflowExpenses(
            @RequestParam(required = false) String range,
            @RequestParam(required = false, defaultValue = "0") Integer offset,
            @RequestParam(required = false) String flowType,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
        @RequestParam(required = false, defaultValue = "false") Boolean groupBy,
            @RequestParam(required = false) Integer targetId,
            @RequestHeader("Authorization") String jwt) throws Exception {

        User reqUser = userService.findUserByJwt(jwt);
        User targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);

        // Validate type parameter (if provided)
        if (type != null && !type.equalsIgnoreCase("loss") && !type.equalsIgnoreCase("gain")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid type parameter. Must be 'loss' or 'gain'.");
        }

        LocalDate effectiveStart;
        LocalDate effectiveEnd;

        // If explicit date range provided, prioritize and ignore range/offset
        if (startDate != null && endDate != null) {
            if (endDate.isBefore(startDate)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("endDate cannot be before startDate");
            }
            effectiveStart = startDate;
            effectiveEnd = endDate;
        } else if ((startDate != null && endDate == null) || (startDate == null && endDate != null)) {
            // Reject partial explicit date input to avoid ambiguous ranges
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Provide both startDate and endDate, or omit both and use range parameter");
        } else {
            // Require range if no explicit dates
            if (range == null || range.isBlank()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Provide either startDate & endDate or a range parameter (week|month|year)");
            }
            LocalDate now = LocalDate.now();
            switch (range.toLowerCase()) {
                case "week":
                    effectiveStart = now.with(DayOfWeek.MONDAY).plusWeeks(offset);
                    effectiveEnd = effectiveStart.plusDays(6);
                    break;
                case "month":
                    effectiveStart = now.withDayOfMonth(1).plusMonths(offset);
                    effectiveEnd = effectiveStart.plusMonths(1).minusDays(1);
                    break;
                case "year":
                    effectiveStart = now.withDayOfMonth(1).withMonth(1).plusYears(offset);
                    effectiveEnd = effectiveStart.plusYears(1).minusDays(1);
                    break;
                default:
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body("Invalid range parameter. Must be one of week, month, year");
            }
        }

        List<Expense> expenses = expenseService.getExpensesWithinRange(
                targetUser.getId(),
                effectiveStart,
                effectiveEnd,
                flowType
        );

        // Optional category name substring filter
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

        // Optional type filter (loss/gain)
        if (type != null) {
            expenses = expenses.stream()
                    .filter(expense -> {
                        if (expense.getExpense() == null || expense.getExpense().getType() == null) {
                            return false;
                        }
                        return expense.getExpense().getType().equalsIgnoreCase(type);
                    })
                    .collect(Collectors.toList());
        }

        // If groupBy flag not set or false, return the flat list (existing behavior)
        if (groupBy == null || !groupBy) {
            return ResponseEntity.ok(expenses);
        }

        // Group by EXPENSE NAME (fallback to "unknown") instead of payment method
        Map<String, List<Expense>> grouped = expenses.stream()
                .collect(Collectors.groupingBy(e -> {
                    if (e.getExpense() == null || e.getExpense().getExpenseName() == null || e.getExpense().getExpenseName().isBlank()) {
                        return "unknown";
                    }
                    return e.getExpense().getExpenseName();
                }));

        // Calculate totals per expense name and overall stats
        Map<String, Double> expenseNameTotals = new LinkedHashMap<>();
        grouped.forEach((expenseName, list) -> {
            double total = list.stream()
                    .filter(exp -> exp.getExpense() != null)
                    .mapToDouble(exp -> Optional.ofNullable(exp.getExpense().getAmount()).orElse(0.0))
                    .sum();
            expenseNameTotals.put(expenseName, total);
        });
        double grandTotal = expenseNameTotals.values().stream().mapToDouble(Double::doubleValue).sum();

        // Prepare summary section (renamed keys but keep old ones for backward compatibility where sensible)
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalAmount", grandTotal);
        Map<String, Object> dateRange = new LinkedHashMap<>();
        dateRange.put("fromDate", effectiveStart.toString());
        dateRange.put("toDate", effectiveEnd.toString());
        dateRange.put("flowType", flowType);
        summary.put("dateRange", dateRange);
        summary.put("totalExpenseNames", expenseNameTotals.size());
        summary.put("totalExpenses", expenses.size());
        summary.put("expenseNameTotals", expenseNameTotals);
        // Backward compatible aliases (if frontend still expecting these temporarily)
        summary.put("totalPaymentMethods", expenseNameTotals.size());
        summary.put("paymentMethodTotals", expenseNameTotals);

        // Assemble final response with summary first, then each expense name section
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("summary", summary);

        grouped.forEach((expenseName, list) -> {
            Map<String, Object> groupBlock = new LinkedHashMap<>();
            groupBlock.put("expenseCount", list.size());
            groupBlock.put("totalAmount", expenseNameTotals.getOrDefault(expenseName, 0.0));
            groupBlock.put("expenseName", expenseName); // primary grouping key
            groupBlock.put("paymentMethod", expenseName); // backward compat alias for frontend expecting this key

            // Gather set of distinct payment methods in this expense name group (optional insight)
            Set<String> paymentMethods = list.stream()
                    .map(e -> e.getExpense() != null ? e.getExpense().getPaymentMethod() : null)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toCollection(LinkedHashSet::new));
            groupBlock.put("paymentMethods", paymentMethods);

            // Transform each expense into a simplified structure
            List<Map<String, Object>> expenseEntries = list.stream().map(exp -> {
                Map<String, Object> entry = new LinkedHashMap<>();
                if (exp.getDate() != null) {
                    entry.put("date", exp.getDate().toString());
                }
                entry.put("id", exp.getId());

                Map<String, Object> details = new LinkedHashMap<>();
                ExpenseDetails d = exp.getExpense();
                if (d != null) {
                    details.put("amount", d.getAmount());
                    details.put("comments", d.getComments());
                    details.put("netAmount", d.getNetAmount());
                    details.put("paymentMethod", d.getPaymentMethod());
                    details.put("id", d.getId());
                    details.put("type", d.getType());
                    details.put("expenseName", d.getExpenseName());
                    details.put("creditDue", d.getCreditDue());
                }
                entry.put("details", details);
                return entry;
            }).collect(Collectors.toList());

            groupBlock.put("expenses", expenseEntries);
            // Backward compatible key (if frontend used paymentMethod previously as map key)
            response.put(expenseName, groupBlock);
        });

        return ResponseEntity.ok(response);
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
            @RequestParam(required = false) Integer targetId) throws Exception {

            // Get authenticated user
            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token");
            }

            // Determine target user (if admin is viewing another user's expenses)
            User targetUser;

                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);
            // Get expenses by category ID
            List<Expense> expenses = expenseService.getExpensesByCategoryId(categoryId, targetUser.getId());

            // Return empty result if no expenses found
            if (expenses.isEmpty()) {
                return ResponseEntity.noContent().build();
            }

            return ResponseEntity.ok(expenses);
    }


    @GetMapping("/all-by-categories/detailed")
    public ResponseEntity<?> getAllExpensesByCategoriesDetailed(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token");
            }

            // Determine target user (if admin is viewing another user's data)
            User targetUser;

                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);

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

    }

    @GetMapping("/all-by-categories/detailed/filtered")
    public ResponseEntity<Map<String, Object>> getAllExpensesByCategoriesDetailedFiltered(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String rangeType,
            @RequestParam(required = false, defaultValue = "0") int offset,
            @RequestParam(required = false) String flowType,
            @RequestParam(required = false) Integer targetId) throws Exception {


            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid or expired token"));
            }

            User targetUser;

                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);


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

    }


    @GetMapping("/all-by-payment-method/detailed/filtered")
    public ResponseEntity<Map<String, Object>> getAllExpensesByPaymentMethodDetailedFiltered(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String rangeType,
            @RequestParam(required = false, defaultValue = "0") int offset,
            @RequestParam(required = false) String flowType,
            @RequestParam(required = false) Integer targetId) throws Exception {

            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid or expired token"));
            }

            User targetUser;

                targetUser = permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, false);


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

    }


    @GetMapping("/get-by-id")
    public ResponseEntity<Expense> findByUserIdandExpenseeID(@RequestParam Integer userId, @RequestParam Integer expenseId) {

        Expense expense = expenseService.getExpenseById(expenseId, userId);
        return ResponseEntity.ok(expense);

    }


    @PostMapping("/save-single")
    public ResponseEntity<Expense> saveTheExpense(@RequestBody Expense expense) {
        Expense savedExpense = expenseService.save(expense);

        return new ResponseEntity<>(savedExpense, HttpStatus.OK);
    }

    @PostMapping("/add-expense-with-bill-service")
    public Expense addExpenseWithBillService(@RequestBody Expense expense, @RequestParam Integer userId) throws Exception {
        return expenseService.addExpense(expense, userId);
    }

    @PostMapping("/update-expense-with-bill-service")
    public Expense updateExpenseWithBillService(@RequestParam Integer expenseId, @RequestBody Expense expense, @RequestParam Integer userId) throws Exception {


        return expenseService.updateExpenseWithBillService(expenseId, expense, userId);
    }


    @DeleteMapping("/delete-expenses-with-bill-service")
    public void deleteExpenseWithBillService(@RequestParam List<Integer> expenseIds, @RequestParam Integer userId) throws Exception {
        expenseService.deleteExpensesByIdsWithBillService(expenseIds, userId);
    }

    @GetMapping("/get-all-expenses-with-bill-service")
    public List<Expense> getAllExpense(@RequestParam Integer userId) {
        return expenseService.getAllExpenses(userId);
    }

    @GetMapping("/get-all-expenses-sort-with-bill-service")
    public List<Expense> getAllExpensesWithSort(@RequestParam Integer userId, @RequestParam String sort) {
        return expenseService.getAllExpenses(userId, sort);
    }
}

