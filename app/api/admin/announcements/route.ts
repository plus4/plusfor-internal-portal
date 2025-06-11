import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { TargetAudience } from "@/lib/types";

// データ取得とロジックを統合
async function requireAdmin(): Promise<void> {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new Error('管理者権限が必要です');
  }

  // Get user profile with role
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.role !== 'ADMIN') {
    throw new Error('管理者権限が必要です');
  }
}

// GET - お知らせ一覧取得
export async function GET() {
  try {
    const supabase = await createClient();

    // 認証・管理者権限チェック
    try {
      await requireAdmin();
    } catch {
      return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
    }

    // お知らせ一覧取得
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching announcements:", error);
      return NextResponse.json(
        { error: "お知らせの取得に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "予期せぬエラーが発生しました" },
      { status: 500 }
    );
  }
}

// POST - お知らせ作成
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 認証・管理者権限チェック
    try {
      await requireAdmin();
    } catch {
      return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
    }

    const body = await request.json();
    const { title, content, is_published, target_audience } = body;

    // バリデーション
    if (!title || !content) {
      return NextResponse.json(
        { error: "タイトルと内容は必須です" },
        { status: 400 }
      );
    }

    if (!["ALL", "EMPLOYEE", "BP"].includes(target_audience)) {
      return NextResponse.json(
        { error: "対象が不正です" },
        { status: 400 }
      );
    }

    // お知らせ作成
    const { data, error } = await supabase
      .from("announcements")
      .insert([
        {
          title,
          content,
          is_published: Boolean(is_published),
          target_audience: target_audience as TargetAudience,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating announcement:", error);
      return NextResponse.json(
        { error: "お知らせの作成に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "予期せぬエラーが発生しました" },
      { status: 500 }
    );
  }
}

// PUT - お知らせ更新
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 認証・管理者権限チェック
    try {
      await requireAdmin();
    } catch {
      return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
    }

    const body = await request.json();
    const { id, title, content, is_published, target_audience } = body;

    // バリデーション
    if (!id) {
      return NextResponse.json({ error: "IDが必要です" }, { status: 400 });
    }

    if (!title || !content) {
      return NextResponse.json(
        { error: "タイトルと内容は必須です" },
        { status: 400 }
      );
    }

    if (!["ALL", "EMPLOYEE", "BP"].includes(target_audience)) {
      return NextResponse.json(
        { error: "対象が不正です" },
        { status: 400 }
      );
    }

    // お知らせ更新
    const { data, error } = await supabase
      .from("announcements")
      .update({
        title,
        content,
        is_published: Boolean(is_published),
        target_audience: target_audience as TargetAudience,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating announcement:", error);
      return NextResponse.json(
        { error: "お知らせの更新に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "予期せぬエラーが発生しました" },
      { status: 500 }
    );
  }
}

// DELETE - お知らせ削除
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 認証・管理者権限チェック
    try {
      await requireAdmin();
    } catch {
      return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "IDが必要です" }, { status: 400 });
    }

    // お知らせ削除
    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting announcement:", error);
      return NextResponse.json(
        { error: "お知らせの削除に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "予期せぬエラーが発生しました" },
      { status: 500 }
    );
  }
}

// PATCH - 公開状態切り替え
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 認証・管理者権限チェック
    try {
      await requireAdmin();
    } catch {
      return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
    }

    const body = await request.json();
    const { id, is_published } = body;

    if (!id) {
      return NextResponse.json({ error: "IDが必要です" }, { status: 400 });
    }

    // 公開状態更新
    const { data, error } = await supabase
      .from("announcements")
      .update({
        is_published: Boolean(is_published),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating announcement publish status:", error);
      return NextResponse.json(
        { error: "公開状態の更新に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "予期せぬエラーが発生しました" },
      { status: 500 }
    );
  }
}

