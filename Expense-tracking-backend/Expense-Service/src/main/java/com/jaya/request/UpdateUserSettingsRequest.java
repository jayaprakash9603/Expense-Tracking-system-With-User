package com.jaya.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.jaya.serialization.NullIfBlankDeserializer;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateUserSettingsRequest {

    @JsonProperty("themeMode")
    @JsonAlias({ "theme", "theme_mode" })
    @JsonDeserialize(using = NullIfBlankDeserializer.class)
    @Pattern(regexp = "^(dark|light)$", message = "Theme mode must be either 'dark' or 'light'")
    private String themeMode;

    @JsonProperty("fontSize")
    @JsonAlias("font_size")
    @JsonDeserialize(using = NullIfBlankDeserializer.class)
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

    @JsonProperty("language")
    @JsonDeserialize(using = NullIfBlankDeserializer.class)
    @Pattern(regexp = "^[a-z]{2}$", message = "Language must be a valid ISO 639-1 code (e.g., en, hi)")
    private String language;

    @JsonProperty("currency")
    @JsonDeserialize(using = NullIfBlankDeserializer.class)
    @Pattern(regexp = "^(USD|EUR|GBP|INR|JPY)$", message = "Currency must be one of: USD, EUR, GBP, INR, JPY")
    private String currency;

    @JsonProperty("dateFormat")
    @JsonAlias("date_format")
    @JsonDeserialize(using = NullIfBlankDeserializer.class)
    @Pattern(regexp = "^(MM/DD/YYYY|DD/MM/YYYY|YYYY-MM-DD)$", message = "Date format must be one of: MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD")
    private String dateFormat;

    @JsonProperty("timeFormat")
    @JsonAlias("time_format")
    @JsonDeserialize(using = NullIfBlankDeserializer.class)
    @Pattern(regexp = "^(12h|24h)$", message = "Time format must be either '12h' or '24h'")
    private String timeFormat;

    @JsonProperty("profileVisibility")
    @JsonAlias("profile_visibility")
    @JsonDeserialize(using = NullIfBlankDeserializer.class)
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

    @JsonProperty("autoBackup")
    @JsonAlias("auto_backup")
    private Boolean autoBackup;

    @JsonProperty("backupFrequency")
    @JsonAlias("backup_frequency")
    @JsonDeserialize(using = NullIfBlankDeserializer.class)
    @Pattern(regexp = "^(daily|weekly|monthly|manual)$", message = "Backup frequency must be one of: daily, weekly, monthly, manual")
    private String backupFrequency;

    @JsonProperty("cloudSync")
    @JsonAlias("cloud_sync")
    private Boolean cloudSync;

    @JsonProperty("autoCategorize")
    @JsonAlias("auto_categorize")
    private Boolean autoCategorize;

    @JsonProperty("smartBudgeting")
    @JsonAlias("smart_budgeting")
    private Boolean smartBudgeting;

    @JsonProperty("scheduledReports")
    @JsonAlias("scheduled_reports")
    @JsonDeserialize(using = NullIfBlankDeserializer.class)
    @Pattern(regexp = "^(daily|weekly|monthly|none)$", message = "Scheduled reports must be one of: daily, weekly, monthly, none")
    private String scheduledReports;

    @JsonProperty("expenseReminders")
    @JsonAlias("expense_reminders")
    private Boolean expenseReminders;

    @JsonProperty("predictiveAnalytics")
    @JsonAlias("predictive_analytics")
    private Boolean predictiveAnalytics;

    @JsonProperty("screenReader")
    @JsonAlias("screen_reader")
    private Boolean screenReader;

    @JsonProperty("keyboardShortcuts")
    @JsonAlias("keyboard_shortcuts")
    private Boolean keyboardShortcuts;

    @JsonProperty("showShortcutIndicators")
    @JsonAlias("show_shortcut_indicators")
    private Boolean showShortcutIndicators;

    @JsonProperty("reduceMotion")
    @JsonAlias("reduce_motion")
    private Boolean reduceMotion;

    @JsonProperty("focusIndicators")
    @JsonAlias("focus_indicators")
    private Boolean focusIndicators;
}
