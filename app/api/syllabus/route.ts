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
  const termFilter = searchParams.get("term");
  const classFilter = searchParams.get("class");

  const admin = createAdminClient();
  let query = admin.from("syllabus").select("*").order("subject");

  if (role === "faculty") {
    const classAssigned = user.app_metadata?.class_assigned ?? "";
    if (!classAssigned) return NextResponse.json({ syllabus: [] });
    const [cls, sec] = parseClass(classAssigned);
    query = query.eq("class", cls).eq("section", sec);
  } else if (classFilter && classFilter !== "All") {
    query = query.eq("class", classFilter);
  }

  if (termFilter) query = query.eq("term", termFilter);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ syllabus: data ?? [] });
}
