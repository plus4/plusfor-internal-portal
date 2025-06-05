-- 既存のデータをバックアップ
CREATE TABLE employees_backup AS SELECT * FROM employees;

-- 既存のテーブルを削除
DROP TABLE employees;

-- 新しい構造でテーブルを作成
CREATE TABLE employees (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLSポリシーを再作成
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read employees"
  ON employees FOR SELECT
  TO authenticated
  USING (true);

-- バックアップテーブルを削除
DROP TABLE employees_backup; 