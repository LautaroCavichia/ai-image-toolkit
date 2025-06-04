CREATE TABLE password_reset_token (
    id UUID PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL,
    expiration TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);
