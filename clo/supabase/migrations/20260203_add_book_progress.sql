-- Add progress column to read_list table for book reading progress tracking
-- This supports the new MIND module's Book List feature with slider-based progress

ALTER TABLE read_list ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;

-- Add constraint to ensure progress is between 0 and 100
ALTER TABLE read_list ADD CONSTRAINT progress_range CHECK (progress >= 0 AND progress <= 100);

-- Add comment for documentation
COMMENT ON COLUMN read_list.progress IS 'Reading progress percentage (0-100)';
