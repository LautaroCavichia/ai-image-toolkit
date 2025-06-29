-- Add email verification fields to users table
ALTER TABLE users 
ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN email_verified_at TIMESTAMPTZ;

-- Create email verification tokens table
CREATE TABLE email_verification_token (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL,
    expiration TIMESTAMPTZ NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_email_verification_token_token ON email_verification_token(token);
CREATE INDEX idx_email_verification_token_user_id ON email_verification_token(user_id);
CREATE INDEX idx_email_verification_token_expiration ON email_verification_token(expiration);

-- Update existing users to be email verified (for backward compatibility)
UPDATE users SET email_verified = TRUE WHERE email_verified = FALSE;