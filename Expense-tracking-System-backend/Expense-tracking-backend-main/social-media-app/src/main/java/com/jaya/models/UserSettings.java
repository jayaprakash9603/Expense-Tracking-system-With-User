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

    // ==================== APPEARANCE SETTINGS ====================
    @Column(name = "theme_mode", nullable = false, length = 10)
    @Builder.Default
    private String themeMode = "dark"; // dark, light

    @Column(name = "font_size", nullable = false, length = 20)
    @Builder.Default
    private String fontSize = "medium"; // small, medium, large, extra-large

    @Column(name = "compact_mode", nullable = false)
    @Builder.Default
    private Boolean compactMode = false;

    @Column(name = "animations", nullable = false)
    @Builder.Default
    private Boolean animations = true;

    @Column(name = "high_contrast", nullable = false)
    @Builder.Default
    private Boolean highContrast = false;

    // ==================== NOTIFICATION SETTINGS ====================
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

    // ==================== PREFERENCE SETTINGS ====================
    @Column(name = "language", nullable = false, length = 5)
    @Builder.Default
    private String language = "en"; // en, es, fr, de, hi

    @Column(name = "currency", nullable = false, length = 5)
    @Builder.Default
    private String currency = "INR"; // USD, EUR, GBP, INR, JPY

    @Column(name = "date_format", nullable = false, length = 15)
    @Builder.Default
    private String dateFormat = "DD/MM/YYYY"; // MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD

    @Column(name = "time_format", nullable = false, length = 5)
    @Builder.Default
    private String timeFormat = "12h"; // 12h, 24h

    // ==================== PRIVACY & SECURITY SETTINGS ====================
    @Column(name = "profile_visibility", nullable = false, length = 10)
    @Builder.Default
    private String profileVisibility = "PUBLIC"; // PUBLIC, FRIENDS, PRIVATE

    @Column(name = "two_factor_enabled", nullable = false)
    @Builder.Default
    private Boolean twoFactorEnabled = false;

    @Column(name = "session_timeout", nullable = false)
    @Builder.Default
    private Boolean sessionTimeout = true;

    // ==================== DATA & STORAGE SETTINGS ====================
    @Column(name = "auto_backup", nullable = false)
    @Builder.Default
    private Boolean autoBackup = true;

    @Column(name = "backup_frequency", nullable = false, length = 10)
    @Builder.Default
    private String backupFrequency = "weekly"; // daily, weekly, monthly, manual

    @Column(name = "cloud_sync", nullable = false)
    @Builder.Default
    private Boolean cloudSync = true;

    // ==================== SMART FEATURES SETTINGS ====================
    @Column(name = "auto_categorize", nullable = false)
    @Builder.Default
    private Boolean autoCategorize = true;

    @Column(name = "smart_budgeting", nullable = false)
    @Builder.Default
    private Boolean smartBudgeting = true;

    @Column(name = "scheduled_reports", nullable = false, length = 10)
    @Builder.Default
    private String scheduledReports = "weekly"; // daily, weekly, monthly, none

    @Column(name = "expense_reminders", nullable = false)
    @Builder.Default
    private Boolean expenseReminders = true;

    @Column(name = "predictive_analytics", nullable = false)
    @Builder.Default
    private Boolean predictiveAnalytics = false;

    // ==================== ACCESSIBILITY SETTINGS ====================
    @Column(name = "screen_reader", nullable = false)
    @Builder.Default
    private Boolean screenReader = false;

    @Column(name = "keyboard_shortcuts", nullable = false)
    @Builder.Default
    private Boolean keyboardShortcuts = true;

    @Column(name = "reduce_motion", nullable = false)
    @Builder.Default
    private Boolean reduceMotion = false;

    @Column(name = "focus_indicators", nullable = false)
    @Builder.Default
    private Boolean focusIndicators = false;

    // Timestamps
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Helper method to create default settings for a new user
     * Follows Builder Pattern for clean object construction
     * 
     * @param userId The user ID
     * @return UserSettings with default values
     */
    public static UserSettings createDefaultSettings(Integer userId) {
        return UserSettings.builder()
                .userId(userId)
                // Appearance
                .themeMode("dark")
                .fontSize("medium")
                .compactMode(false)
                .animations(true)
                .highContrast(false)
                // Notifications
                .emailNotifications(true)
                .budgetAlerts(true)
                .weeklyReports(false)
                .pushNotifications(true)
                .friendRequestNotifications(true)
                // Preferences
                .language("en")
                .currency("INR")
                .dateFormat("DD/MM/YYYY")
                .timeFormat("12h")
                // Privacy & Security
                .profileVisibility("PUBLIC")
                .twoFactorEnabled(false)
                .sessionTimeout(true)
                // Data & Storage
                .autoBackup(true)
                .backupFrequency("weekly")
                .cloudSync(true)
                // Smart Features
                .autoCategorize(true)
                .smartBudgeting(true)
                .scheduledReports("weekly")
                .expenseReminders(true)
                .predictiveAnalytics(false)
                // Accessibility
                .screenReader(false)
                .keyboardShortcuts(true)
                .reduceMotion(false)
                .focusIndicators(false)
                .build();
    }
}
