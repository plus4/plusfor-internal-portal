import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { MemberList } from "@/components/members/member-list";
import { getMembersData } from "@/lib/data/members";


export default async function MembersPage() {
  const { users, hasMore } = await getMembersData(0, 12);

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
