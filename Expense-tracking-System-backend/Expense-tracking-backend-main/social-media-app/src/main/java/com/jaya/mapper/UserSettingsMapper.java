package com.jaya.mapper;

import com.jaya.dto.UserSettingsDTO;
import com.jaya.models.UserSettings;
import com.jaya.request.UpdateUserSettingsRequest;
import org.springframework.stereotype.Component;

/**
 * UserSettingsMapper - Maps between UserSettings entity and DTOs
 * 
 * Design Pattern: Mapper Pattern (Data Transfer Object Pattern)
 * Purpose: Converts between different representations of the same data
 * Benefits:
 * - Separation of concerns (entity vs API representation)
 * - Centralized mapping logic
 * - Easy to modify API response structure without changing entity
 * - Testable in isolation
 */
@Component
public class UserSettingsMapper {

    /**
     * Maps UserSettings entity to UserSettingsDTO
     * 
     * @param entity The UserSettings entity
     * @return UserSettingsDTO for API response
     */
    public UserSettingsDTO toDTO(UserSettings entity) {
        if (entity == null) {
            return null;
        }

        return UserSettingsDTO.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                // Appearance
                .themeMode(entity.getThemeMode())
                .fontSize(entity.getFontSize())
                .compactMode(entity.getCompactMode())
                .animations(entity.getAnimations())
                .highContrast(entity.getHighContrast())
                // Notifications
                .emailNotifications(entity.getEmailNotifications())
                .budgetAlerts(entity.getBudgetAlerts())
                .weeklyReports(entity.getWeeklyReports())
                .pushNotifications(entity.getPushNotifications())
                .friendRequestNotifications(entity.getFriendRequestNotifications())
                // Preferences
                .language(entity.getLanguage())
                .currency(entity.getCurrency())
                .dateFormat(entity.getDateFormat())
                .timeFormat(entity.getTimeFormat())
                // Privacy & Security
                .profileVisibility(entity.getProfileVisibility())
                .twoFactorEnabled(entity.getTwoFactorEnabled())
                .sessionTimeout(entity.getSessionTimeout())
                .maskSensitiveData(entity.getMaskSensitiveData())
                // Data & Storage
                .autoBackup(entity.getAutoBackup())
                .backupFrequency(entity.getBackupFrequency())
                .cloudSync(entity.getCloudSync())
                // Smart Features
                .autoCategorize(entity.getAutoCategorize())
                .smartBudgeting(entity.getSmartBudgeting())
                .scheduledReports(entity.getScheduledReports())
                .expenseReminders(entity.getExpenseReminders())
                .predictiveAnalytics(entity.getPredictiveAnalytics())
                // Accessibility
                .screenReader(entity.getScreenReader())
                .keyboardShortcuts(entity.getKeyboardShortcuts())
                .showShortcutIndicators(entity.getShowShortcutIndicators())
                .reduceMotion(entity.getReduceMotion())
                .focusIndicators(entity.getFocusIndicators())
                // Timestamps
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    /**
     * Maps UserSettingsDTO to UserSettings entity
     * Used when creating new settings
     * 
     * @param dto The UserSettingsDTO
     * @return UserSettings entity
     */
    public UserSettings toEntity(UserSettingsDTO dto) {
        if (dto == null) {
            return null;
        }

        return UserSettings.builder()
                .id(dto.getId())
                .userId(dto.getUserId())
                // Appearance
                .themeMode(dto.getThemeMode())
                .fontSize(dto.getFontSize())
                .compactMode(dto.getCompactMode())
                .animations(dto.getAnimations())
                .highContrast(dto.getHighContrast())
                // Notifications
                .emailNotifications(dto.getEmailNotifications())
                .budgetAlerts(dto.getBudgetAlerts())
                .weeklyReports(dto.getWeeklyReports())
                .pushNotifications(dto.getPushNotifications())
                .friendRequestNotifications(dto.getFriendRequestNotifications())
                // Preferences
                .language(dto.getLanguage())
                .currency(dto.getCurrency())
                .dateFormat(dto.getDateFormat())
                .timeFormat(dto.getTimeFormat())
                // Privacy & Security
                .profileVisibility(dto.getProfileVisibility())
                .twoFactorEnabled(dto.getTwoFactorEnabled())
                .sessionTimeout(dto.getSessionTimeout())
                .maskSensitiveData(dto.getMaskSensitiveData())
                // Data & Storage
                .autoBackup(dto.getAutoBackup())
                .backupFrequency(dto.getBackupFrequency())
                .cloudSync(dto.getCloudSync())
                // Smart Features
                .autoCategorize(dto.getAutoCategorize())
                .smartBudgeting(dto.getSmartBudgeting())
                .scheduledReports(dto.getScheduledReports())
                .expenseReminders(dto.getExpenseReminders())
                .predictiveAnalytics(dto.getPredictiveAnalytics())
                // Accessibility
                .screenReader(dto.getScreenReader())
                .keyboardShortcuts(dto.getKeyboardShortcuts())
                .showShortcutIndicators(dto.getShowShortcutIndicators())
                .reduceMotion(dto.getReduceMotion())
                .focusIndicators(dto.getFocusIndicators())
                .build();
    }

    /**
     * Updates an existing UserSettings entity from UpdateUserSettingsRequest
     * Only updates non-null fields (partial update support)
     * 
     * Design Pattern: Partial Update Pattern
     * Benefits: Allows updating individual settings without affecting others
     * 
     * @param entity  The existing UserSettings entity
     * @param request The update request with new values
     */
    public void updateEntityFromRequest(UserSettings entity, UpdateUserSettingsRequest request) {
        if (entity == null || request == null) {
            return;
        }

        // Appearance Settings
        if (request.getThemeMode() != null) {
            entity.setThemeMode(request.getThemeMode());
        }
        if (request.getFontSize() != null) {
            entity.setFontSize(request.getFontSize());
        }
        if (request.getCompactMode() != null) {
            entity.setCompactMode(request.getCompactMode());
        }
        if (request.getAnimations() != null) {
            entity.setAnimations(request.getAnimations());
        }
        if (request.getHighContrast() != null) {
            entity.setHighContrast(request.getHighContrast());
        }

        // Notification Settings
        if (request.getEmailNotifications() != null) {
            entity.setEmailNotifications(request.getEmailNotifications());
        }
        if (request.getBudgetAlerts() != null) {
            entity.setBudgetAlerts(request.getBudgetAlerts());
        }
        if (request.getWeeklyReports() != null) {
            entity.setWeeklyReports(request.getWeeklyReports());
        }
        if (request.getPushNotifications() != null) {
            entity.setPushNotifications(request.getPushNotifications());
        }
        if (request.getFriendRequestNotifications() != null) {
            entity.setFriendRequestNotifications(request.getFriendRequestNotifications());
        }

        // Preference Settings
        if (request.getLanguage() != null) {
            entity.setLanguage(request.getLanguage());
        }
        if (request.getCurrency() != null) {
            entity.setCurrency(request.getCurrency());
        }
        if (request.getDateFormat() != null) {
            entity.setDateFormat(request.getDateFormat());
        }
        if (request.getTimeFormat() != null) {
            entity.setTimeFormat(request.getTimeFormat());
        }

        // Privacy & Security Settings
        if (request.getProfileVisibility() != null) {
            entity.setProfileVisibility(request.getProfileVisibility());
        }
        if (request.getTwoFactorEnabled() != null) {
            entity.setTwoFactorEnabled(request.getTwoFactorEnabled());
        }
        if (request.getSessionTimeout() != null) {
            entity.setSessionTimeout(request.getSessionTimeout());
        }
        if (request.getMaskSensitiveData() != null) {
            entity.setMaskSensitiveData(request.getMaskSensitiveData());
        }

        // Data & Storage Settings
        if (request.getAutoBackup() != null) {
            entity.setAutoBackup(request.getAutoBackup());
        }
        if (request.getBackupFrequency() != null) {
            entity.setBackupFrequency(request.getBackupFrequency());
        }
        if (request.getCloudSync() != null) {
            entity.setCloudSync(request.getCloudSync());
        }

        // Smart Features Settings
        if (request.getAutoCategorize() != null) {
            entity.setAutoCategorize(request.getAutoCategorize());
        }
        if (request.getSmartBudgeting() != null) {
            entity.setSmartBudgeting(request.getSmartBudgeting());
        }
        if (request.getScheduledReports() != null) {
            entity.setScheduledReports(request.getScheduledReports());
        }
        if (request.getExpenseReminders() != null) {
            entity.setExpenseReminders(request.getExpenseReminders());
        }
        if (request.getPredictiveAnalytics() != null) {
            entity.setPredictiveAnalytics(request.getPredictiveAnalytics());
        }

        // Accessibility Settings
        if (request.getScreenReader() != null) {
            entity.setScreenReader(request.getScreenReader());
        }
        if (request.getKeyboardShortcuts() != null) {
            entity.setKeyboardShortcuts(request.getKeyboardShortcuts());
        }
        if (request.getShowShortcutIndicators() != null) {
            entity.setShowShortcutIndicators(request.getShowShortcutIndicators());
        }
        if (request.getReduceMotion() != null) {
            entity.setReduceMotion(request.getReduceMotion());
        }
        if (request.getFocusIndicators() != null) {
            entity.setFocusIndicators(request.getFocusIndicators());
        }
    }

    /**
     * Creates a new UserSettings entity from UpdateUserSettingsRequest
     * Used when creating settings for a new user
     * 
     * @param userId  The user ID
     * @param request The request with initial settings
     * @return New UserSettings entity
     */
    public UserSettings createEntityFromRequest(Integer userId, UpdateUserSettingsRequest request) {
        // Start with default settings
        UserSettings entity = UserSettings.createDefaultSettings(userId);

        // Apply any provided values from request
        if (request != null) {
            updateEntityFromRequest(entity, request);
        }

        return entity;
    }
}
