import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { User } from "@/lib/types";

// データ取得ロジックをAPI内に統合
async function getMembers(options?: {
  page?: number;
  pageSize?: number;
}): Promise<{
  data: User[];
  hasMore: boolean;
}> {
  const supabase = await createClient();
  const { page, pageSize } = options || {};
  
  let query = supabase.from("users").select("*")
    .order("department", { ascending: true })
    .order("name", { ascending: true });
  
  // ページネーション設定（指定がある場合のみ）
  if (page && pageSize) {
    query = query.range((page - 1) * pageSize, page * pageSize - 1);
  }
  
  const { data, error } = await query;

  if (error) {
    console.error("Error fetching members:", error);
    throw error;
  }

  let hasMore = false;
  
  // ページネーションが指定されている場合のみhasMoreを計算
  if (page && pageSize) {
    const { count } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });
    hasMore = count ? count > page * pageSize : false;
  }

  return {
    data: data || [],
    hasMore,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "6");

    const result = await getMembers({ page, pageSize });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { error: "メンバーの取得に失敗しました" },
      { status: 500 }
    );
  }
}

