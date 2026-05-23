import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// Returns faculty list — accessible to all authenticated roles so parents can message teachers
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const classFilter = searchParams.get("class");

  const admin = createAdminClient();
  const { data: { users }, error } = await admin.auth.admin.listUsers({ perPage: 200 });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let faculty = users.filter(u => u.app_metadata?.role === "faculty");

  if (classFilter) {
    faculty = faculty.filter(u => {
      const ca: string = u.app_metadata?.class_assigned ?? "";
      return ca.startsWith(classFilter);
    });
  }

  const result = faculty.map(u => ({
    id: u.id,
    name: u.app_metadata?.name || u.email?.split("@")[0] || "Teacher",
    class_assigned: u.app_metadata?.class_assigned ?? null,
  }));

  return NextResponse.json({ faculty: result });
}
