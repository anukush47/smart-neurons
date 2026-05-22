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

  const { data: student, error: stuErr } = await admin
    .from("students")
    .select("id, name, class, section")
    .eq("parent_user_id", user.id)
    .single();

  if (stuErr || !student) {
    return NextResponse.json({ syllabus: [], student: null });
  }

  const { searchParams } = new URL(request.url);
  const termFilter = searchParams.get("term");

  let query = admin
    .from("syllabus")
    .select("*")
    .eq("class", student.class)
    .eq("section", student.section)
    .order("subject");

  if (termFilter) query = query.eq("term", termFilter);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ syllabus: data ?? [], student });
}
