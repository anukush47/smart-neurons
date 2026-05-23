import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = user.app_metadata?.role as string;
  if (role !== "parent") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("students")
    .select("*")
    .eq("parent_user_id", user.id)
    .eq("is_active", true)
    .single();

  if (error) {
    if (error.code === "PGRST116" || error.code === "42P01") {
      return NextResponse.json({ student: null });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ student: data });
}
