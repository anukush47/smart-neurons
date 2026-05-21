import { NextResponse } from "next/server";
import crypto from "crypto";
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
  let razorpay_order_id: string, razorpay_payment_id: string,
      razorpay_signature: string, fee_payment_id: string;
  try {
    const body = await request.json() as {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      fee_payment_id: string;
    };
    razorpay_order_id = body.razorpay_order_id;
    razorpay_payment_id = body.razorpay_payment_id;
    razorpay_signature = body.razorpay_signature;
    fee_payment_id = body.fee_payment_id;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !fee_payment_id) {
      throw new Error("missing fields");
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Verify HMAC signature
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");
  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Fetch fee payment — verify ownership and order_id match
  const { data: feePayment, error: fpErr } = await admin
    .from("fee_payments")
    .select("id, amount_due, status, razorpay_order_id, student_id, students(parent_user_id)")
    .eq("id", fee_payment_id)
    .single();

  if (fpErr || !feePayment) {
    return NextResponse.json({ error: "Fee record not found" }, { status: 404 });
  }

  // Ownership check
  const students = feePayment.students as unknown as { parent_user_id: string | null } | null;
  if (!students || students.parent_user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Cross-check: the order_id in DB must match the one in this request
  if (feePayment.razorpay_order_id !== razorpay_order_id) {
    return NextResponse.json({ error: "Order ID mismatch" }, { status: 400 });
  }

  if (feePayment.status === "paid") {
    return NextResponse.json({ error: "Already paid" }, { status: 400 });
  }

  // Generate unique receipt: use fee_payment_id (already unique) + timestamp suffix
  const receiptNo = `RC-SN-${fee_payment_id.slice(0, 8)}-${Date.now().toString(36).toUpperCase()}`;

  const { error: updateErr } = await admin
    .from("fee_payments")
    .update({
      status: "paid",
      razorpay_payment_id,
      amount_paid: feePayment.amount_due,
      paid_at: new Date().toISOString(),
      receipt_no: receiptNo,
    })
    .eq("id", fee_payment_id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, receipt_no: receiptNo });
}
