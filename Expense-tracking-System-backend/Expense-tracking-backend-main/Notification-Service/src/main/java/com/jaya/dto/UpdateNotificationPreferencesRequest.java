package com.jaya.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * UpdateNotificationPreferencesRequest
 * DTO for updating notification preferences
 * Supports partial updates - all fields are optional
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateNotificationPreferencesRequest {

    // Global Settings
    private Boolean masterEnabled;
    private Boolean doNotDisturb;
    private Boolean notificationSound;
    private Boolean browserNotifications;

    // Service Level Toggles
    private Boolean expenseServiceEnabled;
    private Boolean budgetServiceEnabled;
    private Boolean billServiceEnabled;
    private Boolean paymentMethodServiceEnabled;
    private Boolean friendServiceEnabled;
    private Boolean analyticsServiceEnabled;
    private Boolean systemNotificationsEnabled;

    // Expense Service Notifications
    private Boolean expenseAddedEnabled;
    private Boolean expenseUpdatedEnabled;
    private Boolean expenseDeletedEnabled;
    private Boolean largeExpenseAlertEnabled;

    // Budget Service Notifications
    private Boolean budgetExceededEnabled;
    private Boolean budgetWarningEnabled;
    private Boolean budgetLimitApproachingEnabled;
    private Boolean budgetCreatedEnabled;
    private Boolean budgetUpdatedEnabled;

    // Bill Service Notifications
    private Boolean billAddedEnabled;
    private Boolean billUpdatedEnabled;
    private Boolean billDeletedEnabled;
    private Boolean billDueReminderEnabled;
    private Boolean billOverdueEnabled;
    private Boolean billPaidEnabled;

    // Payment Method Service Notifications
    private Boolean paymentMethodAddedEnabled;
    private Boolean paymentMethodUpdatedEnabled;
    private Boolean paymentMethodRemovedEnabled;

    // Friend Service Notifications
    private Boolean friendRequestReceivedEnabled;
    private Boolean friendRequestAcceptedEnabled;
    private Boolean friendRequestRejectedEnabled;

    // Analytics Service Notifications
    private Boolean weeklySummaryEnabled;
    private Boolean monthlyReportEnabled;
    private Boolean spendingTrendAlertEnabled;

    // System Notifications
    private Boolean securityAlertEnabled;
    private Boolean appUpdateEnabled;
    private Boolean maintenanceNoticeEnabled;

    // JSON Configuration
    private String notificationPreferencesJson;

    // Legacy fields
    private Boolean budgetAlertsEnabled;
    private Boolean dailyRemindersEnabled;
    private Boolean weeklyReportsEnabled;
    private Boolean monthlySummaryEnabled;
    private Boolean goalNotificationsEnabled;
    private Boolean unusualSpendingAlerts;
    private Boolean emailNotifications;
    private Boolean smsNotifications;
    private Boolean pushNotifications;
    private Boolean inAppNotifications;
    private Double budgetWarningThreshold;
}
