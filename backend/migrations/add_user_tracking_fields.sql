-- Migration: Add user tracking fields to users table
-- This adds fields needed for comprehensive activity tracking

ALTER TABLE users 
ADD COLUMN last_login DATETIME NULL AFTER updated_at,
ADD COLUMN last_ip VARCHAR(45) NULL AFTER last_login,
ADD COLUMN last_user_agent TEXT NULL AFTER last_ip;

-- Add indexes for better performance
ALTER TABLE users 
ADD INDEX idx_last_login (last_login),
ADD INDEX idx_last_ip (last_ip);

-- Update existing users to have a default last_login value
UPDATE users SET last_login = created_at WHERE last_login IS NULL;

