-- Drop existing tables and policies
DROP POLICY IF EXISTS "Allow authenticated users to read announcements" ON announcements;
DROP POLICY IF EXISTS "Allow authenticated users to create announcements" ON announcements;
DROP POLICY IF EXISTS "Allow authenticated users to update announcements" ON announcements;
DROP POLICY IF EXISTS "Allow authenticated users to delete announcements" ON announcements;
DROP POLICY IF EXISTS "Allow authenticated users to read users" ON users;

DROP TABLE IF EXISTS announcements;
DROP TABLE IF EXISTS users;

-- Create announcements table
CREATE TABLE announcements (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_published BOOLEAN DEFAULT false NOT NULL,
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create RLS policies
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read announcements
CREATE POLICY "Allow authenticated users to read announcements"
  ON announcements FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to create announcements
CREATE POLICY "Allow authenticated users to create announcements"
  ON announcements FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update announcements
CREATE POLICY "Allow authenticated users to update announcements"
  ON announcements FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete announcements
CREATE POLICY "Allow authenticated users to delete announcements"
  ON announcements FOR DELETE
  TO authenticated
  USING (true);

-- Allow authenticated users to read users
CREATE POLICY "Allow authenticated users to read users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- Insert sample data for announcements
INSERT INTO announcements (title, content, is_published) VALUES
  ('システムメンテナンスのお知らせ', '来週月曜日の深夜にシステムメンテナンスを実施します。\n\n実施時間：2024年4月1日 23:00 〜 4月2日 3:00\n\nメンテナンス中はシステムが利用できなくなりますので、ご注意ください。', true),
  ('新入社員研修の開催', '4月1日より新入社員研修を開催します。\n\n日時：2024年4月1日 〜 4月5日\n場所：本社3階 研修室\n\n新入社員の皆様は、指定された時間に集合してください。', true),
  ('社内イベントの開催', '来月社内イベントを開催予定です。\n\n日時：2024年5月15日 18:00 〜 20:00\n場所：本社1階 イベントホール\n\n参加希望の方は、4月末日までに人事部までご連絡ください。', true),
  ('オフィス移転のお知らせ', '本社オフィスが移転いたします。\n\n新住所：東京都千代田区丸の内1-1-1\n移転日：2024年6月1日\n\n移転に伴い、電話番号も変更となります。詳細は後日お知らせします。', false),
  ('夏季休暇のご案内', '夏季休暇の期間が決定いたしました。\n\n期間：2024年8月12日 〜 8月16日\n\n休暇取得希望の方は、7月末日までに申請をお願いします。', false),
  ('社内システムのアップデート', '社内システムのアップデートを実施します。\n\n実施日：2024年4月15日\n\n主な変更点：\n・UIの改善\n・パフォーマンスの向上\n・セキュリティの強化\n\n詳細は社内ポータルサイトでご確認ください。', true),
  ('健康診断のご案内', '定期健康診断を実施いたします。\n\n日時：2024年5月20日 〜 5月24日\n場所：本社2階 健康管理室\n\n予約方法などの詳細は、4月中に各部署の担当者からご案内いたします。', false),
  ('社内表彰制度の開始', '新たな社内表彰制度を開始いたします。\n\n表彰対象：\n・優秀な業績を上げた社員\n・イノベーションを起こした社員\n・チームワークに貢献した社員\n\n詳細は人事部までお問い合わせください。', true),
  ('リモートワークガイドラインの更新', 'リモートワークガイドラインを更新いたしました。\n\n主な変更点：\n・在宅勤務の申請方法の簡素化\n・通信費の支給基準の見直し\n・セキュリティガイドラインの追加\n\n詳細は社内ポータルサイトでご確認ください。', true),
  ('社内勉強会の開催', '技術勉強会を開催いたします。\n\nテーマ：「最新のWeb開発トレンド」\n日時：2024年4月25日 18:00 〜 19:30\n場所：本社4階 会議室A\n\n参加希望の方は、4月20日までに開発部までご連絡ください。', false); 