-- Add user_type field to users table and target_audience to announcements table

-- Create ENUM types for user type and target audience
CREATE TYPE user_type_enum AS ENUM ('EMPLOYEE', 'BP');
CREATE TYPE target_audience_enum AS ENUM ('EMPLOYEE', 'BP', 'ALL');

-- Add user_type column to users table
ALTER TABLE users 
ADD COLUMN user_type user_type_enum NOT NULL DEFAULT 'EMPLOYEE';

-- Add target_audience column to announcements table
ALTER TABLE announcements 
ADD COLUMN target_audience target_audience_enum NOT NULL DEFAULT 'ALL';

-- Update existing sample data to have appropriate target audiences
UPDATE announcements SET target_audience = 'EMPLOYEE' 
WHERE title IN (
  'システムメンテナンスのお知らせ',
  '新入社員研修の開催',
  '社内勉強会の開催'
);

UPDATE announcements SET target_audience = 'BP' 
WHERE title IN (
  'リモートワークガイドラインの更新'
);

-- All other announcements remain as 'ALL' (default)

-- Create index for performance on filtering
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_announcements_target_audience ON announcements(target_audience);