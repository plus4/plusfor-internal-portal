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
    console.log("Error fetching announcements:", error);
    throw error;
  }

  return data;
}

export async function getUsers(page: number = 1, pageSize: number = 6): Promise<{
  data: User[];
  hasMore: boolean;
}> {
  console.log("[getUsers] Starting to fetch users...");
  console.log("[getUsers] Page:", page, "PageSize:", pageSize);
  
  const supabase = await createClient();
  console.log("[getUsers] Supabase client created");
  
  // 認証状態を確認
  const { data: { session }, error: authError } = await supabase.auth.getSession();
  console.log("[getUsers] Session check:", { 
    hasSession: !!session,
    authError: authError ? authError.message : null
  });

  if (authError) {
    console.log("[getUsers] Auth error:", authError);
    return { data: [], hasMore: false };
  }
  
  // 現在のページのデータを取得
  console.log("[getUsers] Executing query to fetch users...");
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: true })
    .range((page - 1) * pageSize, page * pageSize - 1);

  console.log("[getUsers] Query result:", { 
    data: data || [], 
    error: error ? error.message : null,
    dataLength: data?.length || 0
  });

  if (error) {
    console.log("[getUsers] Error fetching users:", error);
    return { data: [], hasMore: false };
  }

  // 次のページがあるか確認
  console.log("[getUsers] Checking total count...");
  const { count } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  console.log("[getUsers] Total count:", count);

  const hasMore = count ? count > page * pageSize : false;
  console.log("[getUsers] Has more:", hasMore);

  const result = {
    data: data || [],
    hasMore,
  };
  console.log("[getUsers] Returning result:", result);
  return result;
} 
