package com.jaya.service;

import com.jaya.dto.NotificationPreferencesResponseDTO;
import com.jaya.dto.UpdateNotificationPreferencesRequest;

/**
 * NotificationPreferencesService
 * Service interface for managing user notification preferences
 * Provides business logic for CRUD operations on notification settings
 */
public interface NotificationPreferencesService {
    
    /**
     * Get notification preferences for a user
     * Creates default preferences if none exist
     * @param userId the user ID
     * @return the notification preferences
     */
    NotificationPreferencesResponseDTO getPreferences(Integer userId);
    
    /**
     * Update notification preferences for a user
     * Supports partial updates - only provided fields are updated
     * @param userId the user ID
     * @param request the update request
     * @return the updated notification preferences
     */
    NotificationPreferencesResponseDTO updatePreferences(Integer userId, UpdateNotificationPreferencesRequest request);
    
    /**
     * Reset notification preferences to defaults for a user
     * @param userId the user ID
     * @return the default notification preferences
     */
    NotificationPreferencesResponseDTO resetToDefaults(Integer userId);
    
    /**
     * Delete notification preferences for a user
     * @param userId the user ID
     */
    void deletePreferences(Integer userId);
    
    /**
     * Check if notification preferences exist for a user
     * @param userId the user ID
     * @return true if preferences exist, false otherwise
     */
    boolean preferencesExist(Integer userId);
    
    /**
     * Create default notification preferences for a user
     * @param userId the user ID
     * @return the created default preferences
     */
    NotificationPreferencesResponseDTO createDefaultPreferences(Integer userId);
}
