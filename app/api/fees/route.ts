import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = user.app_metadata?.role as string;
  if (!["admin", "superadmin"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("student_id");

  const admin = createAdminClient();
  let query = admin
    .from("fee_payments")
    .select("*, students(name, class, section), fee_structures(name, term, academic_year)");
  if (studentId) query = query.eq("student_id", studentId);
  const { data, error } = await query.order("due_date");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ fees: data ?? [] });
}
