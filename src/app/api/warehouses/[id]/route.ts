import { NextRequest } from "next/server";
import { getAuthenticatedSeller } from "@/lib/utils/auth";
import { successResponse, errorResponse } from "@/lib/utils/response";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const { supabase, error } = await getAuthenticatedSeller();
    if (error) return error;

    const { data, error: dbError } = await supabase!
      .from("warehouses")
      .select(
        "*, stock_distribution(product_id, quantity, products(id, name, sku, status))"
      )
      .eq("id", id)
      .single();

    if (dbError || !data) return errorResponse("Gudang tidak ditemukan", 404);

    return successResponse(data);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const { supabase, error } = await getAuthenticatedSeller();
    if (error) return error;

    const body = await request.json();
    const { code, name, address, country, province, province_id, city, city_id, district, district_id, village, pic, phone, is_primary, active } = body;

    const patch: Record<string, unknown> = {};
    if (code        !== undefined) patch.code        = String(code).toUpperCase();
    if (name        !== undefined) patch.name        = name;
    if (address     !== undefined) patch.address     = address;
    if (country     !== undefined) patch.country     = country;
    if (province    !== undefined) patch.province    = province;
    if (province_id !== undefined) patch.province_id = province_id;
    if (city        !== undefined) patch.city        = city;
    if (city_id     !== undefined) patch.city_id     = city_id;
    if (district    !== undefined) patch.district    = district;
    if (district_id !== undefined) patch.district_id = district_id;
    if (village     !== undefined) patch.village     = village;
    if (pic         !== undefined) patch.pic         = pic;
    if (phone       !== undefined) patch.phone       = phone;
    if (is_primary  !== undefined) patch.is_primary  = is_primary;
    if (active      !== undefined) patch.active      = active;

    const { data, error: dbError } = await supabase!
      .from("warehouses")
      .update(patch)
      .eq("id", id)
      .select()
      .single();

    if (dbError || !data) return errorResponse("Gudang tidak ditemukan", 404);

    return successResponse(data);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const { supabase, error } = await getAuthenticatedSeller();
    if (error) return error;

    const { error: dbError } = await supabase!
      .from("warehouses")
      .delete()
      .eq("id", id);

    if (dbError) return errorResponse(dbError.message);

    return successResponse({ message: "Gudang berhasil dihapus" });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
