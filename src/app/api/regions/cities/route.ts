import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/utils/response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provinceId = searchParams.get("province_id");

    if (!provinceId) return errorResponse("province_id wajib diisi");

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("cities")
      .select("id, name, type")
      .eq("province_id", provinceId)
      .order("name");

    if (error) return errorResponse(error.message);

    return successResponse(data ?? []);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
