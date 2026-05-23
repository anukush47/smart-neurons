import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = user.app_metadata?.role as string;
  const admin = createAdminClient();
  const { searchParams } = new URL(request.url);
  const facultyId = searchParams.get("faculty_id");

  let query = admin
    .from("leave_applications")
    .select("*")
    .order("applied_at", { ascending: false });

  if (role === "faculty") {
    query = query.eq("faculty_id", user.id);
  } else if (["admin", "superadmin"].includes(role) && facultyId) {
    query = query.eq("faculty_id", facultyId);
  } else if (!["admin", "superadmin"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await query;
  if (error) {
    if (error.code === "42P01") return NextResponse.json({ leaves: [] });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ leaves: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.app_metadata?.role !== "faculty") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { from_date, to_date, days, type, reason } = body;
  if (!from_date || !to_date || !days || !type) {
    return NextResponse.json({ error: "from_date, to_date, days, type required" }, { status: 400 });
  }

  const name = user.app_metadata?.name || user.user_metadata?.name || "Faculty";
  const admin = createAdminClient();
  const { data, error } = await admin.from("leave_applications").insert({
    faculty_id: user.id,
    faculty_name: name,
    from_date, to_date, days, type,
    reason: reason ?? "",
    status: "pending",
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ leave: data });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "superadmin"].includes(user.app_metadata?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, status, admin_note } = await request.json();
  if (!id || !status) return NextResponse.json({ error: "id and status required" }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin.from("leave_applications").update({
    status,
    admin_note: admin_note ?? null,
    resolved_at: new Date().toISOString(),
  }).eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
