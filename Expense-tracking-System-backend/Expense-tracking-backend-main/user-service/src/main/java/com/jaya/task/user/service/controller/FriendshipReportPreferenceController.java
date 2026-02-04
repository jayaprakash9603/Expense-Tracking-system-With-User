package com.jaya.task.user.service.controller;

import com.jaya.task.user.service.dto.FriendshipReportPreferenceDTO;
import com.jaya.task.user.service.service.FriendshipReportPreferenceService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST Controller for Friendship Report Preferences
 * Handles CRUD operations for user-specific report layout configurations
 */
@RestController
@RequestMapping("/api/user/friendship-report-preferences")
@Validated
@RequiredArgsConstructor
@Slf4j
public class FriendshipReportPreferenceController {

    private static final String ERROR_KEY = "error";
    private static final String MESSAGE_KEY = "message";
    private static final String PREFERENCE_KEY = "preference";

    private final FriendshipReportPreferenceService friendshipReportPreferenceService;

    /**
     * Get friendship report preference for current user
     * Always returns a configuration (custom or default)
     */
    @GetMapping
    public ResponseEntity<Object> getFriendshipReportPreference(
            @RequestHeader("Authorization") String jwt) {

        try {
            FriendshipReportPreferenceDTO preference = friendshipReportPreferenceService
                    .getUserFriendshipReportPreference(jwt);

            return ResponseEntity.ok(preference);

        } catch (RuntimeException e) {
            log.error("Error fetching friendship report preference", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(ERROR_KEY, "Failed to fetch friendship report preference: " + e.getMessage()));
        }
    }

    /**
     * Save or update friendship report preference for current user
     */
    @PostMapping
    public ResponseEntity<Object> saveFriendshipReportPreference(
            @RequestHeader("Authorization") String jwt,
            @RequestBody @NotBlank(message = "Layout configuration is required") String layoutConfig) {

        try {
            FriendshipReportPreferenceDTO saved = friendshipReportPreferenceService.saveFriendshipReportPreference(jwt,
                    layoutConfig);

            return ResponseEntity.ok(Map.of(
                    MESSAGE_KEY, "Friendship report preference saved successfully",
                    PREFERENCE_KEY, saved));

        } catch (RuntimeException e) {
            log.error("Error saving friendship report preference", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(ERROR_KEY, "Failed to save friendship report preference: " + e.getMessage()));
        }
    }

    /**
     * Reset friendship report preference to default
     */
    @DeleteMapping
    public ResponseEntity<Object> resetFriendshipReportPreference(
            @RequestHeader("Authorization") String jwt) {

        try {
            friendshipReportPreferenceService.resetFriendshipReportPreference(jwt);

            return ResponseEntity.ok(Map.of(
                    MESSAGE_KEY, "Friendship report preference reset to default successfully"));

        } catch (RuntimeException e) {
            log.error("Error resetting friendship report preference", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(ERROR_KEY, "Failed to reset friendship report preference: " + e.getMessage()));
        }
    }
}
