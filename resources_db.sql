-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jan 15, 2025 at 10:00 AM
-- Server version: 9.1.0
-- PHP Version: 8.1.31

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `resources_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','school') DEFAULT 'school',
  `status` enum('active','inactive','banned') DEFAULT 'active',
  `organization` varchar(255) DEFAULT NULL,
  `designation` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `grades`
--

DROP TABLE IF EXISTS `grades`;
CREATE TABLE IF NOT EXISTS `grades` (
  `grade_id` int NOT NULL AUTO_INCREMENT,
  `grade_level` varchar(50) NOT NULL,
  `grade_number` int NOT NULL,
  `description` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`grade_id`),
  UNIQUE KEY `grade_number` (`grade_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

DROP TABLE IF EXISTS `subjects`;
CREATE TABLE IF NOT EXISTS `subjects` (
  `subject_id` int NOT NULL AUTO_INCREMENT,
  `subject_name` varchar(100) NOT NULL,
  `description` text,
  `color` varchar(7) DEFAULT '#3B82F6',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`subject_id`),
  UNIQUE KEY `subject_name` (`subject_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `resource_types`
--

DROP TABLE IF EXISTS `resource_types`;
CREATE TABLE IF NOT EXISTS `resource_types` (
  `type_id` int NOT NULL AUTO_INCREMENT,
  `type_name` varchar(50) NOT NULL,
  `description` text,
  `allowed_extensions` text,
  `max_file_size` int DEFAULT 104857600,
  `icon` varchar(50) DEFAULT 'document',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`type_id`),
  UNIQUE KEY `type_name` (`type_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `resources`
--

DROP TABLE IF EXISTS `resources`;
CREATE TABLE IF NOT EXISTS `resources` (
  `resource_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `type_id` int NOT NULL,
  `subject_id` int NOT NULL,
  `grade_id` int NOT NULL,
  `created_by` int NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_size` bigint NOT NULL,
  `file_extension` varchar(20) NOT NULL,
  `preview_image` varchar(500) DEFAULT NULL,
  `status` enum('draft','published','archived') DEFAULT 'draft',
  `download_count` int DEFAULT 0,
  `view_count` int DEFAULT 0,
  `likes` int DEFAULT 0,
  `comments` int DEFAULT 0,
  `is_featured` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`resource_id`),
  KEY `type_id` (`type_id`),
  KEY `subject_id` (`subject_id`),
  KEY `grade_id` (`grade_id`),
  KEY `created_by` (`created_by`),
  KEY `status` (`status`),
  KEY `is_featured` (`is_featured`),
  CONSTRAINT `fk_resources_type` FOREIGN KEY (`type_id`) REFERENCES `resource_types` (`type_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_resources_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`subject_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_resources_grade` FOREIGN KEY (`grade_id`) REFERENCES `grades` (`grade_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_resources_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `resource_tags`
--

DROP TABLE IF EXISTS `resource_tags`;
CREATE TABLE IF NOT EXISTS `resource_tags` (
  `tag_id` int NOT NULL AUTO_INCREMENT,
  `tag_name` varchar(50) NOT NULL,
  `description` text,
  `color` varchar(7) DEFAULT '#6B7280',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`tag_id`),
  UNIQUE KEY `tag_name` (`tag_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `resource_tag_relations`
--

DROP TABLE IF EXISTS `resource_tag_relations`;
CREATE TABLE IF NOT EXISTS `resource_tag_relations` (
  `resource_id` int NOT NULL,
  `tag_id` int NOT NULL,
  PRIMARY KEY (`resource_id`,`tag_id`),
  KEY `tag_id` (`tag_id`),
  CONSTRAINT `fk_rt_relations_resource` FOREIGN KEY (`resource_id`) REFERENCES `resources` (`resource_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rt_relations_tag` FOREIGN KEY (`tag_id`) REFERENCES `resource_tags` (`tag_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `resource_permissions`
--

DROP TABLE IF EXISTS `resource_permissions`;
CREATE TABLE IF NOT EXISTS `resource_permissions` (
  `user_id` int NOT NULL,
  `resource_id` int NOT NULL,
  `permission` enum('owner','editor','viewer') DEFAULT 'viewer',
  `can_download` tinyint(1) DEFAULT 1,
  `can_edit` tinyint(1) DEFAULT 0,
  `can_delete` tinyint(1) DEFAULT 0,
  `expires_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`resource_id`),
  KEY `resource_id` (`resource_id`),
  CONSTRAINT `fk_permissions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_permissions_resource` FOREIGN KEY (`resource_id`) REFERENCES `resources` (`resource_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `resource_reviews`
--

DROP TABLE IF EXISTS `resource_reviews`;
CREATE TABLE IF NOT EXISTS `resource_reviews` (
  `review_id` int NOT NULL AUTO_INCREMENT,
  `resource_id` int NOT NULL,
  `reviewer_id` int NOT NULL,
  `rating` int NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
  `comment` text,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `reviewed_by` int DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`review_id`),
  KEY `resource_id` (`resource_id`),
  KEY `reviewer_id` (`reviewer_id`),
  KEY `reviewed_by` (`reviewed_by`),
  CONSTRAINT `fk_reviews_resource` FOREIGN KEY (`resource_id`) REFERENCES `resources` (`resource_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_reviewer` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_reviewed_by` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `resource_versions`
--

DROP TABLE IF EXISTS `resource_versions`;
CREATE TABLE IF NOT EXISTS `resource_versions` (
  `version_id` int NOT NULL AUTO_INCREMENT,
  `resource_id` int NOT NULL,
  `version_number` varchar(20) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_size` bigint NOT NULL,
  `change_log` text,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`version_id`),
  KEY `resource_id` (`resource_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `fk_versions_resource` FOREIGN KEY (`resource_id`) REFERENCES `resources` (`resource_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_versions_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `resource_id` int DEFAULT NULL,
  `details` json DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `user_id` (`user_id`),
  KEY `resource_id` (`resource_id`),
  KEY `action` (`action`),
  KEY `created_at` (`created_at`),
  CONSTRAINT `fk_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_logs_resource` FOREIGN KEY (`resource_id`) REFERENCES `resources` (`resource_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `resource_downloads`
--

DROP TABLE IF EXISTS `resource_downloads`;
CREATE TABLE IF NOT EXISTS `resource_downloads` (
  `download_id` int NOT NULL AUTO_INCREMENT,
  `resource_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `version_id` int DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `downloaded_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`download_id`),
  KEY `resource_id` (`resource_id`),
  KEY `user_id` (`user_id`),
  KEY `version_id` (`version_id`),
  CONSTRAINT `fk_downloads_resource` FOREIGN KEY (`resource_id`) REFERENCES `resources` (`resource_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_downloads_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_downloads_version` FOREIGN KEY (`version_id`) REFERENCES `resource_versions` (`version_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `resource_views`
--

DROP TABLE IF EXISTS `resource_views`;
CREATE TABLE IF NOT EXISTS `resource_views` (
  `view_id` int NOT NULL AUTO_INCREMENT,
  `resource_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `viewed_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`view_id`),
  KEY `resource_id` (`resource_id`),
  KEY `user_id` (`user_id`),
  KEY `viewed_at` (`viewed_at`),
  CONSTRAINT `fk_views_resource` FOREIGN KEY (`resource_id`) REFERENCES `resources` (`resource_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_views_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `resource_likes`
--

DROP TABLE IF EXISTS `resource_likes`;
CREATE TABLE IF NOT EXISTS `resource_likes` (
  `resource_id` int NOT NULL,
  `user_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`resource_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `fk_likes_resource` FOREIGN KEY (`resource_id`) REFERENCES `resources` (`resource_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_likes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `resource_comments`
--

DROP TABLE IF EXISTS `resource_comments`;
CREATE TABLE IF NOT EXISTS `resource_comments` (
  `comment_id` int NOT NULL AUTO_INCREMENT,
  `resource_id` int NOT NULL,
  `user_id` int NOT NULL,
  `comment` text NOT NULL,
  `parent_comment_id` int DEFAULT NULL,
  `status` enum('active','hidden','deleted') DEFAULT 'active',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`comment_id`),
  KEY `resource_id` (`resource_id`),
  KEY `user_id` (`user_id`),
  KEY `parent_comment_id` (`parent_comment_id`),
  CONSTRAINT `fk_comments_resource` FOREIGN KEY (`resource_id`) REFERENCES `resources` (`resource_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comments_parent` FOREIGN KEY (`parent_comment_id`) REFERENCES `resource_comments` (`comment_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `resource_id` int DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`),
  KEY `user_id` (`user_id`),
  KEY `resource_id` (`resource_id`),
  KEY `is_read` (`is_read`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notifications_resource` FOREIGN KEY (`resource_id`) REFERENCES `resources` (`resource_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Views
--

-- View for resource statistics
CREATE OR REPLACE VIEW `resource_stats` AS
SELECT 
    r.resource_id,
    r.title,
    r.download_count,
    r.view_count,
    r.likes,
    r.comments,
    COUNT(DISTINCT rv.view_id) as actual_views,
    COUNT(DISTINCT rd.download_id) as actual_downloads,
    COUNT(DISTINCT rl.user_id) as actual_likes,
    COUNT(DISTINCT rc.comment_id) as actual_comments
FROM resources r
LEFT JOIN resource_views rv ON r.resource_id = rv.resource_id
LEFT JOIN resource_downloads rd ON r.resource_id = rd.resource_id
LEFT JOIN resource_likes rl ON r.resource_id = rl.resource_id
LEFT JOIN resource_comments rc ON r.resource_id = rc.comment_id AND rc.status = 'active'
GROUP BY r.resource_id, r.title, r.download_count, r.view_count, r.likes, r.comments;

-- View for user activity summary
CREATE OR REPLACE VIEW `user_activity_summary` AS
SELECT 
    u.user_id,
    u.name,
    u.email,
    u.role,
    COUNT(DISTINCT r.resource_id) as resources_created,
    COUNT(DISTINCT rv.view_id) as resources_viewed,
    COUNT(DISTINCT rd.download_id) as resources_downloaded,
    COUNT(DISTINCT rl.resource_id) as resources_liked,
    COUNT(DISTINCT rc.comment_id) as comments_made,
    MAX(rv.viewed_at) as last_viewed,
    MAX(rd.downloaded_at) as last_downloaded
FROM users u
LEFT JOIN resources r ON u.user_id = r.created_by
LEFT JOIN resource_views rv ON u.user_id = rv.user_id
LEFT JOIN resource_downloads rd ON u.user_id = rd.user_id
LEFT JOIN resource_likes rl ON u.user_id = rl.user_id
LEFT JOIN resource_comments rc ON u.user_id = rc.user_id AND rc.status = 'active'
GROUP BY u.user_id, u.name, u.email, u.role;

-- View for grade-wise resource distribution
CREATE OR REPLACE VIEW `grade_resource_distribution` AS
SELECT 
    g.grade_id,
    g.grade_level,
    g.grade_number,
    COUNT(r.resource_id) as total_resources,
    COUNT(CASE WHEN r.status = 'published' THEN 1 END) as published_resources,
    COUNT(CASE WHEN r.status = 'draft' THEN 1 END) as draft_resources,
    COUNT(CASE WHEN r.is_featured = 1 THEN 1 END) as featured_resources,
    SUM(r.download_count) as total_downloads,
    SUM(r.view_count) as total_views,
    SUM(r.likes) as total_likes
FROM grades g
LEFT JOIN resources r ON g.grade_id = r.grade_id
GROUP BY g.grade_id, g.grade_level, g.grade_number;

-- View for subject-wise resource distribution
CREATE OR REPLACE VIEW `subject_resource_distribution` AS
SELECT 
    s.subject_id,
    s.subject_name,
    s.color,
    COUNT(r.resource_id) as total_resources,
    COUNT(CASE WHEN r.status = 'published' THEN 1 END) as published_resources,
    COUNT(CASE WHEN r.status = 'draft' THEN 1 END) as draft_resources,
    COUNT(CASE WHEN r.is_featured = 1 THEN 1 END) as featured_resources,
    SUM(r.download_count) as total_downloads,
    SUM(r.view_count) as total_views,
    SUM(r.likes) as total_likes
FROM subjects s
LEFT JOIN resources r ON s.subject_id = r.subject_id
GROUP BY s.subject_id, s.subject_name, s.color;

-- View for popular resources
CREATE OR REPLACE VIEW `popular_resources` AS
SELECT 
    r.resource_id,
    r.title,
    r.description,
    r.download_count,
    r.view_count,
    r.likes,
    r.comments,
    rt.type_name,
    s.subject_name,
    g.grade_level,
    u.name as author_name,
    u.organization as author_organization,
    r.created_at,
    r.is_featured
FROM resources r
JOIN resource_types rt ON r.type_id = rt.type_id
JOIN subjects s ON r.subject_id = s.subject_id
JOIN grades g ON r.grade_id = g.grade_id
JOIN users u ON r.created_by = u.user_id
WHERE r.status = 'published'
ORDER BY (r.download_count + r.view_count + r.likes) DESC;

-- View for recent activity
CREATE OR REPLACE VIEW `recent_activity` AS
SELECT 
    'resource_created' as activity_type,
    r.resource_id,
    r.title,
    u.name as user_name,
    u.role as user_role,
    r.created_at as activity_time
FROM resources r
JOIN users u ON r.created_by = u.user_id
UNION ALL
SELECT 
    'resource_downloaded' as activity_type,
    r.resource_id,
    r.title,
    u.name as user_name,
    u.role as user_role,
    rd.downloaded_at as activity_time
FROM resource_downloads rd
JOIN resources r ON rd.resource_id = r.resource_id
JOIN users u ON rd.user_id = u.user_id
UNION ALL
SELECT 
    'resource_liked' as activity_type,
    r.resource_id,
    r.title,
    u.name as user_name,
    u.role as user_role,
    rl.created_at as activity_time
FROM resource_likes rl
JOIN resources r ON rl.resource_id = r.resource_id
JOIN users u ON rl.user_id = u.user_id
ORDER BY activity_time DESC;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

