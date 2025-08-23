-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Aug 20, 2025 at 12:09 PM
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
  KEY `created_at` (`created_at`)
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
) ENGINE=InnoDB AUTO_INCREMENT=627 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `grade_resource_distribution`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `grade_resource_distribution`;
CREATE TABLE IF NOT EXISTS `grade_resource_distribution` (
`draft_resources` bigint
,`featured_resources` bigint
,`grade_id` int
,`grade_level` varchar(50)
,`grade_number` int
,`published_resources` bigint
,`total_downloads` decimal(32,0)
,`total_likes` decimal(32,0)
,`total_resources` bigint
,`total_views` decimal(32,0)
);

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
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`),
  KEY `user_id` (`user_id`),
  KEY `resource_id` (`resource_id`),
  KEY `is_read` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `popular_resources`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `popular_resources`;
CREATE TABLE IF NOT EXISTS `popular_resources` (
`author_name` varchar(100)
,`author_organization` varchar(255)
,`comments` int
,`created_at` datetime
,`description` text
,`download_count` int
,`grade_level` varchar(50)
,`is_featured` tinyint(1)
,`likes` int
,`resource_id` int
,`subject_name` varchar(100)
,`title` varchar(255)
,`type_name` varchar(50)
,`view_count` int
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `recent_activity`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `recent_activity`;
CREATE TABLE IF NOT EXISTS `recent_activity` (
`activity_time` datetime
,`activity_type` varchar(19)
,`resource_id` int
,`title` varchar(255)
,`user_name` varchar(100)
,`user_role` varchar(6)
);

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
  `download_count` int DEFAULT '0',
  `view_count` int DEFAULT '0',
  `likes` int DEFAULT '0',
  `comments` int DEFAULT '0',
  `is_featured` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`resource_id`),
  KEY `type_id` (`type_id`),
  KEY `subject_id` (`subject_id`),
  KEY `grade_id` (`grade_id`),
  KEY `created_by` (`created_by`),
  KEY `status` (`status`),
  KEY `is_featured` (`is_featured`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
  KEY `parent_comment_id` (`parent_comment_id`)
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
  KEY `version_id` (`version_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
  KEY `user_id` (`user_id`)
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
  `can_download` tinyint(1) DEFAULT '1',
  `can_edit` tinyint(1) DEFAULT '0',
  `can_delete` tinyint(1) DEFAULT '0',
  `expires_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`resource_id`),
  KEY `resource_id` (`resource_id`)
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
  `rating` int NOT NULL,
  `comment` text,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `reviewed_by` int DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`review_id`),
  KEY `resource_id` (`resource_id`),
  KEY `reviewer_id` (`reviewer_id`),
  KEY `reviewed_by` (`reviewed_by`)
) ;

-- --------------------------------------------------------

--
-- Stand-in structure for view `resource_stats`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `resource_stats`;
CREATE TABLE IF NOT EXISTS `resource_stats` (
`actual_comments` bigint
,`actual_downloads` bigint
,`actual_likes` bigint
,`actual_views` bigint
,`comments` int
,`download_count` int
,`likes` int
,`resource_id` int
,`title` varchar(255)
,`view_count` int
);

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
) ENGINE=InnoDB AUTO_INCREMENT=908 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `resource_tag_relations`
--

DROP TABLE IF EXISTS `resource_tag_relations`;
CREATE TABLE IF NOT EXISTS `resource_tag_relations` (
  `resource_id` int NOT NULL,
  `tag_id` int NOT NULL,
  PRIMARY KEY (`resource_id`,`tag_id`),
  KEY `tag_id` (`tag_id`)
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
  `max_file_size` int DEFAULT '104857600',
  `icon` varchar(50) DEFAULT 'document',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`type_id`),
  UNIQUE KEY `type_name` (`type_name`)
) ENGINE=InnoDB AUTO_INCREMENT=365 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
  KEY `created_by` (`created_by`)
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
  KEY `viewed_at` (`viewed_at`)
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
) ENGINE=InnoDB AUTO_INCREMENT=418 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `subject_resource_distribution`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `subject_resource_distribution`;
CREATE TABLE IF NOT EXISTS `subject_resource_distribution` (
`color` varchar(7)
,`draft_resources` bigint
,`featured_resources` bigint
,`published_resources` bigint
,`subject_id` int
,`subject_name` varchar(100)
,`total_downloads` decimal(32,0)
,`total_likes` decimal(32,0)
,`total_resources` bigint
,`total_views` decimal(32,0)
);

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
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `name`, `email`, `password`, `role`, `status`, `organization`, `designation`, `phone`, `address`, `created_at`, `updated_at`) VALUES
(1, 'System Admin', 'admin@resources.com', '$2a$12$s/3mYdNwlWknc2QJJtOfEOTXjH5PRTDf8Vl9ivVjbklYa0OqZ1yNm', 'admin', 'active', 'System', 'Administrator', NULL, NULL, '2025-08-19 14:30:40', '2025-08-19 14:30:40'),
(9, 'Demo School', 'school@demo.com', '$2a$12$I5CzBukS2QgcA30Nz6el3.C4WAKNtEfzsyjzfezdAAlreUGYu/5rW', 'school', 'active', 'Demo School', 'Teacher', '1231231231', 'Demo School, Demo Place, Demo City, 123', '2025-08-19 15:11:55', '2025-08-19 15:11:55');

-- --------------------------------------------------------

--
-- Stand-in structure for view `user_activity_summary`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `user_activity_summary`;
CREATE TABLE IF NOT EXISTS `user_activity_summary` (
`comments_made` bigint
,`email` varchar(100)
,`last_downloaded` datetime
,`last_viewed` datetime
,`name` varchar(100)
,`resources_created` bigint
,`resources_downloaded` bigint
,`resources_liked` bigint
,`resources_viewed` bigint
,`role` enum('admin','school')
,`user_id` int
);

-- --------------------------------------------------------

--
-- Structure for view `grade_resource_distribution`
--
DROP TABLE IF EXISTS `grade_resource_distribution`;

DROP VIEW IF EXISTS `grade_resource_distribution`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `grade_resource_distribution`  AS SELECT `g`.`grade_id` AS `grade_id`, `g`.`grade_level` AS `grade_level`, `g`.`grade_number` AS `grade_number`, count(`r`.`resource_id`) AS `total_resources`, count((case when (`r`.`status` = 'published') then 1 end)) AS `published_resources`, count((case when (`r`.`status` = 'draft') then 1 end)) AS `draft_resources`, count((case when (`r`.`is_featured` = 1) then 1 end)) AS `featured_resources`, sum(`r`.`download_count`) AS `total_downloads`, sum(`r`.`view_count`) AS `total_views`, sum(`r`.`likes`) AS `total_likes` FROM (`grades` `g` left join `resources` `r` on((`g`.`grade_id` = `r`.`grade_id`))) GROUP BY `g`.`grade_id`, `g`.`grade_level`, `g`.`grade_number` ;

-- --------------------------------------------------------

--
-- Structure for view `popular_resources`
--
DROP TABLE IF EXISTS `popular_resources`;

DROP VIEW IF EXISTS `popular_resources`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `popular_resources`  AS SELECT `r`.`resource_id` AS `resource_id`, `r`.`title` AS `title`, `r`.`description` AS `description`, `r`.`download_count` AS `download_count`, `r`.`view_count` AS `view_count`, `r`.`likes` AS `likes`, `r`.`comments` AS `comments`, `rt`.`type_name` AS `type_name`, `s`.`subject_name` AS `subject_name`, `g`.`grade_level` AS `grade_level`, `u`.`name` AS `author_name`, `u`.`organization` AS `author_organization`, `r`.`created_at` AS `created_at`, `r`.`is_featured` AS `is_featured` FROM ((((`resources` `r` join `resource_types` `rt` on((`r`.`type_id` = `rt`.`type_id`))) join `subjects` `s` on((`r`.`subject_id` = `s`.`subject_id`))) join `grades` `g` on((`r`.`grade_id` = `g`.`grade_id`))) join `users` `u` on((`r`.`created_by` = `u`.`user_id`))) WHERE (`r`.`status` = 'published') ORDER BY ((`r`.`download_count` + `r`.`view_count`) + `r`.`likes`) DESC ;

-- --------------------------------------------------------

--
-- Structure for view `recent_activity`
--
DROP TABLE IF EXISTS `recent_activity`;

DROP VIEW IF EXISTS `recent_activity`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `recent_activity`  AS SELECT 'resource_created' AS `activity_type`, `r`.`resource_id` AS `resource_id`, `r`.`title` AS `title`, `u`.`name` AS `user_name`, `u`.`role` AS `user_role`, `r`.`created_at` AS `activity_time` FROM (`resources` `r` join `users` `u` on((`r`.`created_by` = `u`.`user_id`)))union all select 'resource_downloaded' AS `activity_type`,`r`.`resource_id` AS `resource_id`,`r`.`title` AS `title`,`u`.`name` AS `user_name`,`u`.`role` AS `user_role`,`rd`.`downloaded_at` AS `activity_time` from ((`resource_downloads` `rd` join `resources` `r` on((`rd`.`resource_id` = `r`.`resource_id`))) join `users` `u` on((`rd`.`user_id` = `u`.`user_id`))) union all select 'resource_liked' AS `activity_type`,`r`.`resource_id` AS `resource_id`,`r`.`title` AS `title`,`u`.`name` AS `user_name`,`u`.`role` AS `user_role`,`rl`.`created_at` AS `activity_time` from ((`resource_likes` `rl` join `resources` `r` on((`rl`.`resource_id` = `r`.`resource_id`))) join `users` `u` on((`rl`.`user_id` = `u`.`user_id`))) order by `activity_time` desc  ;

-- --------------------------------------------------------

--
-- Structure for view `resource_stats`
--
DROP TABLE IF EXISTS `resource_stats`;

DROP VIEW IF EXISTS `resource_stats`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `resource_stats`  AS SELECT `r`.`resource_id` AS `resource_id`, `r`.`title` AS `title`, `r`.`download_count` AS `download_count`, `r`.`view_count` AS `view_count`, `r`.`likes` AS `likes`, `r`.`comments` AS `comments`, count(distinct `rv`.`view_id`) AS `actual_views`, count(distinct `rd`.`download_id`) AS `actual_downloads`, count(distinct `rl`.`user_id`) AS `actual_likes`, count(distinct `rc`.`comment_id`) AS `actual_comments` FROM ((((`resources` `r` left join `resource_views` `rv` on((`r`.`resource_id` = `rv`.`resource_id`))) left join `resource_downloads` `rd` on((`r`.`resource_id` = `rd`.`resource_id`))) left join `resource_likes` `rl` on((`r`.`resource_id` = `rl`.`resource_id`))) left join `resource_comments` `rc` on(((`r`.`resource_id` = `rc`.`comment_id`) and (`rc`.`status` = 'active')))) GROUP BY `r`.`resource_id`, `r`.`title`, `r`.`download_count`, `r`.`view_count`, `r`.`likes`, `r`.`comments` ;

-- --------------------------------------------------------

--
-- Structure for view `subject_resource_distribution`
--
DROP TABLE IF EXISTS `subject_resource_distribution`;

DROP VIEW IF EXISTS `subject_resource_distribution`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `subject_resource_distribution`  AS SELECT `s`.`subject_id` AS `subject_id`, `s`.`subject_name` AS `subject_name`, `s`.`color` AS `color`, count(`r`.`resource_id`) AS `total_resources`, count((case when (`r`.`status` = 'published') then 1 end)) AS `published_resources`, count((case when (`r`.`status` = 'draft') then 1 end)) AS `draft_resources`, count((case when (`r`.`is_featured` = 1) then 1 end)) AS `featured_resources`, sum(`r`.`download_count`) AS `total_downloads`, sum(`r`.`view_count`) AS `total_views`, sum(`r`.`likes`) AS `total_likes` FROM (`subjects` `s` left join `resources` `r` on((`s`.`subject_id` = `r`.`subject_id`))) GROUP BY `s`.`subject_id`, `s`.`subject_name`, `s`.`color` ;

-- --------------------------------------------------------

--
-- Structure for view `user_activity_summary`
--
DROP TABLE IF EXISTS `user_activity_summary`;

DROP VIEW IF EXISTS `user_activity_summary`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `user_activity_summary`  AS SELECT `u`.`user_id` AS `user_id`, `u`.`name` AS `name`, `u`.`email` AS `email`, `u`.`role` AS `role`, count(distinct `r`.`resource_id`) AS `resources_created`, count(distinct `rv`.`view_id`) AS `resources_viewed`, count(distinct `rd`.`download_id`) AS `resources_downloaded`, count(distinct `rl`.`resource_id`) AS `resources_liked`, count(distinct `rc`.`comment_id`) AS `comments_made`, max(`rv`.`viewed_at`) AS `last_viewed`, max(`rd`.`downloaded_at`) AS `last_downloaded` FROM (((((`users` `u` left join `resources` `r` on((`u`.`user_id` = `r`.`created_by`))) left join `resource_views` `rv` on((`u`.`user_id` = `rv`.`user_id`))) left join `resource_downloads` `rd` on((`u`.`user_id` = `rd`.`user_id`))) left join `resource_likes` `rl` on((`u`.`user_id` = `rl`.`user_id`))) left join `resource_comments` `rc` on(((`u`.`user_id` = `rc`.`user_id`) and (`rc`.`status` = 'active')))) GROUP BY `u`.`user_id`, `u`.`name`, `u`.`email`, `u`.`role` ;

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
