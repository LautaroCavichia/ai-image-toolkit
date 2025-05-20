-- Add version column to users table for optimistic locking
ALTER TABLE users ADD COLUMN version INTEGER DEFAULT 0;