package com.jaya.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;








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

    
    @Column(name = "theme_mode", nullable = false, length = 10)
    @Builder.Default
    private String themeMode = "dark"; 

    @Column(name = "font_size", nullable = false, length = 20)
    @Builder.Default
    private String fontSize = "medium"; 

    @Column(name = "compact_mode", nullable = false)
    @Builder.Default
    private Boolean compactMode = false;

    @Column(name = "animations", nullable = false)
    @Builder.Default
    private Boolean animations = true;

    @Column(name = "high_contrast", nullable = false)
    @Builder.Default
    private Boolean highContrast = false;

    
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

    
    @Column(name = "language", nullable = false, length = 5)
    @Builder.Default
    private String language = "en"; 

    @Column(name = "currency", nullable = false, length = 5)
    @Builder.Default
    private String currency = "INR"; 

    @Column(name = "date_format", nullable = false, length = 15)
    @Builder.Default
    private String dateFormat = "DD/MM/YYYY"; 

    @Column(name = "time_format", nullable = false, length = 5)
    @Builder.Default
    private String timeFormat = "12h"; 

    
    @Column(name = "profile_visibility", nullable = false, length = 10)
    @Builder.Default
    private String profileVisibility = "PUBLIC"; 

    @Column(name = "two_factor_enabled", nullable = false)
    @Builder.Default
    private Boolean twoFactorEnabled = false;

    @Column(name = "session_timeout", nullable = false)
    @Builder.Default
    private Boolean sessionTimeout = true;

    @Column(name = "mask_sensitive_data", nullable = false)
    @Builder.Default
    private Boolean maskSensitiveData = false; 

    
    @Column(name = "auto_backup", nullable = false)
    @Builder.Default
    private Boolean autoBackup = true;

    @Column(name = "backup_frequency", nullable = false, length = 10)
    @Builder.Default
    private String backupFrequency = "weekly"; 

    @Column(name = "cloud_sync", nullable = false)
    @Builder.Default
    private Boolean cloudSync = true;

    
    @Column(name = "auto_categorize", nullable = false)
    @Builder.Default
    private Boolean autoCategorize = true;

    @Column(name = "smart_budgeting", nullable = false)
    @Builder.Default
    private Boolean smartBudgeting = true;

    @Column(name = "scheduled_reports", nullable = false, length = 10)
    @Builder.Default
    private String scheduledReports = "weekly"; 

    @Column(name = "expense_reminders", nullable = false)
    @Builder.Default
    private Boolean expenseReminders = true;

    @Column(name = "predictive_analytics", nullable = false)
    @Builder.Default
    private Boolean predictiveAnalytics = false;

    
    @Column(name = "screen_reader", nullable = false)
    @Builder.Default
    private Boolean screenReader = false;

    @Column(name = "keyboard_shortcuts", nullable = false)
    @Builder.Default
    private Boolean keyboardShortcuts = true;

    @Column(name = "show_shortcut_indicators", nullable = false)
    @Builder.Default
    private Boolean showShortcutIndicators = true; 

    @Column(name = "reduce_motion", nullable = false)
    @Builder.Default
    private Boolean reduceMotion = false;

    @Column(name = "focus_indicators", nullable = false)
    @Builder.Default
    private Boolean focusIndicators = false;

    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    






    public static UserSettings createDefaultSettings(Integer userId) {
        return UserSettings.builder()
                .userId(userId)
                
                .themeMode("dark")
                .fontSize("medium")
                .compactMode(false)
                .animations(true)
                .highContrast(false)
                
                .emailNotifications(true)
                .budgetAlerts(true)
                .weeklyReports(false)
                .pushNotifications(true)
                .friendRequestNotifications(true)
                
                .language("en")
                .currency("INR")
                .dateFormat("DD/MM/YYYY")
                .timeFormat("12h")
                
                .profileVisibility("PUBLIC")
                .twoFactorEnabled(false)
                .sessionTimeout(true)
                .maskSensitiveData(false)
                
                .autoBackup(true)
                .backupFrequency("weekly")
                .cloudSync(true)
                
                .autoCategorize(true)
                .smartBudgeting(true)
                .scheduledReports("weekly")
                .expenseReminders(true)
                .predictiveAnalytics(false)
                
                .screenReader(false)
                .keyboardShortcuts(true)
                .showShortcutIndicators(true)
                .reduceMotion(false)
                .focusIndicators(false)
                .build();
    }
}
