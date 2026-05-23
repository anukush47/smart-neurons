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
  const classParam = searchParams.get("class");
  const term = searchParams.get("term");

  // Faculty is always restricted to their assigned class
  const effectiveClass =
    role === "faculty" ? (user.app_metadata?.class_assigned ?? classParam) : classParam;

  const admin = createAdminClient();
  let query = admin
    .from("progress_reports")
    .select("*, students!inner(id, name, roll_no, class, section)");

  if (effectiveClass) {
    const parts = effectiveClass.split("-");
    const cls = parts[0];
    const sec = parts[1] ?? "A";
    query = (query as any).eq("students.class", cls).eq("students.section", sec);
  }
  if (term) query = query.eq("term", term);

  const { data, error } = await query;
  if (error) {
    if (error.code === "42P01") return NextResponse.json({ reports: [] });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ reports: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = user.app_metadata?.role as string;
  if (!["admin", "faculty", "superadmin"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { student_id, term, subjects, conduct, teacher_remark, promoted } = body;
  if (!student_id || !term) {
    return NextResponse.json({ error: "student_id and term are required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("progress_reports").upsert(
    {
      student_id,
      term,
      subjects: subjects ?? [],
      conduct: conduct ?? "Good",
      teacher_remark: teacher_remark ?? "",
      promoted: promoted ?? true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "student_id,term" },
  );

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json(
        { error: "progress_reports table not found. Please create it in Supabase." },
        { status: 500 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
