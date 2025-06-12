import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? (
    <div className="flex items-center gap-4">
      {user.email}さん
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">ログイン</Link>
      </Button>
      {/* 本番環境では新規登録を無効化 - 管理者による登録のみ許可 */}
      {/* <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up">新規登録</Link>
      </Button> */}
    </div>
  );
} 
