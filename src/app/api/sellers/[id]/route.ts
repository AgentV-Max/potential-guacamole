import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { Seller, stripAccessCode } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();
  const seller = db.prepare("SELECT * FROM sellers WHERE id = ?").get(id) as
    | Seller
    | undefined;

  if (!seller) {
    return NextResponse.json({ error: "Seller not found" }, { status: 404 });
  }

  return NextResponse.json({ seller: stripAccessCode(seller) });
}
