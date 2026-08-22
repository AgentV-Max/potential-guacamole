import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getDb } from "@/lib/db";
import {
  Order,
  PLATFORM_COMMISSION_RATE,
  PRICE_FIELD_BY_SIZE,
  PRICED_CYLINDER_SIZES,
  PricedCylinderSize,
  Seller,
  stripAccessCode,
  toBuyerOrderView,
  toSellerOrderView,
} from "@/lib/types";

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
    orders: orders.map(toSellerOrderView),
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

  const cylinderSize = body.cylinder_size.trim();
  if (!(PRICED_CYLINDER_SIZES as readonly string[]).includes(cylinderSize)) {
    return NextResponse.json(
      { error: `Orders can only be placed for: ${PRICED_CYLINDER_SIZES.join(", ")}` },
      { status: 400 }
    );
  }

  const seller = db
    .prepare("SELECT * FROM sellers WHERE id = ?")
    .get(body.seller_id) as Seller | undefined;
  if (!seller) {
    return NextResponse.json({ error: "Seller not found" }, { status: 404 });
  }

  const priceField = PRICE_FIELD_BY_SIZE[cylinderSize as PricedCylinderSize];
  const unitPrice = seller[priceField] as number | null;
  if (unitPrice === null || unitPrice === undefined) {
    return NextResponse.json(
      { error: `${seller.business_name} does not price ${cylinderSize} cylinders` },
      { status: 400 }
    );
  }

  const id = randomUUID();
  const buyerToken = randomUUID();
  const now = new Date().toISOString();
  const quantity = Math.max(1, Math.min(20, Number(body.quantity) || 1));
  const amount = unitPrice * quantity;
  const commissionAmount = Math.round(amount * PLATFORM_COMMISSION_RATE);
  const payoutAmount = amount - commissionAmount;

  const buyerEmail =
    typeof body.buyer_email === "string" && body.buyer_email.trim()
      ? body.buyer_email.trim()
      : null;

  db.prepare(
    `INSERT INTO orders (
      id, seller_id, buyer_name, buyer_phone, buyer_email, buyer_token,
      delivery_address, area, cylinder_size, order_type, quantity,
      unit_price, amount, commission_amount, payout_amount, notes,
      status, payment_status, created_at
    ) VALUES (
      @id, @seller_id, @buyer_name, @buyer_phone, @buyer_email, @buyer_token,
      @delivery_address, @area, @cylinder_size, @order_type, @quantity,
      @unit_price, @amount, @commission_amount, @payout_amount, @notes,
      'pending', 'unpaid', @created_at
    )`
  ).run({
    id,
    seller_id: body.seller_id,
    buyer_name: body.buyer_name.trim(),
    buyer_phone: body.buyer_phone.trim(),
    buyer_email: buyerEmail,
    buyer_token: buyerToken,
    delivery_address: body.delivery_address.trim(),
    area: body.area.trim(),
    cylinder_size: cylinderSize,
    order_type: body.order_type === "new" ? "new" : "refill",
    quantity,
    unit_price: unitPrice,
    amount,
    commission_amount: commissionAmount,
    payout_amount: payoutAmount,
    notes: body.notes ? String(body.notes).trim() : null,
    created_at: now,
  });

  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as Order;
  return NextResponse.json(
    {
      order: toBuyerOrderView(order),
      buyer_token: buyerToken,
      seller: stripAccessCode(seller),
    },
    { status: 201 }
  );
}
