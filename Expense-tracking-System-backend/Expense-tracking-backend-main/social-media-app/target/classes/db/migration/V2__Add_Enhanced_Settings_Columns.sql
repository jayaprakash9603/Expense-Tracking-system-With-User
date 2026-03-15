-- =====================================================
-- Database Migration Script
-- Version: 2.0
-- Date: October 31, 2025
-- Description: Add enhanced settings columns for new features
-- =====================================================

-- ==================== APPEARANCE SETTINGS ====================
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS font_size VARCHAR(20) DEFAULT 'medium' NOT NULL,
ADD COLUMN IF NOT EXISTS compact_mode BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS animations BOOLEAN DEFAULT TRUE NOT NULL,
ADD COLUMN IF NOT EXISTS high_contrast BOOLEAN DEFAULT FALSE NOT NULL;

-- ==================== PREFERENCE SETTINGS ====================
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS time_format VARCHAR(5) DEFAULT '12h' NOT NULL;

-- ==================== PRIVACY & SECURITY SETTINGS ====================
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS session_timeout BOOLEAN DEFAULT TRUE NOT NULL;

-- ==================== DATA & STORAGE SETTINGS ====================
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS auto_backup BOOLEAN DEFAULT TRUE NOT NULL,
ADD COLUMN IF NOT EXISTS backup_frequency VARCHAR(10) DEFAULT 'weekly' NOT NULL,
ADD COLUMN IF NOT EXISTS cloud_sync BOOLEAN DEFAULT TRUE NOT NULL;

-- ==================== SMART FEATURES SETTINGS ====================
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS auto_categorize BOOLEAN DEFAULT TRUE NOT NULL,
ADD COLUMN IF NOT EXISTS smart_budgeting BOOLEAN DEFAULT TRUE NOT NULL,
ADD COLUMN IF NOT EXISTS scheduled_reports VARCHAR(10) DEFAULT 'weekly' NOT NULL,
ADD COLUMN IF NOT EXISTS expense_reminders BOOLEAN DEFAULT TRUE NOT NULL,
ADD COLUMN IF NOT EXISTS predictive_analytics BOOLEAN DEFAULT FALSE NOT NULL;

-- ==================== ACCESSIBILITY SETTINGS ====================
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS screen_reader BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS keyboard_shortcuts BOOLEAN DEFAULT TRUE NOT NULL,
ADD COLUMN IF NOT EXISTS reduce_motion BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS focus_indicators BOOLEAN DEFAULT FALSE NOT NULL;

-- =====================================================
-- Add constraints for enum-like fields
-- =====================================================

-- Font size constraint
ALTER TABLE user_settings
ADD CONSTRAINT check_font_size CHECK (font_size IN ('small', 'medium', 'large', 'extra-large'));

-- Time format constraint
ALTER TABLE user_settings
ADD CONSTRAINT check_time_format CHECK (time_format IN ('12h', '24h'));

-- Backup frequency constraint
ALTER TABLE user_settings
ADD CONSTRAINT check_backup_frequency CHECK (backup_frequency IN ('daily', 'weekly', 'monthly', 'manual'));

-- Scheduled reports constraint
ALTER TABLE user_settings
ADD CONSTRAINT check_scheduled_reports CHECK (scheduled_reports IN ('daily', 'weekly', 'monthly', 'none'));

-- =====================================================
-- Add comments for documentation
-- =====================================================

COMMENT ON COLUMN user_settings.font_size IS 'Font size preference: small, medium, large, extra-large';
COMMENT ON COLUMN user_settings.compact_mode IS 'Enable compact mode with reduced spacing';
COMMENT ON COLUMN user_settings.animations IS 'Enable smooth transitions and animations';
COMMENT ON COLUMN user_settings.high_contrast IS 'Enable high contrast mode for accessibility';
COMMENT ON COLUMN user_settings.time_format IS 'Time display format: 12h or 24h';
COMMENT ON COLUMN user_settings.session_timeout IS 'Enable automatic logout on inactivity';
COMMENT ON COLUMN user_settings.auto_backup IS 'Enable automatic data backup';
COMMENT ON COLUMN user_settings.backup_frequency IS 'Backup frequency: daily, weekly, monthly, manual';
COMMENT ON COLUMN user_settings.cloud_sync IS 'Enable cloud synchronization';
COMMENT ON COLUMN user_settings.auto_categorize IS 'Enable AI-powered expense categorization';
COMMENT ON COLUMN user_settings.smart_budgeting IS 'Enable smart budget recommendations';
COMMENT ON COLUMN user_settings.scheduled_reports IS 'Scheduled report frequency: daily, weekly, monthly, none';
COMMENT ON COLUMN user_settings.expense_reminders IS 'Enable reminders for recurring expenses';
COMMENT ON COLUMN user_settings.predictive_analytics IS 'Enable predictive expense analytics';
COMMENT ON COLUMN user_settings.screen_reader IS 'Enable screen reader support';
COMMENT ON COLUMN user_settings.keyboard_shortcuts IS 'Enable keyboard navigation shortcuts';
COMMENT ON COLUMN user_settings.reduce_motion IS 'Reduce animations for accessibility';
COMMENT ON COLUMN user_settings.focus_indicators IS 'Enable enhanced focus indicators';

-- =====================================================
-- Create indexes for frequently queried columns
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_settings_auto_categorize ON user_settings(auto_categorize);
CREATE INDEX IF NOT EXISTS idx_settings_smart_budgeting ON user_settings(smart_budgeting);
CREATE INDEX IF NOT EXISTS idx_settings_scheduled_reports ON user_settings(scheduled_reports);
CREATE INDEX IF NOT EXISTS idx_settings_auto_backup ON user_settings(auto_backup);

-- =====================================================
-- Update existing records with default values
-- =====================================================

UPDATE user_settings
SET 
    font_size = COALESCE(font_size, 'medium'),
    compact_mode = COALESCE(compact_mode, FALSE),
    animations = COALESCE(animations, TRUE),
    high_contrast = COALESCE(high_contrast, FALSE),
    time_format = COALESCE(time_format, '12h'),
    session_timeout = COALESCE(session_timeout, TRUE),
    auto_backup = COALESCE(auto_backup, TRUE),
    backup_frequency = COALESCE(backup_frequency, 'weekly'),
    cloud_sync = COALESCE(cloud_sync, TRUE),
    auto_categorize = COALESCE(auto_categorize, TRUE),
    smart_budgeting = COALESCE(smart_budgeting, TRUE),
    scheduled_reports = COALESCE(scheduled_reports, 'weekly'),
    expense_reminders = COALESCE(expense_reminders, TRUE),
    predictive_analytics = COALESCE(predictive_analytics, FALSE),
    screen_reader = COALESCE(screen_reader, FALSE),
    keyboard_shortcuts = COALESCE(keyboard_shortcuts, TRUE),
    reduce_motion = COALESCE(reduce_motion, FALSE),
    focus_indicators = COALESCE(focus_indicators, FALSE)
WHERE id IS NOT NULL;

-- =====================================================
-- Migration Complete
-- =====================================================
