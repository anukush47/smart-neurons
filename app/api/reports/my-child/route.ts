import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.app_metadata?.role !== "parent") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data: student, error: sErr } = await admin
    .from("students")
    .select("id, name, class, section, roll_no")
    .eq("parent_user_id", user.id)
    .single();

  if (sErr || !student) return NextResponse.json({ reports: [], student: null });

  const { searchParams } = new URL(request.url);
  const term = searchParams.get("term");

  let query = admin
    .from("progress_reports")
    .select("*")
    .eq("student_id", student.id);
  if (term) query = query.eq("term", term);

  const { data, error } = await query;
  if (error) {
    if (error.code === "42P01") return NextResponse.json({ reports: [], student });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ reports: data ?? [], student });
}
