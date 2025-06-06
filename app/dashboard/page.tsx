// モジュールが読み込まれた時点でのログ
if (typeof window === 'undefined') {
  console.log("[DashboardPage] Server-side module loaded");
}

import { DashboardContent } from "./components/dashboard-content";
import { Header } from "@/components/header";
import { getAnnouncements, getUsers } from "@/lib/api";

export default async function DashboardPage() {
  console.log("[DashboardPage] Component function called");
  console.log("[DashboardPage] Starting to fetch data...");

  try {
    const [announcements, users] = await Promise.all([
      getAnnouncements(),
      getUsers(),
    ]);

    console.log("[DashboardPage] Data fetched successfully:", {
      announcementsCount: announcements?.length || 0,
      usersCount: users.data?.length || 0,
      hasMoreUsers: users.hasMore
    });

    return (
      <div className="flex h-screen">
        <div className="flex-1 flex flex-col">
          <Header />
          <DashboardContent
            announcements={announcements}
            users={users.data}
            hasMoreUsers={users.hasMore}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.log("[DashboardPage] Error fetching data:", error);
    throw error;
  }
} 
