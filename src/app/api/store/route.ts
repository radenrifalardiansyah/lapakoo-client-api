import { NextRequest } from "next/server";
import { getAuthenticatedSeller } from "@/lib/utils/auth";
import { successResponse, errorResponse } from "@/lib/utils/response";

export async function GET() {
  try {
    const { seller, supabase, error } = await getAuthenticatedSeller();
    if (error) return error;

    const { data, error: dbError } = await supabase!
      .from("store_settings")
      .select(`
        *,
        tenants(
          id, subdomain, store_name, owner_name, logo_url, primary_color, status, package_id,
          store_category_id,
          store_categories(id, name, description, icon, sort_order),
          packages(id, name, price, features, max_products, max_orders, max_users, max_warehouses)
        )
      `)
      .eq("tenant_id", seller!.tenant_id)
      .single();

    if (dbError || !data) return errorResponse("Pengaturan toko tidak ditemukan", 404);

    return successResponse(data);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { seller, supabase, error } = await getAuthenticatedSeller();
    if (error) return error;

    const body = await request.json();
    const {
      store_name, logo_url,
      description, address, city, province, postal_code,
      phone, email, website, operational_hours, theme_color, tagline,
      banner_url, show_reviews, show_best_sellers,
      free_shipping_min, packaging_fee, processing_days,
      notif_email_new_order, notif_sms_payment, notif_push,
      notif_email_low_stock, notif_email_promotion,
    } = body;

    // Update store_settings
    const patch: Record<string, unknown> = {};
    const settingsFields = {
      description, address, city, province, postal_code,
      phone, email, website, operational_hours, theme_color, tagline,
      banner_url, show_reviews, show_best_sellers,
      free_shipping_min, packaging_fee, processing_days,
      notif_email_new_order, notif_sms_payment, notif_push,
      notif_email_low_stock, notif_email_promotion,
    };
    for (const [key, val] of Object.entries(settingsFields)) {
      if (val !== undefined) patch[key] = val;
    }

    const { data, error: dbError } = await supabase!
      .from("store_settings")
      .update(patch)
      .eq("tenant_id", seller!.tenant_id)
      .select()
      .single();

    if (dbError) return errorResponse(dbError.message);

    // Update tenants jika ada field yang berkaitan
    const tenantPatch: Record<string, unknown> = {};
    if (store_name !== undefined) tenantPatch.store_name = store_name;
    if (logo_url !== undefined) tenantPatch.logo_url = logo_url;
    // Sync theme_color ke primary_color agar storefront menggunakan warna terbaru
    if (theme_color !== undefined) tenantPatch.primary_color = theme_color;

    if (Object.keys(tenantPatch).length > 0) {
      const { error: tenantError } = await supabase!
        .from("tenants")
        .update(tenantPatch)
        .eq("id", seller!.tenant_id);

      if (tenantError) return errorResponse(tenantError.message);
    }

    return successResponse(data);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
