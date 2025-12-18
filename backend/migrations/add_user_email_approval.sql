-- Add email and approval system to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT FALSE;

-- Auto-approve existing admin user
UPDATE users SET approved = TRUE WHERE role = 'admin';

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
