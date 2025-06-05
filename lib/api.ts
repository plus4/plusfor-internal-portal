import { createClient } from "@/lib/supabase/server";
import { Announcement, User } from "./types";

export async function getAnnouncements(): Promise<Announcement[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) {
    console.error("Error fetching announcements:", error);
    throw error;
  }

  return data;
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