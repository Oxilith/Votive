-- Update existing NULL values to 'prefer-not-to-say'
UPDATE "User" SET "gender" = 'prefer-not-to-say' WHERE "gender" IS NULL;

-- SQLite doesn't support ALTER COLUMN NOT NULL, so application-level validation enforces this
-- The UPDATE above ensures no NULLs exist in the database
