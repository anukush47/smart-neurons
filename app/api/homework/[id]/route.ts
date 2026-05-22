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
  if (!["admin", "faculty", "parent"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: homeworkId } = await params;
  const body = await request.json();
  const { submission_id, status, remarks } = body;

  if (!submission_id || !status) {
    return NextResponse.json({ error: "submission_id and status are required" }, { status: 400 });
  }

  const allowedStatuses = role === "parent" ? ["submitted"] : ["reviewed", "submitted", "pending"];
  if (!allowedStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status for role" }, { status: 403 });
  }

  const admin = createAdminClient();

  if (role === "parent") {
    const { data: student } = await admin
      .from("students").select("id").eq("parent_user_id", user.id).single();
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 403 });

    const { data: sub } = await admin
      .from("homework_submissions").select("student_id").eq("id", submission_id).single();
    if (!sub || sub.student_id !== student.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const update: Record<string, unknown> = { status };
  if (status === "submitted") update.submitted_at = new Date().toISOString();
  if (status === "reviewed" && remarks) update.remarks = remarks;

  const { data, error } = await admin
    .from("homework_submissions")
    .update(update)
    .eq("id", submission_id)
    .eq("homework_id", homeworkId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ submission: data });
}

export async function DELETE(
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

  const { id: homeworkId } = await params;
  const admin = createAdminClient();
  const { error } = await admin.from("homework").delete().eq("id", homeworkId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
