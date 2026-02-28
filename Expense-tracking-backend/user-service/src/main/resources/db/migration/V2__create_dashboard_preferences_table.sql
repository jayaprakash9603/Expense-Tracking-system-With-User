-- Create dashboard_preferences table for storing user-specific dashboard customization
-- Schema: expense_user_service

CREATE TABLE IF NOT EXISTS dashboard_preferences (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    layout_config TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_dashboard_preferences_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comments
ALTER TABLE dashboard_preferences 
COMMENT = 'Stores user-specific dashboard layout preferences and customizations';

ALTER TABLE dashboard_preferences 
MODIFY COLUMN user_id INT NOT NULL UNIQUE COMMENT 'Reference to user ID - one preference per user',
MODIFY COLUMN layout_config TEXT NOT NULL COMMENT 'JSON configuration of dashboard sections (order, visibility, type)',
MODIFY COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when preference was first created',
MODIFY COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Timestamp when preference was last updated';
