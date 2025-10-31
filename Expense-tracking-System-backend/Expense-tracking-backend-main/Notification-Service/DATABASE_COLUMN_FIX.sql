-- Fix for Data Truncation Error: "Data truncated for column 'type' at row 1"
-- 
-- PROBLEM: The 'type' column was too small to hold enum values like 'PAYMENT_METHOD_ADDED' (21 chars)
-- SOLUTION: Increase column size from default (probably VARCHAR(20)) to VARCHAR(50)

USE notification_service;

-- 1. Check current column definition
DESCRIBE notifications;

-- 2. Alter the 'type' column to increase size
ALTER TABLE notifications 
MODIFY COLUMN type VARCHAR(50) NOT NULL;

-- 3. Alter the 'priority' column to ensure it's large enough too
ALTER TABLE notifications 
MODIFY COLUMN priority VARCHAR(20) NOT NULL;

-- 4. Verify the changes
DESCRIBE notifications;

-- 5. Check if there are any existing records with truncated data
SELECT id, user_id, type, priority, title, created_at 
FROM notifications 
WHERE LENGTH(type) > 20 
   OR type = '' 
   OR type IS NULL;

-- Note: You may want to clean up any corrupted records from previous failed inserts
-- DELETE FROM notifications WHERE type IS NULL OR type = '';

SELECT 'Database column size fix completed successfully!' AS status;
