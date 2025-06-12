import { createClient } from "@/lib/supabase/server";

export async function getMembersData(page = 0, limit = 12) {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("認証が必要です");
  }

  // Calculate range for pagination
  const start = page * limit;
  const end = start + limit - 1;

  // Get members for the specified page
  const { data: usersData, error: usersError } = await supabase
    .from("users")
    .select("*")
    .order("department", { ascending: true })
    .order("name", { ascending: true })
    .range(start, end);

  if (usersError) {
    console.error("Error fetching users:", usersError);
    throw usersError;
  }

  // Check if there are more users
  const { count } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  const totalUsers = count || 0;
  const hasMoreUsers = totalUsers > (page + 1) * limit;

  return {
    users: usersData || [],
    hasMore: hasMoreUsers,
    total: totalUsers
  };
}