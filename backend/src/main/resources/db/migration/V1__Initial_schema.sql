-- This SQL script creates the initial schema for the image processing application.

-- ENUM types
CREATE TYPE job_type_enum AS ENUM ('BG_REMOVAL', 'UPSCALE', 'ENLARGE');
CREATE TYPE job_status_enum AS ENUM ('PENDING', 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');
CREATE TYPE batch_status_enum AS ENUM ('PENDING', 'PROCESSING', 'PARTIALLY_COMPLETED', 'COMPLETED', 'FAILED');

-- Users table
CREATE TABLE users (
    user_id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

-- Batches table
CREATE TABLE batches (
    batch_id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    batch_name VARCHAR(255),
    status batch_status_enum NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Images table
CREATE TABLE images (
    image_id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    original_storage_path VARCHAR(1024) NOT NULL,
    original_filename VARCHAR(50) NOT NULL,
    original_filesize_bytes BIGINT NOT NULL,
    original_format VARCHAR(10) NOT NULL,
    original_width INT NOT NULL,
    original_height INT NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Jobs table
CREATE TABLE jobs (
    job_id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    original_image_id UUID NOT NULL,
    batch_id UUID,
    job_type job_type_enum NOT NULL,
    status job_status_enum NOT NULL DEFAULT 'PENDING',
    priority INT,
    job_config JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (original_image_id) REFERENCES images(image_id),
    FOREIGN KEY (batch_id) REFERENCES batches(batch_id)
);

-- Processed Images table
CREATE TABLE processed_images (
    processed_image_id UUID PRIMARY KEY,
    original_image_id UUID NOT NULL,
    job_id UUID NOT NULL,
    processed_storage_path VARCHAR(1024) NOT NULL,
    processed_filename VARCHAR(50) NOT NULL,
    processed_filesize_bytes BIGINT NOT NULL,
    processed_format VARCHAR(10) NOT NULL,
    processed_width INT NOT NULL,
    processed_height INT NOT NULL,
    processing_params JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (original_image_id) REFERENCES images(image_id),
    FOREIGN KEY (job_id) REFERENCES jobs(job_id)
);

-- Indexes on foreign keys to improve query performance
CREATE INDEX idx_images_user_id ON images(user_id);
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_image_id ON jobs(original_image_id);
CREATE INDEX idx_jobs_batch_id ON jobs(batch_id);
CREATE INDEX idx_processed_images_image_id ON processed_images(original_image_id);
CREATE INDEX idx_processed_images_job_id ON processed_images(job_id);
CREATE INDEX idx_batches_user_id ON batches(user_id);
