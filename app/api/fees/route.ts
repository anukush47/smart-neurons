import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = user.app_metadata?.role as string;
  if (!["admin", "superadmin"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("student_id");
  const classFilter = searchParams.get("class");

  const admin = createAdminClient();
  let query = admin
    .from("fee_payments")
    .select("*, students(id, name, class, section, roll_no, parent_name, parent_phone), fee_structures(id, name, term, academic_year, amount, due_date)");
  if (studentId) query = query.eq("student_id", studentId);
  if (classFilter && classFilter !== "All") query = query.eq("students.class", classFilter);
  const { data, error } = await query.order("due_date");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ fees: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "superadmin"].includes(user.app_metadata?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { fee_payment_id, amount_paid, mode } = await request.json();
  if (!fee_payment_id || !amount_paid || !mode) {
    return NextResponse.json({ error: "fee_payment_id, amount_paid and mode required" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Fetch the payment to build receipt number
  const { data: fp, error: fpErr } = await admin
    .from("fee_payments")
    .select("*, students(class, section, roll_no), fee_structures(due_date)")
    .eq("id", fee_payment_id)
    .single();
  if (fpErr || !fp) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

  const month = new Date(fp.fee_structures.due_date).toLocaleDateString("en-IN", { month: "short", year: "2-digit" }).replace(" ", "");
  const receipt_no = `RC-SN-${fp.students.class}${fp.students.roll_no ?? "00"}-${month}-${Date.now().toString().slice(-4)}`;

  const { data, error } = await admin
    .from("fee_payments")
    .update({
      amount_paid: Number(amount_paid),
      status: Number(amount_paid) >= fp.amount_due ? "paid" : "pending",
      paid_at: new Date().toISOString(),
      receipt_no,
    })
    .eq("id", fee_payment_id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ payment: data, receipt_no });
}
