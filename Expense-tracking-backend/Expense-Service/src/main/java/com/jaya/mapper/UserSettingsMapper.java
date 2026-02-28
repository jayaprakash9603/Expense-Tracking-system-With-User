package com.jaya.mapper;

import com.jaya.dto.UserSettingsDTO;
import com.jaya.models.UserSettings;
import com.jaya.request.UpdateUserSettingsRequest;
import org.springframework.stereotype.Component;












@Component
public class UserSettingsMapper {

    





    public UserSettingsDTO toDTO(UserSettings entity) {
        if (entity == null) {
            return null;
        }

        return UserSettingsDTO.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                
                .themeMode(entity.getThemeMode())
                .fontSize(entity.getFontSize())
                .compactMode(entity.getCompactMode())
                .animations(entity.getAnimations())
                .highContrast(entity.getHighContrast())
                
                .emailNotifications(entity.getEmailNotifications())
                .budgetAlerts(entity.getBudgetAlerts())
                .weeklyReports(entity.getWeeklyReports())
                .pushNotifications(entity.getPushNotifications())
                .friendRequestNotifications(entity.getFriendRequestNotifications())
                
                .language(entity.getLanguage())
                .currency(entity.getCurrency())
                .dateFormat(entity.getDateFormat())
                .timeFormat(entity.getTimeFormat())
                
                .profileVisibility(entity.getProfileVisibility())
                .twoFactorEnabled(entity.getTwoFactorEnabled())
                .sessionTimeout(entity.getSessionTimeout())
                .maskSensitiveData(entity.getMaskSensitiveData())
                
                .autoBackup(entity.getAutoBackup())
                .backupFrequency(entity.getBackupFrequency())
                .cloudSync(entity.getCloudSync())
                
                .autoCategorize(entity.getAutoCategorize())
                .smartBudgeting(entity.getSmartBudgeting())
                .scheduledReports(entity.getScheduledReports())
                .expenseReminders(entity.getExpenseReminders())
                .predictiveAnalytics(entity.getPredictiveAnalytics())
                
                .screenReader(entity.getScreenReader())
                .keyboardShortcuts(entity.getKeyboardShortcuts())
                .showShortcutIndicators(entity.getShowShortcutIndicators())
                .reduceMotion(entity.getReduceMotion())
                .focusIndicators(entity.getFocusIndicators())
                
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    






    public UserSettings toEntity(UserSettingsDTO dto) {
        if (dto == null) {
            return null;
        }

        return UserSettings.builder()
                .id(dto.getId())
                .userId(dto.getUserId())
                
                .themeMode(dto.getThemeMode())
                .fontSize(dto.getFontSize())
                .compactMode(dto.getCompactMode())
                .animations(dto.getAnimations())
                .highContrast(dto.getHighContrast())
                
                .emailNotifications(dto.getEmailNotifications())
                .budgetAlerts(dto.getBudgetAlerts())
                .weeklyReports(dto.getWeeklyReports())
                .pushNotifications(dto.getPushNotifications())
                .friendRequestNotifications(dto.getFriendRequestNotifications())
                
                .language(dto.getLanguage())
                .currency(dto.getCurrency())
                .dateFormat(dto.getDateFormat())
                .timeFormat(dto.getTimeFormat())
                
                .profileVisibility(dto.getProfileVisibility())
                .twoFactorEnabled(dto.getTwoFactorEnabled())
                .sessionTimeout(dto.getSessionTimeout())
                .maskSensitiveData(dto.getMaskSensitiveData())
                
                .autoBackup(dto.getAutoBackup())
                .backupFrequency(dto.getBackupFrequency())
                .cloudSync(dto.getCloudSync())
                
                .autoCategorize(dto.getAutoCategorize())
                .smartBudgeting(dto.getSmartBudgeting())
                .scheduledReports(dto.getScheduledReports())
                .expenseReminders(dto.getExpenseReminders())
                .predictiveAnalytics(dto.getPredictiveAnalytics())
                
                .screenReader(dto.getScreenReader())
                .keyboardShortcuts(dto.getKeyboardShortcuts())
                .showShortcutIndicators(dto.getShowShortcutIndicators())
                .reduceMotion(dto.getReduceMotion())
                .focusIndicators(dto.getFocusIndicators())
                .build();
    }

    









    public void updateEntityFromRequest(UserSettings entity, UpdateUserSettingsRequest request) {
        if (entity == null || request == null) {
            return;
        }

        
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

        
        if (request.getAutoBackup() != null) {
            entity.setAutoBackup(request.getAutoBackup());
        }
        if (request.getBackupFrequency() != null) {
            entity.setBackupFrequency(request.getBackupFrequency());
        }
        if (request.getCloudSync() != null) {
            entity.setCloudSync(request.getCloudSync());
        }

        
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

    







    public UserSettings createEntityFromRequest(Integer userId, UpdateUserSettingsRequest request) {
        
        UserSettings entity = UserSettings.createDefaultSettings(userId);

        
        if (request != null) {
            updateEntityFromRequest(entity, request);
        }

        return entity;
    }
}
