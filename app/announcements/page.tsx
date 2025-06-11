import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { createClient } from "@/lib/supabase/server";

async function getUserData() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("認証が必要です");
  }

  const { data: profile, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }

  return {
    isAdmin: profile.role === 'ADMIN'
  };
}

export default async function AnnouncementsPage() {
  const { isAdmin } = await getUserData();

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar isAdmin={isAdmin} />
          <main className="flex-1 p-8">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold mb-8">お知らせ</h1>
              <p className="text-muted-foreground">お知らせページの内容は後で実装予定です。</p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}