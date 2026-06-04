import { createAdminClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/utils/response";

// GET /api/store-categories — daftar semua kategori jenis toko aktif (public)
export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("store_categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");

    if (error) return errorResponse(error.message, 500);

    return successResponse(data);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
