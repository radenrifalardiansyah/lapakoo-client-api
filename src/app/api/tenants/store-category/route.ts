import { NextRequest } from "next/server";
import { getAuthenticatedSeller } from "@/lib/utils/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/utils/response";

// GET /api/tenants/store-category — kategori toko aktif tenant saat ini
export async function GET() {
  try {
    const { seller, error } = await getAuthenticatedSeller();
    if (error) return error;

    // Pakai admin client agar tidak tergantung RLS pada tenants
    const supabase = createAdminClient();

    const { data, error: dbError } = await supabase
      .from("tenants")
      .select("store_category_id, store_categories(*)")
      .eq("id", seller!.tenant_id)
      .single();

    if (dbError || !data) return errorResponse("Data tenant tidak ditemukan", 404);

    return successResponse(data);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

// PUT /api/tenants/store-category — ubah kategori toko (owner only)
export async function PUT(request: NextRequest) {
  try {
    const { seller, error } = await getAuthenticatedSeller();
    if (error) return error;

    if (seller!.role !== "owner") {
      return errorResponse("Hanya owner yang dapat mengubah kategori toko", 403);
    }

    const body = await request.json();
    const { store_category_id } = body;

    if (!store_category_id || typeof store_category_id !== "string") {
      return errorResponse("store_category_id wajib diisi");
    }

    const supabase = createAdminClient();

    // Pastikan kategori ada dan aktif
    const { data: category, error: catError } = await supabase
      .from("store_categories")
      .select("id")
      .eq("id", store_category_id)
      .eq("is_active", true)
      .single();

    if (catError || !category) {
      return errorResponse("Kategori toko tidak ditemukan atau tidak aktif", 404);
    }

    const { data: updated, error: updateError } = await supabase
      .from("tenants")
      .update({ store_category_id })
      .eq("id", seller!.tenant_id)
      .select("id, store_category_id, store_categories(*)")
      .single();

    if (updateError) return errorResponse(updateError.message, 500);

    return successResponse(updated);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
