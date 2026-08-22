import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { Order, Seller, toBuyerOrderView } from "@/lib/types";
import { ensureTransferRecipient, isPaystackConfigured, payoutToSeller } from "@/lib/payments";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();
  const body = await request.json();
  const token = String(body.token ?? "").trim();

  if (!token) {
    return NextResponse.json({ error: "token is required" }, { status: 400 });
  }

  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as
    | Order
    | undefined;
  if (!order || order.buyer_token !== token) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.payment_status !== "paid_held") {
    return NextResponse.json(
      { error: "This order has no held payment to release" },
      { status: 400 }
    );
  }
  if (order.status !== "delivered") {
    return NextResponse.json(
      { error: "The seller hasn't marked this order as delivered yet" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const seller = db
    .prepare("SELECT * FROM sellers WHERE id = ?")
    .get(order.seller_id) as Seller;

  if (!isPaystackConfigured()) {
    // Mock mode: simulate an instant, always-successful payout.
    db.prepare(
      `UPDATE orders SET payment_status = 'released', buyer_confirmed_at = @now,
       released_at = @now, payout_error = NULL WHERE id = @id`
    ).run({ id, now });
  } else if (seller.bank_code && seller.bank_account_number && seller.bank_account_name) {
    try {
      let recipientCode = seller.paystack_recipient_code;
      if (!recipientCode) {
        recipientCode = await ensureTransferRecipient({
          bank_account_name: seller.bank_account_name,
          bank_account_number: seller.bank_account_number,
          bank_code: seller.bank_code,
        });
        db.prepare("UPDATE sellers SET paystack_recipient_code = ? WHERE id = ?").run(
          recipientCode,
          seller.id
        );
      }
      await payoutToSeller({
        recipientCode,
        amountNaira: order.payout_amount,
        reason: `GasLink order ${order.id.slice(0, 8)} payout`,
      });
      db.prepare(
        `UPDATE orders SET payment_status = 'released', buyer_confirmed_at = @now,
         released_at = @now, payout_error = NULL WHERE id = @id`
      ).run({ id, now });
    } catch (err) {
      db.prepare(
        `UPDATE orders SET buyer_confirmed_at = @now, payout_error = @error WHERE id = @id`
      ).run({ id, now, error: err instanceof Error ? err.message : "Payout failed" });
    }
  } else {
    db.prepare(
      `UPDATE orders SET buyer_confirmed_at = @now,
       payout_error = 'Seller has not added payout bank details yet' WHERE id = @id`
    ).run({ id, now });
  }

  const updated = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as Order;
  return NextResponse.json({ order: toBuyerOrderView(updated) });
}
