package com.jaya.modal;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "notification_preferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreferences {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Integer userId;

    @Builder.Default
    @Column(name = "master_enabled", nullable = false)
    private Boolean masterEnabled = true;

    @Builder.Default
    @Column(name = "do_not_disturb", nullable = false)
    private Boolean doNotDisturb = false;

    @Builder.Default
    @Column(name = "notification_sound", nullable = false)
    private Boolean notificationSound = true;

    @Builder.Default
    @Column(name = "browser_notifications", nullable = false)
    private Boolean browserNotifications = false;

    @Builder.Default
    @Column(name = "floating_notifications", nullable = false)
    private Boolean floatingNotifications = true;

    @Builder.Default
    @Column(name = "expense_service_enabled", nullable = false)
    private Boolean expenseServiceEnabled = true;

    @Builder.Default
    @Column(name = "budget_service_enabled", nullable = false)
    private Boolean budgetServiceEnabled = true;

    @Builder.Default
    @Column(name = "bill_service_enabled", nullable = false)
    private Boolean billServiceEnabled = true;

    @Builder.Default
    @Column(name = "category_service_enabled", nullable = false)
    private Boolean categoryServiceEnabled = true;

    @Builder.Default
    @Column(name = "payment_method_service_enabled", nullable = false)
    private Boolean paymentMethodServiceEnabled = true;

    @Builder.Default
    @Column(name = "friend_service_enabled", nullable = false)
    private Boolean friendServiceEnabled = true;

    @Builder.Default
    @Column(name = "friend_activity_service_enabled", nullable = false)
    private Boolean friendActivityServiceEnabled = true;

    @Builder.Default
    @Column(name = "analytics_service_enabled", nullable = false)
    private Boolean analyticsServiceEnabled = true;

    @Builder.Default
    @Column(name = "system_notifications_enabled", nullable = false)
    private Boolean systemNotificationsEnabled = true;

    @Builder.Default
    @Column(name = "expense_added_enabled", nullable = false)
    private Boolean expenseAddedEnabled = true;

    @Builder.Default
    @Column(name = "expense_updated_enabled", nullable = false)
    private Boolean expenseUpdatedEnabled = true;

    @Builder.Default
    @Column(name = "expense_deleted_enabled", nullable = false)
    private Boolean expenseDeletedEnabled = false;

    @Builder.Default
    @Column(name = "large_expense_alert_enabled", nullable = false)
    private Boolean largeExpenseAlertEnabled = true;

    @Builder.Default
    @Column(name = "budget_exceeded_enabled", nullable = false)
    private Boolean budgetExceededEnabled = true;

    @Builder.Default
    @Column(name = "budget_warning_enabled", nullable = false)
    private Boolean budgetWarningEnabled = true;

    @Builder.Default
    @Column(name = "budget_limit_approaching_enabled", nullable = false)
    private Boolean budgetLimitApproachingEnabled = true;

    @Builder.Default
    @Column(name = "budget_created_enabled", nullable = false)
    private Boolean budgetCreatedEnabled = true;

    @Builder.Default
    @Column(name = "budget_updated_enabled", nullable = false)
    private Boolean budgetUpdatedEnabled = false;

    @Builder.Default
    @Column(name = "budget_deleted_enabled", nullable = false)
    private Boolean budgetDeletedEnabled = false;

    @Builder.Default
    @Column(name = "bill_added_enabled", nullable = false)
    private Boolean billAddedEnabled = true;

    @Builder.Default
    @Column(name = "bill_updated_enabled", nullable = false)
    private Boolean billUpdatedEnabled = true;

    @Builder.Default
    @Column(name = "bill_deleted_enabled", nullable = false)
    private Boolean billDeletedEnabled = false;

    @Builder.Default
    @Column(name = "bill_due_reminder_enabled", nullable = false)
    private Boolean billDueReminderEnabled = true;

    @Builder.Default
    @Column(name = "bill_overdue_enabled", nullable = false)
    private Boolean billOverdueEnabled = true;

    @Builder.Default
    @Column(name = "bill_paid_enabled", nullable = false)
    private Boolean billPaidEnabled = true;

    @Builder.Default
    @Column(name = "payment_method_added_enabled", nullable = false)
    private Boolean paymentMethodAddedEnabled = true;

    @Builder.Default
    @Column(name = "payment_method_updated_enabled", nullable = false)
    private Boolean paymentMethodUpdatedEnabled = true;

    @Builder.Default
    @Column(name = "payment_method_removed_enabled", nullable = false)
    private Boolean paymentMethodRemovedEnabled = true;

    @Builder.Default
    @Column(name = "category_created_enabled", nullable = false)
    private Boolean categoryCreatedEnabled = true;

    @Builder.Default
    @Column(name = "category_updated_enabled", nullable = false)
    private Boolean categoryUpdatedEnabled = false;

    @Builder.Default
    @Column(name = "category_deleted_enabled", nullable = false)
    private Boolean categoryDeletedEnabled = false;

    @Builder.Default
    @Column(name = "category_budget_exceeded_enabled", nullable = false)
    private Boolean categoryBudgetExceededEnabled = true;

    @Builder.Default
    @Column(name = "friend_request_received_enabled", nullable = false)
    private Boolean friendRequestReceivedEnabled = true;

    @Builder.Default
    @Column(name = "friend_request_accepted_enabled", nullable = false)
    private Boolean friendRequestAcceptedEnabled = true;

    @Builder.Default
    @Column(name = "friend_request_rejected_enabled", nullable = false)
    private Boolean friendRequestRejectedEnabled = false;

    @Builder.Default
    @Column(name = "friend_request_sent_enabled", nullable = false)
    private Boolean friendRequestSentEnabled = false;

    @Builder.Default
    @Column(name = "friend_request_cancelled_enabled", nullable = false)
    private Boolean friendRequestCancelledEnabled = true;

    @Builder.Default
    @Column(name = "friend_removed_enabled", nullable = false)
    private Boolean friendRemovedEnabled = true;

    @Builder.Default
    @Column(name = "access_level_changed_enabled", nullable = false)
    private Boolean accessLevelChangedEnabled = true;

    @Builder.Default
    @Column(name = "user_blocked_enabled", nullable = false)
    private Boolean userBlockedEnabled = false;

    @Builder.Default
    @Column(name = "user_unblocked_enabled", nullable = false)
    private Boolean userUnblockedEnabled = true;

    @Builder.Default
    @Column(name = "friend_expense_created_enabled", nullable = false)
    private Boolean friendExpenseCreatedEnabled = true;

    @Builder.Default
    @Column(name = "friend_expense_updated_enabled", nullable = false)
    private Boolean friendExpenseUpdatedEnabled = true;

    @Builder.Default
    @Column(name = "friend_expense_deleted_enabled", nullable = false)
    private Boolean friendExpenseDeletedEnabled = true;

    @Builder.Default
    @Column(name = "friend_category_created_enabled", nullable = false)
    private Boolean friendCategoryCreatedEnabled = true;

    @Builder.Default
    @Column(name = "friend_category_updated_enabled", nullable = false)
    private Boolean friendCategoryUpdatedEnabled = true;

    @Builder.Default
    @Column(name = "friend_category_deleted_enabled", nullable = false)
    private Boolean friendCategoryDeletedEnabled = true;

    @Builder.Default
    @Column(name = "friend_bill_created_enabled", nullable = false)
    private Boolean friendBillCreatedEnabled = true;

    @Builder.Default
    @Column(name = "friend_bill_updated_enabled", nullable = false)
    private Boolean friendBillUpdatedEnabled = true;

    @Builder.Default
    @Column(name = "friend_bill_deleted_enabled", nullable = false)
    private Boolean friendBillDeletedEnabled = true;

    @Builder.Default
    @Column(name = "friend_budget_created_enabled", nullable = false)
    private Boolean friendBudgetCreatedEnabled = true;

    @Builder.Default
    @Column(name = "friend_budget_updated_enabled", nullable = false)
    private Boolean friendBudgetUpdatedEnabled = true;

    @Builder.Default
    @Column(name = "friend_budget_deleted_enabled", nullable = false)
    private Boolean friendBudgetDeletedEnabled = true;

    @Builder.Default
    @Column(name = "friend_payment_method_created_enabled", nullable = false)
    private Boolean friendPaymentMethodCreatedEnabled = true;

    @Builder.Default
    @Column(name = "friend_payment_method_updated_enabled", nullable = false)
    private Boolean friendPaymentMethodUpdatedEnabled = true;

    @Builder.Default
    @Column(name = "friend_payment_method_deleted_enabled", nullable = false)
    private Boolean friendPaymentMethodDeletedEnabled = true;

    @Builder.Default
    @Column(name = "weekly_summary_enabled", nullable = false)
    private Boolean weeklySummaryEnabled = true;

    @Builder.Default
    @Column(name = "monthly_report_enabled", nullable = false)
    private Boolean monthlyReportEnabled = true;

    @Builder.Default
    @Column(name = "spending_trend_alert_enabled", nullable = false)
    private Boolean spendingTrendAlertEnabled = true;

    @Builder.Default
    @Column(name = "security_alert_enabled", nullable = false)
    private Boolean securityAlertEnabled = true;

    @Builder.Default
    @Column(name = "app_update_enabled", nullable = false)
    private Boolean appUpdateEnabled = true;

    @Builder.Default
    @Column(name = "maintenance_notice_enabled", nullable = false)
    private Boolean maintenanceNoticeEnabled = true;

    @Column(name = "notification_preferences_json", columnDefinition = "TEXT")
    private String notificationPreferencesJson;

    @Builder.Default
    @Column(name = "budget_alerts_enabled", nullable = false)
    private Boolean budgetAlertsEnabled = true;

    @Builder.Default
    @Column(name = "daily_reminders_enabled", nullable = false)
    private Boolean dailyRemindersEnabled = true;

    @Builder.Default
    @Column(name = "weekly_reports_enabled", nullable = false)
    private Boolean weeklyReportsEnabled = true;

    @Builder.Default
    @Column(name = "monthly_summary_enabled", nullable = false)
    private Boolean monthlySummaryEnabled = true;

    @Builder.Default
    @Column(name = "goal_notifications_enabled", nullable = false)
    private Boolean goalNotificationsEnabled = true;

    @Builder.Default
    @Column(name = "unusual_spending_alerts", nullable = false)
    private Boolean unusualSpendingAlerts = true;

    @Builder.Default
    @Column(name = "email_notifications", nullable = false)
    private Boolean emailNotifications = true;

    @Builder.Default
    @Column(name = "sms_notifications", nullable = false)
    private Boolean smsNotifications = false;

    @Builder.Default
    @Column(name = "push_notifications", nullable = false)
    private Boolean pushNotifications = true;

    @Builder.Default
    @Column(name = "in_app_notifications", nullable = false)
    private Boolean inAppNotifications = true;

    @Builder.Default
    @Column(name = "budget_warning_threshold", nullable = false)
    private Double budgetWarningThreshold = 80.0;
}