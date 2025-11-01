package com.jaya.modal;

/**
 * Notification Types for all events in the Expense Tracking System
 * Categorized by service and event type
 */
public enum NotificationType {
    // Budget Notifications
    BUDGET_EXCEEDED,
    BUDGET_WARNING,
    BUDGET_CREATED,
    BUDGET_UPDATED,
    BUDGET_DELETED,
    BUDGET_LIMIT_APPROACHING,

    // Expense Notifications
    EXPENSE_ADDED,
    EXPENSE_UPDATED,
    EXPENSE_DELETED,
    EXPENSE_APPROVED,
    EXPENSE_REJECTED,
    UNUSUAL_SPENDING,
    EXPENSE_LIMIT_REACHED,

    // Bill Notifications
    BILL_CREATED,
    BILL_UPDATED,
    BILL_DELETED,
    BILL_DUE_REMINDER,
    BILL_OVERDUE,
    BILL_PAID,
    PAYMENT_DUE,

    // Category Notifications
    CATEGORY_CREATED,
    CATEGORY_UPDATED,
    CATEGORY_DELETED,
    CATEGORY_BUDGET_EXCEEDED,

    // Payment Method Notifications
    PAYMENT_METHOD_ADDED,
    PAYMENT_METHOD_UPDATED,
    PAYMENT_METHOD_DELETED,
    PAYMENT_METHOD_VERIFIED,

    // Friend/Social Notifications
    FRIEND_REQUEST_RECEIVED,
    FRIEND_REQUEST_ACCEPTED,
    FRIEND_REQUEST_REJECTED,
    FRIEND_REMOVED,
    FRIEND_INVITATION_SENT,

    // Report & Summary Notifications
    MONTHLY_SUMMARY,
    WEEKLY_REPORT,
    DAILY_REMINDER,
    YEARLY_REPORT,

    // Goal & Achievement Notifications
    GOAL_ACHIEVEMENT,
    SAVINGS_MILESTONE,
    SPENDING_GOAL_MET,

    // System Notifications
    CUSTOM_ALERT,
    INACTIVITY_REMINDER,
    SUBSCRIPTION_RENEWAL,
    RECURRING_EXPENSE,
    ACCOUNT_UPDATED,
    SECURITY_ALERT,

    // Group Notifications (if applicable)
    GROUP_CREATED,
    GROUP_UPDATED,
    GROUP_MEMBER_ADDED,
    GROUP_MEMBER_REMOVED,
    GROUP_EXPENSE_SHARED,

    // Chat Notifications (if applicable)
    NEW_MESSAGE,
    MESSAGE_REPLY,
    MENTION_IN_CHAT
}
