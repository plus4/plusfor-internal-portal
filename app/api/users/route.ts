import { getUsers } from "@/lib/api";
import { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: cookieStore,
      }
    );

    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError) {
      return Response.json(
        { error: "認証エラーが発生しました" },
        { status: 401 }
      );
    }

    if (!session) {
      return Response.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "6");

    const result = await getUsers(page, pageSize);
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
} 
