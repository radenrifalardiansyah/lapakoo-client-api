import { createAdminClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/utils/response";

// GET /api/packages — daftar semua paket yang aktif (public)
export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .eq("is_active", true)
      .order("price");

    if (error) return errorResponse(error.message, 500);

    return successResponse(data);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
