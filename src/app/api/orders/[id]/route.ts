import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { Order, Seller, stripAccessCode, toBuyerOrderView, toSellerOrderView } from "@/lib/types";

const VALID_STATUSES = ["pending", "confirmed", "delivered", "cancelled"];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();
  const token = request.nextUrl.searchParams.get("token")?.trim();

  if (!token) {
    return NextResponse.json({ error: "token is required" }, { status: 400 });
  }

  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as
    | Order
    | undefined;
  if (!order || order.buyer_token !== token) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const seller = db
    .prepare("SELECT * FROM sellers WHERE id = ?")
    .get(order.seller_id) as Seller;

  return NextResponse.json({
    order: toBuyerOrderView(order),
    seller: stripAccessCode(seller),
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();
  const body = await request.json();
  const accessCode = String(body.access_code ?? "").trim();
  const status = String(body.status ?? "").trim();

  if (!accessCode || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as
    | Order
    | undefined;
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const seller = db
    .prepare("SELECT * FROM sellers WHERE id = ?")
    .get(order.seller_id) as Seller | undefined;
  if (!seller || seller.access_code !== accessCode) {
    return NextResponse.json({ error: "Invalid access code" }, { status: 401 });
  }

  db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, id);
  const updated = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as Order;
  return NextResponse.json({ order: toSellerOrderView(updated) });
}
