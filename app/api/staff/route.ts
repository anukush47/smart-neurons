import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = user.app_metadata?.role as string;
  if (!["admin", "superadmin"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data: { users }, error } = await admin.auth.admin.listUsers({ perPage: 200 });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const staff = users.filter(u =>
    ["admin", "faculty"].includes(u.app_metadata?.role ?? "")
  );

  const { data: profiles } = await admin
    .from("staff_profiles")
    .select("*");

  const profileMap: Record<string, any> = {};
  for (const p of profiles ?? []) profileMap[p.id] = p;

  const { data: leaves } = await admin
    .from("leave_applications")
    .select("faculty_id, status");

  const leaveMap: Record<string, { pending: number; approved: number }> = {};
  for (const l of leaves ?? []) {
    if (!leaveMap[l.faculty_id]) leaveMap[l.faculty_id] = { pending: 0, approved: 0 };
    if (l.status === "pending")  leaveMap[l.faculty_id].pending++;
    if (l.status === "approved") leaveMap[l.faculty_id].approved++;
  }

  const result = staff.map(u => ({
    id: u.id,
    name: u.app_metadata?.name || u.user_metadata?.name || u.email?.split("@")[0] || "—",
    email: u.email,
    role: u.app_metadata?.role,
    class_assigned: u.app_metadata?.class_assigned ?? null,
    designation: profileMap[u.id]?.designation ?? null,
    phone: profileMap[u.id]?.phone ?? null,
    join_date: profileMap[u.id]?.join_date ?? null,
    casual_balance: profileMap[u.id]?.casual_balance ?? 12,
    sick_balance: profileMap[u.id]?.sick_balance ?? 7,
    pending_leaves: leaveMap[u.id]?.pending ?? 0,
    approved_leaves: leaveMap[u.id]?.approved ?? 0,
  }));

  return NextResponse.json({ staff: result });
}
