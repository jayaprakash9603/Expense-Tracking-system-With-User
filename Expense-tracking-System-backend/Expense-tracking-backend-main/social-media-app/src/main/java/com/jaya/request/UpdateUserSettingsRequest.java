package com.jaya.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * UpdateUserSettingsRequest - Request DTO for updating user settings
 * 
 * Design Pattern: Request DTO Pattern
 * Purpose: Validates incoming request data before processing
 * Benefits: Input validation, clear API contract, separation of concerns
 * 
 * Note: All fields are optional to support partial updates
 * Only provided fields will be updated
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateUserSettingsRequest {

    // ==================== APPEARANCE SETTINGS ====================
    @JsonProperty("themeMode")
    @JsonAlias({ "theme", "theme_mode" })
    @Pattern(regexp = "^(dark|light)$", message = "Theme mode must be either 'dark' or 'light'")
    private String themeMode;

    @JsonProperty("fontSize")
    @JsonAlias("font_size")
    @Pattern(regexp = "^(small|medium|large|extra-large)$", message = "Font size must be one of: small, medium, large, extra-large")
    private String fontSize;

    @JsonProperty("compactMode")
    @JsonAlias("compact_mode")
    private Boolean compactMode;

    @JsonProperty("animations")
    private Boolean animations;

    @JsonProperty("highContrast")
    @JsonAlias("high_contrast")
    private Boolean highContrast;

    // ==================== NOTIFICATION SETTINGS ====================
    @JsonProperty("emailNotifications")
    @JsonAlias("email_notifications")
    private Boolean emailNotifications;

    @JsonProperty("budgetAlerts")
    @JsonAlias("budget_alerts")
    private Boolean budgetAlerts;

    @JsonProperty("weeklyReports")
    @JsonAlias("weekly_reports")
    private Boolean weeklyReports;

    @JsonProperty("pushNotifications")
    @JsonAlias("push_notifications")
    private Boolean pushNotifications;

    @JsonProperty("friendRequestNotifications")
    @JsonAlias("friend_request_notifications")
    private Boolean friendRequestNotifications;

    // ==================== PREFERENCE SETTINGS ====================
    @JsonProperty("language")
    @Pattern(regexp = "^(en|es|fr|de|hi)$", message = "Language must be one of: en, es, fr, de, hi")
    private String language;

    @JsonProperty("currency")
    @Pattern(regexp = "^(USD|EUR|GBP|INR|JPY)$", message = "Currency must be one of: USD, EUR, GBP, INR, JPY")
    private String currency;

    @JsonProperty("dateFormat")
    @JsonAlias("date_format")
    @Pattern(regexp = "^(MM/DD/YYYY|DD/MM/YYYY|YYYY-MM-DD)$", message = "Date format must be one of: MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD")
    private String dateFormat;

    @JsonProperty("timeFormat")
    @JsonAlias("time_format")
    @Pattern(regexp = "^(12h|24h)$", message = "Time format must be either '12h' or '24h'")
    private String timeFormat;

    // ==================== PRIVACY & SECURITY SETTINGS ====================
    @JsonProperty("profileVisibility")
    @JsonAlias("profile_visibility")
    @Pattern(regexp = "^(PUBLIC|FRIENDS|PRIVATE)$", message = "Profile visibility must be one of: PUBLIC, FRIENDS, PRIVATE")
    private String profileVisibility;

    @JsonProperty("twoFactorEnabled")
    @JsonAlias("two_factor_enabled")
    private Boolean twoFactorEnabled;

    @JsonProperty("sessionTimeout")
    @JsonAlias("session_timeout")
    private Boolean sessionTimeout;

    @JsonProperty("maskSensitiveData")
    @JsonAlias("mask_sensitive_data")
    private Boolean maskSensitiveData;

    // ==================== DATA & STORAGE SETTINGS ====================
    @JsonProperty("autoBackup")
    @JsonAlias("auto_backup")
    private Boolean autoBackup;

    @JsonProperty("backupFrequency")
    @JsonAlias("backup_frequency")
    @Pattern(regexp = "^(daily|weekly|monthly|manual)$", message = "Backup frequency must be one of: daily, weekly, monthly, manual")
    private String backupFrequency;

    @JsonProperty("cloudSync")
    @JsonAlias("cloud_sync")
    private Boolean cloudSync;

    // ==================== SMART FEATURES SETTINGS ====================
    @JsonProperty("autoCategorize")
    @JsonAlias("auto_categorize")
    private Boolean autoCategorize;

    @JsonProperty("smartBudgeting")
    @JsonAlias("smart_budgeting")
    private Boolean smartBudgeting;

    @JsonProperty("scheduledReports")
    @JsonAlias("scheduled_reports")
    @Pattern(regexp = "^(daily|weekly|monthly|none)$", message = "Scheduled reports must be one of: daily, weekly, monthly, none")
    private String scheduledReports;

    @JsonProperty("expenseReminders")
    @JsonAlias("expense_reminders")
    private Boolean expenseReminders;

    @JsonProperty("predictiveAnalytics")
    @JsonAlias("predictive_analytics")
    private Boolean predictiveAnalytics;

    // ==================== ACCESSIBILITY SETTINGS ====================
    @JsonProperty("screenReader")
    @JsonAlias("screen_reader")
    private Boolean screenReader;

    @JsonProperty("keyboardShortcuts")
    @JsonAlias("keyboard_shortcuts")
    private Boolean keyboardShortcuts;

    @JsonProperty("reduceMotion")
    @JsonAlias("reduce_motion")
    private Boolean reduceMotion;

    @JsonProperty("focusIndicators")
    @JsonAlias("focus_indicators")
    private Boolean focusIndicators;
}
