import { createClient } from "@/lib/supabase/server";
import { Announcement, User } from "./types";

export async function getAnnouncements(): Promise<(Announcement & { is_read: boolean })[]> {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("認証が必要です");
  }

  // Get announcements with read status
  const { data, error } = await supabase
    .from("announcements")
    .select(`
      *,
      announcement_reads!left(user_id)
    `)
    .eq("is_published", true)
    .eq("announcement_reads.user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) {
    console.error("Error fetching announcements:", error);
    throw error;
  }

  // Transform data to include is_read flag
  return data.map(announcement => ({
    ...announcement,
    is_read: announcement.announcement_reads && announcement.announcement_reads.length > 0,
    announcement_reads: undefined // Remove the join data
  }));
}

export async function getUsers(page: number = 1, pageSize: number = 6): Promise<{
  data: User[];
  hasMore: boolean;
}> {
  const supabase = await createClient();
  
  // 現在のページのデータを取得
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: true })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) {
    console.error("Error fetching users:", error);
    throw error;
  }

  // 次のページがあるか確認
  const { count } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  const hasMore = count ? count > page * pageSize : false;

  return {
    data,
    hasMore,
  };
} 
