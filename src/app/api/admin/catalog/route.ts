import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ADMIN_PASSWORD } from "@/lib/admin";

export const dynamic = "force-dynamic";

/**
 * Upserts one key/value row into `catalog_store` (book edits, custom books,
 * collection edits/custom/deleted). Guarded by the shared admin password,
 * same pattern as `/api/admin/users`. RLS on the table only grants public
 * SELECT, so this service-role write is the only way in.
 */
export async function POST(request: Request) {
  if (request.headers.get("x-admin-secret") !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const key = typeof body?.key === "string" ? body.key : null;
  if (!key || !("value" in (body ?? {}))) {
    return NextResponse.json({ error: "Missing key or value." }, { status: 400 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "SUPABASE_SECRET_KEY is not configured on the server." },
      { status: 500 },
    );
  }

  const { error } = await supabase
    .from("catalog_store")
    .upsert({ key, value: body.value, updated_at: new Date().toISOString() });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
