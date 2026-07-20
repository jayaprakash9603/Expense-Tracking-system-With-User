package com.jaya.task.user.service.controller;

import com.jaya.task.user.service.service.BillReportPreferenceService;
import com.jaya.task.user.service.service.BudgetReportPreferenceService;
import com.jaya.task.user.service.service.CategoryReportPreferenceService;
import com.jaya.task.user.service.service.DashboardPreferenceService;
import com.jaya.task.user.service.service.ExpenseReportPreferenceService;
import com.jaya.task.user.service.service.FriendshipReportPreferenceService;
import com.jaya.task.user.service.service.PaymentReportPreferenceService;
import com.jaya.task.user.service.service.UserProfileCacheService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

/**
 * Unified report-preference endpoint that consolidates the seven previously duplicated
 * per-domain controllers (bill, budget, category, expense, friendship, payment, dashboard)
 * behind a single path: {@code /api/user/report-preferences/{type}}.
 *
 * The legacy per-domain controllers remain available (deprecated) for backward compatibility.
 */
@RestController
@RequestMapping("/api/user/report-preferences")
public class ReportPreferenceController {

    private final BillReportPreferenceService billService;
    private final BudgetReportPreferenceService budgetService;
    private final CategoryReportPreferenceService categoryService;
    private final ExpenseReportPreferenceService expenseService;
    private final FriendshipReportPreferenceService friendshipService;
    private final PaymentReportPreferenceService paymentService;
    private final DashboardPreferenceService dashboardService;
    private final UserProfileCacheService userProfileCacheService;

    public ReportPreferenceController(
            BillReportPreferenceService billService,
            BudgetReportPreferenceService budgetService,
            CategoryReportPreferenceService categoryService,
            ExpenseReportPreferenceService expenseService,
            FriendshipReportPreferenceService friendshipService,
            PaymentReportPreferenceService paymentService,
            DashboardPreferenceService dashboardService,
            UserProfileCacheService userProfileCacheService) {
        this.billService = billService;
        this.budgetService = budgetService;
        this.categoryService = categoryService;
        this.expenseService = expenseService;
        this.friendshipService = friendshipService;
        this.paymentService = paymentService;
        this.dashboardService = dashboardService;
        this.userProfileCacheService = userProfileCacheService;
    }

    @GetMapping("/{type}")
    public ResponseEntity<Object> getPreferences(
            @PathVariable String type,
            @RequestHeader("Authorization") String authHeader) {

        Object preference = switch (normalize(type)) {
            case "bill" -> billService.getPreferences(requireUserId(authHeader));
            case "budget" -> budgetService.getPreferences(requireUserId(authHeader));
            case "category" -> categoryService.getUserCategoryReportPreference(authHeader);
            case "expense" -> expenseService.getUserExpenseReportPreference(authHeader);
            case "friendship" -> friendshipService.getUserFriendshipReportPreference(authHeader);
            case "payment" -> paymentService.getUserPaymentReportPreference(authHeader);
            case "dashboard" -> dashboardService.getUserDashboardPreference(authHeader);
            default -> throw unknownType(type);
        };

        if (preference == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(preference);
    }

    @PutMapping(value = "/{type}", consumes = MediaType.ALL_VALUE)
    public ResponseEntity<Object> savePreferences(
            @PathVariable String type,
            @RequestHeader("Authorization") String authHeader,
            @RequestBody String layoutConfig) {

        Object saved = switch (normalize(type)) {
            case "bill" -> billService.savePreferences(requireUserId(authHeader), layoutConfig);
            case "budget" -> budgetService.savePreferences(requireUserId(authHeader), layoutConfig);
            case "category" -> categoryService.saveCategoryReportPreference(authHeader, layoutConfig);
            case "expense" -> expenseService.saveExpenseReportPreference(authHeader, layoutConfig);
            case "friendship" -> friendshipService.saveFriendshipReportPreference(authHeader, layoutConfig);
            case "payment" -> paymentService.savePaymentReportPreference(authHeader, layoutConfig);
            case "dashboard" -> dashboardService.saveDashboardPreference(authHeader, layoutConfig);
            default -> throw unknownType(type);
        };
        return ResponseEntity.ok(saved);
    }

    /**
     * Backward-compatible alias for clients that still issue {@code POST} to save preferences.
     */
    @PostMapping(value = "/{type}", consumes = MediaType.ALL_VALUE)
    public ResponseEntity<Object> savePreferencesViaPost(
            @PathVariable String type,
            @RequestHeader("Authorization") String authHeader,
            @RequestBody String layoutConfig) {
        return savePreferences(type, authHeader, layoutConfig);
    }

    @DeleteMapping("/{type}")
    public ResponseEntity<Object> resetPreferences(
            @PathVariable String type,
            @RequestHeader("Authorization") String authHeader) {

        switch (normalize(type)) {
            case "bill" -> billService.resetPreferences(requireUserId(authHeader));
            case "budget" -> budgetService.resetPreferences(requireUserId(authHeader));
            case "category" -> categoryService.resetCategoryReportPreference(authHeader);
            case "expense" -> expenseService.resetExpenseReportPreference(authHeader);
            case "friendship" -> friendshipService.resetFriendshipReportPreference(authHeader);
            case "payment" -> paymentService.resetPaymentReportPreference(authHeader);
            case "dashboard" -> dashboardService.resetDashboardPreference(authHeader);
            default -> throw unknownType(type);
        }
        return ResponseEntity.noContent().build();
    }

    private Integer requireUserId(String authHeader) {
        Integer userId = userProfileCacheService.resolveUserId(authHeader);
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or missing authentication token");
        }
        return userId;
    }

    private String normalize(String type) {
        return type == null ? "" : type.trim().toLowerCase(Locale.ROOT);
    }

    private ResponseStatusException unknownType(String type) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown report preference type: " + type);
    }
}
