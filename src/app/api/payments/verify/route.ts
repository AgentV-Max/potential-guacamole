import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { Order, toBuyerOrderView } from "@/lib/types";
import { isPaystackConfigured, verifyTransaction } from "@/lib/payments";

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  const reference = String(body.reference ?? "").trim();

  if (!reference) {
    return NextResponse.json({ error: "reference is required" }, { status: 400 });
  }

  const order = db.prepare("SELECT * FROM orders WHERE payment_reference = ?").get(reference) as
    | Order
    | undefined;
  if (!order) {
    return NextResponse.json({ error: "No order matches that payment reference" }, { status: 404 });
  }

  if (order.payment_status !== "unpaid") {
    return NextResponse.json({ order: toBuyerOrderView(order) });
  }

  if (!isPaystackConfigured()) {
    return NextResponse.json(
      { error: "Paystack is not configured; use /api/payments/mock-complete instead" },
      { status: 400 }
    );
  }

  const result = await verifyTransaction(reference);
  if (!result.success) {
    return NextResponse.json({ error: "Payment was not successful" }, { status: 400 });
  }

  const now = new Date().toISOString();
  db.prepare(
    "UPDATE orders SET payment_status = 'paid_held', paid_at = ? WHERE id = ?"
  ).run(now, order.id);

  const updated = db.prepare("SELECT * FROM orders WHERE id = ?").get(order.id) as Order;
  return NextResponse.json({ order: toBuyerOrderView(updated) });
}
