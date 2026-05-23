import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.app_metadata?.role !== "faculty") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ca: string = user.app_metadata?.class_assigned ?? "";
  if (!ca) return NextResponse.json({ timetable: [], class: null });

  const parts = ca.split("-");
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("timetable")
    .select("*")
    .eq("class", parts[0])
    .eq("section", parts[1] ?? "A")
    .order("day");

  if (error) {
    if (error.code === "42P01") return NextResponse.json({ timetable: [], class: ca });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ timetable: data ?? [], class: ca });
}
