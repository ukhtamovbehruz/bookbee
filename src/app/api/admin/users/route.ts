import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ADMIN_PASSWORD } from "@/lib/admin";

export const dynamic = "force-dynamic";

interface AdminUser {
  name: string;
  email: string;
  createdAt: string;
  avatar: string;
}

/**
 * Lists every registered Supabase auth user (email/password *and* Google) for
 * the admin panel. Guarded by the shared admin password so it isn't an open
 * email-scraping endpoint. The real listing power comes from the secret key
 * inside `createAdminClient`, which stays server-side.
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

  const { data: profileRows } = await supabase.from("profiles").select("user_id, avatar");
  const avatarByUserId = new Map(
    (profileRows ?? []).map((p: { user_id: string; avatar: string }) => [p.user_id, p.avatar]),
  );

  const users: AdminUser[] = [];
  const perPage = 200;

  for (let page = 1; ; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    for (const u of data.users) {
      const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
      const metaName = typeof meta.name === "string" ? meta.name : "";
      const metaFullName = typeof meta.full_name === "string" ? meta.full_name : "";
      const fallback = u.email ? u.email.split("@")[0] : "Listener";
      users.push({
        name: metaName || metaFullName || fallback,
        email: u.email ?? "",
        createdAt: u.created_at ?? "",
        avatar: avatarByUserId.get(u.id) ?? "",
      });
    }

    if (data.users.length < perPage) break;
  }

  users.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return NextResponse.json({ users });
}
