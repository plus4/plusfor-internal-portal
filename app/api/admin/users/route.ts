import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requireAdmin } from "@/lib/auth";

// 環境変数のチェック
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// 型アサーションを追加
const supabaseUrlString = supabaseUrl as string;
const supabaseAnonKeyString = supabaseAnonKey as string;

const supabaseAdmin = createClient(supabaseUrlString, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// 認証チェック用のミドルウェア
async function checkAuth() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      supabaseUrlString,
      supabaseAnonKeyString,
      {
        cookies: {
          get: (name: string) => cookieStore.get(name)?.value,
          set: (name: string, value: string, options: CookieOptions) => {
            cookieStore.set({ name, value, ...options });
          },
          remove: (name: string, options: CookieOptions) => {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Auth error:", error);
      return NextResponse.json(
        { error: "認証エラーが発生しました" },
        { status: 401 }
      );
    }

    if (!session) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    return null;
  } catch (error) {
    console.error("Unexpected error in checkAuth:", error);
    return NextResponse.json(
      { error: "予期せぬエラーが発生しました" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log("=== ユーザー登録処理開始 ===");
    
    // 管理者権限チェック
    console.log("管理者権限チェック開始");
    try {
      await requireAdmin();
      console.log("管理者権限チェック成功");
    } catch (error) {
      console.log("管理者権限チェック失敗:", error);
      return NextResponse.json(
        { error: "管理者権限が必要です" },
        { status: 403 }
      );
    }

    // 認証チェック
    console.log("認証チェック開始");
    const authCheckResult = await checkAuth();
    if (authCheckResult) {
      console.log("認証チェック失敗:", authCheckResult);
      return authCheckResult;
    }
    console.log("認証チェック成功");

    // リクエストボディの解析
    console.log("リクエストボディの解析開始");
    let body;
    try {
      body = await request.json();
      console.log("リクエストボディ:", body);
    } catch (error) {
      console.error("リクエストボディの解析に失敗:", error);
      return NextResponse.json(
        { error: "リクエストの解析に失敗しました" },
        { status: 400 }
      );
    }

    const { name, department, position, email, user_type, role } = body;

    // 必須項目のチェック
    console.log("必須項目のチェック開始");
    if (!name || !department || !position || !email || !user_type || !role) {
      console.log("必須項目が不足:", { name, department, position, email, user_type, role });
      return NextResponse.json(
        { error: "必須項目が入力されていません" },
        { status: 400 }
      );
    }
    console.log("必須項目のチェック成功");

    // 1. Supabase Authにユーザーを作成（ユーザー情報をメタデータに含める）
    console.log("Supabase Authユーザー作成開始");
    const initialPassword = `${email.split("@")[0]}123`;
    const { data: authData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: initialPassword,
      email_confirm: true,
      user_metadata: {
        name,
        department,
        position,
        user_type,
        role,
      },
    });

    if (createUserError) {
      console.error("Authユーザー作成エラー:", createUserError);
      return NextResponse.json(
        { error: `ユーザーの作成に失敗しました: ${createUserError.message}` },
        { status: 400 }
      );
    }
    console.log("Authユーザー作成成功:", authData);

    if (!authData.user) {
      console.error("Authユーザーデータが存在しません");
      return NextResponse.json(
        { error: "ユーザーデータの取得に失敗しました" },
        { status: 500 }
      );
    }

    // 2. トリガーによってusersテーブルに自動挿入されるので、明示的な挿入は不要
    console.log("usersテーブルへの自動挿入を待機");
    
    // 少し待機してからデータが挿入されたことを確認
    let retryCount = 0;
    const maxRetries = 5;
    while (retryCount < maxRetries) {
      const { data: userData, error: fetchError } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      if (!fetchError && userData) {
        console.log("usersテーブルへの自動挿入確認成功");
        break;
      }

      retryCount++;
      if (retryCount < maxRetries) {
        console.log(`usersテーブルデータ確認リトライ ${retryCount}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, 500)); // 500ms待機
      } else {
        console.error("usersテーブルへの自動挿入確認失敗:", fetchError);
        // Authユーザーを削除（ロールバック）
        console.log("Authユーザーの削除開始（ロールバック）");
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        if (deleteError) {
          console.error("Authユーザー削除エラー（ロールバック）:", deleteError);
        }
        return NextResponse.json(
          { error: "従業員情報の作成に失敗しました: データベースへの自動挿入が完了しませんでした" },
          { status: 500 }
        );
      }
    }

    console.log("=== ユーザー登録処理完了 ===");
    return NextResponse.json({
      message: "ユーザーを作成しました",
      initialPassword,
      user: {
        name,
        department,
        position,
        email,
        user_type,
        role,
      },
    });
  } catch (error) {
    console.error("予期せぬエラー:", error);
    return NextResponse.json(
      { error: "予期せぬエラーが発生しました" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    console.log("=== ユーザー更新処理開始 ===");
    
    // 管理者権限チェック
    console.log("管理者権限チェック開始");
    try {
      await requireAdmin();
      console.log("管理者権限チェック成功");
    } catch (error) {
      console.log("管理者権限チェック失敗:", error);
      return NextResponse.json(
        { error: "管理者権限が必要です" },
        { status: 403 }
      );
    }

    // 認証チェック
    console.log("認証チェック開始");
    const authCheckResult = await checkAuth();
    if (authCheckResult) {
      console.log("認証チェック失敗:", authCheckResult);
      return authCheckResult;
    }
    console.log("認証チェック成功");

    // リクエストボディの解析
    console.log("リクエストボディの解析開始");
    let body;
    try {
      body = await request.json();
      console.log("リクエストボディ:", body);
    } catch (error) {
      console.error("リクエストボディの解析に失敗:", error);
      return NextResponse.json(
        { error: "リクエストの解析に失敗しました" },
        { status: 400 }
      );
    }

    const { id, name, department, position, user_type, role } = body;

    // 必須項目のチェック
    console.log("必須項目のチェック開始");
    if (!id || !name || !department || !position || !user_type || !role) {
      console.log("必須項目が不足:", { id, name, department, position, user_type, role });
      return NextResponse.json(
        { error: "必須項目が入力されていません" },
        { status: 400 }
      );
    }
    console.log("必須項目のチェック成功");

    // usersテーブルを更新
    console.log("usersテーブルの更新開始");
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({
        name,
        department,
        position,
        user_type,
        role,
      })
      .eq("id", id);

    if (updateError) {
      console.error("usersテーブル更新エラー:", updateError);
      return NextResponse.json(
        { error: `ユーザー情報の更新に失敗しました: ${updateError.message}` },
        { status: 400 }
      );
    }
    console.log("usersテーブルの更新成功");

    console.log("=== ユーザー更新処理完了 ===");
    return NextResponse.json({
      message: "ユーザー情報を更新しました",
      user: {
        id,
        name,
        department,
        position,
        user_type,
        role,
      },
    });
  } catch (error) {
    console.error("予期せぬエラー:", error);
    return NextResponse.json(
      { error: "予期せぬエラーが発生しました" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    console.log("=== ユーザー削除処理開始 ===");
    
    // 管理者権限チェック
    console.log("管理者権限チェック開始");
    try {
      await requireAdmin();
      console.log("管理者権限チェック成功");
    } catch (error) {
      console.log("管理者権限チェック失敗:", error);
      return NextResponse.json(
        { error: "管理者権限が必要です" },
        { status: 403 }
      );
    }
    
    // 認証チェック
    const authCheckResult = await checkAuth();
    if (authCheckResult) return authCheckResult;

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        { error: "ユーザーIDが指定されていません" },
        { status: 400 }
      );
    }

    console.log("削除対象ユーザーID:", userId);

    // 1. まずusersテーブルからユーザーを削除（外部キー制約を回避）
    console.log("usersテーブルからの削除開始");
    const { error: dbError } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("id", userId);

    if (dbError) {
      console.error("usersテーブル削除エラー:", dbError);
      return NextResponse.json(
        { error: `従業員情報の削除に失敗しました: ${dbError.message}` },
        { status: 400 }
      );
    }

    console.log("usersテーブル削除成功");

    // 2. その後Supabase Authからユーザーを削除
    console.log("Authユーザー削除開始");
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      console.error("Authユーザー削除エラー:", deleteUserError);
      return NextResponse.json(
        { error: `認証ユーザーの削除に失敗しました: ${deleteUserError.message}` },
        { status: 400 }
      );
    }

    console.log("Authユーザー削除成功");
    console.log("=== ユーザー削除処理完了 ===");

    return NextResponse.json({ message: "ユーザーを削除しました" });
  } catch (error) {
    console.error("予期せぬエラー:", error);
    return NextResponse.json(
      { error: "予期せぬエラーが発生しました" },
      { status: 500 }
    );
  }
} 
