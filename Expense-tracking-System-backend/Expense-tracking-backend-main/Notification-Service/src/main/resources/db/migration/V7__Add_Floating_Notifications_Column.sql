-- Migration: Add floating_notifications column to notification_preferences table
-- Version: V7
-- Description: Adds support for floating notification preferences
-- Author: System
-- Date: 2025-11-01

-- Add floating_notifications column with default value true
ALTER TABLE notification_preferences 
ADD COLUMN floating_notifications BOOLEAN NOT NULL DEFAULT true;

-- Add comment for documentation
COMMENT ON COLUMN notification_preferences.floating_notifications IS 'Enable/disable floating popup notifications on screen';

-- Create index for better query performance (optional, if frequently queried)
CREATE INDEX IF NOT EXISTS idx_notification_preferences_floating 
ON notification_preferences(floating_notifications);
