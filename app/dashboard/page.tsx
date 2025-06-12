import Link from "next/link";
import { Header } from "@/components/header";
import { AnnouncementList } from "@/components/announcements/announcement-list";
import { MemberList } from "@/components/members/member-list";
import { Sidebar } from "@/components/sidebar";
import { getAnnouncementsWithReadStatus } from "@/lib/data/announcements";
import { getMembersData } from "@/lib/data/members";

async function getDashboardData() {
  // Get announcements (limited to 5 for dashboard)
  const announcements = await getAnnouncementsWithReadStatus(undefined, 5);
  
  // Get members (limited to 6 for dashboard)
  const membersData = await getMembersData(0, 6);

  return {
    announcements,
    users: {
      data: membersData.users,
      hasMore: membersData.hasMore
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

