import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  // Auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "parent") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse body safely
  let fee_payment_id: string;
  try {
    const body = await request.json() as { fee_payment_id: string };
    fee_payment_id = body.fee_payment_id;
    if (!fee_payment_id) throw new Error("missing fee_payment_id");
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Fetch the fee payment record from DB — DO NOT trust client-supplied amount
  const { data: feePayment, error: fpErr } = await admin
    .from("fee_payments")
    .select("id, amount_due, status, student_id, students(parent_user_id)")
    .eq("id", fee_payment_id)
    .single();

  if (fpErr || !feePayment) {
    return NextResponse.json({ error: "Fee record not found" }, { status: 404 });
  }

  // Verify ownership: this fee belongs to the logged-in parent's child
  const students = feePayment.students as unknown as { parent_user_id: string | null } | null;
  if (!students || students.parent_user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (feePayment.status === "paid") {
    return NextResponse.json({ error: "Fee already paid" }, { status: 400 });
  }

  // Create Razorpay order inside handler (not at module scope)
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return NextResponse.json({ error: "Payment gateway not configured" }, { status: 503 });
  }
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let order: { id: string; amount: number | string; currency: string; [k: string]: any };
  try {
    const created = await razorpay.orders.create({
      amount: Math.round(Number(feePayment.amount_due) * 100), // paise from DB value
      currency: "INR",
      receipt: `rcpt_${fee_payment_id.replace(/-/g, "").slice(0, 20)}`,
    });
    if (!created || typeof created !== "object" || !("id" in created)) {
      throw new Error("Razorpay returned unexpected response");
    }
    order = created as typeof order;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Razorpay error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  // Store order ID in DB
  const { error: updateErr } = await admin
    .from("fee_payments")
    .update({ razorpay_order_id: order.id })
    .eq("id", fee_payment_id);
  if (updateErr) {
    return NextResponse.json({ error: "Failed to store order" }, { status: 500 });
  }

  return NextResponse.json({
    order_id: order.id,
    amount: order.amount,
    currency: order.currency,
    key: process.env.RAZORPAY_KEY_ID,
  });
}
