package com.jaya.service.impl;

import com.jaya.dto.UserSettingsDTO;
import com.jaya.exceptions.ResourceNotFoundException;
import com.jaya.mapper.UserSettingsMapper;
import com.jaya.models.UserSettings;
import com.jaya.repository.UserSettingsRepository;
import com.jaya.request.UpdateUserSettingsRequest;
import com.jaya.service.UserSettingsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * UserSettingsServiceImpl - Implementation of UserSettingsService
 * 
 * Design Patterns Applied:
 * 1. Service Layer Pattern - Encapsulates business logic
 * 2. Dependency Injection - Loose coupling via constructor injection
 * 3. Transaction Management - Ensures data consistency
 * 4. Cache Pattern - Reduces database load
 * 5. Exception Handling - Consistent error handling
 * 
 * SOLID Principles:
 * - Single Responsibility: Only handles user settings business logic
 * - Open/Closed: Open for extension via interface
 * - Liskov Substitution: Can be replaced with any UserSettingsService
 * implementation
 * - Interface Segregation: Implements focused interface
 * - Dependency Inversion: Depends on abstractions (interfaces)
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserSettingsServiceImpl implements UserSettingsService {

    private final UserSettingsRepository settingsRepository;
    private final UserSettingsMapper settingsMapper;

    /**
     * Get user settings by user ID
     * Returns cached result if available
     * Creates default settings if none exist
     * 
     * Design Pattern: Lazy Initialization
     * 
     * @param userId The user ID
     * @return UserSettingsDTO
     */
    @Override
    @Cacheable(value = "userSettings", key = "#userId")
    public UserSettingsDTO getUserSettings(Integer userId) {
        log.debug("Fetching settings for user ID: {}", userId);

        UserSettings settings = settingsRepository.findByUserId(userId)
                .orElseGet(() -> {
                    log.info("Settings not found for user ID: {}. Creating default settings.", userId);
                    return createAndSaveDefaultSettings(userId);
                });

        return settingsMapper.toDTO(settings);
    }

    /**
     * Update user settings
     * Supports partial updates via request DTO
     * Invalidates cache after update
     * 
     * Design Pattern: Partial Update Pattern
     * 
     * @param userId  The user ID
     * @param request The update request
     * @return Updated UserSettingsDTO
     */
    @Override
    @CacheEvict(value = "userSettings", key = "#userId")
    public UserSettingsDTO updateUserSettings(Integer userId, UpdateUserSettingsRequest request) {
        log.debug("Updating settings for user ID: {}", userId);

        // Validate request
        if (request == null) {
            throw new IllegalArgumentException("Update request cannot be null");
        }

        // Find existing settings or create new
        UserSettings settings = settingsRepository.findByUserId(userId)
                .orElseGet(() -> createAndSaveDefaultSettings(userId));

        // Apply updates
        settingsMapper.updateEntityFromRequest(settings, request);

        // Save and return
        UserSettings updatedSettings = settingsRepository.save(settings);
        log.info("Successfully updated settings for user ID: {}", userId);

        return settingsMapper.toDTO(updatedSettings);
    }

    /**
     * Create default settings for a new user
     * Called during user registration
     * 
     * @param userId The user ID
     * @return Created UserSettingsDTO
     */
    @Override
    @CacheEvict(value = "userSettings", key = "#userId")
    public UserSettingsDTO createDefaultSettings(Integer userId) {
        log.debug("Creating default settings for user ID: {}", userId);

        // Check if settings already exist
        if (settingsRepository.existsByUserId(userId)) {
            log.warn("Settings already exist for user ID: {}. Returning existing settings.", userId);
            return getUserSettings(userId);
        }

        UserSettings settings = createAndSaveDefaultSettings(userId);
        return settingsMapper.toDTO(settings);
    }

    /**
     * Delete user settings
     * Called when deleting a user account
     * Invalidates cache
     * 
     * @param userId The user ID
     */
    @Override
    @CacheEvict(value = "userSettings", key = "#userId")
    public void deleteUserSettings(Integer userId) {
        log.debug("Deleting settings for user ID: {}", userId);

        if (!settingsRepository.existsByUserId(userId)) {
            log.warn("No settings found for user ID: {}. Nothing to delete.", userId);
            return;
        }

        settingsRepository.deleteByUserId(userId);
        log.info("Successfully deleted settings for user ID: {}", userId);
    }

    /**
     * Check if settings exist for a user
     * 
     * @param userId The user ID
     * @return true if settings exist, false otherwise
     */
    @Override
    @Transactional(readOnly = true)
    public boolean settingsExist(Integer userId) {
        return settingsRepository.existsByUserId(userId);
    }

    /**
     * Reset settings to default values
     * Useful for troubleshooting or user preference
     * 
     * @param userId The user ID
     * @return Reset UserSettingsDTO
     */
    @Override
    @CacheEvict(value = "userSettings", key = "#userId")
    public UserSettingsDTO resetToDefaults(Integer userId) {
        log.debug("Resetting settings to defaults for user ID: {}", userId);

        // Delete existing settings
        settingsRepository.deleteByUserId(userId);

        // Create new default settings
        UserSettings settings = createAndSaveDefaultSettings(userId);
        log.info("Successfully reset settings to defaults for user ID: {}", userId);

        return settingsMapper.toDTO(settings);
    }

    /**
     * Helper method to create and save default settings
     * 
     * @param userId The user ID
     * @return Saved UserSettings entity
     */
    private UserSettings createAndSaveDefaultSettings(Integer userId) {
        UserSettings defaultSettings = UserSettings.createDefaultSettings(userId);
        return settingsRepository.save(defaultSettings);
    }
}
