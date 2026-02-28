package com.jaya.controller;

import com.jaya.common.dto.UserDTO;
import com.jaya.dto.UserSettingsDTO;
import com.jaya.request.UpdateUserSettingsRequest;
import com.jaya.common.service.client.IUserServiceClient;
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
@Tag(name = "UserDTO Settings", description = "UserDTO settings management API")
public class UserSettingsController {

    private final UserSettingsService settingsService;
    private final IUserServiceClient IUserServiceClient;

    






    @GetMapping
    @Operation(summary = "Get UserDTO settings", description = "Retrieve current UserDTO settings. Creates default settings if none exist.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Settings retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
            @ApiResponse(responseCode = "404", description = "UserDTO not found")
    })
    public ResponseEntity<UserSettingsDTO> getUserSettings(
            @Parameter(description = "JWT token", required = true) @RequestHeader("Authorization") String jwt) {

        log.debug("GET /api/settings - Fetching UserDTO settings");

        
        UserDTO UserDTO = IUserServiceClient.getUserProfile(jwt);

        
        UserSettingsDTO settings = settingsService.getUserSettings(UserDTO.getId());

        log.info("Successfully retrieved settings for UserDTO ID: {}", UserDTO.getId());
        return ResponseEntity.ok(settings);
    }

    







    @PutMapping
    @Operation(summary = "Update UserDTO settings", description = "Update UserDTO settings. Supports partial updates - only provided fields will be updated.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Settings updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request body"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
            @ApiResponse(responseCode = "404", description = "UserDTO not found")
    })
    public ResponseEntity<UserSettingsDTO> updateUserSettings(
            @Parameter(description = "JWT token", required = true) @RequestHeader("Authorization") String jwt,
            @Parameter(description = "Settings update request", required = true) @Valid @RequestBody UpdateUserSettingsRequest request) {

        log.debug("PUT /api/settings - Updating UserDTO settings");

        
        UserDTO UserDTO = IUserServiceClient.getUserProfile(jwt);

        
        UserSettingsDTO updatedSettings = settingsService.updateUserSettings(UserDTO.getId(), request);

        log.info("Successfully updated settings for UserDTO ID: {}", UserDTO.getId());
        return ResponseEntity.ok(updatedSettings);
    }

    






    @PostMapping("/reset")
    @Operation(summary = "Reset settings to defaults", description = "Reset all UserDTO settings to default values.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Settings reset successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
            @ApiResponse(responseCode = "404", description = "UserDTO not found")
    })
    public ResponseEntity<UserSettingsDTO> resetSettings(
            @Parameter(description = "JWT token", required = true) @RequestHeader("Authorization") String jwt) {

        log.debug("POST /api/settings/reset - Resetting UserDTO settings to defaults");

        
        UserDTO UserDTO = IUserServiceClient.getUserProfile(jwt);

        
        UserSettingsDTO defaultSettings = settingsService.resetToDefaults(UserDTO.getId());

        log.info("Successfully reset settings to defaults for UserDTO ID: {}", UserDTO.getId());
        return ResponseEntity.ok(defaultSettings);
    }

    






    @DeleteMapping
    @Operation(summary = "Delete UserDTO settings", description = "Delete all UserDTO settings. Default settings will be created on next access.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Settings deleted successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
            @ApiResponse(responseCode = "404", description = "UserDTO not found")
    })
    public ResponseEntity<Map<String, Object>> deleteSettings(
            @Parameter(description = "JWT token", required = true) @RequestHeader("Authorization") String jwt) {

        log.debug("DELETE /api/settings - Deleting UserDTO settings");

        
        UserDTO UserDTO = IUserServiceClient.getUserProfile(jwt);

        
        settingsService.deleteUserSettings(UserDTO.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Settings deleted successfully");
        response.put("userId", UserDTO.getId());

        log.info("Successfully deleted settings for UserDTO ID: {}", UserDTO.getId());
        return ResponseEntity.ok(response);
    }

    






    @GetMapping("/exists")
    @Operation(summary = "Check if settings exist", description = "Check if UserDTO has settings configured.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Check completed successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token")
    })
    public ResponseEntity<Map<String, Boolean>> checkSettingsExist(
            @Parameter(description = "JWT token", required = true) @RequestHeader("Authorization") String jwt) {

        log.debug("GET /api/settings/exists - Checking if settings exist");

        
        UserDTO UserDTO = IUserServiceClient.getUserProfile(jwt);

        
        boolean exists = settingsService.settingsExist(UserDTO.getId());

        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);

        return ResponseEntity.ok(response);
    }

    






    @PostMapping("/default")
    @Operation(summary = "Create default settings", description = "Explicitly create default settings for the UserDTO.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Default settings created successfully"),
            @ApiResponse(responseCode = "400", description = "Settings already exist"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token")
    })
    public ResponseEntity<UserSettingsDTO> createDefaultSettings(
            @Parameter(description = "JWT token", required = true) @RequestHeader("Authorization") String jwt) {

        log.debug("POST /api/settings/default - Creating default settings");

        
        UserDTO UserDTO = IUserServiceClient.getUserProfile(jwt);

        
        UserSettingsDTO settings = settingsService.createDefaultSettings(UserDTO.getId());

        log.info("Successfully created default settings for UserDTO ID: {}", UserDTO.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(settings);
    }
}
