-- Drop existing function and trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into employees table
  INSERT INTO public.employees (id, name, department, position, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', '名前未設定'),
    COALESCE(NEW.raw_user_meta_data->>'department', '部署未設定'),
    COALESCE(NEW.raw_user_meta_data->>'position', '役職未設定'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
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