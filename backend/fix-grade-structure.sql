-- Fix Grade Structure
-- 1. Remove UNIQUE constraint on grade_number
-- 2. Add subject_id to grades table for hierarchy

-- First, drop the UNIQUE constraint on grade_number
ALTER TABLE `grades` DROP INDEX `grade_number`;

-- Add subject_id column to grades table
ALTER TABLE `grades` ADD COLUMN `subject_id` int NULL AFTER `grade_id`;

-- Add foreign key constraint
ALTER TABLE `grades` ADD CONSTRAINT `fk_grades_subject` 
FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`subject_id`) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- Add index for better performance
ALTER TABLE `grades` ADD INDEX `idx_grades_subject` (`subject_id`);

-- Update existing grades to have a default subject (you can change this later)
-- This assumes you have at least one subject in the database
UPDATE `grades` SET `subject_id` = (SELECT MIN(`subject_id`) FROM `subjects`) 
WHERE `subject_id` IS NULL;

-- Add display_order field to resources table for custom ordering
ALTER TABLE resources ADD COLUMN display_order INT DEFAULT 0;

-- Update existing resources to have sequential display_order based on created_at
UPDATE resources SET display_order = (
  SELECT rn FROM (
    SELECT resource_id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
    FROM resources
  ) ranked
  WHERE ranked.resource_id = resources.resource_id
);

-- Add index for better performance
CREATE INDEX idx_resources_display_order ON resources(display_order);

-- Add index for grade-specific ordering
CREATE INDEX idx_resources_grade_display_order ON resources(grade_id, display_order);

