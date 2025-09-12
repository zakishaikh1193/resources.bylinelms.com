-- Test script to verify Activity Log database structure and data
-- Run this to check if everything is working correctly

-- 1. Check if required tables exist
SHOW TABLES LIKE 'users';
SHOW TABLES LIKE 'resources';
SHOW TABLES LIKE 'resource_downloads';
SHOW TABLES LIKE 'resource_types';
SHOW TABLES LIKE 'subjects';
SHOW TABLES LIKE 'grades';

-- 2. Check if required fields exist in users table
DESCRIBE users;

-- 3. Check if there are any users (schools) in the system
SELECT user_id, name, email, role, organization, status FROM users LIMIT 10;

-- 4. Check if there are any resources
SELECT resource_id, title, type_id, subject_id, grade_id, created_by FROM resources LIMIT 10;

-- 5. Check if there are any resource downloads
SELECT 
  rd.download_id,
  rd.user_id,
  rd.resource_id,
  rd.ip_address,
  rd.downloaded_at,
  u.name as school_name,
  u.organization,
  r.title as resource_title
FROM resource_downloads rd
JOIN users u ON rd.user_id = u.user_id
JOIN resources r ON rd.resource_id = r.resource_id
LIMIT 10;

-- 6. Check resource types
SELECT * FROM resource_types;

-- 7. Check subjects
SELECT * FROM subjects;

-- 8. Check grades
SELECT * FROM grades;

-- 9. Count total records
SELECT 
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM resources) as total_resources,
  (SELECT COUNT(*) FROM resource_downloads) as total_downloads,
  (SELECT COUNT(*) FROM resource_types) as total_resource_types,
  (SELECT COUNT(*) FROM subjects) as total_subjects,
  (SELECT COUNT(*) FROM grades) as total_grades;

-- 10. Test the main query that the API will use
SELECT 
  rd.download_id,
  rd.user_id,
  rd.resource_id,
  rd.ip_address,
  rd.user_agent,
  rd.downloaded_at as created_at,
  u.name as school_name,
  u.email as school_email,
  u.organization as school_organization,
  u.role as user_role,
  r.title as resource_title,
  r.description as resource_description,
  r.file_name,
  r.file_size,
  r.file_extension,
  rt.type_name as resource_type,
  s.subject_name,
  g.grade_level
FROM resource_downloads rd
JOIN users u ON rd.user_id = u.user_id
JOIN resources r ON rd.resource_id = r.resource_id
JOIN resource_types rt ON r.type_id = rt.type_id
JOIN subjects s ON r.subject_id = s.subject_id
JOIN grades g ON r.grade_id = g.grade_id
ORDER BY rd.downloaded_at DESC
LIMIT 5;

