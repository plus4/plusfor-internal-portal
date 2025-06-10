-- Consolidated schema migration for plusfor-internal-portal
-- This file creates the complete database schema from scratch

-- =======================================
-- DROP ALL EXISTING RESOURCES
-- =======================================

-- Drop all triggers first (dependent on functions and tables)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_announcements_updated_at ON announcements;

-- Drop all functions (may be used by triggers)
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_user_update();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop all policies (dependent on tables)
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Users can update profiles" ON users;
DROP POLICY IF EXISTS "Allow system and admins to insert users" ON users;
DROP POLICY IF EXISTS "Only admins can delete users" ON users;
DROP POLICY IF EXISTS "Users can view announcements" ON announcements;
DROP POLICY IF EXISTS "Only admins can insert announcements" ON announcements;
DROP POLICY IF EXISTS "Only admins can update announcements" ON announcements;
DROP POLICY IF EXISTS "Only admins can delete announcements" ON announcements;
DROP POLICY IF EXISTS "Users can read their own announcement reads" ON announcement_reads;
DROP POLICY IF EXISTS "Users can insert their own announcement reads" ON announcement_reads;

-- Drop old policies (from previous migrations)
DROP POLICY IF EXISTS "Allow authenticated users to read announcements" ON announcements;
DROP POLICY IF EXISTS "Allow authenticated users to create announcements" ON announcements;
DROP POLICY IF EXISTS "Allow authenticated users to update announcements" ON announcements;
DROP POLICY IF EXISTS "Allow authenticated users to delete announcements" ON announcements;
DROP POLICY IF EXISTS "Allow authenticated users to read users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;
DROP POLICY IF EXISTS "Only admins can insert users" ON users;
DROP POLICY IF EXISTS "Users can view published announcements" ON announcements;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON announcements;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON announcements;

-- Drop all indexes (dependent on tables)
DROP INDEX IF EXISTS idx_users_user_type;
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_announcements_target_audience;
DROP INDEX IF EXISTS idx_announcement_reads_user_id;
DROP INDEX IF EXISTS idx_announcement_reads_announcement_id;

-- Drop all tables (in reverse dependency order)
DROP TABLE IF EXISTS announcement_reads;  -- depends on users and announcements
DROP TABLE IF EXISTS announcements;      -- independent
DROP TABLE IF EXISTS users;              -- depends on auth.users (foreign key)

-- Drop all ENUM types (may be used by tables)
DROP TYPE IF EXISTS user_type_enum;
DROP TYPE IF EXISTS user_role_enum;
DROP TYPE IF EXISTS target_audience_enum;

-- =======================================
-- CREATE ENUM TYPES
-- =======================================

-- Create ENUM types for user management
CREATE TYPE user_type_enum AS ENUM ('EMPLOYEE', 'BP');
CREATE TYPE user_role_enum AS ENUM ('ADMIN', 'USER');
CREATE TYPE target_audience_enum AS ENUM ('EMPLOYEE', 'BP', 'ALL');

-- =======================================
-- CREATE TABLES
-- =======================================

-- Create announcements table
CREATE TABLE announcements (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_published BOOLEAN DEFAULT false NOT NULL,
  target_audience target_audience_enum NOT NULL DEFAULT 'ALL',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  user_type user_type_enum NOT NULL DEFAULT 'EMPLOYEE',
  role user_role_enum NOT NULL DEFAULT 'USER',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create announcement_reads table for tracking read status
CREATE TABLE announcement_reads (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  announcement_id BIGINT NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Composite primary key to prevent duplicate reads
  PRIMARY KEY (user_id, announcement_id)
);

-- =======================================
-- CREATE INDEXES
-- =======================================

-- Performance indexes
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_announcements_target_audience ON announcements(target_audience);
CREATE INDEX idx_announcement_reads_user_id ON announcement_reads(user_id);
CREATE INDEX idx_announcement_reads_announcement_id ON announcement_reads(announcement_id);

-- =======================================
-- CREATE FUNCTIONS
-- =======================================

-- Function to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, user_type, role, department, position)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'EMPLOYEE')::public.user_type_enum,
    COALESCE(NEW.raw_user_meta_data->>'role', 'USER')::public.user_role_enum,
    COALESCE(NEW.raw_user_meta_data->>'department', ''),
    COALESCE(NEW.raw_user_meta_data->>'position', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =======================================
-- CREATE TRIGGERS
-- =======================================

-- Trigger to automatically update updated_at for users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to automatically update updated_at for announcements table
CREATE TRIGGER update_announcements_updated_at
    BEFORE UPDATE ON announcements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to handle new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =======================================
-- ENABLE ROW LEVEL SECURITY
-- =======================================

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_reads ENABLE ROW LEVEL SECURITY;

-- =======================================
-- CREATE RLS POLICIES
-- =======================================

-- Users table policies
-- Allow authenticated users to view all user profiles
CREATE POLICY "Users can view all profiles" ON users
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow users to update their own profile, admins can update any profile
CREATE POLICY "Users can update profiles" ON users
    FOR UPDATE USING (
        auth.uid() = id OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Allow system (trigger) and admins to insert new users
CREATE POLICY "Allow system and admins to insert users" ON users
    FOR INSERT WITH CHECK (
        auth.uid() IS NULL OR  -- Allow system/trigger operations
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Only admins can delete users
CREATE POLICY "Only admins can delete users" ON users
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Announcements table policies
-- Allow users to view published announcements based on target audience
CREATE POLICY "Users can view announcements" ON announcements
    FOR SELECT USING (
        is_published = true AND
        auth.role() = 'authenticated' AND
        (
            target_audience = 'ALL' OR
            target_audience::text = (
                SELECT user_type::text FROM users 
                WHERE id = auth.uid()
            )
        )
    );

-- Only admins can insert announcements
CREATE POLICY "Only admins can insert announcements" ON announcements
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Only admins can update announcements
CREATE POLICY "Only admins can update announcements" ON announcements
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Only admins can delete announcements
CREATE POLICY "Only admins can delete announcements" ON announcements
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Announcement reads table policies
-- Users can only read their own read status
CREATE POLICY "Users can read their own announcement reads"
  ON announcement_reads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can only insert their own read status
CREATE POLICY "Users can insert their own announcement reads"
  ON announcement_reads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- =======================================
-- INSERT SAMPLE DATA
-- =======================================

-- Insert sample data for announcements with random timestamps within 1 year
INSERT INTO announcements (title, content, is_published, target_audience, created_at, updated_at) VALUES
  ('システムメンテナンスのお知らせ', '来週月曜日の深夜にシステムメンテナンスを実施します。

実施時間：2024年4月1日 23:00 〜 4月2日 3:00

メンテナンス中はシステムが利用できなくなりますので、ご注意ください。', true, 'ALL', 
   NOW() - INTERVAL '45 days', NOW() - INTERVAL '45 days'),
  ('新入社員研修の開催', '4月1日より新入社員研修を開催します。

日時：2024年4月1日 〜 4月5日
場所：本社3階 研修室

新入社員の皆様は、指定された時間に集合してください。', true, 'EMPLOYEE',
   NOW() - INTERVAL '120 days', NOW() - INTERVAL '120 days'),
  ('社内イベントの開催', '来月社内イベントを開催予定です。

日時：2024年5月15日 18:00 〜 20:00
場所：本社1階 イベントホール

参加希望の方は、4月末日までに人事部までご連絡ください。', true, 'ALL',
   NOW() - INTERVAL '78 days', NOW() - INTERVAL '78 days'),
  ('オフィス移転のお知らせ', '本社オフィスが移転いたします。

新住所：東京都千代田区丸の内1-1-1
移転日：2024年6月1日

移転に伴い、電話番号も変更となります。詳細は後日お知らせします。', false, 'ALL',
   NOW() - INTERVAL '200 days', NOW() - INTERVAL '200 days'),
  ('夏季休暇のご案内', '夏季休暇の期間が決定いたしました。

期間：2024年8月12日 〜 8月16日

休暇取得希望の方は、7月末日までに申請をお願いします。', false, 'EMPLOYEE',
   NOW() - INTERVAL '89 days', NOW() - INTERVAL '89 days'),
  ('社内システムのアップデート', '社内システムのアップデートを実施します。

実施日：2024年4月15日

主な変更点：
・UIの改善
・パフォーマンスの向上
・セキュリティの強化

詳細は社内ポータルサイトでご確認ください。', true, 'ALL',
   NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
  ('健康診断のご案内', '定期健康診断を実施いたします。

日時：2024年5月20日 〜 5月24日
場所：本社2階 健康管理室

予約方法などの詳細は、4月中に各部署の担当者からご案内いたします。', false, 'EMPLOYEE',
   NOW() - INTERVAL '156 days', NOW() - INTERVAL '156 days'),
  ('社内表彰制度の開始', '新たな社内表彰制度を開始いたします。

表彰対象：
・優秀な業績を上げた社員
・イノベーションを起こした社員
・チームワークに貢献した社員

詳細は人事部までお問い合わせください。', true, 'ALL',
   NOW() - INTERVAL '67 days', NOW() - INTERVAL '67 days'),
  ('リモートワークガイドラインの更新', 'リモートワークガイドラインを更新いたしました。

主な変更点：
・在宅勤務の申請方法の簡素化
・通信費の支給基準の見直し
・セキュリティガイドラインの追加

詳細は社内ポータルサイトでご確認ください。', true, 'BP',
   NOW() - INTERVAL '234 days', NOW() - INTERVAL '234 days'),
  ('社内勉強会の開催', '技術勉強会を開催いたします。

テーマ：「最新のWeb開発トレンド」
日時：2024年4月25日 18:00 〜 19:30
場所：本社4階 会議室A

参加希望の方は、4月20日までに開発部までご連絡ください。', false, 'EMPLOYEE',
   NOW() - INTERVAL '310 days', NOW() - INTERVAL '310 days');

-- Set first user as admin (this should be done manually in production)
-- UPDATE users SET role = 'ADMIN' 
-- WHERE id = (SELECT id FROM users ORDER BY created_at LIMIT 1);