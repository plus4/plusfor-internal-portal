import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// 環境変数のチェック
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// 認証チェック用のミドルウェア
async function checkAuth() {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
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

    const { name, department, position, email } = body;

    // 必須項目のチェック
    console.log("必須項目のチェック開始");
    if (!name || !department || !position || !email) {
      console.log("必須項目が不足:", { name, department, position, email });
      return NextResponse.json(
        { error: "必須項目が入力されていません" },
        { status: 400 }
      );
    }
    console.log("必須項目のチェック成功");

    // 1. Supabase Authにユーザーを作成
    console.log("Supabase Authユーザー作成開始");
    const initialPassword = `${email.split("@")[0]}123`;
    const { data: authData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: initialPassword,
      email_confirm: true,
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

    // 2. usersテーブルにユーザーを追加
    console.log("usersテーブルへの追加開始");
    const { error: dbError } = await supabaseAdmin.from("users").insert([
      {
        id: authData.user.id,
        name,
        department,
        position,
        email,
      },
    ]);

    if (dbError) {
      console.error("usersテーブル追加エラー:", dbError);
      // ユーザー作成に失敗した場合、Authからも削除
      console.log("Authユーザーの削除開始（ロールバック）");
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      if (deleteError) {
        console.error("Authユーザー削除エラー（ロールバック）:", deleteError);
      }
      return NextResponse.json(
        { error: `従業員情報の作成に失敗しました: ${dbError.message}` },
        { status: 400 }
      );
    }
    console.log("usersテーブルへの追加成功");

    console.log("=== ユーザー登録処理完了 ===");
    return NextResponse.json({
      message: "ユーザーを作成しました",
      initialPassword,
      user: {
        name,
        department,
        position,
        email,
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
    // 認証チェック
    const authCheckResult = await checkAuth();
    if (authCheckResult) return authCheckResult;

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "メールアドレスが指定されていません" },
        { status: 400 }
      );
    }

    // 1. Supabase Authからユーザーを削除
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(email);

    if (deleteUserError) {
      console.error("Error deleting auth user:", deleteUserError);
      return NextResponse.json(
        { error: `認証ユーザーの削除に失敗しました: ${deleteUserError.message}` },
        { status: 400 }
      );
    }

    // 2. usersテーブルからユーザーを削除
    const { error: dbError } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("email", email);

    if (dbError) {
      console.error("Error deleting employee:", dbError);
      return NextResponse.json(
        { error: `従業員情報の削除に失敗しました: ${dbError.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "ユーザーを削除しました" });
  } catch (error) {
    console.error("Unexpected error in DELETE:", error);
    return NextResponse.json(
      { error: "予期せぬエラーが発生しました" },
      { status: 500 }
    );
  }
} 