import { DashboardContent } from "./components/dashboard-content";
import { Header } from "@/components/header";
import { getAnnouncements, getEmployees } from "@/lib/api";

export default async function DashboardPage() {
  const [announcements, employees] = await Promise.all([
    getAnnouncements(),
    getEmployees(),
  ]);

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col">
        <Header />
        <DashboardContent
          announcements={announcements}
          employees={employees.data}
          hasMoreEmployees={employees.hasMore}
        />
      </div>
    </div>
  );
} 