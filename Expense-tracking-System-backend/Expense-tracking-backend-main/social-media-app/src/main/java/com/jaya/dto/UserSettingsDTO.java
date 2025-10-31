package com.jaya.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * UserSettingsDTO - Data Transfer Object for User Settings
 * 
 * Design Pattern: DTO Pattern
 * Purpose: Decouples internal entity structure from external API representation
 * Benefits: API versioning flexibility, security (hides sensitive fields),
 * reduced payload size
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSettingsDTO {

    @JsonProperty("id")
    private Integer id;

    @JsonProperty("userId")
    private Integer userId;

    // ==================== APPEARANCE SETTINGS ====================
    @JsonProperty("themeMode")
    private String themeMode;

    @JsonProperty("fontSize")
    private String fontSize;

    @JsonProperty("compactMode")
    private Boolean compactMode;

    @JsonProperty("animations")
    private Boolean animations;

    @JsonProperty("highContrast")
    private Boolean highContrast;

    // ==================== NOTIFICATION SETTINGS ====================
    @JsonProperty("emailNotifications")
    private Boolean emailNotifications;

    @JsonProperty("budgetAlerts")
    private Boolean budgetAlerts;

    @JsonProperty("weeklyReports")
    private Boolean weeklyReports;

    @JsonProperty("pushNotifications")
    private Boolean pushNotifications;

    @JsonProperty("friendRequestNotifications")
    private Boolean friendRequestNotifications;

    // ==================== PREFERENCE SETTINGS ====================
    @JsonProperty("language")
    private String language;

    @JsonProperty("currency")
    private String currency;

    @JsonProperty("dateFormat")
    private String dateFormat;

    @JsonProperty("timeFormat")
    private String timeFormat;

    // ==================== PRIVACY & SECURITY SETTINGS ====================
    @JsonProperty("profileVisibility")
    private String profileVisibility;

    @JsonProperty("twoFactorEnabled")
    private Boolean twoFactorEnabled;

    @JsonProperty("sessionTimeout")
    private Boolean sessionTimeout;

    // ==================== DATA & STORAGE SETTINGS ====================
    @JsonProperty("autoBackup")
    private Boolean autoBackup;

    @JsonProperty("backupFrequency")
    private String backupFrequency;

    @JsonProperty("cloudSync")
    private Boolean cloudSync;

    // ==================== SMART FEATURES SETTINGS ====================
    @JsonProperty("autoCategorize")
    private Boolean autoCategorize;

    @JsonProperty("smartBudgeting")
    private Boolean smartBudgeting;

    @JsonProperty("scheduledReports")
    private String scheduledReports;

    @JsonProperty("expenseReminders")
    private Boolean expenseReminders;

    @JsonProperty("predictiveAnalytics")
    private Boolean predictiveAnalytics;

    // ==================== ACCESSIBILITY SETTINGS ====================
    @JsonProperty("screenReader")
    private Boolean screenReader;

    @JsonProperty("keyboardShortcuts")
    private Boolean keyboardShortcuts;

    @JsonProperty("reduceMotion")
    private Boolean reduceMotion;

    @JsonProperty("focusIndicators")
    private Boolean focusIndicators;

    // Timestamps
    @JsonProperty("createdAt")
    private LocalDateTime createdAt;

    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;
}
