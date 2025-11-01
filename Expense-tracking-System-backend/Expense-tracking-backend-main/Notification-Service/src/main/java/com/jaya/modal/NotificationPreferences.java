package com.jaya.modal;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.DynamicUpdate;

/**
 * NotificationPreferences Entity
 * Stores comprehensive notification settings for each user
 * Supports multi-level configuration: global, service-level, and
 * notification-level
 * 
 * Architecture:
 * - Master toggle for all notifications
 * - Global settings (DND, sound, browser notifications)
 * - Service-specific toggles (expense, budget, bill, etc.)
 * - Individual notification type preferences
 * - Delivery method preferences (in-app, email, push, SMS)
 * - Frequency settings (instant, hourly, daily, weekly)
 * 
 * Performance Optimization:
 * - @DynamicUpdate: Only updates modified fields in SQL query
 */
@Entity
@Table(name = "notification_preferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
// @DynamicUpdate
public class NotificationPreferences {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Integer userId;

    // ============================================
    // GLOBAL SETTINGS
    // ============================================

    @Column(name = "master_enabled", nullable = false)
    private Boolean masterEnabled = true;

    @Column(name = "do_not_disturb", nullable = false)
    private Boolean doNotDisturb = false;

    @Column(name = "notification_sound", nullable = false)
    private Boolean notificationSound = true;

    @Column(name = "browser_notifications", nullable = false)
    private Boolean browserNotifications = false;

    // ============================================
    // SERVICE-LEVEL TOGGLES
    // ============================================

    @Column(name = "expense_service_enabled", nullable = false)
    private Boolean expenseServiceEnabled = true;

    @Column(name = "budget_service_enabled", nullable = false)
    private Boolean budgetServiceEnabled = true;

    @Column(name = "bill_service_enabled", nullable = false)
    private Boolean billServiceEnabled = true;

    @Column(name = "payment_method_service_enabled", nullable = false)
    private Boolean paymentMethodServiceEnabled = true;

    @Column(name = "friend_service_enabled", nullable = false)
    private Boolean friendServiceEnabled = true;

    @Column(name = "analytics_service_enabled", nullable = false)
    private Boolean analyticsServiceEnabled = true;

    @Column(name = "system_notifications_enabled", nullable = false)
    private Boolean systemNotificationsEnabled = true;

    // ============================================
    // EXPENSE SERVICE NOTIFICATIONS
    // ============================================

    @Column(name = "expense_added_enabled", nullable = false)
    private Boolean expenseAddedEnabled = true;

    @Column(name = "expense_updated_enabled", nullable = false)
    private Boolean expenseUpdatedEnabled = true;

    @Column(name = "expense_deleted_enabled", nullable = false)
    private Boolean expenseDeletedEnabled = false;

    @Column(name = "large_expense_alert_enabled", nullable = false)
    private Boolean largeExpenseAlertEnabled = true;

    // ============================================
    // BUDGET SERVICE NOTIFICATIONS
    // ============================================

    @Column(name = "budget_exceeded_enabled", nullable = false)
    private Boolean budgetExceededEnabled = true;

    @Column(name = "budget_warning_enabled", nullable = false)
    private Boolean budgetWarningEnabled = true;

    @Column(name = "budget_limit_approaching_enabled", nullable = false)
    private Boolean budgetLimitApproachingEnabled = true;

    @Column(name = "budget_created_enabled", nullable = false)
    private Boolean budgetCreatedEnabled = true;

    @Column(name = "budget_updated_enabled", nullable = false)
    private Boolean budgetUpdatedEnabled = false;

    @Column(name = "budget_deleted_enabled", nullable = false)
    private Boolean budgetDeletedEnabled = false;

    // ============================================
    // BILL SERVICE NOTIFICATIONS
    // ============================================

    @Column(name = "bill_added_enabled", nullable = false)
    private Boolean billAddedEnabled = true;

    @Column(name = "bill_updated_enabled", nullable = false)
    private Boolean billUpdatedEnabled = true;

    @Column(name = "bill_deleted_enabled", nullable = false)
    private Boolean billDeletedEnabled = false;

    @Column(name = "bill_due_reminder_enabled", nullable = false)
    private Boolean billDueReminderEnabled = true;

    @Column(name = "bill_overdue_enabled", nullable = false)
    private Boolean billOverdueEnabled = true;

    @Column(name = "bill_paid_enabled", nullable = false)
    private Boolean billPaidEnabled = true;

    // ============================================
    // PAYMENT METHOD SERVICE NOTIFICATIONS
    // ============================================

    @Column(name = "payment_method_added_enabled", nullable = false)
    private Boolean paymentMethodAddedEnabled = true;

    @Column(name = "payment_method_updated_enabled", nullable = false)
    private Boolean paymentMethodUpdatedEnabled = true;

    @Column(name = "payment_method_removed_enabled", nullable = false)
    private Boolean paymentMethodRemovedEnabled = true;

    // ============================================
    // FRIEND SERVICE NOTIFICATIONS
    // ============================================

    @Column(name = "friend_request_received_enabled", nullable = false)
    private Boolean friendRequestReceivedEnabled = true;

    @Column(name = "friend_request_accepted_enabled", nullable = false)
    private Boolean friendRequestAcceptedEnabled = true;

    @Column(name = "friend_request_rejected_enabled", nullable = false)
    private Boolean friendRequestRejectedEnabled = false;

    // ============================================
    // ANALYTICS SERVICE NOTIFICATIONS
    // ============================================

    @Column(name = "weekly_summary_enabled", nullable = false)
    private Boolean weeklySummaryEnabled = true;

    @Column(name = "monthly_report_enabled", nullable = false)
    private Boolean monthlyReportEnabled = true;

    @Column(name = "spending_trend_alert_enabled", nullable = false)
    private Boolean spendingTrendAlertEnabled = true;

    // ============================================
    // SYSTEM NOTIFICATIONS
    // ============================================

    @Column(name = "security_alert_enabled", nullable = false)
    private Boolean securityAlertEnabled = true;

    @Column(name = "app_update_enabled", nullable = false)
    private Boolean appUpdateEnabled = true;

    @Column(name = "maintenance_notice_enabled", nullable = false)
    private Boolean maintenanceNoticeEnabled = true;

    // ============================================
    // DELIVERY METHODS (JSON format for flexibility)
    // ============================================

    @Column(name = "notification_preferences_json", columnDefinition = "TEXT")
    private String notificationPreferencesJson;

    // ============================================
    // LEGACY FIELDS (Keep for backward compatibility)
    // ============================================

    @Column(name = "budget_alerts_enabled", nullable = false)
    private Boolean budgetAlertsEnabled = true;

    @Column(name = "daily_reminders_enabled", nullable = false)
    private Boolean dailyRemindersEnabled = true;

    @Column(name = "weekly_reports_enabled", nullable = false)
    private Boolean weeklyReportsEnabled = true;

    @Column(name = "monthly_summary_enabled", nullable = false)
    private Boolean monthlySummaryEnabled = true;

    @Column(name = "goal_notifications_enabled", nullable = false)
    private Boolean goalNotificationsEnabled = true;

    @Column(name = "unusual_spending_alerts", nullable = false)
    private Boolean unusualSpendingAlerts = true;

    @Column(name = "email_notifications", nullable = false)
    private Boolean emailNotifications = true;

    @Column(name = "sms_notifications", nullable = false)
    private Boolean smsNotifications = false;

    @Column(name = "push_notifications", nullable = false)
    private Boolean pushNotifications = true;

    @Column(name = "in_app_notifications", nullable = false)
    private Boolean inAppNotifications = true;

    @Column(name = "budget_warning_threshold", nullable = false)
    private Double budgetWarningThreshold = 80.0; // 80% of budget
}