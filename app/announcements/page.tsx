import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { AnnouncementList } from "@/components/announcements/announcement-list";
import { getAnnouncementsWithReadStatus } from "@/lib/data/announcements";
import { LayoutProvider } from "@/lib/layout-context";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "お知らせ"
};


export default async function AnnouncementsPage() {
  const announcements = await getAnnouncementsWithReadStatus();

  return (
    <LayoutProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
      
      <div className="flex-1 flex">
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 w-full lg:w-auto">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">お知らせ</h1>
            <AnnouncementList announcements={announcements} />
          </div>
        </main>
      </div>
    </div>
    </LayoutProvider>
  );
}
