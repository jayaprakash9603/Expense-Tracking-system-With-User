package com.jaya.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreferencesDTO {

    private Integer id;
    private Integer userId;
    private Boolean budgetAlertsEnabled = true;
    private Boolean dailyRemindersEnabled = true;
    private Boolean weeklyReportsEnabled = true;
    private Boolean monthlySummaryEnabled = true;
    private Boolean goalNotificationsEnabled = true;
    private Boolean unusualSpendingAlerts = true;
    private Boolean emailNotifications = true;
    private Boolean smsNotifications = false;
    private Boolean pushNotifications = true;
    private Boolean inAppNotifications = true;
    private Double budgetWarningThreshold = 80.0;
    private String preferredNotificationTime = "09:00";
    private String timezone = "UTC";
    private Boolean weekendNotifications = true;
}