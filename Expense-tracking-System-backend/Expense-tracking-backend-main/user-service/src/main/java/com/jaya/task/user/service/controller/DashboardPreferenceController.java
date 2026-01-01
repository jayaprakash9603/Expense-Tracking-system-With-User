package com.jaya.task.user.service.controller;

import com.jaya.task.user.service.dto.DashboardPreferenceDTO;
import com.jaya.task.user.service.service.DashboardPreferenceService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/user/dashboard-preferences")
@Validated
@RequiredArgsConstructor
@Slf4j
public class DashboardPreferenceController {

    private static final String ERROR_KEY = "error";
    private static final String MESSAGE_KEY = "message";
    private static final String PREFERENCE_KEY = "preference";

    private final DashboardPreferenceService dashboardPreferenceService;

    /**
     * Get dashboard preference for current user
     * Always returns a configuration (custom or default)
     */
    @GetMapping
    public ResponseEntity<Object> getDashboardPreference(
            @RequestHeader("Authorization") String jwt) {

        try {
            DashboardPreferenceDTO preference = dashboardPreferenceService.getUserDashboardPreference(jwt);

            return ResponseEntity.ok(preference);

        } catch (RuntimeException e) {
            log.error("Error fetching dashboard preference", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(ERROR_KEY, "Failed to fetch dashboard preference: " + e.getMessage()));
        }
    }

    /**
     * Save or update dashboard preference for current user
     */
    @PostMapping
    public ResponseEntity<Object> saveDashboardPreference(
            @RequestHeader("Authorization") String jwt,
            @RequestBody @NotBlank(message = "Layout configuration is required") String layoutConfig) {

        try {
            DashboardPreferenceDTO saved = dashboardPreferenceService.saveDashboardPreference(jwt, layoutConfig);

            return ResponseEntity.ok(Map.of(
                    MESSAGE_KEY, "Dashboard preference saved successfully",
                    PREFERENCE_KEY, saved));

        } catch (RuntimeException e) {
            log.error("Error saving dashboard preference", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(ERROR_KEY, "Failed to save dashboard preference: " + e.getMessage()));
        }
    }

    /**
     * Reset dashboard preference to default
     */
    @DeleteMapping
    public ResponseEntity<Object> resetDashboardPreference(
            @RequestHeader("Authorization") String jwt) {

        try {
            dashboardPreferenceService.resetDashboardPreference(jwt);

            return ResponseEntity.ok(Map.of(
                    MESSAGE_KEY, "Dashboard preference reset to default successfully"));

        } catch (RuntimeException e) {
            log.error("Error resetting dashboard preference", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(ERROR_KEY, "Failed to reset dashboard preference: " + e.getMessage()));
        }
    }
}
