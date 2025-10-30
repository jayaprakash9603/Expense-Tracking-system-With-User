package com.jaya.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
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
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateUserSettingsRequest {

    // Appearance Settings
    @JsonProperty("themeMode")
    @JsonAlias({ "theme", "theme_mode" }) // Support both "theme" and "themeMode" from frontend
    @Pattern(regexp = "^(dark|light)$", message = "Theme mode must be either 'dark' or 'light'")
    private String themeMode;

    // Notification Settings
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

    // Preference Settings
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

    // Privacy Settings
    @JsonProperty("profileVisibility")
    @JsonAlias("profile_visibility")
    @Pattern(regexp = "^(PUBLIC|FRIENDS|PRIVATE)$", message = "Profile visibility must be one of: PUBLIC, FRIENDS, PRIVATE")
    private String profileVisibility;

    @JsonProperty("twoFactorEnabled")
    @JsonAlias("two_factor_enabled")
    private Boolean twoFactorEnabled;
}
