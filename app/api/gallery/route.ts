import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const classFilter = searchParams.get("class");

  const admin = createAdminClient();
  let query = admin
    .from("gallery")
    .select("*")
    .order("created_at", { ascending: false });

  if (classFilter) query = query.or(`class_filter.eq.${classFilter},class_filter.is.null`);

  const { data, error } = await query;
  if (error) {
    if (error.code === "42P01") return NextResponse.json({ photos: [] });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ photos: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = user.app_metadata?.role as string;
  if (!["admin", "faculty", "superadmin"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { title, image_url, class_filter } = body;
  if (!title || !image_url) {
    return NextResponse.json({ error: "title and image_url required" }, { status: 400 });
  }

  const name = user.app_metadata?.name || user.user_metadata?.name || role;
  const admin = createAdminClient();
  const { data, error } = await admin.from("gallery").insert({
    title, image_url,
    class_filter: class_filter ?? null,
    uploaded_by: user.id,
    uploaded_by_name: name,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ photo: data });
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
  const { error } = await admin.from("gallery").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
