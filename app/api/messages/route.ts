import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const withUserId = searchParams.get("with");

  const admin = createAdminClient();
  let query = admin
    .from("messages")
    .select("*")
    .order("sent_at", { ascending: true });

  if (withUserId) {
    query = query.or(
      `and(from_user_id.eq.${user.id},to_user_id.eq.${withUserId}),and(from_user_id.eq.${withUserId},to_user_id.eq.${user.id})`
    );
  } else {
    query = query.or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`);
  }

  const { data, error } = await query.limit(100);
  if (error) {
    if (error.code === "42P01") return NextResponse.json({ messages: [] });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Mark received messages as read
  if (withUserId) {
    await admin
      .from("messages")
      .update({ read: true })
      .eq("from_user_id", withUserId)
      .eq("to_user_id", user.id)
      .eq("read", false);
  }

  return NextResponse.json({ messages: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { to_user_id, body } = await request.json();
  if (!to_user_id || !body?.trim()) {
    return NextResponse.json({ error: "to_user_id and body required" }, { status: 400 });
  }

  const name = user.app_metadata?.name || user.user_metadata?.name || "User";
  const role = user.app_metadata?.role as string;
  const admin = createAdminClient();
  const { data, error } = await admin.from("messages").insert({
    from_user_id: user.id,
    from_name: name,
    from_role: role,
    to_user_id,
    body: body.trim(),
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: data });
}
