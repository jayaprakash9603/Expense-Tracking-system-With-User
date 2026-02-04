package com.jaya.task.user.service.controller;

import com.jaya.task.user.service.dto.PaymentReportPreferenceDTO;
import com.jaya.task.user.service.service.PaymentReportPreferenceService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST Controller for Payment Report layout preferences.
 * Follows the same pattern as CategoryReportPreferenceController for
 * consistency.
 */
@RestController
@RequestMapping("/api/user/payment-report-preferences")
@Validated
@RequiredArgsConstructor
@Slf4j
public class PaymentReportPreferenceController {

    private static final String ERROR_KEY = "error";
    private static final String MESSAGE_KEY = "message";
    private static final String PREFERENCE_KEY = "preference";

    private final PaymentReportPreferenceService paymentReportPreferenceService;

    /**
     * Get payment report preference for current user
     * Always returns a configuration (custom or default)
     */
    @GetMapping
    public ResponseEntity<Object> getPaymentReportPreference(
            @RequestHeader("Authorization") String jwt) {

        try {
            PaymentReportPreferenceDTO preference = paymentReportPreferenceService
                    .getUserPaymentReportPreference(jwt);

            return ResponseEntity.ok(preference);

        } catch (RuntimeException e) {
            log.error("Error fetching payment report preference", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(ERROR_KEY, "Failed to fetch payment report preference: " + e.getMessage()));
        }
    }

    /**
     * Save or update payment report preference for current user
     */
    @PostMapping
    public ResponseEntity<Object> savePaymentReportPreference(
            @RequestHeader("Authorization") String jwt,
            @RequestBody @NotBlank(message = "Layout configuration is required") String layoutConfig) {

        try {
            PaymentReportPreferenceDTO saved = paymentReportPreferenceService.savePaymentReportPreference(jwt,
                    layoutConfig);

            return ResponseEntity.ok(Map.of(
                    MESSAGE_KEY, "Payment report preference saved successfully",
                    PREFERENCE_KEY, saved));

        } catch (RuntimeException e) {
            log.error("Error saving payment report preference", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(ERROR_KEY, "Failed to save payment report preference: " + e.getMessage()));
        }
    }

    /**
     * Reset payment report preference to default
     */
    @DeleteMapping
    public ResponseEntity<Object> resetPaymentReportPreference(
            @RequestHeader("Authorization") String jwt) {

        try {
            paymentReportPreferenceService.resetPaymentReportPreference(jwt);

            return ResponseEntity.ok(Map.of(
                    MESSAGE_KEY, "Payment report preference reset to default successfully"));

        } catch (RuntimeException e) {
            log.error("Error resetting payment report preference", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(ERROR_KEY, "Failed to reset payment report preference: " + e.getMessage()));
        }
    }
}
