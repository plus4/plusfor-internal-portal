import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { createClient } from "@/lib/supabase/server";
import { AnnouncementList } from "@/components/announcements/announcement-list";

async function getAnnouncementsData() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("認証が必要です");
  }

  // Get current user's profile to determine user_type
  const { data: userProfile, error: userError } = await supabase
    .from("users")
    .select("user_type")
    .eq("id", user.id)
    .single();

  if (userError) {
    console.error("Error fetching user profile:", userError);
    throw userError;
  }

  // Get all announcements with read status, filtered by target audience
  const { data: announcements, error: announcementsError } = await supabase
    .from("announcements")
    .select(`
      *,
      announcement_reads!left(user_id)
    `)
    .eq("is_published", true)
    .eq("announcement_reads.user_id", user.id)
    .or(`target_audience.eq.ALL,target_audience.eq.${userProfile.user_type}`)
    .order("created_at", { ascending: false });

  if (announcementsError) {
    console.error("Error fetching announcements:", announcementsError);
    throw announcementsError;
  }

  // Transform announcements data to include is_read flag
  const transformedAnnouncements = announcements.map(announcement => ({
    ...announcement,
    is_read: announcement.announcement_reads && announcement.announcement_reads.length > 0,
    announcement_reads: undefined // Remove the join data
  }));

  return transformedAnnouncements;
}

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncementsData();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex">
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">お知らせ</h1>
            <AnnouncementList announcements={announcements} />
          </div>
        </main>
      </div>
    </div>
  );
}
