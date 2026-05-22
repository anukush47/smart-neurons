import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function parseClass(classAssigned: string): [string, string] {
  const lastDash = classAssigned.lastIndexOf("-");
  if (lastDash === -1) return [classAssigned, "A"];
  const sec = classAssigned.slice(lastDash + 1);
  if (sec.length === 1 && /[A-Z]/i.test(sec)) {
    return [classAssigned.slice(0, lastDash), sec.toUpperCase()];
  }
  return [classAssigned, "A"];
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = user.app_metadata?.role as string;
  if (!["admin", "faculty", "superadmin"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const classFilter = searchParams.get("class");

  const admin = createAdminClient();
  let query = admin
    .from("homework")
    .select("*, homework_submissions(id, student_id, status, submitted_at, remarks, students(name))")
    .order("created_at", { ascending: false });

  if (role === "faculty") {
    const classAssigned = user.app_metadata?.class_assigned ?? "";
    if (!classAssigned) return NextResponse.json({ homework: [] });
    const [cls, sec] = parseClass(classAssigned);
    query = query.eq("class", cls).eq("section", sec);
  } else if (classFilter && classFilter !== "All") {
    query = query.eq("class", classFilter);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ homework: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = user.app_metadata?.role as string;
  if (!["admin", "faculty"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { subject, title, description, type, due_date, class: cls, section } = body;
  if (!subject || !title || !type || !due_date || !cls) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const sec = section || "A";

  // Faculty can only create homework for their own assigned class
  if (role === "faculty") {
    const [assignedCls, assignedSec] = parseClass(user.app_metadata?.class_assigned ?? "");
    if (cls !== assignedCls || sec !== assignedSec) {
      return NextResponse.json({ error: "Forbidden: can only assign homework to your own class" }, { status: 403 });
    }
  }
  const admin = createAdminClient();

  const { data: hw, error: hwErr } = await admin
    .from("homework")
    .insert({ subject, title, description: description || "", type, due_date, class: cls, section: sec, assigned_by: user.id })
    .select()
    .single();

  if (hwErr) return NextResponse.json({ error: hwErr.message }, { status: 500 });

  const { data: students } = await admin
    .from("students")
    .select("id")
    .eq("class", cls)
    .eq("section", sec)
    .eq("is_active", true);

  if (students?.length) {
    await admin.from("homework_submissions").insert(
      students.map((s: { id: string }) => ({ homework_id: hw.id, student_id: s.id, status: "pending" }))
    );
  }

  return NextResponse.json({ homework: hw }, { status: 201 });
}
