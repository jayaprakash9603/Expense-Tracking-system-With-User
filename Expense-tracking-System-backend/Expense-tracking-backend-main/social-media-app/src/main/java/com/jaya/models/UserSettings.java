package com.jaya.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * UserSettings Entity
 * Stores user preferences and application settings
 * 
 * Design Pattern: Entity Pattern
 * Follows JPA best practices with proper indexing and constraints
 */
@Entity
@Table(name = "user_settings", indexes = {
        @Index(name = "idx_user_id", columnList = "user_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Integer userId;

    // Appearance Settings
    @Column(name = "theme_mode", nullable = false)
    @Builder.Default
    private String themeMode = "dark"; // dark, light

    // Notification Settings
    @Column(name = "email_notifications", nullable = false)
    @Builder.Default
    private Boolean emailNotifications = true;

    @Column(name = "budget_alerts", nullable = false)
    @Builder.Default
    private Boolean budgetAlerts = true;

    @Column(name = "weekly_reports", nullable = false)
    @Builder.Default
    private Boolean weeklyReports = false;

    @Column(name = "push_notifications", nullable = false)
    @Builder.Default
    private Boolean pushNotifications = true;

    @Column(name = "friend_request_notifications", nullable = false)
    @Builder.Default
    private Boolean friendRequestNotifications = true;

    // Preference Settings
    @Column(name = "language", nullable = false)
    @Builder.Default
    private String language = "en"; // en, es, fr, de, hi

    @Column(name = "currency", nullable = false)
    @Builder.Default
    private String currency = "INR"; // USD, EUR, GBP, INR, JPY

    @Column(name = "date_format", nullable = false)
    @Builder.Default
    private String dateFormat = "DD/MM/YYYY"; // MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD

    // Privacy Settings
    @Column(name = "profile_visibility", nullable = false)
    @Builder.Default
    private String profileVisibility = "PUBLIC"; // PUBLIC, FRIENDS, PRIVATE

    @Column(name = "two_factor_enabled", nullable = false)
    @Builder.Default
    private Boolean twoFactorEnabled = false;

    // Timestamps
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Helper method to create default settings for a new user
     * 
     * @param userId The user ID
     * @return UserSettings with default values
     */
    public static UserSettings createDefaultSettings(Integer userId) {
        return UserSettings.builder()
                .userId(userId)
                .themeMode("dark")
                .emailNotifications(true)
                .budgetAlerts(true)
                .weeklyReports(false)
                .pushNotifications(true)
                .friendRequestNotifications(true)
                .language("en")
                .currency("INR")
                .dateFormat("DD/MM/YYYY")
                .profileVisibility("PUBLIC")
                .twoFactorEnabled(false)
                .build();
    }
}
