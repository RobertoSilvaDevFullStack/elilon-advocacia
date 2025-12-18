-- Migration: Add education, specializations, and location fields to professionals table
-- Created: 2025-12-18
-- Description: Adds missing fields for professional profiles detail page

-- Add location column (simple text)
ALTER TABLE professionals 
ADD COLUMN IF NOT EXISTS location VARCHAR(255) DEFAULT 'Escritório Central';

-- Add education column (JSONB array for flexibility)
ALTER TABLE professionals 
ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]'::jsonb;

-- Add specializations column (JSONB array for flexibility)
ALTER TABLE professionals 
ADD COLUMN IF NOT EXISTS specializations JSONB DEFAULT '[]'::jsonb;

-- Optional: Update existing records with sample data (remove if not needed)
-- UPDATE professionals SET location = 'Escritório Central' WHERE location IS NULL;
-- UPDATE professionals SET education = '[]'::jsonb WHERE education IS NULL;
-- UPDATE professionals SET specializations = '[]'::jsonb WHERE specializations IS NULL;

-- Verify changes
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'professionals'
AND column_name IN ('location', 'education', 'specializations');
