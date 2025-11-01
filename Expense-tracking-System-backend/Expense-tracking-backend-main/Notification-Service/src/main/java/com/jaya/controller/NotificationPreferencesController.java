package com.jaya.controller;

import com.jaya.dto.NotificationPreferencesResponseDTO;
import com.jaya.dto.UpdateNotificationPreferencesRequest;
import com.jaya.service.NotificationPreferencesService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * NotificationPreferencesController
 * REST controller for managing user notification preferences
 * Provides endpoints for CRUD operations on notification settings
 */
@RestController
@RequestMapping("/api/notification-preferences")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class NotificationPreferencesController {

    private final NotificationPreferencesService service;

    /**
     * Get notification preferences for the current user
     * Creates default preferences if none exist
     * 
     * @param userId User ID from JWT token or request header
     * @return Notification preferences for the user
     */
    @GetMapping
    public ResponseEntity<NotificationPreferencesResponseDTO> getPreferences(
            @RequestHeader("X-User-Id") Integer userId) {
        log.info("GET /api/notification-preferences - User: {}", userId);
        
        NotificationPreferencesResponseDTO preferences = service.getPreferences(userId);
        return ResponseEntity.ok(preferences);
    }

    /**
     * Update notification preferences for the current user
     * Supports partial updates - only provided fields are updated
     * 
     * @param userId User ID from JWT token or request header
     * @param request Update request with new preference values
     * @return Updated notification preferences
     */
    @PutMapping
    public ResponseEntity<NotificationPreferencesResponseDTO> updatePreferences(
            @RequestHeader("X-User-Id") Integer userId,
            @RequestBody UpdateNotificationPreferencesRequest request) {
        log.info("PUT /api/notification-preferences - User: {}", userId);
        
        NotificationPreferencesResponseDTO updated = service.updatePreferences(userId, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Reset notification preferences to default values
     * 
     * @param userId User ID from JWT token or request header
     * @return Default notification preferences
     */
    @PostMapping("/reset")
    public ResponseEntity<NotificationPreferencesResponseDTO> resetToDefaults(
            @RequestHeader("X-User-Id") Integer userId) {
        log.info("POST /api/notification-preferences/reset - User: {}", userId);
        
        NotificationPreferencesResponseDTO defaults = service.resetToDefaults(userId);
        return ResponseEntity.ok(defaults);
    }

    /**
     * Delete notification preferences for the current user
     * 
     * @param userId User ID from JWT token or request header
     * @return No content
     */
    @DeleteMapping
    public ResponseEntity<Void> deletePreferences(
            @RequestHeader("X-User-Id") Integer userId) {
        log.info("DELETE /api/notification-preferences - User: {}", userId);
        
        service.deletePreferences(userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Check if notification preferences exist for the current user
     * 
     * @param userId User ID from JWT token or request header
     * @return True if preferences exist, false otherwise
     */
    @GetMapping("/exists")
    public ResponseEntity<Boolean> preferencesExist(
            @RequestHeader("X-User-Id") Integer userId) {
        log.debug("GET /api/notification-preferences/exists - User: {}", userId);
        
        boolean exists = service.preferencesExist(userId);
        return ResponseEntity.ok(exists);
    }

    /**
     * Create default notification preferences for the current user
     * Returns existing preferences if already created
     * 
     * @param userId User ID from JWT token or request header
     * @return Created default preferences
     */
    @PostMapping("/default")
    public ResponseEntity<NotificationPreferencesResponseDTO> createDefaults(
            @RequestHeader("X-User-Id") Integer userId) {
        log.info("POST /api/notification-preferences/default - User: {}", userId);
        
        NotificationPreferencesResponseDTO defaults = service.createDefaultPreferences(userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(defaults);
    }
}
