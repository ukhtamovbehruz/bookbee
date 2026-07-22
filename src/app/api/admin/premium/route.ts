import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ADMIN_PASSWORD } from "@/lib/admin";

export const dynamic = "force-dynamic";

/**
 * Lists every premium membership request (manual card transfer + admin
 * review — there's no payment gateway merchant account yet). Guarded by the
 * shared admin password, same pattern as the other /api/admin/* routes.
 */
export async function GET(request: Request) {
  if (request.headers.get("x-admin-secret") !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "SUPABASE_SECRET_KEY is not configured on the server." },
      { status: 500 },
    );
  }

  const { data, error } = await supabase
    .from("premium_status")
    .select("user_id, email, name, status, plan, promo_code, requested_at, updated_at")
    .order("requested_at", { ascending: false, nullsFirst: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ requests: data ?? [] });
}

/**
 * Approves or rejects a pending premium request. Only this service-role
 * route can flip status to "active" — regular users' RLS policies only
 * ever allow them to set their own row to "pending".
 */
export async function POST(request: Request) {
  if (request.headers.get("x-admin-secret") !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const userId = typeof body?.userId === "string" ? body.userId : null;
  const action = body?.action === "approve" || body?.action === "reject" ? body.action : null;

  if (!userId || !action) {
    return NextResponse.json({ error: "Missing userId or action." }, { status: 400 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "SUPABASE_SECRET_KEY is not configured on the server." },
      { status: 500 },
    );
  }

  const { error } = await supabase
    .from("premium_status")
    .update({
      status: action === "approve" ? "active" : "rejected",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
