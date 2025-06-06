ALTER TABLE images
    ALTER COLUMN cloudinary_public_id TYPE VARCHAR(255),
    ALTER COLUMN original_filename TYPE VARCHAR(255),
    ALTER COLUMN original_format TYPE VARCHAR(255),
    ALTER COLUMN original_storage_path TYPE VARCHAR(1024);