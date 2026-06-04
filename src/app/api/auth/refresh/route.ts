import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/utils/response";

// POST /api/auth/refresh — tukar refresh_token dengan access_token baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refresh_token } = body;

    if (!refresh_token || typeof refresh_token !== "string") {
      return errorResponse("refresh_token wajib diisi", 400);
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase.auth.refreshSession({ refresh_token });

    if (error || !data.session) {
      return errorResponse("Sesi tidak valid atau sudah kedaluwarsa", 401);
    }

    return successResponse({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at:    data.session.expires_at,
      expires_in:    data.session.expires_in,
    });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
