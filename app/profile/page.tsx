import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { ProfileForm } from "./components/profile-form";

// データ取得とページ表示を統合
async function getCurrentUserProfile() {
  const supabase = await createClient();

  // 認証チェック
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect("/auth/login");
  }

  // ユーザー情報取得
  const { data: userProfile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Error fetching user profile:", profileError);
    // プロフィールが見つからない場合はデフォルト値を使用
  }

  return { user, userProfile };
}

export default async function ProfilePage() {
  const { user, userProfile } = await getCurrentUserProfile();

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="container max-w-4xl mx-auto py-8 px-4">
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">プロフィール</h1>
                <p className="text-muted-foreground">
                  あなたのプロフィール情報を確認・編集できます。
                </p>
              </div>
              
              <ProfileForm
                user={user}
                userProfile={userProfile}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}