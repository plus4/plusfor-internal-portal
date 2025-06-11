import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { MembersList } from "./components/members-list";

// データ取得とページ表示を統合
async function getAllMembers() {
  const supabase = await createClient();

  // 認証チェック
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect("/auth/login");
  }

  // メンバー一覧取得（全件、部署順ソート）
  const { data: members, error } = await supabase
    .from("users")
    .select("*")
    .order("department", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching members:", error);
    throw error;
  }

  return members || [];
}

export default async function MembersPage() {
  const members = await getAllMembers();

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="container max-w-6xl mx-auto py-8 px-4">
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">メンバーディレクトリ</h1>
                <p className="text-muted-foreground">
                  社内メンバーの一覧を確認できます。
                </p>
              </div>
              
              <MembersList members={members} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}