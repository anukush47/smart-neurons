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
    .select("id, name, class, section")
    .eq("parent_user_id", user.id)
    .single();

  if (sErr) {
    if (sErr.code === "PGRST116") {
      return NextResponse.json({ attendance: [], student: null });
    }
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
  if (!student) return NextResponse.json({ attendance: [], student: null });

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month"); // e.g. "2026-05"

  let query = admin
    .from("attendance")
    .select("*")
    .eq("student_id", student.id)
    .order("date", { ascending: false });
  if (month) {
    const [y, m] = month.split("-").map(Number);
    const lastDay = new Date(y, m, 0).getDate(); // day 0 of next month = last day of this month
    query = query
      .gte("date", `${month}-01`)
      .lte("date", `${month}-${String(lastDay).padStart(2, "0")}`);
  }
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ attendance: data ?? [], student });
}
