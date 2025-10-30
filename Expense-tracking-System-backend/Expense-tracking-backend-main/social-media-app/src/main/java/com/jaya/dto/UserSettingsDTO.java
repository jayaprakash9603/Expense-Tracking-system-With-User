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

    // Appearance Settings
    @JsonProperty("themeMode")
    private String themeMode;

    // Notification Settings
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

    // Preference Settings
    @JsonProperty("language")
    private String language;

    @JsonProperty("currency")
    private String currency;

    @JsonProperty("dateFormat")
    private String dateFormat;

    // Privacy Settings
    @JsonProperty("profileVisibility")
    private String profileVisibility;

    @JsonProperty("twoFactorEnabled")
    private Boolean twoFactorEnabled;

    // Timestamps
    @JsonProperty("createdAt")
    private LocalDateTime createdAt;

    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;
}
