import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = user.app_metadata?.role as string;
  if (!["admin", "faculty", "superadmin"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
  const classParam = searchParams.get("class");

  const admin = createAdminClient();
  let query = admin
    .from("attendance")
    .select("*, students(name, class, section, roll_no)")
    .eq("date", date);
  if (classParam) {
    const parts = classParam.split("-");
    query = query.eq("class", `${parts[0]}-${parts[1] || "A"}`);
  }
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ attendance: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = user.app_metadata?.role as string;
  if (!["admin", "faculty"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { date: string; class: string; records: { student_id: string; status: string }[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!Array.isArray(body.records) || body.records.length === 0) {
    return NextResponse.json({ error: "records must be a non-empty array" }, { status: 400 });
  }

  const validStatuses = ["present", "absent", "late", "holiday"];
  const invalidRecord = body.records.find(r => !validStatuses.includes(r.status));
  if (invalidRecord) {
    return NextResponse.json({ error: `Invalid status: ${invalidRecord.status}` }, { status: 400 });
  }

  const admin = createAdminClient();
  const rows = body.records.map(r => ({
    student_id: r.student_id,
    date: body.date,
    status: r.status,
    class: body.class,
    marked_by: user.id,
  }));

  const { error } = await admin
    .from("attendance")
    .upsert(rows, { onConflict: "student_id,date" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, count: rows.length });
}
