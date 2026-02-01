package com.jaya.models.enums;

/**
 * Story severity levels with corresponding visual indicators
 * Maps to colored rings in the UI (like Instagram stories)
 */
public enum StorySeverity {
    INFO("#3B82F6"), // Blue - informational updates
    SUCCESS("#10B981"), // Green - positive events (savings increased, etc.)
    WARNING("#F59E0B"), // Yellow - warnings (budget approaching limit)
    CRITICAL("#EF4444"); // Red - critical alerts (budget exceeded, bill overdue)

    private final String colorCode;

    StorySeverity(String colorCode) {
        this.colorCode = colorCode;
    }

    public String getColorCode() {
        return colorCode;
    }
}
