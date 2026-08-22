import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { Order } from "@/lib/types";
import { initializeCheckout } from "@/lib/payments";

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  const orderId = String(body.order_id ?? "").trim();
  const token = String(body.token ?? "").trim();

  if (!orderId || !token) {
    return NextResponse.json({ error: "order_id and token are required" }, { status: 400 });
  }

  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId) as
    | Order
    | undefined;
  if (!order || order.buyer_token !== token) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.payment_status !== "unpaid") {
    return NextResponse.json(
      { error: `This order is already ${order.payment_status.replace("_", " ")}` },
      { status: 400 }
    );
  }

  const email = order.buyer_email || `${order.buyer_phone.replace(/[^0-9]/g, "")}@gaslink.local`;
  const origin = request.nextUrl.origin;

  const result = await initializeCheckout({
    email,
    amountNaira: order.amount,
    callbackUrl: `${origin}/orders/${order.id}`,
    metadata: { order_id: order.id, seller_id: order.seller_id },
  });

  db.prepare(
    "UPDATE orders SET payment_provider = ?, payment_reference = ? WHERE id = ?"
  ).run(result.provider, result.reference, order.id);

  return NextResponse.json({
    provider: result.provider,
    reference: result.reference,
    authorization_url: result.authorizationUrl,
  });
}
