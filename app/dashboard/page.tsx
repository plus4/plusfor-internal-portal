import Link from "next/link";
import { Header } from "@/components/header";
import { createClient } from "@/lib/supabase/server";
import { AnnouncementList } from "@/components/announcements/announcement-list";
import { MemberList } from "@/components/members/member-list";
import { Sidebar } from "@/components/sidebar";

// データ取得とページ表示を統合
async function getDashboardData() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("認証が必要です");
  }

  // Get current user's profile to determine user_type and role
  const { data: userProfile, error: userError } = await supabase
    .from("users")
    .select("user_type, role")
    .eq("id", user.id)
    .single();

  if (userError) {
    console.error("Error fetching user profile:", userError);
    throw userError;
  }

  // Get announcements with read status, filtered by target audience
  const { data: announcements, error: announcementsError } = await supabase
    .from("announcements")
    .select(`
      *,
      announcement_reads!left(user_id)
    `)
    .eq("is_published", true)
    .eq("announcement_reads.user_id", user.id)
    .or(`target_audience.eq.ALL,target_audience.eq.${userProfile.user_type}`)
    .order("created_at", { ascending: false })
    .limit(3);

  if (announcementsError) {
    console.error("Error fetching announcements:", announcementsError);
    throw announcementsError;
  }

  // Get users for dashboard (first page)
  const { data: usersData, error: usersError } = await supabase
    .from("users")
    .select("*")
    .order("department", { ascending: true })
    .order("name", { ascending: true })
    .range(0, 5); // First 6 users

  if (usersError) {
    console.error("Error fetching users:", usersError);
    throw usersError;
  }

  // Check if there are more users
  const { count } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  const hasMoreUsers = count ? count > 6 : false;

  // Transform announcements data to include is_read flag
  const transformedAnnouncements = announcements.map(announcement => ({
    ...announcement,
    is_read: announcement.announcement_reads && announcement.announcement_reads.length > 0,
    announcement_reads: undefined // Remove the join data
  }));

  return {
    announcements: transformedAnnouncements,
    users: {
      data: usersData || [],
      hasMore: hasMoreUsers
    }
  };
}

export default async function DashboardPage() {
  const { announcements, users } = await getDashboardData();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex">
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* お知らせセクション */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">お知らせ</h2>
                <Link 
                  href="/announcements" 
                  className="text-sm text-primary hover:underline"
                >
                  すべて見る
                </Link>
              </div>
              <AnnouncementList 
                announcements={announcements}
                showLimit={5}
              />
            </section>

            {/* メンバー一覧セクション */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">メンバー一覧</h2>
                <Link 
                  href="/members" 
                  className="text-sm text-primary hover:underline"
                >
                  すべて見る
                </Link>
              </div>
              <MemberList 
                initialUsers={users.data} 
                hasMore={users.hasMore} 
              />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
} 

