package com.jaya.task.user.service.controller;

import com.jaya.task.user.service.dto.BudgetReportPreferenceDTO;
import com.jaya.task.user.service.modal.User;
import com.jaya.task.user.service.repository.UserRepository;
import com.jaya.task.user.service.service.BudgetReportPreferenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for budget report layout preferences.
 * Provides endpoints to get, save, and reset budget report customization.
 */
@RestController
@RequestMapping("/api/user/budget-report-preferences")
public class BudgetReportPreferenceController {

    private final BudgetReportPreferenceService preferenceService;
    private final UserRepository userRepository;

    public BudgetReportPreferenceController(
            BudgetReportPreferenceService preferenceService,
            UserRepository userRepository) {
        this.preferenceService = preferenceService;
        this.userRepository = userRepository;
    }

    /**
     * Get budget report preferences for the authenticated user.
     *
     * @param authHeader JWT token in Authorization header
     * @return Preferences DTO or 204 No Content if not found
     */
    @GetMapping
    public ResponseEntity<BudgetReportPreferenceDTO> getPreferences(
            @RequestHeader("Authorization") String authHeader) {

        Integer userId = extractUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        BudgetReportPreferenceDTO preferences = preferenceService.getPreferences(userId);
        if (preferences == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(preferences);
    }

    /**
     * Save budget report preferences for the authenticated user.
     *
     * @param authHeader   JWT token in Authorization header
     * @param layoutConfig JSON string containing layout configuration
     * @return Saved preferences DTO
     */
    @PostMapping
    public ResponseEntity<BudgetReportPreferenceDTO> savePreferences(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody String layoutConfig) {

        Integer userId = extractUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        BudgetReportPreferenceDTO saved = preferenceService.savePreferences(userId, layoutConfig);
        return ResponseEntity.ok(saved);
    }

    /**
     * Reset budget report preferences for the authenticated user.
     * Deletes saved preferences, causing frontend to use defaults.
     *
     * @param authHeader JWT token in Authorization header
     * @return 204 No Content on success
     */
    @DeleteMapping
    public ResponseEntity<Void> resetPreferences(
            @RequestHeader("Authorization") String authHeader) {

        Integer userId = extractUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        preferenceService.resetPreferences(userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Extract user ID from JWT token in Authorization header.
     * Uses the same pattern as other controllers in the application.
     *
     * @param authHeader Authorization header value
     * @return User ID or null if extraction fails
     */
    private Integer extractUserId(String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return null;
            }

            String email = com.jaya.task.user.service.config.JwtProvider.getEmailFromJwt(authHeader);

            if (email == null) {
                return null;
            }

            User user = userRepository.findByEmail(email);
            return user != null ? user.getId() : null;

        } catch (Exception e) {
            return null;
        }
    }
}
