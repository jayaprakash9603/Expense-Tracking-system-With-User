package com.jaya.controller;

import com.jaya.dto.BudgetReport;
import com.jaya.dto.DetailedBudgetReport;
import com.jaya.dto.ExpenseDTO;
import com.jaya.models.Budget;
import com.jaya.models.UserDto;
import com.jaya.service.BudgetService;
import com.jaya.service.FriendshipService;
import com.jaya.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.jaya.service.BudgetNotificationService;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    @Autowired
    private UserService userService;

    @Autowired
    private BudgetNotificationService budgetNotificationService;

    @Autowired
    private FriendshipService friendshipService;

    private UserDto getTargetUserWithPermissionCheck(Integer targetId, UserDto reqUser, boolean needWriteAccess)
            throws Exception {
        if (targetId == null) {
            return reqUser;
        }

        UserDto targetUser = userService.getUserProfileById(targetId);
        if (targetUser == null) {
            throw new RuntimeException("Target user not found");
        }

        boolean hasAccess = needWriteAccess ? friendshipService.canUserModifyExpenses(targetId, reqUser.getId())
                : friendshipService.canUserAccessExpenses(targetId, reqUser.getId());

        if (!hasAccess) {
            String action = needWriteAccess ? "modify" : "access";
            throw new RuntimeException("You don't have permission to " + action + " this user's expenses");
        }

        return targetUser;
    }

    @PostMapping("")
    public ResponseEntity<?> createBudget(
            @RequestBody @Valid Budget budget,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            // Validate JWT
            UserDto reqUser = userService.getuserProfile(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token");
            }

            // Validate and get target user
            UserDto targetUser;
            try {
                targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);
            } catch (RuntimeException e) {
                if (e.getMessage().contains("not found")) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body("Target user not found");
                } else if (e.getMessage().contains("permission")) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(e.getMessage());
                } else {
                    throw e;
                }
            }

            // Create budget
            Budget createdBudget = budgetService.createBudget(budget, targetUser.getId());

            // Send notification
            budgetNotificationService.sendBudgetCreatedNotification(createdBudget);

            return ResponseEntity.status(HttpStatus.CREATED).body(createdBudget);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid budget data: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating budget: " + e.getMessage());
        }
    }

    @PutMapping("/{budgetId}")
    public ResponseEntity<?> editBudget(
            @PathVariable Integer budgetId,
            @RequestBody @Valid Budget budget,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            // Validate JWT
            UserDto reqUser = userService.getuserProfile(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token");
            }

            // Validate and get target user with write permission
            UserDto targetUser;
            try {
                targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);
            } catch (RuntimeException e) {
                if (e.getMessage().contains("not found")) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body("Target user not found");
                } else if (e.getMessage().contains("permission")) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(e.getMessage());
                } else {
                    throw e;
                }
            }

            // Edit budget
            Budget updatedBudget = budgetService.editBudget(budgetId, budget, targetUser.getId());

            // Send notification
            budgetNotificationService.sendBudgetUpdatedNotification(updatedBudget);

            return ResponseEntity.ok(updatedBudget);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid budget data: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error editing budget: " + e.getMessage());
        }
    }

    @DeleteMapping("/{budgetId}")
    public ResponseEntity<?> deleteBudget(
            @PathVariable Integer budgetId,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            // Validate JWT
            UserDto reqUser = userService.getuserProfile(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token");
            }

            // Validate and get target user with write permission
            UserDto targetUser;
            try {
                targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);
            } catch (RuntimeException e) {
                if (e.getMessage().contains("not found")) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body("Target user not found");
                } else if (e.getMessage().contains("permission")) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(e.getMessage());
                } else {
                    throw e;
                }
            }

            // Get budget name before deletion
            Budget budget = budgetService.getBudgetById(budgetId, targetUser.getId());
            String budgetName = budget.getName();

            // Delete budget
            budgetService.deleteBudget(budgetId, targetUser.getId());

            // Send notification
            budgetNotificationService.sendBudgetDeletedNotification(budgetId, budgetName, targetUser.getId());

            return ResponseEntity.status(HttpStatus.NO_CONTENT)
                    .body("Budget is deleted successfully");

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid request: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting budget: " + e.getMessage());
        }
    }

    @DeleteMapping("")
    public ResponseEntity<?> deleteAllBudget(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            // Validate JWT
            UserDto reqUser = userService.getuserProfile(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token");
            }

            // Validate and get target user with write permission
            UserDto targetUser;
            try {
                targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);
            } catch (RuntimeException e) {
                if (e.getMessage().contains("not found")) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body("Target user not found");
                } else if (e.getMessage().contains("permission")) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(e.getMessage());
                } else {
                    throw e;
                }
            }

            // Delete all budgets
            budgetService.deleteAllBudget(targetUser.getId());
            return ResponseEntity.status(HttpStatus.NO_CONTENT)
                    .body("All budgets deleted successfully");

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid request: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting all budgets: " + e.getMessage());
        }
    }

    @GetMapping("/{budgetId}")
    public ResponseEntity<?> getBudgetById(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer budgetId,
            @RequestParam(required = false) Integer targetId) {
        try {
            // Validate JWT
            UserDto reqUser = userService.getuserProfile(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token");
            }

            // Validate and get target user with read permission
            UserDto targetUser;
            try {
                targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                if (e.getMessage().contains("not found")) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body("Target user not found");
                } else if (e.getMessage().contains("permission")) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(e.getMessage());
                } else {
                    throw e;
                }
            }

            // Get budget
            Budget budget = budgetService.getBudgetById(budgetId, targetUser.getId());
            return ResponseEntity.ok(budget);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid request: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching budget: " + e.getMessage());
        }
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
            @RequestParam(required = false) Integer targetId) {
        try {
            // Validate JWT
            UserDto reqUser = userService.getuserProfile(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token");
            }

            // Validate and get target user with read permission
            UserDto targetUser;
            try {
                targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                if (e.getMessage().contains("not found")) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body("Target user not found");
                } else if (e.getMessage().contains("permission")) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(e.getMessage());
                } else {
                    throw e;
                }
            }

            // Get all budgets for user
            List<Budget> budgets = budgetService.getAllBudgetForUser(targetUser.getId());
            return ResponseEntity.ok(budgets);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid request: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching budgets: " + e.getMessage());
        }
    }

    @GetMapping("/{budgetId}/expenses")
    public ResponseEntity<?> getExpensesWithinBudgetDates(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer budgetId,
            @RequestParam(required = false) Integer targetId) {
        try {
            // Validate JWT
            UserDto reqUser = userService.getuserProfile(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token");
            }

            // Validate and get target user with read permission
            UserDto targetUser;
            try {
                targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                if (e.getMessage().contains("not found")) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body("Target user not found");
                } else if (e.getMessage().contains("permission")) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(e.getMessage());
                } else {
                    throw e;
                }
            }

            // Get expenses within budget dates
            List<ExpenseDTO> expenses = budgetService.getExpensesForUserByBudgetId(targetUser.getId(), budgetId);
            return ResponseEntity.ok(expenses);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid request: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching expenses: " + e.getMessage());
        }
    }

    @GetMapping("/report/{budgetId}")
    public ResponseEntity<?> getBudgetReport(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer budgetId,
            @RequestParam(required = false) Integer targetId) {
        try {
            // Validate JWT
            UserDto reqUser = userService.getuserProfile(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token");
            }

            // Validate and get target user with read permission
            UserDto targetUser;
            try {
                targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                if (e.getMessage().contains("not found")) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body("Target user not found");
                } else if (e.getMessage().contains("permission")) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(e.getMessage());
                } else {
                    throw e;
                }
            }

            // Get budget report
            BudgetReport budgetReport = budgetService.calculateBudgetReport(targetUser.getId(), budgetId);
            return ResponseEntity.ok(budgetReport);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid request: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching budget report: " + e.getMessage());
        }
    }

    @GetMapping("/reports")
    public ResponseEntity<?> getAllBudgetReportsForUser(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            // Validate JWT
            UserDto reqUser = userService.getuserProfile(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token");
            }

            // Validate and get target user with read permission
            UserDto targetUser;
            try {
                targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                if (e.getMessage().contains("not found")) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body("Target user not found");
                } else if (e.getMessage().contains("permission")) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(e.getMessage());
                } else {
                    throw e;
                }
            }

            // Get all budget reports for user
            List<BudgetReport> budgetReports = budgetService.getAllBudgetReportsForUser(targetUser.getId());
            return ResponseEntity.ok(budgetReports);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid request: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching budget reports: " + e.getMessage());
        }
    }

    @GetMapping("/detailed-report/{budgetId}")
    public ResponseEntity<?> getDetailedBudgetReport(
            @PathVariable Integer budgetId,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            // Validate JWT
            UserDto reqUser = userService.getuserProfile(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token");
            }

            // Validate and get target user with read permission
            UserDto targetUser;
            try {
                targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                if (e.getMessage().contains("not found")) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body("Target user not found");
                } else if (e.getMessage().contains("permission")) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(e.getMessage());
                } else {
                    throw e;
                }
            }

            // Get detailed budget report
            DetailedBudgetReport detailedReport = budgetService.calculateDetailedBudgetReport(targetUser.getId(),
                    budgetId);
            return ResponseEntity.ok(detailedReport);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid request: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching detailed budget report: " + e.getMessage());
        }
    }

    @GetMapping("/filter-by-date")
    public ResponseEntity<?> getBudgetsByDate(
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            // Validate JWT
            UserDto reqUser = userService.getuserProfile(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token");
            }

            // Validate and get target user with read permission
            UserDto targetUser;
            try {
                targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                if (e.getMessage().contains("not found")) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body("Target user not found");
                } else if (e.getMessage().contains("permission")) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(e.getMessage());
                } else {
                    throw e;
                }
            }

            // Get budgets by date
            List<Budget> budgets = budgetService.getBudgetsByDate(date, targetUser.getId());
            return ResponseEntity.ok(budgets);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid request: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching budgets: " + e.getMessage());
        }
    }

    @GetMapping("/expenses")
    public ResponseEntity<?> getBudgetsForExpense(
            @RequestParam Integer expenseId,
            @RequestParam String date,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            // Validate JWT
            UserDto reqUser = userService.getuserProfile(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token");
            }

            // Validate and get target user with read permission
            UserDto targetUser;
            try {
                targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                if (e.getMessage().contains("not found")) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body("Target user not found");
                } else if (e.getMessage().contains("permission")) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(e.getMessage());
                } else {
                    throw e;
                }
            }

            LocalDate expenseDate = LocalDate.parse(date);
            List<Budget> budgets = budgetService.getBudgetsByExpenseId(expenseId, targetUser.getId(), expenseDate);
            return ResponseEntity.ok(budgets);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid request: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching budgets: " + e.getMessage());
        }
    }

}
