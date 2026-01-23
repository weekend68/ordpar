-- Remove difficulty_level column from word_sets table
ALTER TABLE word_sets DROP COLUMN IF EXISTS difficulty_level;
