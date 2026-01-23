-- Migration 006: Reset all feedback
-- Clear group_feedback table to start fresh
-- Reason: Feedback loop was reinforcing bad patterns (simple groups like "Färger")

-- Delete all feedback
DELETE FROM group_feedback;

-- Reset sequence/counter if needed (PostgreSQL specific)
-- This ensures IDs start fresh
ALTER SEQUENCE IF EXISTS group_feedback_id_seq RESTART WITH 1;

-- Verify deletion
-- Run this after to check: SELECT COUNT(*) FROM group_feedback;

-- Comment
COMMENT ON TABLE group_feedback IS 'Individual ratings for each group. Reset 2026-01-23 due to quality issues from feedback loop.';
