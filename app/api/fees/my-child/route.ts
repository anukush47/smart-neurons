import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
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
      return NextResponse.json({ fees: [], student: null });
    }
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
  if (!student) return NextResponse.json({ fees: [], student: null });

  const { data, error } = await admin
    .from("fee_payments")
    .select("*, fee_structures(name, term, academic_year, description)")
    .eq("student_id", student.id)
    .order("due_date");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ fees: data ?? [], student });
}
