import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/utils/response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const districtId = searchParams.get("district_id");

    if (!districtId) return errorResponse("district_id wajib diisi");

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("villages")
      .select("id, name")
      .eq("district_id", districtId)
      .order("name");

    if (error) return errorResponse(error.message);

    return successResponse(data ?? []);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
