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

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationPreferencesServiceImpl implements NotificationPreferencesService {

    private final NotificationPreferencesRepository repository;

    @Override
    @Transactional
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

        updateFieldsIfNotNull(preferences, request);

        NotificationPreferences saved = repository.save(preferences);
        log.info("Successfully updated preferences for user: {}", userId);

        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public NotificationPreferencesResponseDTO resetToDefaults(Integer userId) {
        log.info("Resetting notification preferences to defaults for user: {}", userId);

        NotificationPreferences preferences = repository.findByUserId(userId)
                .orElseGet(() -> {
                    log.info("No existing preferences found for user: {}. Creating new record.", userId);
                    NotificationPreferences newPrefs = new NotificationPreferences();
                    newPrefs.setUserId(userId);
                    return newPrefs;
                });

        setDefaultValues(preferences);

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

    private NotificationPreferences createAndSaveDefaultPreferences(Integer userId) {
        NotificationPreferences preferences = NotificationPreferences.builder()
                .userId(userId)
                .masterEnabled(true)
                .doNotDisturb(false)
                .notificationSound(true)
                .browserNotifications(true)
                .floatingNotifications(true)
                .expenseServiceEnabled(true)
                .budgetServiceEnabled(true)
                .billServiceEnabled(true)
                .categoryServiceEnabled(true)
                .paymentMethodServiceEnabled(true)
                .friendServiceEnabled(true)
                .friendActivityServiceEnabled(true)
                .analyticsServiceEnabled(true)
                .systemNotificationsEnabled(true)
                .expenseAddedEnabled(true)
                .expenseUpdatedEnabled(true)
                .expenseDeletedEnabled(false)
                .largeExpenseAlertEnabled(true)
                .budgetExceededEnabled(true)
                .budgetWarningEnabled(true)
                .budgetLimitApproachingEnabled(true)
                .budgetCreatedEnabled(false)
                .budgetUpdatedEnabled(false)
                .budgetDeletedEnabled(false)
                .billAddedEnabled(true)
                .billUpdatedEnabled(true)
                .billDeletedEnabled(false)
                .billDueReminderEnabled(true)
                .billOverdueEnabled(true)
                .billPaidEnabled(true)
                .paymentMethodAddedEnabled(false)
                .paymentMethodUpdatedEnabled(false)
                .paymentMethodRemovedEnabled(true)
                .categoryCreatedEnabled(true)
                .categoryUpdatedEnabled(false)
                .categoryDeletedEnabled(false)
                .categoryBudgetExceededEnabled(true)
                .friendRequestReceivedEnabled(true)
                .friendRequestAcceptedEnabled(true)
                .friendRequestRejectedEnabled(false)
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
                .weeklySummaryEnabled(true)
                .monthlyReportEnabled(true)
                .spendingTrendAlertEnabled(true)
                .securityAlertEnabled(true)
                .appUpdateEnabled(false)
                .maintenanceNoticeEnabled(true)
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

    private void setDefaultValues(NotificationPreferences preferences) {
        preferences.setMasterEnabled(true);
        preferences.setDoNotDisturb(false);
        preferences.setNotificationSound(true);
        preferences.setBrowserNotifications(true);
        preferences.setFloatingNotifications(true);

        preferences.setExpenseServiceEnabled(true);
        preferences.setBudgetServiceEnabled(true);
        preferences.setBillServiceEnabled(true);
        preferences.setCategoryServiceEnabled(true);
        preferences.setPaymentMethodServiceEnabled(true);
        preferences.setFriendServiceEnabled(true);
        preferences.setFriendActivityServiceEnabled(true);
        preferences.setAnalyticsServiceEnabled(true);
        preferences.setSystemNotificationsEnabled(true);

        preferences.setExpenseAddedEnabled(true);
        preferences.setExpenseUpdatedEnabled(true);
        preferences.setExpenseDeletedEnabled(false);
        preferences.setLargeExpenseAlertEnabled(true);

        preferences.setBudgetExceededEnabled(true);
        preferences.setBudgetWarningEnabled(true);
        preferences.setBudgetLimitApproachingEnabled(true);
        preferences.setBudgetCreatedEnabled(false);
        preferences.setBudgetUpdatedEnabled(false);
        preferences.setBudgetDeletedEnabled(false);

        preferences.setBillAddedEnabled(true);
        preferences.setBillUpdatedEnabled(true);
        preferences.setBillDeletedEnabled(false);
        preferences.setBillDueReminderEnabled(true);
        preferences.setBillOverdueEnabled(true);
        preferences.setBillPaidEnabled(true);

        preferences.setPaymentMethodAddedEnabled(false);
        preferences.setPaymentMethodUpdatedEnabled(false);
        preferences.setPaymentMethodRemovedEnabled(true);

        preferences.setCategoryCreatedEnabled(true);
        preferences.setCategoryUpdatedEnabled(false);
        preferences.setCategoryDeletedEnabled(false);
        preferences.setCategoryBudgetExceededEnabled(true);

        preferences.setFriendRequestReceivedEnabled(true);
        preferences.setFriendRequestAcceptedEnabled(true);
        preferences.setFriendRequestRejectedEnabled(false);

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

        preferences.setWeeklySummaryEnabled(true);
        preferences.setMonthlyReportEnabled(true);
        preferences.setSpendingTrendAlertEnabled(true);

        preferences.setSecurityAlertEnabled(true);
        preferences.setAppUpdateEnabled(false);
        preferences.setMaintenanceNoticeEnabled(true);

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
        preferences.setNotificationPreferencesJson(null);
    }

    private void updateFieldsIfNotNull(NotificationPreferences preferences,
            UpdateNotificationPreferencesRequest request) {
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
        if (request.getExpenseAddedEnabled() != null)
            preferences.setExpenseAddedEnabled(request.getExpenseAddedEnabled());
        if (request.getExpenseUpdatedEnabled() != null)
            preferences.setExpenseUpdatedEnabled(request.getExpenseUpdatedEnabled());
        if (request.getExpenseDeletedEnabled() != null)
            preferences.setExpenseDeletedEnabled(request.getExpenseDeletedEnabled());
        if (request.getLargeExpenseAlertEnabled() != null)
            preferences.setLargeExpenseAlertEnabled(request.getLargeExpenseAlertEnabled());
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

        if (request.getPaymentMethodAddedEnabled() != null)
            preferences.setPaymentMethodAddedEnabled(request.getPaymentMethodAddedEnabled());
        if (request.getPaymentMethodUpdatedEnabled() != null)
            preferences.setPaymentMethodUpdatedEnabled(request.getPaymentMethodUpdatedEnabled());
        if (request.getPaymentMethodRemovedEnabled() != null)
            preferences.setPaymentMethodRemovedEnabled(request.getPaymentMethodRemovedEnabled());

        if (request.getCategoryCreatedEnabled() != null)
            preferences.setCategoryCreatedEnabled(request.getCategoryCreatedEnabled());
        if (request.getCategoryUpdatedEnabled() != null)
            preferences.setCategoryUpdatedEnabled(request.getCategoryUpdatedEnabled());
        if (request.getCategoryDeletedEnabled() != null)
            preferences.setCategoryDeletedEnabled(request.getCategoryDeletedEnabled());
        if (request.getCategoryBudgetExceededEnabled() != null)
            preferences.setCategoryBudgetExceededEnabled(request.getCategoryBudgetExceededEnabled());

        if (request.getFriendRequestReceivedEnabled() != null)
            preferences.setFriendRequestReceivedEnabled(request.getFriendRequestReceivedEnabled());
        if (request.getFriendRequestAcceptedEnabled() != null)
            preferences.setFriendRequestAcceptedEnabled(request.getFriendRequestAcceptedEnabled());
        if (request.getFriendRequestRejectedEnabled() != null)
            preferences.setFriendRequestRejectedEnabled(request.getFriendRequestRejectedEnabled());

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

        if (request.getWeeklySummaryEnabled() != null)
            preferences.setWeeklySummaryEnabled(request.getWeeklySummaryEnabled());
        if (request.getMonthlyReportEnabled() != null)
            preferences.setMonthlyReportEnabled(request.getMonthlyReportEnabled());
        if (request.getSpendingTrendAlertEnabled() != null)
            preferences.setSpendingTrendAlertEnabled(request.getSpendingTrendAlertEnabled());

        if (request.getSecurityAlertEnabled() != null)
            preferences.setSecurityAlertEnabled(request.getSecurityAlertEnabled());
        if (request.getAppUpdateEnabled() != null)
            preferences.setAppUpdateEnabled(request.getAppUpdateEnabled());
        if (request.getMaintenanceNoticeEnabled() != null)
            preferences.setMaintenanceNoticeEnabled(request.getMaintenanceNoticeEnabled());

        if (request.getNotificationPreferencesJson() != null)
            preferences.setNotificationPreferencesJson(request.getNotificationPreferencesJson());
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

    private NotificationPreferencesResponseDTO mapToDTO(NotificationPreferences preferences) {
        return NotificationPreferencesResponseDTO.builder()
                .userId(preferences.getUserId())
                .masterEnabled(preferences.getMasterEnabled())
                .doNotDisturb(preferences.getDoNotDisturb())
                .notificationSound(preferences.getNotificationSound())
                .browserNotifications(preferences.getBrowserNotifications())
                .floatingNotifications(preferences.getFloatingNotifications())
                .expenseServiceEnabled(preferences.getExpenseServiceEnabled())
                .budgetServiceEnabled(preferences.getBudgetServiceEnabled())
                .billServiceEnabled(preferences.getBillServiceEnabled())
                .categoryServiceEnabled(preferences.getCategoryServiceEnabled())
                .paymentMethodServiceEnabled(preferences.getPaymentMethodServiceEnabled())
                .friendServiceEnabled(preferences.getFriendServiceEnabled())
                .friendActivityServiceEnabled(preferences.getFriendActivityServiceEnabled())
                .analyticsServiceEnabled(preferences.getAnalyticsServiceEnabled())
                .systemNotificationsEnabled(preferences.getSystemNotificationsEnabled())
                .expenseAddedEnabled(preferences.getExpenseAddedEnabled())
                .expenseUpdatedEnabled(preferences.getExpenseUpdatedEnabled())
                .expenseDeletedEnabled(preferences.getExpenseDeletedEnabled())
                .largeExpenseAlertEnabled(preferences.getLargeExpenseAlertEnabled())
                .budgetExceededEnabled(preferences.getBudgetExceededEnabled())
                .budgetWarningEnabled(preferences.getBudgetWarningEnabled())
                .budgetLimitApproachingEnabled(preferences.getBudgetLimitApproachingEnabled())
                .budgetCreatedEnabled(preferences.getBudgetCreatedEnabled())
                .budgetUpdatedEnabled(preferences.getBudgetUpdatedEnabled())
                .budgetDeletedEnabled(preferences.getBudgetDeletedEnabled())
                .billAddedEnabled(preferences.getBillAddedEnabled())
                .billUpdatedEnabled(preferences.getBillUpdatedEnabled())
                .billDeletedEnabled(preferences.getBillDeletedEnabled())
                .billDueReminderEnabled(preferences.getBillDueReminderEnabled())
                .billOverdueEnabled(preferences.getBillOverdueEnabled())
                .billPaidEnabled(preferences.getBillPaidEnabled())
                .paymentMethodAddedEnabled(preferences.getPaymentMethodAddedEnabled())
                .paymentMethodUpdatedEnabled(preferences.getPaymentMethodUpdatedEnabled())
                .paymentMethodRemovedEnabled(preferences.getPaymentMethodRemovedEnabled())
                .categoryCreatedEnabled(preferences.getCategoryCreatedEnabled())
                .categoryUpdatedEnabled(preferences.getCategoryUpdatedEnabled())
                .categoryDeletedEnabled(preferences.getCategoryDeletedEnabled())
                .categoryBudgetExceededEnabled(preferences.getCategoryBudgetExceededEnabled())
                .friendRequestReceivedEnabled(preferences.getFriendRequestReceivedEnabled())
                .friendRequestAcceptedEnabled(preferences.getFriendRequestAcceptedEnabled())
                .friendRequestRejectedEnabled(preferences.getFriendRequestRejectedEnabled())
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
                .weeklySummaryEnabled(preferences.getWeeklySummaryEnabled())
                .monthlyReportEnabled(preferences.getMonthlyReportEnabled())
                .spendingTrendAlertEnabled(preferences.getSpendingTrendAlertEnabled())
                .securityAlertEnabled(preferences.getSecurityAlertEnabled())
                .appUpdateEnabled(preferences.getAppUpdateEnabled())
                .maintenanceNoticeEnabled(preferences.getMaintenanceNoticeEnabled())
                .notificationPreferencesJson(preferences.getNotificationPreferencesJson())
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
