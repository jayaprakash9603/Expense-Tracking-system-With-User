package com.jaya.service.impl;

import com.jaya.dto.NotificationPreferencesResponseDTO;
import com.jaya.dto.UpdateNotificationPreferencesRequest;
import com.jaya.modal.NotificationPreferences;
import com.jaya.repository.NotificationPreferencesRepository;
import com.jaya.service.NotificationPreferencesService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * NotificationPreferencesServiceImpl
 * Implementation of NotificationPreferencesService
 * Handles business logic for notification preferences management
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationPreferencesServiceImpl implements NotificationPreferencesService {

    private final NotificationPreferencesRepository repository;

    @Override
    @Transactional(readOnly = true)
    public NotificationPreferencesResponseDTO getPreferences(Integer userId) {
        log.info("Fetching notification preferences for user: {}", userId);

        NotificationPreferences preferences = repository.findByUserId(userId)
                .orElseGet(() -> {
                    log.info("No preferences found for user: {}. Creating defaults.", userId);
                    return createAndSaveDefaultPreferences(userId);
                });

        return mapToDTO(preferences);
    }

    @Override
    @Transactional
    public NotificationPreferencesResponseDTO updatePreferences(Integer userId,
            UpdateNotificationPreferencesRequest request) {
        log.info("Updating notification preferences for user: {}", userId);

        NotificationPreferences preferences = repository.findByUserId(userId)
                .orElseGet(() -> createAndSaveDefaultPreferences(userId));

        // Update only non-null fields (partial update support)
        updateFieldsIfNotNull(preferences, request);

        NotificationPreferences saved = repository.save(preferences);
        log.info("Successfully updated preferences for user: {}", userId);

        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public NotificationPreferencesResponseDTO resetToDefaults(Integer userId) {
        log.info("Resetting notification preferences to defaults for user: {}", userId);

        // Find existing preferences or create new ones
        NotificationPreferences preferences = repository.findByUserId(userId)
                .orElseGet(() -> {
                    log.info("No existing preferences found for user: {}. Creating new record.", userId);
                    NotificationPreferences newPrefs = new NotificationPreferences();
                    newPrefs.setUserId(userId);
                    return newPrefs;
                });

        // Set all fields to default values
        setDefaultValues(preferences);

        // Save the updated preferences
        NotificationPreferences saved = repository.save(preferences);

        log.info("Successfully reset preferences to defaults for user: {}", userId);
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public void deletePreferences(Integer userId) {
        log.info("Deleting notification preferences for user: {}", userId);
        repository.deleteByUserId(userId);
        log.info("Successfully deleted preferences for user: {}", userId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean preferencesExist(Integer userId) {
        boolean exists = repository.existsByUserId(userId);
        log.debug("Preferences exist for user {}: {}", userId, exists);
        return exists;
    }

    @Override
    @Transactional
    public NotificationPreferencesResponseDTO createDefaultPreferences(Integer userId) {
        log.info("Creating default notification preferences for user: {}", userId);

        if (repository.existsByUserId(userId)) {
            log.warn("Preferences already exist for user: {}. Returning existing preferences.", userId);
            return getPreferences(userId);
        }

        NotificationPreferences defaults = createAndSaveDefaultPreferences(userId);
        return mapToDTO(defaults);
    }

    /**
     * Create and save default notification preferences
     */
    private NotificationPreferences createAndSaveDefaultPreferences(Integer userId) {
        NotificationPreferences preferences = NotificationPreferences.builder()
                .userId(userId)
                // Global Settings - All enabled by default
                .masterEnabled(true)
                .doNotDisturb(false)
                .notificationSound(true)
                .browserNotifications(true)
                .floatingNotifications(true)
                // Service Level Toggles - All enabled by default
                .expenseServiceEnabled(true)
                .budgetServiceEnabled(true)
                .billServiceEnabled(true)
                .categoryServiceEnabled(true)
                .paymentMethodServiceEnabled(true)
                .friendServiceEnabled(true)
                .friendActivityServiceEnabled(true)
                .analyticsServiceEnabled(true)
                .systemNotificationsEnabled(true)
                // Expense Service Notifications
                .expenseAddedEnabled(true)
                .expenseUpdatedEnabled(true)
                .expenseDeletedEnabled(false)
                .largeExpenseAlertEnabled(true)
                // Budget Service Notifications
                .budgetExceededEnabled(true)
                .budgetWarningEnabled(true)
                .budgetLimitApproachingEnabled(true)
                .budgetCreatedEnabled(false)
                .budgetUpdatedEnabled(false)
                .budgetDeletedEnabled(false)
                // Bill Service Notifications
                .billAddedEnabled(true)
                .billUpdatedEnabled(true)
                .billDeletedEnabled(false)
                .billDueReminderEnabled(true)
                .billOverdueEnabled(true)
                .billPaidEnabled(true)
                // Payment Method Service Notifications
                .paymentMethodAddedEnabled(false)
                .paymentMethodUpdatedEnabled(false)
                .paymentMethodRemovedEnabled(true)
                // Category Service Notifications
                .categoryCreatedEnabled(true)
                .categoryUpdatedEnabled(false)
                .categoryDeletedEnabled(false)
                .categoryBudgetExceededEnabled(true)
                // Friend Service Notifications
                .friendRequestReceivedEnabled(true)
                .friendRequestAcceptedEnabled(true)
                .friendRequestRejectedEnabled(false)
                // Friend Activity Service Notifications
                .friendExpenseCreatedEnabled(true)
                .friendExpenseUpdatedEnabled(true)
                .friendExpenseDeletedEnabled(true)
                .friendCategoryCreatedEnabled(true)
                .friendCategoryUpdatedEnabled(true)
                .friendCategoryDeletedEnabled(true)
                .friendBillCreatedEnabled(true)
                .friendBillUpdatedEnabled(true)
                .friendBillDeletedEnabled(true)
                .friendBudgetCreatedEnabled(true)
                .friendBudgetUpdatedEnabled(true)
                .friendBudgetDeletedEnabled(true)
                .friendPaymentMethodCreatedEnabled(true)
                .friendPaymentMethodUpdatedEnabled(true)
                .friendPaymentMethodDeletedEnabled(true)
                // Analytics Service Notifications
                .weeklySummaryEnabled(true)
                .monthlyReportEnabled(true)
                .spendingTrendAlertEnabled(true)
                // System Notifications
                .securityAlertEnabled(true)
                .appUpdateEnabled(false)
                .maintenanceNoticeEnabled(true)
                // Legacy fields defaults
                .budgetAlertsEnabled(true)
                .dailyRemindersEnabled(false)
                .weeklyReportsEnabled(true)
                .monthlySummaryEnabled(true)
                .goalNotificationsEnabled(true)
                .unusualSpendingAlerts(true)
                .emailNotifications(true)
                .smsNotifications(false)
                .pushNotifications(true)
                .inAppNotifications(true)
                .budgetWarningThreshold(80.0)
                .build();

        return repository.save(preferences);
    }

    /**
     * Set all fields to default values
     */
    private void setDefaultValues(NotificationPreferences preferences) {
        // Global Settings - All enabled by default
        preferences.setMasterEnabled(true);
        preferences.setDoNotDisturb(false);
        preferences.setNotificationSound(true);
        preferences.setBrowserNotifications(true);
        preferences.setFloatingNotifications(true);

        // Service Level Toggles - All enabled by default
        preferences.setExpenseServiceEnabled(true);
        preferences.setBudgetServiceEnabled(true);
        preferences.setBillServiceEnabled(true);
        preferences.setCategoryServiceEnabled(true);
        preferences.setPaymentMethodServiceEnabled(true);
        preferences.setFriendServiceEnabled(true);
        preferences.setFriendActivityServiceEnabled(true);
        preferences.setAnalyticsServiceEnabled(true);
        preferences.setSystemNotificationsEnabled(true);

        // Expense Service Notifications
        preferences.setExpenseAddedEnabled(true);
        preferences.setExpenseUpdatedEnabled(true);
        preferences.setExpenseDeletedEnabled(false);
        preferences.setLargeExpenseAlertEnabled(true);

        // Budget Service Notifications
        preferences.setBudgetExceededEnabled(true);
        preferences.setBudgetWarningEnabled(true);
        preferences.setBudgetLimitApproachingEnabled(true);
        preferences.setBudgetCreatedEnabled(false);
        preferences.setBudgetUpdatedEnabled(false);
        preferences.setBudgetDeletedEnabled(false);

        // Bill Service Notifications
        preferences.setBillAddedEnabled(true);
        preferences.setBillUpdatedEnabled(true);
        preferences.setBillDeletedEnabled(false);
        preferences.setBillDueReminderEnabled(true);
        preferences.setBillOverdueEnabled(true);
        preferences.setBillPaidEnabled(true);

        // Payment Method Service Notifications
        preferences.setPaymentMethodAddedEnabled(false);
        preferences.setPaymentMethodUpdatedEnabled(false);
        preferences.setPaymentMethodRemovedEnabled(true);

        // Category Service Notifications
        preferences.setCategoryCreatedEnabled(true);
        preferences.setCategoryUpdatedEnabled(false);
        preferences.setCategoryDeletedEnabled(false);
        preferences.setCategoryBudgetExceededEnabled(true);

        // Friend Service Notifications
        preferences.setFriendRequestReceivedEnabled(true);
        preferences.setFriendRequestAcceptedEnabled(true);
        preferences.setFriendRequestRejectedEnabled(false);

        // Friend Activity Service Notifications
        preferences.setFriendExpenseCreatedEnabled(true);
        preferences.setFriendExpenseUpdatedEnabled(true);
        preferences.setFriendExpenseDeletedEnabled(true);
        preferences.setFriendCategoryCreatedEnabled(true);
        preferences.setFriendCategoryUpdatedEnabled(true);
        preferences.setFriendCategoryDeletedEnabled(true);
        preferences.setFriendBillCreatedEnabled(true);
        preferences.setFriendBillUpdatedEnabled(true);
        preferences.setFriendBillDeletedEnabled(true);
        preferences.setFriendBudgetCreatedEnabled(true);
        preferences.setFriendBudgetUpdatedEnabled(true);
        preferences.setFriendBudgetDeletedEnabled(true);
        preferences.setFriendPaymentMethodCreatedEnabled(true);
        preferences.setFriendPaymentMethodUpdatedEnabled(true);
        preferences.setFriendPaymentMethodDeletedEnabled(true);

        // Analytics Service Notifications
        preferences.setWeeklySummaryEnabled(true);
        preferences.setMonthlyReportEnabled(true);
        preferences.setSpendingTrendAlertEnabled(true);

        // System Notifications
        preferences.setSecurityAlertEnabled(true);
        preferences.setAppUpdateEnabled(false);
        preferences.setMaintenanceNoticeEnabled(true);

        // Legacy fields defaults
        preferences.setBudgetAlertsEnabled(true);
        preferences.setDailyRemindersEnabled(false);
        preferences.setWeeklyReportsEnabled(true);
        preferences.setMonthlySummaryEnabled(true);
        preferences.setGoalNotificationsEnabled(true);
        preferences.setUnusualSpendingAlerts(true);
        preferences.setEmailNotifications(true);
        preferences.setSmsNotifications(false);
        preferences.setPushNotifications(true);
        preferences.setInAppNotifications(true);
        preferences.setBudgetWarningThreshold(80.0);

        // Clear JSON preferences
        preferences.setNotificationPreferencesJson(null);
    }

    /**
     * Update fields if they are not null (partial update)
     */
    private void updateFieldsIfNotNull(NotificationPreferences preferences,
            UpdateNotificationPreferencesRequest request) {
        // Global Settings
        if (request.getMasterEnabled() != null)
            preferences.setMasterEnabled(request.getMasterEnabled());
        if (request.getDoNotDisturb() != null)
            preferences.setDoNotDisturb(request.getDoNotDisturb());
        if (request.getNotificationSound() != null)
            preferences.setNotificationSound(request.getNotificationSound());
        if (request.getBrowserNotifications() != null)
            preferences.setBrowserNotifications(request.getBrowserNotifications());
        if (request.getFloatingNotifications() != null)
            preferences.setFloatingNotifications(request.getFloatingNotifications());

        // Service Level Toggles
        if (request.getExpenseServiceEnabled() != null)
            preferences.setExpenseServiceEnabled(request.getExpenseServiceEnabled());
        if (request.getBudgetServiceEnabled() != null)
            preferences.setBudgetServiceEnabled(request.getBudgetServiceEnabled());
        if (request.getBillServiceEnabled() != null)
            preferences.setBillServiceEnabled(request.getBillServiceEnabled());
        if (request.getCategoryServiceEnabled() != null)
            preferences.setCategoryServiceEnabled(request.getCategoryServiceEnabled());
        if (request.getPaymentMethodServiceEnabled() != null)
            preferences.setPaymentMethodServiceEnabled(request.getPaymentMethodServiceEnabled());
        if (request.getFriendServiceEnabled() != null)
            preferences.setFriendServiceEnabled(request.getFriendServiceEnabled());
        if (request.getFriendActivityServiceEnabled() != null)
            preferences.setFriendActivityServiceEnabled(request.getFriendActivityServiceEnabled());
        if (request.getAnalyticsServiceEnabled() != null)
            preferences.setAnalyticsServiceEnabled(request.getAnalyticsServiceEnabled());
        if (request.getSystemNotificationsEnabled() != null)
            preferences.setSystemNotificationsEnabled(request.getSystemNotificationsEnabled());

        // Expense Service Notifications
        if (request.getExpenseAddedEnabled() != null)
            preferences.setExpenseAddedEnabled(request.getExpenseAddedEnabled());
        if (request.getExpenseUpdatedEnabled() != null)
            preferences.setExpenseUpdatedEnabled(request.getExpenseUpdatedEnabled());
        if (request.getExpenseDeletedEnabled() != null)
            preferences.setExpenseDeletedEnabled(request.getExpenseDeletedEnabled());
        if (request.getLargeExpenseAlertEnabled() != null)
            preferences.setLargeExpenseAlertEnabled(request.getLargeExpenseAlertEnabled());

        // Budget Service Notifications
        if (request.getBudgetExceededEnabled() != null)
            preferences.setBudgetExceededEnabled(request.getBudgetExceededEnabled());
        if (request.getBudgetWarningEnabled() != null)
            preferences.setBudgetWarningEnabled(request.getBudgetWarningEnabled());
        if (request.getBudgetLimitApproachingEnabled() != null)
            preferences.setBudgetLimitApproachingEnabled(request.getBudgetLimitApproachingEnabled());
        if (request.getBudgetCreatedEnabled() != null)
            preferences.setBudgetCreatedEnabled(request.getBudgetCreatedEnabled());
        if (request.getBudgetUpdatedEnabled() != null)
            preferences.setBudgetUpdatedEnabled(request.getBudgetUpdatedEnabled());
        if (request.getBudgetDeletedEnabled() != null)
            preferences.setBudgetDeletedEnabled(request.getBudgetDeletedEnabled());

        // Bill Service Notifications
        if (request.getBillAddedEnabled() != null)
            preferences.setBillAddedEnabled(request.getBillAddedEnabled());
        if (request.getBillUpdatedEnabled() != null)
            preferences.setBillUpdatedEnabled(request.getBillUpdatedEnabled());
        if (request.getBillDeletedEnabled() != null)
            preferences.setBillDeletedEnabled(request.getBillDeletedEnabled());
        if (request.getBillDueReminderEnabled() != null)
            preferences.setBillDueReminderEnabled(request.getBillDueReminderEnabled());
        if (request.getBillOverdueEnabled() != null)
            preferences.setBillOverdueEnabled(request.getBillOverdueEnabled());
        if (request.getBillPaidEnabled() != null)
            preferences.setBillPaidEnabled(request.getBillPaidEnabled());

        // Payment Method Service Notifications
        if (request.getPaymentMethodAddedEnabled() != null)
            preferences.setPaymentMethodAddedEnabled(request.getPaymentMethodAddedEnabled());
        if (request.getPaymentMethodUpdatedEnabled() != null)
            preferences.setPaymentMethodUpdatedEnabled(request.getPaymentMethodUpdatedEnabled());
        if (request.getPaymentMethodRemovedEnabled() != null)
            preferences.setPaymentMethodRemovedEnabled(request.getPaymentMethodRemovedEnabled());

        // Category Service Notifications
        if (request.getCategoryCreatedEnabled() != null)
            preferences.setCategoryCreatedEnabled(request.getCategoryCreatedEnabled());
        if (request.getCategoryUpdatedEnabled() != null)
            preferences.setCategoryUpdatedEnabled(request.getCategoryUpdatedEnabled());
        if (request.getCategoryDeletedEnabled() != null)
            preferences.setCategoryDeletedEnabled(request.getCategoryDeletedEnabled());
        if (request.getCategoryBudgetExceededEnabled() != null)
            preferences.setCategoryBudgetExceededEnabled(request.getCategoryBudgetExceededEnabled());

        // Friend Service Notifications
        if (request.getFriendRequestReceivedEnabled() != null)
            preferences.setFriendRequestReceivedEnabled(request.getFriendRequestReceivedEnabled());
        if (request.getFriendRequestAcceptedEnabled() != null)
            preferences.setFriendRequestAcceptedEnabled(request.getFriendRequestAcceptedEnabled());
        if (request.getFriendRequestRejectedEnabled() != null)
            preferences.setFriendRequestRejectedEnabled(request.getFriendRequestRejectedEnabled());

        // Friend Activity Service Notifications
        if (request.getFriendExpenseCreatedEnabled() != null)
            preferences.setFriendExpenseCreatedEnabled(request.getFriendExpenseCreatedEnabled());
        if (request.getFriendExpenseUpdatedEnabled() != null)
            preferences.setFriendExpenseUpdatedEnabled(request.getFriendExpenseUpdatedEnabled());
        if (request.getFriendExpenseDeletedEnabled() != null)
            preferences.setFriendExpenseDeletedEnabled(request.getFriendExpenseDeletedEnabled());
        if (request.getFriendCategoryCreatedEnabled() != null)
            preferences.setFriendCategoryCreatedEnabled(request.getFriendCategoryCreatedEnabled());
        if (request.getFriendCategoryUpdatedEnabled() != null)
            preferences.setFriendCategoryUpdatedEnabled(request.getFriendCategoryUpdatedEnabled());
        if (request.getFriendCategoryDeletedEnabled() != null)
            preferences.setFriendCategoryDeletedEnabled(request.getFriendCategoryDeletedEnabled());
        if (request.getFriendBillCreatedEnabled() != null)
            preferences.setFriendBillCreatedEnabled(request.getFriendBillCreatedEnabled());
        if (request.getFriendBillUpdatedEnabled() != null)
            preferences.setFriendBillUpdatedEnabled(request.getFriendBillUpdatedEnabled());
        if (request.getFriendBillDeletedEnabled() != null)
            preferences.setFriendBillDeletedEnabled(request.getFriendBillDeletedEnabled());
        if (request.getFriendBudgetCreatedEnabled() != null)
            preferences.setFriendBudgetCreatedEnabled(request.getFriendBudgetCreatedEnabled());
        if (request.getFriendBudgetUpdatedEnabled() != null)
            preferences.setFriendBudgetUpdatedEnabled(request.getFriendBudgetUpdatedEnabled());
        if (request.getFriendBudgetDeletedEnabled() != null)
            preferences.setFriendBudgetDeletedEnabled(request.getFriendBudgetDeletedEnabled());
        if (request.getFriendPaymentMethodCreatedEnabled() != null)
            preferences.setFriendPaymentMethodCreatedEnabled(request.getFriendPaymentMethodCreatedEnabled());
        if (request.getFriendPaymentMethodUpdatedEnabled() != null)
            preferences.setFriendPaymentMethodUpdatedEnabled(request.getFriendPaymentMethodUpdatedEnabled());
        if (request.getFriendPaymentMethodDeletedEnabled() != null)
            preferences.setFriendPaymentMethodDeletedEnabled(request.getFriendPaymentMethodDeletedEnabled());

        // Analytics Service Notifications
        if (request.getWeeklySummaryEnabled() != null)
            preferences.setWeeklySummaryEnabled(request.getWeeklySummaryEnabled());
        if (request.getMonthlyReportEnabled() != null)
            preferences.setMonthlyReportEnabled(request.getMonthlyReportEnabled());
        if (request.getSpendingTrendAlertEnabled() != null)
            preferences.setSpendingTrendAlertEnabled(request.getSpendingTrendAlertEnabled());

        // System Notifications
        if (request.getSecurityAlertEnabled() != null)
            preferences.setSecurityAlertEnabled(request.getSecurityAlertEnabled());
        if (request.getAppUpdateEnabled() != null)
            preferences.setAppUpdateEnabled(request.getAppUpdateEnabled());
        if (request.getMaintenanceNoticeEnabled() != null)
            preferences.setMaintenanceNoticeEnabled(request.getMaintenanceNoticeEnabled());

        // JSON Configuration
        if (request.getNotificationPreferencesJson() != null)
            preferences.setNotificationPreferencesJson(request.getNotificationPreferencesJson());

        // Legacy fields
        if (request.getBudgetAlertsEnabled() != null)
            preferences.setBudgetAlertsEnabled(request.getBudgetAlertsEnabled());
        if (request.getDailyRemindersEnabled() != null)
            preferences.setDailyRemindersEnabled(request.getDailyRemindersEnabled());
        if (request.getWeeklyReportsEnabled() != null)
            preferences.setWeeklyReportsEnabled(request.getWeeklyReportsEnabled());
        if (request.getMonthlySummaryEnabled() != null)
            preferences.setMonthlySummaryEnabled(request.getMonthlySummaryEnabled());
        if (request.getGoalNotificationsEnabled() != null)
            preferences.setGoalNotificationsEnabled(request.getGoalNotificationsEnabled());
        if (request.getUnusualSpendingAlerts() != null)
            preferences.setUnusualSpendingAlerts(request.getUnusualSpendingAlerts());
        if (request.getEmailNotifications() != null)
            preferences.setEmailNotifications(request.getEmailNotifications());
        if (request.getSmsNotifications() != null)
            preferences.setSmsNotifications(request.getSmsNotifications());
        if (request.getPushNotifications() != null)
            preferences.setPushNotifications(request.getPushNotifications());
        if (request.getInAppNotifications() != null)
            preferences.setInAppNotifications(request.getInAppNotifications());
        if (request.getBudgetWarningThreshold() != null)
            preferences.setBudgetWarningThreshold(request.getBudgetWarningThreshold());
    }

    /**
     * Map entity to DTO
     */
    private NotificationPreferencesResponseDTO mapToDTO(NotificationPreferences preferences) {
        return NotificationPreferencesResponseDTO.builder()
                .userId(preferences.getUserId())
                // Global Settings
                .masterEnabled(preferences.getMasterEnabled())
                .doNotDisturb(preferences.getDoNotDisturb())
                .notificationSound(preferences.getNotificationSound())
                .browserNotifications(preferences.getBrowserNotifications())
                .floatingNotifications(preferences.getFloatingNotifications())
                // Service Level Toggles
                .expenseServiceEnabled(preferences.getExpenseServiceEnabled())
                .budgetServiceEnabled(preferences.getBudgetServiceEnabled())
                .billServiceEnabled(preferences.getBillServiceEnabled())
                .categoryServiceEnabled(preferences.getCategoryServiceEnabled())
                .paymentMethodServiceEnabled(preferences.getPaymentMethodServiceEnabled())
                .friendServiceEnabled(preferences.getFriendServiceEnabled())
                .friendActivityServiceEnabled(preferences.getFriendActivityServiceEnabled())
                .analyticsServiceEnabled(preferences.getAnalyticsServiceEnabled())
                .systemNotificationsEnabled(preferences.getSystemNotificationsEnabled())
                // Expense Service Notifications
                .expenseAddedEnabled(preferences.getExpenseAddedEnabled())
                .expenseUpdatedEnabled(preferences.getExpenseUpdatedEnabled())
                .expenseDeletedEnabled(preferences.getExpenseDeletedEnabled())
                .largeExpenseAlertEnabled(preferences.getLargeExpenseAlertEnabled())
                // Budget Service Notifications
                .budgetExceededEnabled(preferences.getBudgetExceededEnabled())
                .budgetWarningEnabled(preferences.getBudgetWarningEnabled())
                .budgetLimitApproachingEnabled(preferences.getBudgetLimitApproachingEnabled())
                .budgetCreatedEnabled(preferences.getBudgetCreatedEnabled())
                .budgetUpdatedEnabled(preferences.getBudgetUpdatedEnabled())
                .budgetDeletedEnabled(preferences.getBudgetDeletedEnabled())
                // Bill Service Notifications
                .billAddedEnabled(preferences.getBillAddedEnabled())
                .billUpdatedEnabled(preferences.getBillUpdatedEnabled())
                .billDeletedEnabled(preferences.getBillDeletedEnabled())
                .billDueReminderEnabled(preferences.getBillDueReminderEnabled())
                .billOverdueEnabled(preferences.getBillOverdueEnabled())
                .billPaidEnabled(preferences.getBillPaidEnabled())
                // Payment Method Service Notifications
                .paymentMethodAddedEnabled(preferences.getPaymentMethodAddedEnabled())
                .paymentMethodUpdatedEnabled(preferences.getPaymentMethodUpdatedEnabled())
                .paymentMethodRemovedEnabled(preferences.getPaymentMethodRemovedEnabled())
                // Category Service Notifications
                .categoryCreatedEnabled(preferences.getCategoryCreatedEnabled())
                .categoryUpdatedEnabled(preferences.getCategoryUpdatedEnabled())
                .categoryDeletedEnabled(preferences.getCategoryDeletedEnabled())
                .categoryBudgetExceededEnabled(preferences.getCategoryBudgetExceededEnabled())
                // Friend Service Notifications
                .friendRequestReceivedEnabled(preferences.getFriendRequestReceivedEnabled())
                .friendRequestAcceptedEnabled(preferences.getFriendRequestAcceptedEnabled())
                .friendRequestRejectedEnabled(preferences.getFriendRequestRejectedEnabled())
                // Friend Activity Service Notifications
                .friendExpenseCreatedEnabled(preferences.getFriendExpenseCreatedEnabled())
                .friendExpenseUpdatedEnabled(preferences.getFriendExpenseUpdatedEnabled())
                .friendExpenseDeletedEnabled(preferences.getFriendExpenseDeletedEnabled())
                .friendCategoryCreatedEnabled(preferences.getFriendCategoryCreatedEnabled())
                .friendCategoryUpdatedEnabled(preferences.getFriendCategoryUpdatedEnabled())
                .friendCategoryDeletedEnabled(preferences.getFriendCategoryDeletedEnabled())
                .friendBillCreatedEnabled(preferences.getFriendBillCreatedEnabled())
                .friendBillUpdatedEnabled(preferences.getFriendBillUpdatedEnabled())
                .friendBillDeletedEnabled(preferences.getFriendBillDeletedEnabled())
                .friendBudgetCreatedEnabled(preferences.getFriendBudgetCreatedEnabled())
                .friendBudgetUpdatedEnabled(preferences.getFriendBudgetUpdatedEnabled())
                .friendBudgetDeletedEnabled(preferences.getFriendBudgetDeletedEnabled())
                .friendPaymentMethodCreatedEnabled(preferences.getFriendPaymentMethodCreatedEnabled())
                .friendPaymentMethodUpdatedEnabled(preferences.getFriendPaymentMethodUpdatedEnabled())
                .friendPaymentMethodDeletedEnabled(preferences.getFriendPaymentMethodDeletedEnabled())
                // Analytics Service Notifications
                .weeklySummaryEnabled(preferences.getWeeklySummaryEnabled())
                .monthlyReportEnabled(preferences.getMonthlyReportEnabled())
                .spendingTrendAlertEnabled(preferences.getSpendingTrendAlertEnabled())
                // System Notifications
                .securityAlertEnabled(preferences.getSecurityAlertEnabled())
                .appUpdateEnabled(preferences.getAppUpdateEnabled())
                .maintenanceNoticeEnabled(preferences.getMaintenanceNoticeEnabled())
                // JSON Configuration
                .notificationPreferencesJson(preferences.getNotificationPreferencesJson())
                // Legacy fields
                .budgetAlertsEnabled(preferences.getBudgetAlertsEnabled())
                .dailyRemindersEnabled(preferences.getDailyRemindersEnabled())
                .weeklyReportsEnabled(preferences.getWeeklyReportsEnabled())
                .monthlySummaryEnabled(preferences.getMonthlySummaryEnabled())
                .goalNotificationsEnabled(preferences.getGoalNotificationsEnabled())
                .unusualSpendingAlerts(preferences.getUnusualSpendingAlerts())
                .emailNotifications(preferences.getEmailNotifications())
                .smsNotifications(preferences.getSmsNotifications())
                .pushNotifications(preferences.getPushNotifications())
                .inAppNotifications(preferences.getInAppNotifications())
                .budgetWarningThreshold(preferences.getBudgetWarningThreshold())
                .build();
    }
}
