-- Create comprehensive activity log table for tracking school activities
-- This table will store all school-related activities including logins and resource downloads

-- Drop table if it exists
DROP TABLE IF EXISTS `school_activity_logs`;

-- Create the main activity log table
CREATE TABLE `school_activity_logs` (
  `log_id` INT AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT NOT NULL,
  `school_name` VARCHAR(255) NOT NULL,
  `school_email` VARCHAR(255),
  `school_organization` VARCHAR(255),
  `activity_type` ENUM('login', 'resource_download', 'resource_view', 'resource_upload', 'logout', 'other') NOT NULL,
  `resource_id` INT NULL,
  `resource_name` VARCHAR(255) NULL,
  `resource_type` VARCHAR(100) NULL,
  `subject_name` VARCHAR(100) NULL,
  `grade_level` VARCHAR(50) NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` TEXT NULL,
  `login_time` DATETIME NULL,
  `activity_timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `session_duration` INT NULL COMMENT 'Session duration in seconds (for login/logout pairs)',
  `file_size` BIGINT NULL COMMENT 'File size in bytes for downloads',
  `file_extension` VARCHAR(20) NULL,
  `download_count` INT DEFAULT 0 COMMENT 'Number of times this resource was downloaded by this school',
  `additional_details` JSON NULL COMMENT 'Additional activity-specific details',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for better performance
  INDEX `idx_school_id` (`school_id`),
  INDEX `idx_activity_type` (`activity_type`),
  INDEX `idx_resource_id` (`resource_id`),
  INDEX `idx_login_time` (`login_time`),
  INDEX `idx_activity_timestamp` (`activity_timestamp`),
  INDEX `idx_school_activity` (`school_id`, `activity_type`),
  INDEX `idx_timestamp_range` (`activity_timestamp`),
  
  -- Foreign key constraints
  FOREIGN KEY (`school_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`resource_id`) REFERENCES `resources`(`resource_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create a trigger to automatically update the updated_at timestamp
DELIMITER //
CREATE TRIGGER `update_school_activity_logs_timestamp` 
BEFORE UPDATE ON `school_activity_logs`
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//
DELIMITER ;

-- Create a view for easy querying of school activities
CREATE OR REPLACE VIEW `school_activity_summary` AS
SELECT 
    sal.school_id,
    sal.school_name,
    sal.school_organization,
    sal.activity_type,
    COUNT(*) as activity_count,
    MAX(sal.activity_timestamp) as last_activity,
    MIN(sal.activity_timestamp) as first_activity,
    SUM(CASE WHEN sal.activity_type = 'resource_download' THEN 1 ELSE 0 END) as total_downloads,
    SUM(CASE WHEN sal.activity_type = 'login' THEN 1 ELSE 0 END) as total_logins,
    SUM(CASE WHEN sal.activity_type = 'resource_view' THEN 1 ELSE 0 END) as total_views
FROM school_activity_logs sal
GROUP BY sal.school_id, sal.school_name, sal.school_organization, sal.activity_type;

-- Insert sample data for testing
INSERT INTO `school_activity_logs` (
    `school_id`, 
    `school_name`, 
    `school_email`, 
    `school_organization`, 
    `activity_type`, 
    `resource_id`, 
    `resource_name`, 
    `resource_type`, 
    `subject_name`, 
    `grade_level`, 
    `ip_address`, 
    `user_agent`, 
    `login_time`, 
    `activity_timestamp`,
    `file_size`,
    `file_extension`,
    `additional_details`
) VALUES 
-- Sample login activity
(2, 'School A', 'schoola@example.com', 'ABC School', 'login', NULL, NULL, NULL, NULL, NULL, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 2 HOUR, NULL, NULL, '{"login_method": "web", "session_id": "sess_123"}'),

-- Sample resource download activity
(2, 'School A', 'schoola@example.com', 'ABC School', 'resource_download', 1, 'Mathematics Worksheet', 'worksheet', 'Mathematics', 'Grade 5', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 1 HOUR, 1024000, 'pdf', '{"download_method": "web", "file_size_mb": 1.0}'),

-- Sample resource view activity
(2, 'School A', 'schoola@example.com', 'ABC School', 'resource_view', 1, 'Mathematics Worksheet', 'worksheet', 'Mathematics', 'Grade 5', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 30 MINUTE, NULL, NULL, '{"view_method": "web", "view_duration": 120}'),

-- Sample login activity for another school
(3, 'School B', 'schoolb@example.com', 'XYZ School', 'login', NULL, NULL, NULL, NULL, NULL, '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', NOW() - INTERVAL 1 HOUR, NOW() - INTERVAL 1 HOUR, NULL, NULL, '{"login_method": "web", "session_id": "sess_456"}'),

-- Sample resource download for another school
(3, 'School B', 'schoolb@example.com', 'XYZ School', 'resource_download', 2, 'Science Experiment Guide', 'document', 'Science', 'Grade 6', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', NOW() - INTERVAL 1 HOUR, NOW() - INTERVAL 45 MINUTE, 1536000, 'docx', '{"download_method": "web", "file_size_mb": 1.5}');

-- Create a stored procedure to log school activities
DELIMITER //
CREATE PROCEDURE `LogSchoolActivity`(
    IN p_school_id INT,
    IN p_school_name VARCHAR(255),
    IN p_school_email VARCHAR(255),
    IN p_school_organization VARCHAR(255),
    IN p_activity_type ENUM('login', 'resource_download', 'resource_view', 'resource_upload', 'logout', 'other'),
    IN p_resource_id INT,
    IN p_resource_name VARCHAR(255),
    IN p_resource_type VARCHAR(100),
    IN p_subject_name VARCHAR(100),
    IN p_grade_level VARCHAR(50),
    IN p_ip_address VARCHAR(45),
    IN p_user_agent TEXT,
    IN p_login_time DATETIME,
    IN p_file_size BIGINT,
    IN p_file_extension VARCHAR(20),
    IN p_additional_details JSON
)
BEGIN
    INSERT INTO school_activity_logs (
        school_id, school_name, school_email, school_organization,
        activity_type, resource_id, resource_name, resource_type,
        subject_name, grade_level, ip_address, user_agent,
        login_time, file_size, file_extension, additional_details
    ) VALUES (
        p_school_id, p_school_name, p_school_email, p_school_organization,
        p_activity_type, p_resource_id, p_resource_name, p_resource_type,
        p_subject_name, p_grade_level, p_ip_address, p_user_agent,
        p_login_time, p_file_size, p_file_extension, p_additional_details
    );
    
    -- Update download count if it's a download activity
    IF p_activity_type = 'resource_download' AND p_resource_id IS NOT NULL THEN
        UPDATE school_activity_logs 
        SET download_count = download_count + 1
        WHERE school_id = p_school_id AND resource_id = p_resource_id;
    END IF;
END//
DELIMITER ;

-- Create a function to get school activity summary
DELIMITER //
CREATE FUNCTION `GetSchoolActivitySummary`(p_school_id INT, p_days INT) 
RETURNS TEXT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE result TEXT;
    
    SELECT JSON_OBJECT(
        'school_id', school_id,
        'school_name', school_name,
        'total_activities', COUNT(*),
        'total_logins', SUM(CASE WHEN activity_type = 'login' THEN 1 ELSE 0 END),
        'total_downloads', SUM(CASE WHEN activity_type = 'resource_download' THEN 1 ELSE 0 END),
        'total_views', SUM(CASE WHEN activity_type = 'resource_view' THEN 1 ELSE 0 END),
        'last_activity', MAX(activity_timestamp),
        'first_activity', MIN(activity_timestamp)
    ) INTO result
    FROM school_activity_logs 
    WHERE school_id = p_school_id 
    AND activity_timestamp >= DATE_SUB(NOW(), INTERVAL p_days DAY);
    
    RETURN COALESCE(result, '{}');
END//
DELIMITER ;

-- Verify the table creation
SELECT 'Table created successfully!' as status;
DESCRIBE school_activity_logs;
SELECT COUNT(*) as total_records FROM school_activity_logs;
SELECT * FROM school_activity_logs LIMIT 5;
