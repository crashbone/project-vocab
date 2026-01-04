-- Run this query in Beekeeper Studio after connecting to the 'project-vocab' database.

CREATE TABLE "pages" (
    -- Primary Key: Big integer (64-bit) that automatically increments
    id BIGSERIAL PRIMARY KEY,

    -- Foreign Key reference to the user table (assuming one exists). 
    -- If this is an identifier for the user table, BIGINT is correct.
    user_id BIGINT NOT NULL,

    -- Descriptive name for the page. Changed from VARCHAR(255) to a maximum length of 64 characters.
    name VARCHAR(64) NOT NULL,

    -- Longer description. Changed from TEXT to a maximum length of 1000 characters.
    description VARCHAR(1000),

    -- Stores the potentially large and compressed word data. 
    -- JSONB is PostgreSQL's optimized binary JSON type, allowing for 
    -- indexing and efficient storage/retrieval of JSON data.
    words JSONB,

    -- Total time spent. BIGINT easily accommodates numbers up to 9 quintillion.
    time_spent_seconds BIGINT DEFAULT 0,

    -- Timestamp for the last time the entry was modified or saved
    last_entry_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Create an index on user_id for fast lookup of a user's pages
CREATE INDEX idx_pages_user_id ON pages (user_id);

-- Optional: Add comments to the columns for better documentation
COMMENT ON TABLE pages IS 'Stores individual vocabulary or project pages created by users.';
COMMENT ON COLUMN pages.words IS 'Large JSON data structure containing compressed word entries.';
COMMENT ON COLUMN pages.time_spent_seconds IS 'Total time spent editing this page, stored in seconds.';