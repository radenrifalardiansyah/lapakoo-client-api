import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/utils/response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const countryId = searchParams.get("country_id");

    if (!countryId) return errorResponse("country_id wajib diisi");

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("provinces")
      .select("id, name")
      .eq("country_id", countryId)
      .order("name");

    if (error) return errorResponse(error.message);

    return successResponse(data ?? []);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
