import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getDb } from "@/lib/db";
import { Order, Seller, stripAccessCode } from "@/lib/types";

export async function GET(request: NextRequest) {
  const db = getDb();
  const accessCode = request.nextUrl.searchParams.get("access_code")?.trim();

  if (!accessCode) {
    return NextResponse.json({ error: "access_code is required" }, { status: 400 });
  }

  const seller = db
    .prepare("SELECT * FROM sellers WHERE access_code = ?")
    .get(accessCode) as Seller | undefined;

  if (!seller) {
    return NextResponse.json({ error: "Invalid access code" }, { status: 401 });
  }

  const orders = db
    .prepare("SELECT * FROM orders WHERE seller_id = ? ORDER BY created_at DESC")
    .all(seller.id) as Order[];

  return NextResponse.json({
    seller: { id: seller.id, business_name: seller.business_name },
    orders,
  });
}

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();

  const required = [
    "seller_id",
    "buyer_name",
    "buyer_phone",
    "delivery_address",
    "area",
    "cylinder_size",
  ];
  for (const field of required) {
    if (!body[field] || typeof body[field] !== "string" || !body[field].trim()) {
      return NextResponse.json(
        { error: `Missing required field: ${field}` },
        { status: 400 }
      );
    }
  }

  const seller = db
    .prepare("SELECT * FROM sellers WHERE id = ?")
    .get(body.seller_id) as Seller | undefined;
  if (!seller) {
    return NextResponse.json({ error: "Seller not found" }, { status: 404 });
  }

  const id = randomUUID();
  const now = new Date().toISOString();
  const quantity = Math.max(1, Math.min(20, Number(body.quantity) || 1));

  db.prepare(
    `INSERT INTO orders (
      id, seller_id, buyer_name, buyer_phone, delivery_address, area,
      cylinder_size, order_type, quantity, notes, status, created_at
    ) VALUES (
      @id, @seller_id, @buyer_name, @buyer_phone, @delivery_address, @area,
      @cylinder_size, @order_type, @quantity, @notes, 'pending', @created_at
    )`
  ).run({
    id,
    seller_id: body.seller_id,
    buyer_name: body.buyer_name.trim(),
    buyer_phone: body.buyer_phone.trim(),
    delivery_address: body.delivery_address.trim(),
    area: body.area.trim(),
    cylinder_size: body.cylinder_size.trim(),
    order_type: body.order_type === "new" ? "new" : "refill",
    quantity,
    notes: body.notes ? String(body.notes).trim() : null,
    created_at: now,
  });

  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as Order;
  return NextResponse.json({ order, seller: stripAccessCode(seller) }, { status: 201 });
}
