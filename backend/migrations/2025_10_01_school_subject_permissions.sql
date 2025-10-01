-- Migration: School Subject Permissions
-- Date: 2025-10-01
-- Description: Add per-school subject-grade permissions table and convenience view

-- Create school_subject_permissions table
CREATE TABLE IF NOT EXISTS `school_subject_permissions` (
  `school_id` int NOT NULL,
  `subject_id` int NOT NULL,
  `grade_id` int NOT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`school_id`, `subject_id`, `grade_id`),
  KEY `idx_school_subject` (`school_id`, `subject_id`),
  KEY `idx_school_grade` (`school_id`, `grade_id`),
  KEY `idx_created_by` (`created_by`),
  CONSTRAINT `fk_school_permissions_school` FOREIGN KEY (`school_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_school_permissions_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`subject_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_school_permissions_grade` FOREIGN KEY (`grade_id`) REFERENCES `grades` (`grade_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_school_permissions_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create convenience view for school allowed resources
CREATE OR REPLACE VIEW `school_allowed_resources` AS
SELECT 
    r.resource_id,
    r.title,
    r.description,
    r.type_id,
    r.subject_id,
    r.grade_id,
    r.created_by,
    r.file_path,
    r.file_name,
    r.file_size,
    r.file_extension,
    r.preview_image,
    r.status,
    r.download_count,
    r.view_count,
    r.likes,
    r.comments,
    r.is_featured,
    r.created_at,
    r.updated_at,
    rt.type_name,
    s.subject_name,
    s.color as subject_color,
    g.grade_level,
    g.grade_number,
    u.name as author_name,
    u.organization as author_organization,
    p.school_id
FROM resources r
JOIN school_subject_permissions p ON p.subject_id = r.subject_id AND p.grade_id = r.grade_id
JOIN resource_types rt ON r.type_id = rt.type_id
JOIN subjects s ON r.subject_id = s.subject_id
JOIN grades g ON r.grade_id = g.grade_id
JOIN users u ON r.created_by = u.user_id
WHERE r.status = 'published';


