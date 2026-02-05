package com.jaya.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreferencesResponseDTO {

    private Integer userId;

    private Boolean masterEnabled;
    private Boolean doNotDisturb;
    private Boolean notificationSound;
    private Boolean browserNotifications;
    private Boolean floatingNotifications;

    private Boolean expenseServiceEnabled;
    private Boolean budgetServiceEnabled;
    private Boolean billServiceEnabled;
    private Boolean categoryServiceEnabled;
    private Boolean paymentMethodServiceEnabled;
    private Boolean friendServiceEnabled;
    private Boolean friendActivityServiceEnabled;
    private Boolean analyticsServiceEnabled;
    private Boolean systemNotificationsEnabled;

    private Boolean expenseAddedEnabled;
    private Boolean expenseUpdatedEnabled;
    private Boolean expenseDeletedEnabled;
    private Boolean largeExpenseAlertEnabled;

    private Boolean budgetExceededEnabled;
    private Boolean budgetWarningEnabled;
    private Boolean budgetLimitApproachingEnabled;
    private Boolean budgetCreatedEnabled;
    private Boolean budgetUpdatedEnabled;
    private Boolean budgetDeletedEnabled;

    private Boolean billAddedEnabled;
    private Boolean billUpdatedEnabled;
    private Boolean billDeletedEnabled;
    private Boolean billDueReminderEnabled;
    private Boolean billOverdueEnabled;
    private Boolean billPaidEnabled;

    private Boolean paymentMethodAddedEnabled;
    private Boolean paymentMethodUpdatedEnabled;
    private Boolean paymentMethodRemovedEnabled;

    private Boolean categoryCreatedEnabled;
    private Boolean categoryUpdatedEnabled;
    private Boolean categoryDeletedEnabled;
    private Boolean categoryBudgetExceededEnabled;

    private Boolean friendRequestReceivedEnabled;
    private Boolean friendRequestAcceptedEnabled;
    private Boolean friendRequestRejectedEnabled;
    private Boolean friendRequestSentEnabled;
    private Boolean friendRequestCancelledEnabled;
    private Boolean friendRemovedEnabled;
    private Boolean accessLevelChangedEnabled;
    private Boolean userBlockedEnabled;
    private Boolean userUnblockedEnabled;

    private Boolean friendExpenseCreatedEnabled;
    private Boolean friendExpenseUpdatedEnabled;
    private Boolean friendExpenseDeletedEnabled;
    private Boolean friendCategoryCreatedEnabled;
    private Boolean friendCategoryUpdatedEnabled;
    private Boolean friendCategoryDeletedEnabled;
    private Boolean friendBillCreatedEnabled;
    private Boolean friendBillUpdatedEnabled;
    private Boolean friendBillDeletedEnabled;
    private Boolean friendBudgetCreatedEnabled;
    private Boolean friendBudgetUpdatedEnabled;
    private Boolean friendBudgetDeletedEnabled;
    private Boolean friendPaymentMethodCreatedEnabled;
    private Boolean friendPaymentMethodUpdatedEnabled;
    private Boolean friendPaymentMethodDeletedEnabled;

    private Boolean weeklySummaryEnabled;
    private Boolean monthlyReportEnabled;
    private Boolean spendingTrendAlertEnabled;

    private Boolean securityAlertEnabled;
    private Boolean appUpdateEnabled;
    private Boolean maintenanceNoticeEnabled;

    private String notificationPreferencesJson;

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
