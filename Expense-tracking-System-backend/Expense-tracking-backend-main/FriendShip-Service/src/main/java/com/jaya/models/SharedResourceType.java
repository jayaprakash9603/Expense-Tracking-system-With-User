package com.jaya.models;

/**
 * Types of resources that can be shared via QR code.
 */
public enum SharedResourceType {
    EXPENSE, // Individual expense records
    CATEGORY, // Expense categories
    BUDGET, // Budget allocations
    GROUPED // Grouped data (multiple types combined)
}
