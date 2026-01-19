package com.jaya.service;

import com.jaya.modal.NotificationPreferences;
import com.jaya.repository.NotificationPreferencesRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Service responsible for checking if a notification should be sent
 * based on user preferences
 * 
 * Follows Single Responsibility Principle - Only handles preference checking
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationPreferencesChecker {

    private final NotificationPreferencesRepository preferencesRepository;

    /**
     * Check if notifications are enabled for a specific user and notification type
     * 
     * @param userId           User ID
     * @param notificationType Type of notification (e.g., "expenseAdded",
     *                         "budgetExceeded")
     * @return true if notification should be sent, false otherwise
     */
    public boolean shouldSendNotification(Integer userId, String notificationType) {
        try {
            NotificationPreferences preferences = preferencesRepository
                    .findByUserId(userId)
                    .orElse(null);

            // If no preferences found, send notification by default
            if (preferences == null) {
                log.debug("No preferences found for user {}. Sending notification by default.", userId);
                return true;
            }

            // Check master toggle first
            if (!preferences.getMasterEnabled()) {
                log.debug("Master notifications disabled for user {}. Skipping notification.", userId);
                return false;
            }

            // Check Do Not Disturb mode
            if (preferences.getDoNotDisturb()) {
                // Only send critical notifications in DND mode
                if (!isCriticalNotification(notificationType)) {
                    log.debug("Do Not Disturb enabled for user {}. Skipping non-critical notification.", userId);
                    return false;
                }
            }

            // Check specific notification type
            boolean isEnabled = isNotificationTypeEnabled(preferences, notificationType);

            if (!isEnabled) {
                log.debug("Notification type '{}' disabled for user {}. Skipping notification.",
                        notificationType, userId);
            }

            return isEnabled;

        } catch (Exception e) {
            log.error("Error checking notification preferences for user {}: {}", userId, e.getMessage(), e);
            // Default to sending notification if there's an error
            return true;
        }
    }

    /**
     * Check if a specific notification type is enabled in preferences
     */
    private boolean isNotificationTypeEnabled(NotificationPreferences prefs, String notificationType) {
        switch (notificationType) {
            // Expense Service Notifications
            case "expenseAdded":
                return prefs.getExpenseServiceEnabled() && prefs.getExpenseAddedEnabled();
            case "expenseUpdated":
                return prefs.getExpenseServiceEnabled() && prefs.getExpenseUpdatedEnabled();
            case "expenseDeleted":
                return prefs.getExpenseServiceEnabled() && prefs.getExpenseDeletedEnabled();
            case "largeExpenseAlert":
                return prefs.getExpenseServiceEnabled() && prefs.getLargeExpenseAlertEnabled();

            // Budget Service Notifications
            case "budgetExceeded":
                return prefs.getBudgetServiceEnabled() && prefs.getBudgetExceededEnabled();
            case "budgetWarning":
                return prefs.getBudgetServiceEnabled() && prefs.getBudgetWarningEnabled();
            case "budgetLimitApproaching":
                return prefs.getBudgetServiceEnabled() && prefs.getBudgetLimitApproachingEnabled();
            case "budgetCreated":
                return prefs.getBudgetServiceEnabled() && prefs.getBudgetCreatedEnabled();
            case "budgetUpdated":
                return prefs.getBudgetServiceEnabled() && prefs.getBudgetUpdatedEnabled();
            case "budgetDeleted":
                return prefs.getBudgetServiceEnabled() && prefs.getBudgetDeletedEnabled();

            // Bill Service Notifications
            case "billAdded":
                return prefs.getBillServiceEnabled() && prefs.getBillAddedEnabled();
            case "billUpdated":
                return prefs.getBillServiceEnabled() && prefs.getBillUpdatedEnabled();
            case "billDeleted":
                return prefs.getBillServiceEnabled() && prefs.getBillDeletedEnabled();
            case "billDueReminder":
                return prefs.getBillServiceEnabled() && prefs.getBillDueReminderEnabled();
            case "billOverdue":
                return prefs.getBillServiceEnabled() && prefs.getBillOverdueEnabled();
            case "billPaid":
                return prefs.getBillServiceEnabled() && prefs.getBillPaidEnabled();

            // Payment Method Service Notifications
            case "paymentMethodAdded":
                return prefs.getPaymentMethodServiceEnabled() && prefs.getPaymentMethodAddedEnabled();
            case "paymentMethodUpdated":
                return prefs.getPaymentMethodServiceEnabled() && prefs.getPaymentMethodUpdatedEnabled();
            case "paymentMethodRemoved":
                return prefs.getPaymentMethodServiceEnabled() && prefs.getPaymentMethodRemovedEnabled();

            // Friend Service Notifications
            case "friendRequestReceived":
                return prefs.getFriendServiceEnabled() && prefs.getFriendRequestReceivedEnabled();
            case "friendRequestAccepted":
                return prefs.getFriendServiceEnabled() && prefs.getFriendRequestAcceptedEnabled();
            case "friendRequestRejected":
                return prefs.getFriendServiceEnabled() && prefs.getFriendRequestRejectedEnabled();
            case "friendRequestSent":
                return prefs.getFriendServiceEnabled() && prefs.getFriendRequestSentEnabled();
            case "friendRequestCancelled":
                return prefs.getFriendServiceEnabled() && prefs.getFriendRequestCancelledEnabled();
            case "friendRemoved":
                return prefs.getFriendServiceEnabled() && prefs.getFriendRemovedEnabled();
            case "accessLevelChanged":
                return prefs.getFriendServiceEnabled() && prefs.getAccessLevelChangedEnabled();
            case "userBlocked":
                return prefs.getFriendServiceEnabled() && prefs.getUserBlockedEnabled();
            case "userUnblocked":
                return prefs.getFriendServiceEnabled() && prefs.getUserUnblockedEnabled();

            // Analytics Service Notifications
            case "weeklySummary":
                return prefs.getAnalyticsServiceEnabled() && prefs.getWeeklySummaryEnabled();
            case "monthlyReport":
                return prefs.getAnalyticsServiceEnabled() && prefs.getMonthlyReportEnabled();
            case "spendingTrendAlert":
                return prefs.getAnalyticsServiceEnabled() && prefs.getSpendingTrendAlertEnabled();

            // System Notifications
            case "securityAlert":
                return prefs.getSystemNotificationsEnabled() && prefs.getSecurityAlertEnabled();
            case "appUpdate":
                return prefs.getSystemNotificationsEnabled() && prefs.getAppUpdateEnabled();
            case "maintenanceNotice":
                return prefs.getSystemNotificationsEnabled() && prefs.getMaintenanceNoticeEnabled();

            // Friend Activity Service Notifications
            case "friendExpenseCreated":
                return prefs.getFriendActivityServiceEnabled() && prefs.getFriendExpenseCreatedEnabled();
            case "friendExpenseUpdated":
                return prefs.getFriendActivityServiceEnabled() && prefs.getFriendExpenseUpdatedEnabled();
            case "friendExpenseDeleted":
                return prefs.getFriendActivityServiceEnabled() && prefs.getFriendExpenseDeletedEnabled();
            case "friendCategoryCreated":
                return prefs.getFriendActivityServiceEnabled() && prefs.getFriendCategoryCreatedEnabled();
            case "friendCategoryUpdated":
                return prefs.getFriendActivityServiceEnabled() && prefs.getFriendCategoryUpdatedEnabled();
            case "friendCategoryDeleted":
                return prefs.getFriendActivityServiceEnabled() && prefs.getFriendCategoryDeletedEnabled();
            case "friendBillCreated":
                return prefs.getFriendActivityServiceEnabled() && prefs.getFriendBillCreatedEnabled();
            case "friendBillUpdated":
                return prefs.getFriendActivityServiceEnabled() && prefs.getFriendBillUpdatedEnabled();
            case "friendBillDeleted":
                return prefs.getFriendActivityServiceEnabled() && prefs.getFriendBillDeletedEnabled();
            case "friendBudgetCreated":
                return prefs.getFriendActivityServiceEnabled() && prefs.getFriendBudgetCreatedEnabled();
            case "friendBudgetUpdated":
                return prefs.getFriendActivityServiceEnabled() && prefs.getFriendBudgetUpdatedEnabled();
            case "friendBudgetDeleted":
                return prefs.getFriendActivityServiceEnabled() && prefs.getFriendBudgetDeletedEnabled();
            case "friendPaymentMethodCreated":
                return prefs.getFriendActivityServiceEnabled() && prefs.getFriendPaymentMethodCreatedEnabled();
            case "friendPaymentMethodUpdated":
                return prefs.getFriendActivityServiceEnabled() && prefs.getFriendPaymentMethodUpdatedEnabled();
            case "friendPaymentMethodDeleted":
                return prefs.getFriendActivityServiceEnabled() && prefs.getFriendPaymentMethodDeletedEnabled();

            default:
                log.warn("Unknown notification type: {}. Sending by default.", notificationType);
                return true;
        }
    }

    /**
     * Determine if a notification type is critical
     * Critical notifications bypass Do Not Disturb mode
     */
    private boolean isCriticalNotification(String notificationType) {
        return "budgetExceeded".equals(notificationType) ||
                "billOverdue".equals(notificationType) ||
                "securityAlert".equals(notificationType);
    }
}
