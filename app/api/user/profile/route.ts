import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET - 現在のユーザーのプロフィール情報取得
export async function GET() {
  try {
    const supabase = await createClient();

    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // ユーザー情報取得
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("name, department, position")
      .eq("id", user.id)
      .single();

    if (userError) {
      console.error("Error fetching user profile:", userError);
      return NextResponse.json(
        { error: "ユーザー情報の取得に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      email: user.email,
      ...userData
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "予期せぬエラーが発生しました" },
      { status: 500 }
    );
  }
}