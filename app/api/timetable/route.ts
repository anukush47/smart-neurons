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
  const classParam = searchParams.get("class");

  const admin = createAdminClient();
  let query = admin.from("timetable").select("*").order("class").order("day");
  if (classParam) {
    const parts = classParam.split("-");
    query = query.eq("class", parts[0]).eq("section", parts[1] ?? "A");
  }
  const { data, error } = await query;
  if (error) {
    if (error.code === "42P01") return NextResponse.json({ timetable: [] });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ timetable: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "superadmin"].includes(user.app_metadata?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { class: cls, section, day, periods } = body;
  if (!cls || !section || !day) {
    return NextResponse.json({ error: "class, section, day required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("timetable").upsert(
    { class: cls, section, day, periods: periods ?? [], updated_by: user.id, updated_at: new Date().toISOString() },
    { onConflict: "class,section,day" }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
