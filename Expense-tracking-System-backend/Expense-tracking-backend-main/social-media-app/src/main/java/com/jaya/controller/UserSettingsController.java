package com.jaya.controller;

import com.jaya.dto.User;
import com.jaya.dto.UserSettingsDTO;
import com.jaya.request.UpdateUserSettingsRequest;
import com.jaya.service.UserService;
import com.jaya.service.UserSettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * UserSettingsController - REST API endpoints for user settings management
 * 
 * Design Patterns Applied:
 * 1. RESTful API Design - Standard HTTP methods (GET, PUT, POST, DELETE)
 * 2. Controller Pattern - Handles HTTP requests and responses
 * 3. Dependency Injection - Loose coupling via constructor injection
 * 4. Response Entity Pattern - Standardized API responses
 * 
 * Best Practices:
 * - Proper HTTP status codes
 * - JWT authentication via header
 * - Input validation
 * - Consistent error handling
 * - API documentation with Swagger/OpenAPI
 * - Logging for monitoring
 * 
 * Endpoints:
 * GET /api/settings - Get current user settings
 * PUT /api/settings - Update user settings (partial update)
 * POST /api/settings/reset - Reset settings to defaults
 * DELETE /api/settings - Delete user settings
 */
@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "User Settings", description = "User settings management API")
public class UserSettingsController {

    private final UserSettingsService settingsService;
    private final UserService userService;

    /**
     * Get current user settings
     * Returns default settings if none exist
     * 
     * @param jwt JWT token from header
     * @return UserSettingsDTO
     */
    @GetMapping
    @Operation(summary = "Get user settings", description = "Retrieve current user settings. Creates default settings if none exist.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Settings retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<UserSettingsDTO> getUserSettings(
            @Parameter(description = "JWT token", required = true) @RequestHeader("Authorization") String jwt) {

        log.debug("GET /api/settings - Fetching user settings");

        // Extract user from JWT
        User user = userService.findUserByJwt(jwt);

        // Get or create settings
        UserSettingsDTO settings = settingsService.getUserSettings(user.getId());

        log.info("Successfully retrieved settings for user ID: {}", user.getId());
        return ResponseEntity.ok(settings);
    }

    /**
     * Update user settings
     * Supports partial updates (only provided fields are updated)
     * 
     * @param jwt     JWT token from header
     * @param request Update request with new values
     * @return Updated UserSettingsDTO
     */
    @PutMapping
    @Operation(summary = "Update user settings", description = "Update user settings. Supports partial updates - only provided fields will be updated.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Settings updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request body"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<UserSettingsDTO> updateUserSettings(
            @Parameter(description = "JWT token", required = true) @RequestHeader("Authorization") String jwt,
            @Parameter(description = "Settings update request", required = true) @Valid @RequestBody UpdateUserSettingsRequest request) {

        log.debug("PUT /api/settings - Updating user settings");

        // Extract user from JWT
        User user = userService.findUserByJwt(jwt);

        // Update settings
        UserSettingsDTO updatedSettings = settingsService.updateUserSettings(user.getId(), request);

        log.info("Successfully updated settings for user ID: {}", user.getId());
        return ResponseEntity.ok(updatedSettings);
    }

    /**
     * Reset settings to default values
     * Deletes existing settings and creates new default settings
     * 
     * @param jwt JWT token from header
     * @return Default UserSettingsDTO
     */
    @PostMapping("/reset")
    @Operation(summary = "Reset settings to defaults", description = "Reset all user settings to default values.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Settings reset successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<UserSettingsDTO> resetSettings(
            @Parameter(description = "JWT token", required = true) @RequestHeader("Authorization") String jwt) {

        log.debug("POST /api/settings/reset - Resetting user settings to defaults");

        // Extract user from JWT
        User user = userService.findUserByJwt(jwt);

        // Reset to defaults
        UserSettingsDTO defaultSettings = settingsService.resetToDefaults(user.getId());

        log.info("Successfully reset settings to defaults for user ID: {}", user.getId());
        return ResponseEntity.ok(defaultSettings);
    }

    /**
     * Delete user settings
     * Removes all settings for the current user
     * 
     * @param jwt JWT token from header
     * @return Success message
     */
    @DeleteMapping
    @Operation(summary = "Delete user settings", description = "Delete all user settings. Default settings will be created on next access.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Settings deleted successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<Map<String, Object>> deleteSettings(
            @Parameter(description = "JWT token", required = true) @RequestHeader("Authorization") String jwt) {

        log.debug("DELETE /api/settings - Deleting user settings");

        // Extract user from JWT
        User user = userService.findUserByJwt(jwt);

        // Delete settings
        settingsService.deleteUserSettings(user.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Settings deleted successfully");
        response.put("userId", user.getId());

        log.info("Successfully deleted settings for user ID: {}", user.getId());
        return ResponseEntity.ok(response);
    }

    /**
     * Check if settings exist for current user
     * Utility endpoint for frontend
     * 
     * @param jwt JWT token from header
     * @return Boolean indicating if settings exist
     */
    @GetMapping("/exists")
    @Operation(summary = "Check if settings exist", description = "Check if user has settings configured.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Check completed successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token")
    })
    public ResponseEntity<Map<String, Boolean>> checkSettingsExist(
            @Parameter(description = "JWT token", required = true) @RequestHeader("Authorization") String jwt) {

        log.debug("GET /api/settings/exists - Checking if settings exist");

        // Extract user from JWT
        User user = userService.findUserByJwt(jwt);

        // Check existence
        boolean exists = settingsService.settingsExist(user.getId());

        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);

        return ResponseEntity.ok(response);
    }

    /**
     * Create default settings for current user
     * Explicitly creates default settings (normally done automatically)
     * 
     * @param jwt JWT token from header
     * @return Created UserSettingsDTO
     */
    @PostMapping("/default")
    @Operation(summary = "Create default settings", description = "Explicitly create default settings for the user.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Default settings created successfully"),
            @ApiResponse(responseCode = "400", description = "Settings already exist"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token")
    })
    public ResponseEntity<UserSettingsDTO> createDefaultSettings(
            @Parameter(description = "JWT token", required = true) @RequestHeader("Authorization") String jwt) {

        log.debug("POST /api/settings/default - Creating default settings");

        // Extract user from JWT
        User user = userService.findUserByJwt(jwt);

        // Create default settings
        UserSettingsDTO settings = settingsService.createDefaultSettings(user.getId());

        log.info("Successfully created default settings for user ID: {}", user.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(settings);
    }
}
