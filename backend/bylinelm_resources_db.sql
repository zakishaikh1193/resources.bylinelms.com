-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Aug 21, 2025 at 12:09 AM
-- Server version: 8.0.39-cll-lve
-- PHP Version: 8.3.23

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bylinelm_resources_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `log_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `resource_id` int DEFAULT NULL,
  `details` json DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`log_id`, `user_id`, `action`, `resource_id`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES
(1, 1, 'USER_LOGIN', NULL, '{\"role\": \"admin\", \"email\": \"admin@resources.com\"}', '127.0.0.1', NULL, '2025-08-20 05:25:07'),
(2, 1, 'USER_LOGIN', NULL, '{\"role\": \"admin\", \"email\": \"admin@resources.com\"}', '127.0.0.1', NULL, '2025-08-20 05:33:57'),
(3, 57, 'USER_LOGIN', NULL, '{\"role\": \"admin\", \"email\": \"info@bylinelearning.com\"}', '127.0.0.1', NULL, '2025-08-20 06:06:26'),
(4, 57, 'ADMIN_CREATE_SCHOOL', NULL, '{\"email\": \"school@test.com\", \"organization\": \"Test School\", \"createdUserId\": 59}', '127.0.0.1', NULL, '2025-08-20 06:07:39'),
(5, 59, 'USER_LOGIN', NULL, '{\"role\": \"school\", \"email\": \"school@test.com\"}', '127.0.0.1', NULL, '2025-08-20 06:51:28'),
(6, 1, 'USER_LOGIN', NULL, '{\"role\": \"admin\", \"email\": \"admin@resources.com\"}', '127.0.0.1', NULL, '2025-08-20 06:55:04'),
(7, 1, 'USER_LOGIN', NULL, '{\"role\": \"admin\", \"email\": \"admin@resources.com\"}', '127.0.0.1', NULL, '2025-08-20 14:58:39'),
(8, 1, 'USER_LOGIN', NULL, '{\"role\": \"admin\", \"email\": \"admin@resources.com\"}', '127.0.0.1', NULL, '2025-08-20 14:59:39'),
(9, 1, 'ADMIN_CREATE_SCHOOL', NULL, '{\"email\": \"school@school.com\", \"organization\": \"School One\", \"createdUserId\": 61}', '127.0.0.1', NULL, '2025-08-20 15:01:05'),
(10, 61, 'USER_LOGIN', NULL, '{\"role\": \"school\", \"email\": \"school@school.com\"}', '127.0.0.1', NULL, '2025-08-20 15:01:17'),
(11, 1, 'USER_LOGIN', NULL, '{\"role\": \"admin\", \"email\": \"admin@resources.com\"}', '127.0.0.1', NULL, '2025-08-20 15:01:28'),
(12, 1, 'USER_LOGIN', NULL, '{\"role\": \"admin\", \"email\": \"admin@resources.com\"}', '127.0.0.1', NULL, '2025-08-20 22:25:37'),
(13, 1, 'ADMIN_CREATE_SCHOOL', NULL, '{\"email\": \"demoschool@resources.com\", \"organization\": \"Byline\", \"createdUserId\": 63}', '127.0.0.1', NULL, '2025-08-20 22:38:37'),
(14, 63, 'USER_LOGIN', NULL, '{\"role\": \"school\", \"email\": \"demoschool@resources.com\"}', '127.0.0.1', NULL, '2025-08-20 22:49:13'),
(15, 1, 'USER_LOGIN', NULL, '{\"role\": \"admin\", \"email\": \"admin@resources.com\"}', '127.0.0.1', NULL, '2025-08-20 23:40:04');

-- --------------------------------------------------------

--
-- Table structure for table `grades`
--

CREATE TABLE `grades` (
  `grade_id` int NOT NULL,
  `grade_level` varchar(50) NOT NULL,
  `grade_number` int NOT NULL,
  `description` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `grades`
--

INSERT INTO `grades` (`grade_id`, `grade_level`, `grade_number`, `description`, `created_at`) VALUES
(627, 'Grade 1', 1, 'Educational resources for Grade 1 students', '2025-08-20 05:25:06'),
(628, 'Grade 2', 2, 'Educational resources for Grade 2 students', '2025-08-20 05:25:06'),
(629, 'Grade 3', 3, 'Educational resources for Grade 3 students', '2025-08-20 05:25:06'),
(630, 'Grade 4', 4, 'Educational resources for Grade 4 students', '2025-08-20 05:25:06'),
(631, 'Grade 5', 5, 'Educational resources for Grade 5 students', '2025-08-20 05:25:06'),
(632, 'Grade 6', 6, 'Educational resources for Grade 6 students', '2025-08-20 05:25:06'),
(633, 'Grade 7', 7, 'Educational resources for Grade 7 students', '2025-08-20 05:25:06'),
(634, 'Grade 8', 8, 'Educational resources for Grade 8 students', '2025-08-20 05:25:06'),
(635, 'Grade 9', 9, 'Educational resources for Grade 9 students', '2025-08-20 05:25:06'),
(636, 'Grade 10', 10, 'Educational resources for Grade 10 students', '2025-08-20 05:25:06'),
(637, 'Grade 11', 11, 'Educational resources for Grade 11 students', '2025-08-20 05:25:06'),
(638, 'Grade 12', 12, 'Educational resources for Grade 12 students', '2025-08-20 05:25:06');

-- --------------------------------------------------------

--
-- Table structure for table `grade_resource_distribution`
--

CREATE TABLE `grade_resource_distribution` (
  `draft_resources` bigint DEFAULT NULL,
  `featured_resources` bigint DEFAULT NULL,
  `grade_id` int DEFAULT NULL,
  `grade_level` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `grade_number` int DEFAULT NULL,
  `published_resources` bigint DEFAULT NULL,
  `total_downloads` decimal(32,0) DEFAULT NULL,
  `total_likes` decimal(32,0) DEFAULT NULL,
  `total_resources` bigint DEFAULT NULL,
  `total_views` decimal(32,0) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int NOT NULL,
  `user_id` int NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `resource_id` int DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `popular_resources`
--

CREATE TABLE `popular_resources` (
  `author_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `author_organization` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `comments` int DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `download_count` int DEFAULT NULL,
  `grade_level` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_featured` tinyint(1) DEFAULT NULL,
  `likes` int DEFAULT NULL,
  `resource_id` int DEFAULT NULL,
  `subject_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `view_count` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `recent_activity`
--

CREATE TABLE `recent_activity` (
  `activity_time` datetime DEFAULT NULL,
  `activity_type` varchar(19) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resource_id` int DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_role` varchar(6) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `resources`
--

CREATE TABLE `resources` (
  `resource_id` int NOT NULL,
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
  `download_count` int DEFAULT '0',
  `view_count` int DEFAULT '0',
  `likes` int DEFAULT '0',
  `comments` int DEFAULT '0',
  `is_featured` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `resource_comments`
--

CREATE TABLE `resource_comments` (
  `comment_id` int NOT NULL,
  `resource_id` int NOT NULL,
  `user_id` int NOT NULL,
  `comment` text NOT NULL,
  `parent_comment_id` int DEFAULT NULL,
  `status` enum('active','hidden','deleted') DEFAULT 'active',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `resource_downloads`
--

CREATE TABLE `resource_downloads` (
  `download_id` int NOT NULL,
  `resource_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `version_id` int DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `downloaded_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `resource_likes`
--

CREATE TABLE `resource_likes` (
  `resource_id` int NOT NULL,
  `user_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `resource_permissions`
--

CREATE TABLE `resource_permissions` (
  `user_id` int NOT NULL,
  `resource_id` int NOT NULL,
  `permission` enum('owner','editor','viewer') DEFAULT 'viewer',
  `can_download` tinyint(1) DEFAULT '1',
  `can_edit` tinyint(1) DEFAULT '0',
  `can_delete` tinyint(1) DEFAULT '0',
  `expires_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `resource_reviews`
--

CREATE TABLE `resource_reviews` (
  `review_id` int NOT NULL,
  `resource_id` int NOT NULL,
  `reviewer_id` int NOT NULL,
  `rating` int NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `reviewed_by` int DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `resource_stats`
--

CREATE TABLE `resource_stats` (
  `actual_comments` bigint DEFAULT NULL,
  `actual_downloads` bigint DEFAULT NULL,
  `actual_likes` bigint DEFAULT NULL,
  `actual_views` bigint DEFAULT NULL,
  `comments` int DEFAULT NULL,
  `download_count` int DEFAULT NULL,
  `likes` int DEFAULT NULL,
  `resource_id` int DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `view_count` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `resource_tags`
--

CREATE TABLE `resource_tags` (
  `tag_id` int NOT NULL,
  `tag_name` varchar(50) NOT NULL,
  `description` text,
  `color` varchar(7) DEFAULT '#6B7280',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `resource_tags`
--

INSERT INTO `resource_tags` (`tag_id`, `tag_name`, `description`, `color`, `created_at`) VALUES
(948, 'Maths', NULL, '#6B7280', '2025-08-20 22:26:52'),
(949, 'Math', NULL, '#6B7280', '2025-08-20 22:26:56');

-- --------------------------------------------------------

--
-- Table structure for table `resource_tag_relations`
--

CREATE TABLE `resource_tag_relations` (
  `resource_id` int NOT NULL,
  `tag_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `resource_types`
--

CREATE TABLE `resource_types` (
  `type_id` int NOT NULL,
  `type_name` varchar(50) NOT NULL,
  `description` text,
  `allowed_extensions` text,
  `max_file_size` int DEFAULT '104857600',
  `icon` varchar(50) DEFAULT 'document',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `resource_types`
--

INSERT INTO `resource_types` (`type_id`, `type_name`, `description`, `allowed_extensions`, `max_file_size`, `icon`, `created_at`) VALUES
(365, 'Document', 'Document files', 'pdf,doc,docx,txt', 104857600, 'document', '2025-08-20 05:25:06'),
(366, 'Presentation', 'Presentation files', 'ppt,pptx,key', 104857600, 'presentation', '2025-08-20 05:25:06'),
(367, 'Video', 'Video files', 'mp4,avi,mov,wmv,flv', 524288000, 'video', '2025-08-20 05:25:06'),
(368, 'Image', 'Image files', 'jpg,jpeg,png,gif,bmp', 52428800, 'image', '2025-08-20 05:25:06'),
(369, 'Archive', 'Archive files', 'zip,rar,7z,tar,gz', 104857600, 'archive', '2025-08-20 05:25:06'),
(370, 'Spreadsheet', 'Spreadsheet files', 'xls,xlsx,csv', 104857600, 'spreadsheet', '2025-08-20 05:25:06'),
(371, 'Audio', 'Audio files', 'mp3,wav,ogg,aac', 104857600, 'audio', '2025-08-20 05:25:06');

-- --------------------------------------------------------

--
-- Table structure for table `resource_versions`
--

CREATE TABLE `resource_versions` (
  `version_id` int NOT NULL,
  `resource_id` int NOT NULL,
  `version_number` varchar(20) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_size` bigint NOT NULL,
  `change_log` text,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `resource_views`
--

CREATE TABLE `resource_views` (
  `view_id` int NOT NULL,
  `resource_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `viewed_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `subject_id` int NOT NULL,
  `subject_name` varchar(100) NOT NULL,
  `description` text,
  `color` varchar(7) DEFAULT '#3B82F6',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `subjects`
--

INSERT INTO `subjects` (`subject_id`, `subject_name`, `description`, `color`, `created_at`) VALUES
(434, 'Mathematics', 'Mathematics', '#3B82F6', '2025-08-20 22:26:32');

-- --------------------------------------------------------

--
-- Table structure for table `subject_resource_distribution`
--

CREATE TABLE `subject_resource_distribution` (
  `color` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `draft_resources` bigint DEFAULT NULL,
  `featured_resources` bigint DEFAULT NULL,
  `published_resources` bigint DEFAULT NULL,
  `subject_id` int DEFAULT NULL,
  `subject_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_downloads` decimal(32,0) DEFAULT NULL,
  `total_likes` decimal(32,0) DEFAULT NULL,
  `total_resources` bigint DEFAULT NULL,
  `total_views` decimal(32,0) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int NOT NULL,
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
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `name`, `email`, `password`, `role`, `status`, `organization`, `designation`, `phone`, `address`, `created_at`, `updated_at`) VALUES
(1, 'System Admin', 'admin@resources.com', '$2a$12$s/3mYdNwlWknc2QJJtOfEOTXjH5PRTDf8Vl9ivVjbklYa0OqZ1yNm', 'admin', 'active', 'System', 'Administrator', NULL, NULL, '2025-08-19 14:30:40', '2025-08-20 05:31:19'),
(9, 'Demo School', 'school@demo.com', '$2a$12$I5CzBukS2QgcA30Nz6el3.C4WAKNtEfzsyjzfezdAAlreUGYu/5rW', 'school', 'inactive', 'Demo School', 'Teacher', '1231231231', 'Demo School, Demo Place, Demo City, 123', '2025-08-19 15:11:55', '2025-08-20 05:31:35'),
(57, 'System Admin', 'info@bylinelearning.com', '$2a$12$AE7l6GAAxdmLyKEHaZDL8e5YDTPDHnTdCqU/jd0Ns055rPX82QolW', 'admin', 'active', 'System', 'Administrator', NULL, NULL, '2025-08-20 06:05:48', '2025-08-20 06:05:48'),
(59, 'Test School User', 'school@test.com', '$2a$12$r2YQXWTN1uNOtfmc29p77O/WYKMGQAwqnUSuxtBd16IyQVCEvPxXm', 'school', 'active', 'Test School', 'Teacher', '12454212451', 'dssd', '2025-08-20 06:07:39', '2025-08-20 06:07:39'),
(61, 'School one', 'school@school.com', '$2a$12$tUCqysKeYt4lrMysfT9UeuvvaiSc6a21.U223yQ8tO/x3iCCGkV1q', 'school', 'active', 'School One', '', '', '', '2025-08-20 15:01:05', '2025-08-20 15:01:05'),
(63, 'Demo', 'demoschool@resources.com', '$2a$12$eulnVXQIVXDgizTT1diQj.le01/rw0vPnLqGv/2IFG4/YaVpYddbG', 'school', 'active', 'Byline', '', '', '', '2025-08-20 22:38:37', '2025-08-20 22:38:37');

-- --------------------------------------------------------

--
-- Table structure for table `user_activity_summary`
--

CREATE TABLE `user_activity_summary` (
  `comments_made` bigint DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_downloaded` datetime DEFAULT NULL,
  `last_viewed` datetime DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resources_created` bigint DEFAULT NULL,
  `resources_downloaded` bigint DEFAULT NULL,
  `resources_liked` bigint DEFAULT NULL,
  `resources_viewed` bigint DEFAULT NULL,
  `role` enum('admin','school') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `resource_id` (`resource_id`),
  ADD KEY `action` (`action`),
  ADD KEY `created_at` (`created_at`);

--
-- Indexes for table `grades`
--
ALTER TABLE `grades`
  ADD PRIMARY KEY (`grade_id`),
  ADD UNIQUE KEY `grade_number` (`grade_number`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `resource_id` (`resource_id`),
  ADD KEY `is_read` (`is_read`);

--
-- Indexes for table `resources`
--
ALTER TABLE `resources`
  ADD PRIMARY KEY (`resource_id`),
  ADD KEY `type_id` (`type_id`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `grade_id` (`grade_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `status` (`status`),
  ADD KEY `is_featured` (`is_featured`);

--
-- Indexes for table `resource_comments`
--
ALTER TABLE `resource_comments`
  ADD PRIMARY KEY (`comment_id`),
  ADD KEY `resource_id` (`resource_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `parent_comment_id` (`parent_comment_id`);

--
-- Indexes for table `resource_downloads`
--
ALTER TABLE `resource_downloads`
  ADD PRIMARY KEY (`download_id`),
  ADD KEY `resource_id` (`resource_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `version_id` (`version_id`);

--
-- Indexes for table `resource_likes`
--
ALTER TABLE `resource_likes`
  ADD PRIMARY KEY (`resource_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `resource_permissions`
--
ALTER TABLE `resource_permissions`
  ADD PRIMARY KEY (`user_id`,`resource_id`),
  ADD KEY `resource_id` (`resource_id`);

--
-- Indexes for table `resource_reviews`
--
ALTER TABLE `resource_reviews`
  ADD PRIMARY KEY (`review_id`),
  ADD KEY `resource_id` (`resource_id`),
  ADD KEY `reviewer_id` (`reviewer_id`),
  ADD KEY `reviewed_by` (`reviewed_by`);

--
-- Indexes for table `resource_tags`
--
ALTER TABLE `resource_tags`
  ADD PRIMARY KEY (`tag_id`),
  ADD UNIQUE KEY `tag_name` (`tag_name`);

--
-- Indexes for table `resource_tag_relations`
--
ALTER TABLE `resource_tag_relations`
  ADD PRIMARY KEY (`resource_id`,`tag_id`),
  ADD KEY `tag_id` (`tag_id`);

--
-- Indexes for table `resource_types`
--
ALTER TABLE `resource_types`
  ADD PRIMARY KEY (`type_id`),
  ADD UNIQUE KEY `type_name` (`type_name`);

--
-- Indexes for table `resource_versions`
--
ALTER TABLE `resource_versions`
  ADD PRIMARY KEY (`version_id`),
  ADD KEY `resource_id` (`resource_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `resource_views`
--
ALTER TABLE `resource_views`
  ADD PRIMARY KEY (`view_id`),
  ADD KEY `resource_id` (`resource_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `viewed_at` (`viewed_at`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`subject_id`),
  ADD UNIQUE KEY `subject_name` (`subject_name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `log_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `grades`
--
ALTER TABLE `grades`
  MODIFY `grade_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=651;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `resources`
--
ALTER TABLE `resources`
  MODIFY `resource_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `resource_comments`
--
ALTER TABLE `resource_comments`
  MODIFY `comment_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `resource_downloads`
--
ALTER TABLE `resource_downloads`
  MODIFY `download_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `resource_reviews`
--
ALTER TABLE `resource_reviews`
  MODIFY `review_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `resource_tags`
--
ALTER TABLE `resource_tags`
  MODIFY `tag_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=950;

--
-- AUTO_INCREMENT for table `resource_types`
--
ALTER TABLE `resource_types`
  MODIFY `type_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=379;

--
-- AUTO_INCREMENT for table `resource_versions`
--
ALTER TABLE `resource_versions`
  MODIFY `version_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `resource_views`
--
ALTER TABLE `resource_views`
  MODIFY `view_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `subject_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=435;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `fk_logs_resource` FOREIGN KEY (`resource_id`) REFERENCES `resources` (`resource_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notifications_resource` FOREIGN KEY (`resource_id`) REFERENCES `resources` (`resource_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `resources`
--
ALTER TABLE `resources`
  ADD CONSTRAINT `fk_resources_grade` FOREIGN KEY (`grade_id`) REFERENCES `grades` (`grade_id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_resources_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`subject_id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_resources_type` FOREIGN KEY (`type_id`) REFERENCES `resource_types` (`type_id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_resources_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT;

--
-- Constraints for table `resource_comments`
--
ALTER TABLE `resource_comments`
  ADD CONSTRAINT `fk_comments_parent` FOREIGN KEY (`parent_comment_id`) REFERENCES `resource_comments` (`comment_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_comments_resource` FOREIGN KEY (`resource_id`) REFERENCES `resources` (`resource_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_comments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `resource_downloads`
--
ALTER TABLE `resource_downloads`
  ADD CONSTRAINT `fk_downloads_resource` FOREIGN KEY (`resource_id`) REFERENCES `resources` (`resource_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_downloads_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_downloads_version` FOREIGN KEY (`version_id`) REFERENCES `resource_versions` (`version_id`) ON DELETE SET NULL;

--
-- Constraints for table `resource_likes`
--
ALTER TABLE `resource_likes`
  ADD CONSTRAINT `fk_likes_resource` FOREIGN KEY (`resource_id`) REFERENCES `resources` (`resource_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_likes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `resource_permissions`
--
ALTER TABLE `resource_permissions`
  ADD CONSTRAINT `fk_permissions_resource` FOREIGN KEY (`resource_id`) REFERENCES `resources` (`resource_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_permissions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `resource_reviews`
--
ALTER TABLE `resource_reviews`
  ADD CONSTRAINT `fk_reviews_resource` FOREIGN KEY (`resource_id`) REFERENCES `resources` (`resource_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_reviews_reviewed_by` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_reviews_reviewer` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `resource_tag_relations`
--
ALTER TABLE `resource_tag_relations`
  ADD CONSTRAINT `fk_rt_relations_resource` FOREIGN KEY (`resource_id`) REFERENCES `resources` (`resource_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_rt_relations_tag` FOREIGN KEY (`tag_id`) REFERENCES `resource_tags` (`tag_id`) ON DELETE CASCADE;

--
-- Constraints for table `resource_versions`
--
ALTER TABLE `resource_versions`
  ADD CONSTRAINT `fk_versions_resource` FOREIGN KEY (`resource_id`) REFERENCES `resources` (`resource_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_versions_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT;

--
-- Constraints for table `resource_views`
--
ALTER TABLE `resource_views`
  ADD CONSTRAINT `fk_views_resource` FOREIGN KEY (`resource_id`) REFERENCES `resources` (`resource_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_views_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
