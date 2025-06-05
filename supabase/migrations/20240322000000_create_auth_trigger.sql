-- ユーザー登録時に従業員レコードを作成する関数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 新規ユーザーのメールアドレスから従業員情報を取得
  -- 注: 実際の運用では、別の方法（例: 管理画面からの登録）で従業員情報を登録することを推奨
  INSERT INTO public.employees (id, name, department, position, email)
  VALUES (
    NEW.id,
    SPLIT_PART(NEW.email, '@', 1), -- メールアドレスの@より前の部分を名前として使用
    '未設定', -- デフォルトの部署
    '未設定', -- デフォルトの役職
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 新規ユーザー作成時にトリガーを発火
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 既存のユーザーに対して従業員レコードが存在しない場合に作成する関数
CREATE OR REPLACE FUNCTION public.create_missing_employee_records()
RETURNS void AS $$
DECLARE
  auth_user RECORD;
BEGIN
  FOR auth_user IN SELECT id, email FROM auth.users
  LOOP
    -- 従業員レコードが存在しない場合のみ作成
    IF NOT EXISTS (SELECT 1 FROM public.employees WHERE id = auth_user.id) THEN
      INSERT INTO public.employees (id, name, department, position, email)
      VALUES (
        auth_user.id,
        SPLIT_PART(auth_user.email, '@', 1),
        '未設定',
        '未設定',
        auth_user.email
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 既存のユーザーに対して従業員レコードを作成
SELECT public.create_missing_employee_records();

-- 関数を削除（一度だけ実行するため）
DROP FUNCTION public.create_missing_employee_records(); 