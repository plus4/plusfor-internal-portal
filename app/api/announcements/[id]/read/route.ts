import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    const announcementId = parseInt(params.id);
    
    if (isNaN(announcementId)) {
      return NextResponse.json(
        { error: "無効なお知らせIDです" },
        { status: 400 }
      );
    }

    // Check if announcement exists and is published
    const { data: announcement, error: announcementError } = await supabase
      .from("announcements")
      .select("id, is_published")
      .eq("id", announcementId)
      .eq("is_published", true)
      .single();

    if (announcementError || !announcement) {
      return NextResponse.json(
        { error: "お知らせが見つかりません" },
        { status: 404 }
      );
    }

    // Insert read status (will ignore if already exists due to primary key constraint)
    const { error: insertError } = await supabase
      .from("announcement_reads")
      .insert({
        user_id: user.id,
        announcement_id: announcementId,
      });

    // Ignore duplicate key error (user already read this announcement)
    if (insertError && !insertError.message.includes("duplicate key")) {
      console.error("Error marking announcement as read:", insertError);
      return NextResponse.json(
        { error: "既読マークに失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: "お知らせを既読にしました",
      announcement_id: announcementId 
    });
    
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "予期せぬエラーが発生しました" },
      { status: 500 }
    );
  }
}