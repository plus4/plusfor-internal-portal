import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// データ取得ロジックをAPI内に統合
async function getCurrentUserBasicProfile() {
  const supabase = await createClient();

  // 認証チェック
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("認証が必要です");
  }

  // ユーザー情報取得
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("name, department, position")
    .eq("id", user.id)
    .single();

  if (userError) {
    console.error("Error fetching user profile:", userError);
    throw new Error("ユーザー情報の取得に失敗しました");
  }

  return {
    email: user.email,
    ...userData
  };
}

// GET - 現在のユーザーのプロフィール情報取得
export async function GET() {
  try {
    const profile = await getCurrentUserBasicProfile();
    return NextResponse.json(profile);
  } catch (error) {
    const message = error instanceof Error ? error.message : "予期せぬエラーが発生しました";
    const status = message === "認証が必要です" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// PUT - プロフィール情報更新
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const body = await request.json();
    const { name, department, position } = body;

    // バリデーション
    if (!name || !department || !position) {
      return NextResponse.json(
        { error: "氏名、部署、役職は必須です" },
        { status: 400 }
      );
    }

    // プロフィール更新
    const { error: updateError } = await supabase
      .from("users")
      .update({
        name,
        department,
        position,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating user profile:", updateError);
      return NextResponse.json(
        { error: "プロフィールの更新に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "プロフィールを更新しました",
      user: { name, department, position }
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "予期せぬエラーが発生しました" },
      { status: 500 }
    );
  }
}
