-- Setup script for Activity Log functionality
-- Run this script to add missing fields and sample data

-- 1. Add missing fields to users table
ALTER TABLE users 
ADD COLUMN last_login DATETIME NULL AFTER updated_at,
ADD COLUMN last_ip VARCHAR(45) NULL AFTER last_login,
ADD COLUMN last_user_agent TEXT NULL AFTER last_ip;

-- 2. Add indexes for better performance
ALTER TABLE users 
ADD INDEX idx_last_login (last_login),
ADD INDEX idx_last_ip (last_ip);

-- 3. Update existing users to have default values
UPDATE users SET last_login = created_at WHERE last_login IS NULL;

-- 4. Insert sample activity data for testing (if tables are empty)
-- Insert sample users if they don't exist
INSERT IGNORE INTO users (name, email, password, role, organization, status, created_at) VALUES
('Admin User', 'admin@bylinelearning.com', '$2b$10$dummyhash', 'admin', 'Byline Learning Solutions', 'active', NOW()),
('School A', 'schoola@example.com', '$2b$10$dummyhash', 'school', 'ABC School', 'active', NOW()),
('School B', 'schoolb@example.com', '$2b$10$dummyhash', 'school', 'XYZ School', 'active', NOW());

-- Insert sample grades if they don't exist
INSERT IGNORE INTO grades (grade_level, grade_number, description) VALUES
('Grade 1', 1, 'First Grade'),
('Grade 2', 2, 'Second Grade'),
('Grade 3', 3, 'Third Grade');

-- Insert sample subjects if they don't exist
INSERT IGNORE INTO subjects (subject_name, description, color) VALUES
('Mathematics', 'Basic Mathematics', '#3B82F6'),
('Science', 'General Science', '#10B981'),
('English', 'English Language', '#F59E0B');

-- Insert sample resource types if they don't exist
INSERT IGNORE INTO resource_types (type_name, description, allowed_extensions, max_file_size) VALUES
('PDF', 'Portable Document Format', 'pdf', 10485760),
('Video', 'Video files', 'mp4,avi,mov', 104857600),
('Image', 'Image files', 'jpg,png,gif', 10485760);

-- Insert sample resources if they don't exist
INSERT IGNORE INTO resources (title, description, type_id, subject_id, grade_id, created_by, file_path, file_name, file_size, file_extension, status, download_count, view_count, likes) VALUES
('Math Worksheet 1', 'Basic addition worksheet', 1, 1, 1, 2, '/uploads/math1.pdf', 'math1.pdf', 1024000, 'pdf', 'published', 5, 15, 3),
('Science Quiz', 'Science quiz for grade 2', 1, 2, 2, 2, '/uploads/science_quiz.pdf', 'science_quiz.pdf', 2048000, 'pdf', 'published', 3, 12, 2),
('English Grammar', 'Grammar exercises', 1, 3, 3, 3, '/uploads/grammar.pdf', 'grammar.pdf', 1536000, 'pdf', 'published', 7, 20, 4);

-- Insert sample resource downloads
INSERT IGNORE INTO resource_downloads (resource_id, user_id, ip_address, user_agent, downloaded_at) VALUES
(1, 2, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW() - INTERVAL 1 HOUR),
(1, 2, '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW() - INTERVAL 2 HOUR),
(2, 2, '192.168.1.102', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW() - INTERVAL 3 HOUR),
(3, 3, '192.168.1.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW() - INTERVAL 4 HOUR);

-- Insert sample resource views
INSERT IGNORE INTO resource_views (resource_id, user_id, ip_address, user_agent, viewed_at) VALUES
(1, 2, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW() - INTERVAL 30 MINUTE),
(1, 2, '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW() - INTERVAL 1 HOUR),
(2, 2, '192.168.1.102', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW() - INTERVAL 2 HOUR),
(3, 3, '192.168.1.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW() - INTERVAL 3 HOUR);

-- Update user last login times for sample data
UPDATE users SET 
  last_login = NOW() - INTERVAL 1 HOUR,
  last_ip = '192.168.1.100',
  last_user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
WHERE user_id = 2;

UPDATE users SET 
  last_login = NOW() - INTERVAL 2 HOUR,
  last_ip = '192.168.1.101',
  last_user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
WHERE user_id = 3;

-- Insert some activity logs for additional tracking
INSERT IGNORE INTO activity_logs (user_id, action, resource_id, details, ip_address, user_agent, created_at) VALUES
(2, 'user_login', NULL, '{"login_method": "web", "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW() - INTERVAL 1 HOUR),
(3, 'user_login', NULL, '{"login_method": "web", "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}', '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW() - INTERVAL 2 HOUR),
(2, 'resource_download', 1, '{"download_method": "web", "file_size": 1024000}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW() - INTERVAL 1 HOUR),
(3, 'resource_download', 3, '{"download_method": "web", "file_size": 1536000}', '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW() - INTERVAL 2 HOUR);

-- Verify the setup
SELECT 'Setup completed successfully!' as status;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_resources FROM resources;
SELECT COUNT(*) as total_downloads FROM resource_downloads;
SELECT COUNT(*) as total_views FROM resource_views;
SELECT COUNT(*) as total_activity_logs FROM activity_logs;
