import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? 50);

  const { data, error } = await admin
    .from("announcements")
    .select("*")
    .eq("status", "sent")
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (error.code === "42P01") return NextResponse.json({ announcements: [] });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ announcements: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "superadmin"].includes(user.app_metadata?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { title, body: msgBody, tag, audience, class_filter, pinned, status } = body;
  if (!title || !msgBody) {
    return NextResponse.json({ error: "title and body required" }, { status: 400 });
  }

  const senderName = user.app_metadata?.name || user.user_metadata?.name || "Admin";
  const admin = createAdminClient();
  const { data, error } = await admin.from("announcements").insert({
    title, body: msgBody,
    tag: tag ?? "General",
    audience: audience ?? "All",
    class_filter: class_filter ?? null,
    sent_by: user.id,
    sent_by_name: senderName,
    pinned: pinned ?? false,
    status: status ?? "sent",
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ announcement: data });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "superadmin"].includes(user.app_metadata?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin.from("announcements").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "superadmin"].includes(user.app_metadata?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin.from("announcements").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
