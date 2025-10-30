-- User Settings Table Migration Script
-- Database: MySQL/MariaDB
-- Purpose: Store user preferences and application settings

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    
    -- Appearance Settings
    theme_mode VARCHAR(10) NOT NULL DEFAULT 'dark' COMMENT 'Theme mode: dark, light',
    
    -- Notification Settings
    email_notifications BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Enable email notifications',
    budget_alerts BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Enable budget alerts',
    weekly_reports BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Enable weekly reports',
    push_notifications BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Enable push notifications',
    friend_request_notifications BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Enable friend request notifications',
    
    -- Preference Settings
    language VARCHAR(5) NOT NULL DEFAULT 'en' COMMENT 'Language code: en, es, fr, de, hi',
    currency VARCHAR(5) NOT NULL DEFAULT 'USD' COMMENT 'Currency code: USD, EUR, GBP, INR, JPY',
    date_format VARCHAR(15) NOT NULL DEFAULT 'MM/DD/YYYY' COMMENT 'Date format: MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD',
    
    -- Privacy Settings
    profile_visibility VARCHAR(10) NOT NULL DEFAULT 'PUBLIC' COMMENT 'Profile visibility: PUBLIC, FRIENDS, PRIVATE',
    two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Two-factor authentication enabled',
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation time',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update time',
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_theme_mode (theme_mode),
    INDEX idx_email_notifications (email_notifications),
    INDEX idx_weekly_reports (weekly_reports),
    
    -- Constraints
    CONSTRAINT chk_theme_mode CHECK (theme_mode IN ('dark', 'light')),
    CONSTRAINT chk_language CHECK (language IN ('en', 'es', 'fr', 'de', 'hi')),
    CONSTRAINT chk_currency CHECK (currency IN ('USD', 'EUR', 'GBP', 'INR', 'JPY')),
    CONSTRAINT chk_date_format CHECK (date_format IN ('MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD')),
    CONSTRAINT chk_profile_visibility CHECK (profile_visibility IN ('PUBLIC', 'FRIENDS', 'PRIVATE'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User settings and preferences';

-- Create trigger to automatically create settings when a new user is created
DELIMITER //

CREATE TRIGGER create_default_settings_after_user_insert
AFTER INSERT ON user
FOR EACH ROW
BEGIN
    INSERT INTO user_settings (
        user_id,
        theme_mode,
        email_notifications,
        budget_alerts,
        weekly_reports,
        push_notifications,
        friend_request_notifications,
        language,
        currency,
        date_format,
        profile_visibility,
        two_factor_enabled
    ) VALUES (
        NEW.id,
        'dark',
        TRUE,
        TRUE,
        FALSE,
        TRUE,
        TRUE,
        'en',
        'USD',
        'MM/DD/YYYY',
        'PUBLIC',
        FALSE
    );
END //

DELIMITER ;

-- Sample data (for testing)
-- INSERT INTO user_settings (user_id, theme_mode, language, currency) 
-- VALUES (1, 'dark', 'en', 'USD');

-- Rollback script (if needed)
-- DROP TRIGGER IF EXISTS create_default_settings_after_user_insert;
-- DROP TABLE IF EXISTS user_settings;
