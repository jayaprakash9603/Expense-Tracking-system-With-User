package com.jaya.models.enums;

/**
 * Types of stories in the system
 */
public enum StoryType {
    // System-generated stories (automatic)
    BUDGET_THRESHOLD_80, // Budget crossed 80%
    BUDGET_THRESHOLD_90, // Budget crossed 90%
    BUDGET_THRESHOLD_100, // Budget exceeded 100%
    EXPENSE_SPIKE, // Unusual expense spike detected
    SAVINGS_UPDATE, // Savings increased or decreased
    BILL_REMINDER, // Upcoming bill due reminder
    BILL_OVERDUE, // Bill is overdue
    WEEKLY_SUMMARY, // Weekly expense summary
    MONTHLY_SUMMARY, // Monthly expense summary

    // Admin-generated stories (manual)
    FEATURE_ANNOUNCEMENT, // New feature announcements
    MAINTENANCE_ALERT, // Scheduled maintenance
    SYSTEM_NOTICE, // Important system notices
    PROMOTIONAL, // Promotional content
    TIP_OF_THE_DAY, // Financial tips
    TIP, // Daily financial tip
    ACHIEVEMENT, // Achievement/milestone story
    ANNOUNCEMENT, // General announcement
    SYSTEM_UPDATE, // System update notification
    SAVINGS_GOAL, // Savings goal update
    CUSTOM // Custom story type
}
