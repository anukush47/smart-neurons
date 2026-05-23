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
  const { data: student } = await admin
    .from("students")
    .select("name, class, section")
    .eq("parent_user_id", user.id)
    .single();

  if (!student) return NextResponse.json({ timetable: [], student: null });

  const { data, error } = await admin
    .from("timetable")
    .select("*")
    .eq("class", student.class)
    .eq("section", student.section)
    .order("day");

  if (error) {
    if (error.code === "42P01") return NextResponse.json({ timetable: [], student });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ timetable: data ?? [], student });
}
