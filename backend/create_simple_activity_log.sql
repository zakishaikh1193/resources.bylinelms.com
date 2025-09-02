-- Simple Activity Log Table for School Activities
-- This table stores: school name, resource name, login time, current timestamp

-- Drop table if it exists
DROP TABLE IF EXISTS `school_activity_logs`;

-- Create the simple activity log table
CREATE TABLE `school_activity_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `school_name` VARCHAR(255) NOT NULL COMMENT 'Name of the school',
  `school_email` VARCHAR(255) COMMENT 'Email of the school',
  `school_organization` VARCHAR(255) COMMENT 'Organization/Institution name',
  `resource_name` VARCHAR(255) NULL COMMENT 'Name of the resource downloaded (NULL for login)',
  `resource_type` VARCHAR(100) NULL COMMENT 'Type of resource (PDF, DOC, etc.)',
  `activity_type` ENUM('login', 'resource_download', 'resource_view') NOT NULL DEFAULT 'login',
  `login_time` DATETIME NOT NULL COMMENT 'When the school user logged in',
  `activity_timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When this activity occurred',
  `ip_address` VARCHAR(45) COMMENT 'IP address of the school',
  `user_agent` TEXT COMMENT 'Browser/device information',
  `file_size` BIGINT NULL COMMENT 'File size in bytes (for downloads)',
  `file_extension` VARCHAR(20) NULL COMMENT 'File extension (for downloads)',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes for better performance
  INDEX `idx_school_name` (`school_name`),
  INDEX `idx_activity_type` (`activity_type`),
  INDEX `idx_login_time` (`login_time`),
  INDEX `idx_activity_timestamp` (`activity_timestamp`),
  INDEX `idx_school_activity` (`school_name`, `activity_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for testing
INSERT INTO `school_activity_logs` (
    `school_name`, 
    `school_email`, 
    `school_organization`, 
    `resource_name`, 
    `resource_type`, 
    `activity_type`, 
    `login_time`, 
    `activity_timestamp`,
    `ip_address`,
    `user_agent`,
    `file_size`,
    `file_extension`
) VALUES 
-- School A login
('School A', 'schoola@example.com', 'ABC School', NULL, NULL, 'login', NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 2 HOUR, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NULL, NULL),

-- School A downloads a resource
('School A', 'schoola@example.com', 'ABC School', 'Mathematics Worksheet', 'PDF', 'resource_download', NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 1 HOUR, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 1024000, 'pdf'),

-- School A downloads another resource
('School A', 'schoola@example.com', 'ABC School', 'Science Experiment Guide', 'DOCX', 'resource_download', NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 30 MINUTE, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 1536000, 'docx'),

-- School B login
('School B', 'schoolb@example.com', 'XYZ School', NULL, NULL, 'login', NOW() - INTERVAL 1 HOUR, NOW() - INTERVAL 1 HOUR, '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', NULL, NULL),

-- School B downloads a resource
('School B', 'schoolb@example.com', 'XYZ School', 'English Grammar Book', 'PDF', 'resource_download', NOW() - INTERVAL 1 HOUR, NOW() - INTERVAL 45 MINUTE, '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', 2048000, 'pdf'),

-- School C login
('School C', 'schoolc@example.com', 'DEF Academy', NULL, NULL, 'login', NOW() - INTERVAL 30 MINUTE, NOW() - INTERVAL 30 MINUTE, '192.168.1.102', 'Mozilla/5.0 (Linux; Android)', NULL, NULL),

-- School C views a resource
('School C', 'schoolc@example.com', 'DEF Academy', 'History Timeline', 'HTML', 'resource_view', NOW() - INTERVAL 30 MINUTE, NOW() - INTERVAL 15 MINUTE, '192.168.1.102', 'Mozilla/5.0 (Linux; Android)', NULL, NULL);

-- Create a simple view for easy querying
CREATE OR REPLACE VIEW `school_activity_summary` AS
SELECT 
    school_name,
    school_organization,
    COUNT(*) as total_activities,
    SUM(CASE WHEN activity_type = 'login' THEN 1 ELSE 0 END) as total_logins,
    SUM(CASE WHEN activity_type = 'resource_download' THEN 1 ELSE 0 END) as total_downloads,
    SUM(CASE WHEN activity_type = 'resource_view' THEN 1 ELSE 0 END) as total_views,
    MAX(activity_timestamp) as last_activity,
    MIN(login_time) as first_login
FROM school_activity_logs 
GROUP BY school_name, school_organization;

-- Create a simple stored procedure to log activities
DELIMITER //
CREATE PROCEDURE `LogSchoolActivity`(
    IN p_school_name VARCHAR(255),
    IN p_school_email VARCHAR(255),
    IN p_school_organization VARCHAR(255),
    IN p_resource_name VARCHAR(255),
    IN p_resource_type VARCHAR(100),
    IN p_activity_type ENUM('login', 'resource_download', 'resource_view'),
    IN p_login_time DATETIME,
    IN p_ip_address VARCHAR(45),
    IN p_user_agent TEXT,
    IN p_file_size BIGINT,
    IN p_file_extension VARCHAR(20)
)
BEGIN
    INSERT INTO school_activity_logs (
        school_name, school_email, school_organization,
        resource_name, resource_type, activity_type,
        login_time, ip_address, user_agent,
        file_size, file_extension
    ) VALUES (
        p_school_name, p_school_email, p_school_organization,
        p_resource_name, p_resource_type, p_activity_type,
        p_login_time, p_ip_address, p_user_agent,
        p_file_size, p_file_extension
    );
END//
DELIMITER ;

-- Verify the table creation
SELECT 'Simple Activity Log Table created successfully!' as status;
DESCRIBE school_activity_logs;
SELECT COUNT(*) as total_records FROM school_activity_logs;

-- Show sample data
SELECT 
    school_name,
    school_organization,
    resource_name,
    activity_type,
    login_time,
    activity_timestamp,
    ip_address
FROM school_activity_logs 
ORDER BY activity_timestamp DESC;

-- Show summary by school
SELECT * FROM school_activity_summary ORDER BY total_activities DESC;
