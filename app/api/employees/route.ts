import { getEmployees } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "6");

  try {
    const result = await getEmployees(page, pageSize);
    return Response.json(result);
  } catch (error) {
    console.error("Error in employees API route:", error);
    return Response.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
} 