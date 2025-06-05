import { DashboardContent } from "./components/dashboard-content";
import { Header } from "@/components/header";
import { getAnnouncements, getUsers } from "@/lib/api";

export default async function DashboardPage() {
  const [announcements, users] = await Promise.all([
    getAnnouncements(),
    getUsers(),
  ]);

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
} 