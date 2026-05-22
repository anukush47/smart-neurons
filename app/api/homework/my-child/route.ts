import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (user.app_metadata?.role !== "parent") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();

  const { data: student, error: stuErr } = await admin
    .from("students")
    .select("id, name, class, section, roll_no")
    .eq("parent_user_id", user.id)
    .single();

  if (stuErr || !student) {
    return NextResponse.json({ homework: [], student: null });
  }

  const { data: hwList, error: hwErr } = await admin
    .from("homework")
    .select("id, subject, title, description, due_date, type, class, section")
    .eq("class", student.class)
    .eq("section", student.section)
    .order("due_date", { ascending: false });

  if (hwErr) return NextResponse.json({ error: hwErr.message }, { status: 500 });
  if (!hwList?.length) return NextResponse.json({ homework: [], student });

  const { data: submissions } = await admin
    .from("homework_submissions")
    .select("id, homework_id, status, submitted_at, remarks")
    .eq("student_id", student.id)
    .in("homework_id", hwList.map((h: { id: string }) => h.id));

  const subsByHwId = Object.fromEntries(
    (submissions ?? []).map((s: { homework_id: string; id: string; status: string; submitted_at: string | null; remarks: string | null }) =>
      [s.homework_id, s]
    )
  );

  const homework = hwList.map((hw: Record<string, unknown>) => {
    const sub = subsByHwId[hw.id as string];
    return {
      id: hw.id,
      subject: hw.subject,
      title: hw.title,
      description: hw.description,
      due_date: hw.due_date,
      type: hw.type,
      submission_id: sub?.id ?? null,
      status: sub?.status ?? "pending",
      submitted_at: sub?.submitted_at ?? null,
      remarks: sub?.remarks ?? null,
    };
  });

  return NextResponse.json({ homework, student });
}
