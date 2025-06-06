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
    throw error;
  }

  return data;
}

export async function getUsers(page: number = 1, pageSize: number = 6): Promise<{
  data: User[];
  hasMore: boolean;
}> {
  const supabase = await createClient();
  
  // 認証状態を確認
  const { data: { session }, error: authError } = await supabase.auth.getSession();

  if (authError) {
    return { data: [], hasMore: false };
  }
  
  // 現在のページのデータを取得
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: true })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) {
    return { data: [], hasMore: false };
  }

  // 次のページがあるか確認
  const { count } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  const hasMore = count ? count > page * pageSize : false;

  return {
    data: data || [],
    hasMore,
  };
} 
