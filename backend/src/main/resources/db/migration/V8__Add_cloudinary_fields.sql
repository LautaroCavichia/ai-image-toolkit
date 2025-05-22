
ALTER TABLE processed_images ADD COLUMN cloudinary_public_id VARCHAR(255);
ALTER TABLE processed_images ADD COLUMN scheduled_deletion_at TIMESTAMPTZ;
ALTER TABLE processed_images ADD COLUMN is_premium BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE images ADD COLUMN cloudinary_public_id VARCHAR(255);

-- Index for cleanup operations
CREATE INDEX idx_processed_images_deletion_scheduled ON processed_images(scheduled_deletion_at) WHERE scheduled_deletion_at IS NOT NULL;
CREATE INDEX idx_processed_images_premium ON processed_images(is_premium);