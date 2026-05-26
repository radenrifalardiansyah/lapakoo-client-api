import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/utils/response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get("city_id");

    if (!cityId) return errorResponse("city_id wajib diisi");

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("districts")
      .select("id, name")
      .eq("city_id", cityId)
      .order("name");

    if (error) return errorResponse(error.message);

    return successResponse(data ?? []);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
