import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { createClient } from "@/lib/supabase/server";
import { MemberList } from "@/components/members/member-list";

async function getMembersData() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("認証が必要です");
  }

  // Get all members (first page)
  const { data: usersData, error: usersError } = await supabase
    .from("users")
    .select("*")
    .order("department", { ascending: true })
    .order("name", { ascending: true })
    .range(0, 11); // First 12 users

  if (usersError) {
    console.error("Error fetching users:", usersError);
    throw usersError;
  }

  // Check if there are more users
  const { count } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  const hasMoreUsers = count ? count > 12 : false;

  return {
    users: usersData || [],
    hasMore: hasMoreUsers
  };
}

export default async function MembersPage() {
  const { users, hasMore } = await getMembersData();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex">
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">メンバー一覧</h1>
            <MemberList 
              initialUsers={users} 
              hasMore={hasMore} 
            />
          </div>
        </main>
      </div>
    </div>
  );
}
