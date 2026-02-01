package com.jaya.controller;

import com.jaya.dto.BudgetReport;
import com.jaya.dto.BudgetSearchDTO;
import com.jaya.dto.ExpenseDTO;
import com.jaya.models.Budget;
import com.jaya.models.UserDto;
import com.jaya.service.BudgetService;
import com.jaya.service.FriendshipService;
import com.jaya.service.UserService;
import com.jaya.kafka.service.UnifiedActivityService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    @Autowired
    private UserService userService;

    @Autowired
    private UnifiedActivityService unifiedActivityService;

    @Autowired
    private FriendshipService friendshipService;

    private UserDto getTargetUserWithPermissionCheck(Integer targetId, UserDto reqUser, boolean needWriteAccess)
            throws Exception {
        if (targetId == null)
            return reqUser;
        UserDto targetUser = userService.getUserProfileById(targetId);
        if (targetUser == null) {
            throw new com.jaya.exceptions.UserNotFoundException("Target user not found");
        }
        boolean hasAccess = needWriteAccess
                ? friendshipService.canUserModifyExpenses(targetId, reqUser.getId())
                : friendshipService.canUserAccessExpenses(targetId, reqUser.getId());
        if (!hasAccess) {
            String action = needWriteAccess ? "modify" : "access";
            throw new com.jaya.exceptions.AccessDeniedException(
                    "You don't have permission to " + action + " this user's expenses");
        }
        return targetUser;
    }

    private UserDto authenticate(String jwt) {
        UserDto reqUser = userService.getuserProfile(jwt);
        if (reqUser == null) {
            throw new com.jaya.exceptions.UnauthorizedException("Invalid or expired token");
        }
        return reqUser;
    }

    @PostMapping("")
    public ResponseEntity<?> createBudget(
            @RequestBody @Valid Budget budget,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {
        UserDto reqUser = authenticate(jwt);
        UserDto targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);
        Budget createdBudget;
        if (targetId != null && !targetId.equals(reqUser.getId())) {
            createdBudget = budgetService.createBudgetForFriend(budget, reqUser.getId(), targetId);
        } else {
            createdBudget = budgetService.createBudget(budget, reqUser.getId());
        }

        // Send unified event (handles both own action and friend activity)
        unifiedActivityService.sendBudgetCreatedEvent(createdBudget, reqUser, targetUser);

        return ResponseEntity.status(HttpStatus.CREATED).body(createdBudget);
    }

    @PutMapping("/{budgetId}")
    public ResponseEntity<?> editBudget(
            @PathVariable Integer budgetId,
            @RequestBody @Valid Budget budget,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {
        UserDto reqUser = authenticate(jwt);
        UserDto targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);

        // Get old budget for audit tracking
        Budget oldBudget = budgetService.getBudgetById(budgetId, targetUser.getId());

        Budget updatedBudget = budgetService.editBudget(budgetId, budget, targetUser.getId());

        // Send unified event (handles both own action and friend activity)
        unifiedActivityService.sendBudgetUpdatedEvent(updatedBudget, oldBudget, reqUser, targetUser);

        return ResponseEntity.ok(updatedBudget);
    }

    @DeleteMapping("/{budgetId}")
    public ResponseEntity<?> deleteBudget(
            @PathVariable Integer budgetId,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {
        UserDto reqUser = authenticate(jwt);
        UserDto targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);
        Budget budget = budgetService.getBudgetById(budgetId, targetUser.getId());
        String budgetName = budget.getName();
        Double budgetAmount = budget.getAmount();
        budgetService.deleteBudget(budgetId, targetUser.getId());

        // Send unified event (handles both own action and friend activity)
        unifiedActivityService.sendBudgetDeletedEvent(budgetId, budgetName, budgetAmount, reqUser, targetUser);

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("")
    public ResponseEntity<?> deleteAllBudget(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {
        UserDto reqUser = authenticate(jwt);
        UserDto targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);
        // Get count before deletion for notification
        List<Budget> budgets = budgetService.getAllBudgetForUser(targetUser.getId());
        int count = budgets != null ? budgets.size() : 0;
        budgetService.deleteAllBudget(targetUser.getId());

        // Send unified event for bulk deletion
        unifiedActivityService.sendAllBudgetsDeletedEvent(count, reqUser, targetUser);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{budgetId}")
    public ResponseEntity<?> getBudgetById(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer budgetId,
            @RequestParam(required = false) Integer targetId) throws Exception {

        // Validate JWT
        UserDto reqUser = userService.getuserProfile(jwt);
        if (reqUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid or expired token");
        }

        UserDto targetUser;

        targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
        Budget budget = budgetService.getBudgetById(budgetId, targetUser.getId());
        return ResponseEntity.ok(budget);

    }

    @GetMapping("/get-by-id")
    public Budget getBudgetByBudgetID(
            @RequestParam Integer budgetId,
            @RequestParam Integer userId) throws Exception {

        return budgetService.getBudgetById(budgetId, userId);

    }

    @PostMapping("/save")
    public Budget save(
            @RequestBody Budget budget) throws Exception {

        return budgetService.save(budget);

    }

    @GetMapping("/user")
    public List<Budget> getAllBudgetForUser(
            @RequestParam Integer userId) throws Exception {

        return budgetService.getBudgetsForUser(userId);

    }

    @GetMapping("")
    public ResponseEntity<?> getAllBudgetsForUser(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {
        UserDto reqUser = authenticate(jwt);
        UserDto targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
        List<Budget> budgets = budgetService.getAllBudgetForUser(targetUser.getId());
        return ResponseEntity.ok(budgets);
    }

    @GetMapping("/{budgetId}/expenses")
    public ResponseEntity<?> getExpensesWithinBudgetDates(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer budgetId,
            @RequestParam(required = false) Integer targetId) throws Exception {
        UserDto reqUser = authenticate(jwt);
        UserDto targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
        List<ExpenseDTO> expenses = budgetService.getExpensesForUserByBudgetId(targetUser.getId(), budgetId);
        return ResponseEntity.ok(expenses);
    }

    @GetMapping("/report/{budgetId}")
    public ResponseEntity<?> getBudgetReport(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer budgetId,
            @RequestParam(required = false) Integer targetId) throws Exception {
        UserDto reqUser = authenticate(jwt);
        UserDto targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
        BudgetReport budgetReport = budgetService.calculateBudgetReport(targetUser.getId(), budgetId);
        return ResponseEntity.ok(budgetReport);
    }

    @GetMapping("/reports")
    public ResponseEntity<?> getAllBudgetReportsForUser(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {
        UserDto reqUser = authenticate(jwt);
        UserDto targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
        List<BudgetReport> budgetReports = budgetService.getAllBudgetReportsForUser(targetUser.getId());
        return ResponseEntity.ok(budgetReports);
    }

    @GetMapping("/detailed-report/{budgetId}")
    public ResponseEntity<?> getDetailedBudgetReport(
            @PathVariable Integer budgetId,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false, defaultValue = "all") String rangeType,
            @RequestParam(required = false, defaultValue = "0") int offset,
            @RequestParam(required = false, defaultValue = "all") String flowType) throws Exception {
        UserDto reqUser = authenticate(jwt);
        UserDto targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
        Map<String, Object> groupedBudget = budgetService.getSingleBudgetDetailedReport(
                targetUser.getId(), budgetId, fromDate, toDate, rangeType, offset, flowType);
        return ResponseEntity.ok(groupedBudget);
    }

    @GetMapping("/filter-by-date")
    public ResponseEntity<?> getBudgetsByDate(
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {
        UserDto reqUser = authenticate(jwt);
        UserDto targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
        List<Budget> budgets = budgetService.getBudgetsByDate(date, targetUser.getId());
        return ResponseEntity.ok(budgets);
    }

    @GetMapping("/expenses")
    public ResponseEntity<?> getBudgetsForExpense(
            @RequestParam Integer expenseId,
            @RequestParam String date,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {
        UserDto reqUser = authenticate(jwt);
        UserDto targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
        LocalDate expenseDate;
        try {
            expenseDate = LocalDate.parse(date);
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid date format: " + date);
        }
        List<Budget> budgets = budgetService.getBudgetsByExpenseId(expenseId, targetUser.getId(), expenseDate);
        return ResponseEntity.ok(budgets);
    }

    @GetMapping("/all-with-expenses/detailed/filtered")
    public ResponseEntity<?> getAllBudgetsWithExpensesDetailedFiltered(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String rangeType,
            @RequestParam(required = false, defaultValue = "0") int offset,
            @RequestParam(required = false) String flowType,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer targetId) throws Exception {
        UserDto reqUser = authenticate(jwt);
        UserDto targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
        String effectiveFlowType = (type != null && !type.isBlank()) ? type : flowType;
        Map<String, Object> response = budgetService.getFilteredBudgetsWithExpenses(targetUser.getId(), fromDate,
                toDate, rangeType, offset, effectiveFlowType);
        return ResponseEntity.ok(response);
    }

    /**
     * Fuzzy search budgets by name or category name.
     * Supports partial text matching for typeahead/search functionality.
     * Optimized query - avoids N+1 problem by returning DTOs.
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchBudgets(
            @RequestParam String query,
            @RequestParam(defaultValue = "20") int limit,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {
        UserDto reqUser = authenticate(jwt);
        UserDto targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
        List<BudgetSearchDTO> budgets = budgetService.searchBudgets(targetUser.getId(), query, limit);
        return ResponseEntity.ok(budgets);
    }

}
