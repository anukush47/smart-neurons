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
  const classParam = searchParams.get("class"); // e.g. "JKG-A"

  const admin = createAdminClient();
  let query = admin.from("students").select("*").eq("is_active", true);
  if (classParam) {
    const parts = classParam.split("-");
    const cls = parts[0];
    const sec = parts[1] || "A";
    query = query.eq("class", cls).eq("section", sec);
  }
  const { data, error } = await query.order("class").order("roll_no");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ students: data ?? [] });
}
