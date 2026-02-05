package com.jaya.controller;

import com.jaya.dto.NotificationPreferencesResponseDTO;
import com.jaya.dto.UpdateNotificationPreferencesRequest;
import com.jaya.modal.UserDto;
import com.jaya.service.NotificationPreferencesService;
import com.jaya.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/notification-preferences")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class NotificationPreferencesController {

    private final NotificationPreferencesService service;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<NotificationPreferencesResponseDTO> getPreferences(
            @RequestHeader("Authorization") String jwt) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            log.info("GET /api/notification-preferences - User: {}", user.getId());

            NotificationPreferencesResponseDTO preferences = service.getPreferences(user.getId());
            return ResponseEntity.ok(preferences);
        } catch (Exception e) {
            log.error("Error fetching notification preferences: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping
    public ResponseEntity<NotificationPreferencesResponseDTO> updatePreferences(
            @RequestHeader("Authorization") String jwt,
            @RequestBody UpdateNotificationPreferencesRequest request) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            log.info("PUT /api/notification-preferences - User: {}", user.getId());

            NotificationPreferencesResponseDTO updated = service.updatePreferences(user.getId(), request);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("Error updating notification preferences: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/reset")
    public ResponseEntity<NotificationPreferencesResponseDTO> resetToDefaults(
            @RequestHeader("Authorization") String jwt) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            log.info("POST /api/notification-preferences/reset - User: {}", user.getId());

            NotificationPreferencesResponseDTO defaults = service.resetToDefaults(user.getId());
            return ResponseEntity.ok(defaults);
        } catch (Exception e) {
            log.error("Error resetting notification preferences: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping
    public ResponseEntity<Void> deletePreferences(
            @RequestHeader("Authorization") String jwt) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            log.info("DELETE /api/notification-preferences - User: {}", user.getId());

            service.deletePreferences(user.getId());
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting notification preferences: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/exists")
    public ResponseEntity<Boolean> preferencesExist(
            @RequestHeader("Authorization") String jwt) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            log.debug("GET /api/notification-preferences/exists - User: {}", user.getId());

            boolean exists = service.preferencesExist(user.getId());
            return ResponseEntity.ok(exists);
        } catch (Exception e) {
            log.error("Error checking notification preferences existence: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(false);
        }
    }

    @PostMapping("/default")
    public ResponseEntity<NotificationPreferencesResponseDTO> createDefaults(
            @RequestHeader("Authorization") String jwt) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            log.info("POST /api/notification-preferences/default - User: {}", user.getId());

            NotificationPreferencesResponseDTO defaults = service.createDefaultPreferences(user.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(defaults);
        } catch (Exception e) {
            log.error("Error creating default notification preferences: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
