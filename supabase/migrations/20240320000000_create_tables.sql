-- Create announcements table
CREATE TABLE announcements (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create employees table
CREATE TABLE employees (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create RLS policies
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read announcements
CREATE POLICY "Allow authenticated users to read announcements"
  ON announcements FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to read employees
CREATE POLICY "Allow authenticated users to read employees"
  ON employees FOR SELECT
  TO authenticated
  USING (true);

-- Insert sample data
INSERT INTO announcements (title, content) VALUES
  ('システムメンテナンスのお知らせ', '来週月曜日の深夜にシステムメンテナンスを実施します。'),
  ('新入社員研修の開催', '4月1日より新入社員研修を開催します。'),
  ('社内イベントの開催', '来月社内イベントを開催予定です。詳細は後日お知らせします。');

INSERT INTO employees (name, department, position, email) VALUES
  ('山田 太郎', '開発部', 'シニアエンジニア', 'yamada@example.com'),
  ('鈴木 花子', '営業部', 'マネージャー', 'suzuki@example.com'),
  ('佐藤 次郎', '人事部', '部長', 'sato@example.com'),
  ('田中 美咲', '開発部', 'フロントエンドエンジニア', 'tanaka@example.com'),
  ('伊藤 健太', '開発部', 'バックエンドエンジニア', 'ito@example.com'),
  ('渡辺 真理', '営業部', '営業担当', 'watanabe@example.com'),
  ('高橋 和也', '開発部', 'テックリード', 'takahashi@example.com'),
  ('小林 恵子', '人事部', '人事担当', 'kobayashi@example.com'),
  ('加藤 大輔', '開発部', 'インフラエンジニア', 'kato@example.com'),
  ('吉田 優子', '営業部', '営業担当', 'yoshida@example.com'),
  ('山本 直樹', '開発部', 'QAエンジニア', 'yamamoto@example.com'),
  ('中村 美穂', '人事部', '採用担当', 'nakamura@example.com'),
  ('松本 翔太', '開発部', 'モバイルエンジニア', 'matsumoto@example.com'),
  ('井上 裕子', '営業部', '営業担当', 'inoue@example.com'),
  ('木村 健一', '開発部', 'セキュリティエンジニア', 'kimura@example.com'); 