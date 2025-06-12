import { createClient } from "@/lib/supabase/server";

export async function getAnnouncementsWithReadStatus(userId?: string, limit?: number) {
  const supabase = await createClient();
  
  // Get current user if not provided
  const currentUserId = userId || (await supabase.auth.getUser()).data.user?.id;
  
  if (!currentUserId) {
    throw new Error("認証が必要です");
  }

  // Get current user's profile to determine user_type
  const { data: userProfile, error: userError } = await supabase
    .from("users")
    .select("user_type")
    .eq("id", currentUserId)
    .single();

  if (userError) {
    console.error("Error fetching user profile:", userError);
    throw userError;
  }

  // Build query
  let query = supabase
    .from("announcements")
    .select(`
      *,
      announcement_reads!left(user_id)
    `)
    .eq("is_published", true)
    .eq("announcement_reads.user_id", currentUserId)
    .or(`target_audience.eq.ALL,target_audience.eq.${userProfile.user_type}`)
    .order("created_at", { ascending: false });

  // Apply limit if specified
  if (limit) {
    query = query.limit(limit);
  }

  const { data: announcements, error: announcementsError } = await query;

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
