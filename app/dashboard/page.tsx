import { DashboardContent } from "./components/dashboard-content";
import { Header } from "@/app/components/header";
import { getAnnouncements, getEmployees } from "@/lib/api";

export default async function DashboardPage() {
  try {
    const [announcements, employeesResult] = await Promise.all([
      getAnnouncements(),
      getEmployees(1, 6),
    ]);

    return (
      <div className="min-h-screen">
        <Header />
        <DashboardContent 
          announcements={announcements} 
          employees={employeesResult.data} 
          hasMoreEmployees={employeesResult.hasMore}
        />
      </div>
    );
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">エラーが発生しました</h1>
          <p className="text-muted-foreground">
            データの読み込み中にエラーが発生しました。しばらく経ってから再度お試しください。
          </p>
        </div>
      </div>
    );
  }
} 