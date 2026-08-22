import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { Order, toBuyerOrderView } from "@/lib/types";
import { isPaystackConfigured } from "@/lib/payments";

/**
 * Test-mode payment completion. Only works when no PAYSTACK_SECRET_KEY is
 * configured, so it can never be used to fake a payment on a live deployment.
 */
export async function POST(request: NextRequest) {
  if (isPaystackConfigured()) {
    return NextResponse.json(
      { error: "Mock payments are disabled once Paystack is configured" },
      { status: 403 }
    );
  }

  const db = getDb();
  const body = await request.json();
  const orderId = String(body.order_id ?? "").trim();
  const token = String(body.token ?? "").trim();

  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId) as
    | Order
    | undefined;
  if (!order || order.buyer_token !== token) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.payment_status !== "unpaid") {
    return NextResponse.json({ order: toBuyerOrderView(order) });
  }

  const now = new Date().toISOString();
  db.prepare(
    `UPDATE orders SET payment_status = 'paid_held', payment_provider = 'mock',
     payment_reference = @reference, paid_at = @now WHERE id = @id`
  ).run({ id: orderId, now, reference: order.payment_reference || `MOCK-${orderId}` });

  const updated = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId) as Order;
  return NextResponse.json({ order: toBuyerOrderView(updated) });
}
