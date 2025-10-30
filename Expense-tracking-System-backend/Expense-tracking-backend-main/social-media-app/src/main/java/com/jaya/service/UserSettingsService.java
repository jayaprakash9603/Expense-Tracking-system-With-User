package com.jaya.service;

import com.jaya.dto.UserSettingsDTO;
import com.jaya.request.UpdateUserSettingsRequest;

/**
 * UserSettingsService - Service Interface for User Settings
 * 
 * Design Pattern: Service Layer Pattern + Interface Segregation Principle
 * Purpose: Defines contract for user settings business logic
 * Benefits:
 * - Loose coupling (implementation can be swapped)
 * - Easy to mock for testing
 * - Clear API contract
 * - Multiple implementations possible (e.g., cached, async)
 */
public interface UserSettingsService {

    /**
     * Get user settings by user ID
     * Creates default settings if none exist
     * 
     * @param userId The user ID
     * @return UserSettingsDTO
     */
    UserSettingsDTO getUserSettings(Integer userId);

    /**
     * Update user settings
     * Supports partial updates (only non-null fields are updated)
     * 
     * @param userId  The user ID
     * @param request The update request
     * @return Updated UserSettingsDTO
     */
    UserSettingsDTO updateUserSettings(Integer userId, UpdateUserSettingsRequest request);

    /**
     * Create default settings for a new user
     * Called during user registration
     * 
     * @param userId The user ID
     * @return Created UserSettingsDTO
     */
    UserSettingsDTO createDefaultSettings(Integer userId);

    /**
     * Delete user settings
     * Called when deleting a user account
     * 
     * @param userId The user ID
     */
    void deleteUserSettings(Integer userId);

    /**
     * Check if settings exist for a user
     * 
     * @param userId The user ID
     * @return true if settings exist, false otherwise
     */
    boolean settingsExist(Integer userId);

    /**
     * Reset settings to default values
     * 
     * @param userId The user ID
     * @return Reset UserSettingsDTO
     */
    UserSettingsDTO resetToDefaults(Integer userId);
}
