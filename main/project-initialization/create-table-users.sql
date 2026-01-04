-- Run this query in Beekeeper Studio (or terminal) after connecting to the 'project-vocab' database.

CREATE TABLE "users" (
    -- Primary Key: The standard unique identifier for users
    user_id BIGSERIAL PRIMARY KEY,

    -- Unique Google identifier for OAuth/Sign-in purposes
    google_user_id TEXT UNIQUE NOT NULL,

    -- Email address, must be unique
    email VARCHAR(255) UNIQUE NOT NULL,

    -- Display name
    name VARCHAR(255),

    -- URL of the user's avatar/profile picture
    avatar_url TEXT,

    -- Timestamp for when the user record was created
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for quick lookups by email (useful for login/search)
CREATE INDEX idx_users_email ON users (email);

-- Index for quick lookups by Google ID
CREATE INDEX idx_users_google_id ON users (google_user_id);