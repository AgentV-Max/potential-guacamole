import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getDb } from "@/lib/db";
import { Seller, stripAccessCode } from "@/lib/types";

function generateAccessCode(area: string): string {
  const prefix = area.replace(/[^a-zA-Z]/g, "").slice(0, 4).toUpperCase() || "GASL";
  const suffix = Math.floor(100 + Math.random() * 900);
  return `GAS-${prefix}-${suffix}`;
}

export async function GET(request: NextRequest) {
  const db = getDb();
  const area = request.nextUrl.searchParams.get("area");
  const cylinder = request.nextUrl.searchParams.get("cylinder");
  const delivery = request.nextUrl.searchParams.get("delivery");

  let query = "SELECT * FROM sellers WHERE 1=1";
  const params: Record<string, unknown> = {};

  if (area && area !== "all") {
    query += " AND area = @area";
    params.area = area;
  }
  if (delivery === "1") {
    query += " AND delivery = 1";
  }
  if (cylinder === "5kg") query += " AND price_5kg IS NOT NULL";
  if (cylinder === "12.5kg") query += " AND price_12_5kg IS NOT NULL";
  if (cylinder === "25kg") query += " AND price_25kg IS NOT NULL";

  query += " ORDER BY verified DESC, rating DESC";

  const sellers = db.prepare(query).all(params) as Seller[];
  return NextResponse.json({ sellers: sellers.map(stripAccessCode) });
}

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();

  const required = ["business_name", "owner_name", "phone", "area", "address"];
  for (const field of required) {
    if (!body[field] || typeof body[field] !== "string" || !body[field].trim()) {
      return NextResponse.json(
        { error: `Missing required field: ${field}` },
        { status: 400 }
      );
    }
  }

  const id = randomUUID();
  const accessCode = generateAccessCode(body.area);
  const now = new Date().toISOString();

  const toNullableInt = (v: unknown) => {
    const n = Number(v);
    return v && !Number.isNaN(n) ? Math.round(n) : null;
  };

  const nullableText = (v: unknown) =>
    typeof v === "string" && v.trim() ? v.trim() : null;

  db.prepare(
    `INSERT INTO sellers (
      id, business_name, owner_name, phone, whatsapp, area, city, state, address,
      price_5kg, price_12_5kg, price_25kg, delivery, accessories, rating, rating_count,
      access_code, verified, bank_code, bank_account_number, bank_account_name, created_at
    ) VALUES (
      @id, @business_name, @owner_name, @phone, @whatsapp, @area, 'Surulere', 'Lagos', @address,
      @price_5kg, @price_12_5kg, @price_25kg, @delivery, @accessories, 4.5, 0,
      @access_code, 0, @bank_code, @bank_account_number, @bank_account_name, @created_at
    )`
  ).run({
    id,
    business_name: body.business_name.trim(),
    owner_name: body.owner_name.trim(),
    phone: body.phone.trim(),
    whatsapp: (body.whatsapp || body.phone).trim(),
    area: body.area.trim(),
    address: body.address.trim(),
    price_5kg: toNullableInt(body.price_5kg),
    price_12_5kg: toNullableInt(body.price_12_5kg),
    price_25kg: toNullableInt(body.price_25kg),
    delivery: body.delivery ? 1 : 0,
    accessories: body.accessories ? 1 : 0,
    access_code: accessCode,
    bank_code: nullableText(body.bank_code),
    bank_account_number: nullableText(body.bank_account_number),
    bank_account_name: nullableText(body.bank_account_name),
    created_at: now,
  });

  const seller = db.prepare("SELECT * FROM sellers WHERE id = ?").get(id) as Seller;
  return NextResponse.json({ seller }, { status: 201 });
}
