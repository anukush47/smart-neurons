import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ user: { id: user.id, email: user.email, ...user.app_metadata } });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const allowed: Record<string, unknown> = {};
  if (body.name !== undefined) allowed.name = body.name;
  if (body.phone !== undefined) allowed.phone = body.phone;

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: { ...user.app_metadata, ...allowed },
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
