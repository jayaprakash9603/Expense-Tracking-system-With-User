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
    LARGE_EXPENSE_ALERT, // Added for large expense detection

    // Bill Notifications
    BILL_ADDED, // Added for bill creation
    BILL_CREATED,
    BILL_UPDATED,
    BILL_DELETED,
    BILL_REMINDER, // Added for bill reminders
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
    FRIEND_REQUEST_SENT, // Added for friend request sent
    FRIEND_REQUEST_RECEIVED,
    FRIEND_REQUEST_ACCEPTED,
    FRIEND_REQUEST_REJECTED,
    FRIEND_REQUEST_CANCELLED,
    FRIEND_REMOVED,
    FRIEND_INVITATION_SENT,
    ACCESS_LEVEL_CHANGED,
    USER_BLOCKED,
    USER_UNBLOCKED,
    DATA_SHARED, // Share data with friend notification

    // Friend Activity Notifications (actions performed by friends on user's behalf)
    // Expense
    FRIEND_EXPENSE_CREATED,
    FRIEND_EXPENSE_UPDATED,
    FRIEND_EXPENSE_DELETED,
    // Category
    FRIEND_CATEGORY_CREATED,
    FRIEND_CATEGORY_UPDATED,
    FRIEND_CATEGORY_DELETED,
    // Budget
    FRIEND_BUDGET_CREATED,
    FRIEND_BUDGET_UPDATED,
    FRIEND_BUDGET_DELETED,
    // Bill
    FRIEND_BILL_CREATED,
    FRIEND_BILL_UPDATED,
    FRIEND_BILL_DELETED,
    // Payment Method
    FRIEND_PAYMENT_METHOD_CREATED,
    FRIEND_PAYMENT_METHOD_UPDATED,
    FRIEND_PAYMENT_METHOD_DELETED,

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
