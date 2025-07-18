package com.jaya.modal;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "notification_preferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreferences {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Integer userId;

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