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
        cookies: {
          get: (name: string) => cookieStore.get(name)?.value,
          set: (name: string, value: string, options: any) => {
            cookieStore.set({ name, value, ...options });
          },
          remove: (name: string, options: any) => {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session) {
      console.error("Authentication error:", authError);
      return Response.json(
        { data: [], hasMore: false, error: "認証が必要です" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "6");

    const result = await getUsers(page, pageSize);
    return Response.json(result);
  } catch (error) {
    console.error("Error in GET /api/users:", error);
    return Response.json(
      { data: [], hasMore: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
} 
