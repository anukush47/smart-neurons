import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = user.app_metadata?.role as string;
  if (!["admin", "faculty", "superadmin"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const allowed = ["topics", "note", "file_name", "file_uploaded"] as const;
  const update: Record<string, unknown> = { updated_by: user.id, updated_at: new Date().toISOString() };

  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("syllabus")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ syllabus: data });
}
