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
























@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "User Settings", description = "User settings management API")
public class UserSettingsController {

    private final UserSettingsService settingsService;
    private final UserService userService;

    






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

        
        User user = userService.findUserByJwt(jwt);

        
        UserSettingsDTO settings = settingsService.getUserSettings(user.getId());

        log.info("Successfully retrieved settings for user ID: {}", user.getId());
        return ResponseEntity.ok(settings);
    }

    







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

        
        User user = userService.findUserByJwt(jwt);

        
        UserSettingsDTO updatedSettings = settingsService.updateUserSettings(user.getId(), request);

        log.info("Successfully updated settings for user ID: {}", user.getId());
        return ResponseEntity.ok(updatedSettings);
    }

    






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

        
        User user = userService.findUserByJwt(jwt);

        
        UserSettingsDTO defaultSettings = settingsService.resetToDefaults(user.getId());

        log.info("Successfully reset settings to defaults for user ID: {}", user.getId());
        return ResponseEntity.ok(defaultSettings);
    }

    






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

        
        User user = userService.findUserByJwt(jwt);

        
        settingsService.deleteUserSettings(user.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Settings deleted successfully");
        response.put("userId", user.getId());

        log.info("Successfully deleted settings for user ID: {}", user.getId());
        return ResponseEntity.ok(response);
    }

    






    @GetMapping("/exists")
    @Operation(summary = "Check if settings exist", description = "Check if user has settings configured.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Check completed successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token")
    })
    public ResponseEntity<Map<String, Boolean>> checkSettingsExist(
            @Parameter(description = "JWT token", required = true) @RequestHeader("Authorization") String jwt) {

        log.debug("GET /api/settings/exists - Checking if settings exist");

        
        User user = userService.findUserByJwt(jwt);

        
        boolean exists = settingsService.settingsExist(user.getId());

        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);

        return ResponseEntity.ok(response);
    }

    






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

        
        User user = userService.findUserByJwt(jwt);

        
        UserSettingsDTO settings = settingsService.createDefaultSettings(user.getId());

        log.info("Successfully created default settings for user ID: {}", user.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(settings);
    }
}
