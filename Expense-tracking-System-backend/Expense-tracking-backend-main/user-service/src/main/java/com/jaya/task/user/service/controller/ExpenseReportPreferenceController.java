package com.jaya.task.user.service.controller;

import com.jaya.task.user.service.dto.ExpenseReportPreferenceDTO;
import com.jaya.task.user.service.service.ExpenseReportPreferenceService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user/expense-report-preferences")
@Validated
@RequiredArgsConstructor
@Slf4j
public class ExpenseReportPreferenceController {

    private static final String ERROR_KEY = "error";
    private static final String MESSAGE_KEY = "message";
    private static final String PREFERENCE_KEY = "preference";

    private final ExpenseReportPreferenceService expenseReportPreferenceService;

    



    @GetMapping
    public ResponseEntity<Object> getExpenseReportPreference(
            @RequestHeader("Authorization") String jwt) {

        try {
            ExpenseReportPreferenceDTO preference = expenseReportPreferenceService.getUserExpenseReportPreference(jwt);

            return ResponseEntity.ok(preference);

        } catch (RuntimeException e) {
            log.error("Error fetching expense report preference", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(ERROR_KEY, "Failed to fetch expense report preference: " + e.getMessage()));
        }
    }

    


    @PostMapping
    public ResponseEntity<Object> saveExpenseReportPreference(
            @RequestHeader("Authorization") String jwt,
            @RequestBody @NotBlank(message = "Layout configuration is required") String layoutConfig) {

        try {
            ExpenseReportPreferenceDTO saved = expenseReportPreferenceService.saveExpenseReportPreference(jwt,
                    layoutConfig);

            return ResponseEntity.ok(Map.of(
                    MESSAGE_KEY, "Expense report preference saved successfully",
                    PREFERENCE_KEY, saved));

        } catch (RuntimeException e) {
            log.error("Error saving expense report preference", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(ERROR_KEY, "Failed to save expense report preference: " + e.getMessage()));
        }
    }

    


    @DeleteMapping
    public ResponseEntity<Object> resetExpenseReportPreference(
            @RequestHeader("Authorization") String jwt) {

        try {
            expenseReportPreferenceService.resetExpenseReportPreference(jwt);

            return ResponseEntity.ok(Map.of(
                    MESSAGE_KEY, "Expense report preference reset to default successfully"));

        } catch (RuntimeException e) {
            log.error("Error resetting expense report preference", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(ERROR_KEY, "Failed to reset expense report preference: " + e.getMessage()));
        }
    }
}
