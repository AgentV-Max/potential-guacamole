import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { Order, toBuyerOrderView } from "@/lib/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();
  const body = await request.json();
  const token = String(body.token ?? "").trim();
  const reason = String(body.reason ?? "").trim();

  if (!token || !reason) {
    return NextResponse.json({ error: "token and reason are required" }, { status: 400 });
  }

  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as
    | Order
    | undefined;
  if (!order || order.buyer_token !== token) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.payment_status !== "paid_held") {
    return NextResponse.json(
      { error: "Only orders with a held payment can be disputed" },
      { status: 400 }
    );
  }

  db.prepare(
    "UPDATE orders SET payment_status = 'disputed', dispute_reason = ? WHERE id = ?"
  ).run(reason, id);

  const updated = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as Order;
  return NextResponse.json({ order: toBuyerOrderView(updated) });
}
