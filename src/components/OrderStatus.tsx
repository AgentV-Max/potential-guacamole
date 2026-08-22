"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BuyerOrderView } from "@/lib/types";
import { formatNaira } from "@/lib/format";

type SellerInfo = { business_name: string; whatsapp: string; phone: string; area: string };

const STATUS_LABEL: Record<string, string> = {
  pending: "Waiting for seller to confirm",
  confirmed: "Seller confirmed your order",
  delivered: "Marked as delivered",
  cancelled: "Cancelled",
};

function tokenStorageKey(orderId: string) {
  return `gaslink_order_token_${orderId}`;
}

export default function OrderStatus() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();

  const [token, setToken] = useState<string | null>(null);
  const [order, setOrder] = useState<BuyerOrderView | null>(null);
  const [seller, setSeller] = useState<SellerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [mockCheckout, setMockCheckout] = useState<{ reference: string } | null>(null);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");

  const fetchOrder = useCallback(
    async (activeToken: string) => {
      setError(null);
      try {
        const res = await fetch(`/api/orders/${id}?token=${encodeURIComponent(activeToken)}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "We couldn't find this order.");
          return;
        }
        setOrder(data.order);
        setSeller(data.seller);
      } catch {
        setError("Network error loading your order.");
      } finally {
        setLoading(false);
      }
    },
    [id]
  );

  useEffect(
    /* eslint-disable react-hooks/set-state-in-effect -- resolve the buyer's order token from the URL or a prior visit */
    () => {
      const fromUrl = searchParams.get("token");
      const resolved = fromUrl || window.localStorage.getItem(tokenStorageKey(id));
      if (fromUrl) {
        window.localStorage.setItem(tokenStorageKey(id), fromUrl);
      }
      if (!resolved) {
        setLoading(false);
        setError(
          "We need your order link to show this page. Check the confirmation you received when you placed the order."
        );
        return;
      }
      setToken(resolved);
    },
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id]
  );

  useEffect(
    /* eslint-disable react-hooks/set-state-in-effect -- load the order as soon as we have a token */
    () => {
      if (!token) return;
      fetchOrder(token);
    },
    /* eslint-enable react-hooks/set-state-in-effect */
    [token, fetchOrder]
  );

  useEffect(() => {
    const reference = searchParams.get("reference") ?? searchParams.get("trxref");
    if (!reference || !token) return;
    (async () => {
      await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      fetchOrder(token);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function payNow() {
    if (!token) return;
    setActionError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: id, token }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error ?? "Could not start payment.");
        return;
      }
      if (data.provider === "paystack" && data.authorization_url) {
        window.location.href = data.authorization_url;
        return;
      }
      setMockCheckout({ reference: data.reference });
    } catch {
      setActionError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function completeMockPayment() {
    if (!token) return;
    setBusy(true);
    setActionError(null);
    try {
      const res = await fetch("/api/payments/mock-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: id, token }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error ?? "Could not complete payment.");
        return;
      }
      setOrder(data.order);
      setMockCheckout(null);
    } catch {
      setActionError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function releasePayment() {
    if (!token) return;
    setActionError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/orders/${id}/release`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error ?? "Could not confirm receipt.");
        return;
      }
      setOrder(data.order);
    } catch {
      setActionError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function submitDispute() {
    if (!token || !disputeReason.trim()) return;
    setActionError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/orders/${id}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, reason: disputeReason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error ?? "Could not report this issue.");
        return;
      }
      setOrder(data.order);
      setShowDisputeForm(false);
    } catch {
      setActionError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-8 text-center text-neutral-500 shadow-sm dark:border-white/10 dark:bg-neutral-900">
        Loading your order…
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="rounded-2xl border border-dashed border-black/10 p-8 text-center text-neutral-500 dark:border-white/10">
        {error ?? "We couldn't find this order."}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold">Order #{order.id.slice(0, 8)}</h1>
            <p className="text-sm text-neutral-500">
              {order.quantity} x {order.cylinder_size} ({order.order_type}) &middot;{" "}
              {order.delivery_address}, {order.area}
            </p>
          </div>
          <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium dark:bg-white/10">
            {STATUS_LABEL[order.status] ?? order.status}
          </span>
        </div>

        {seller && (
          <p className="mt-3 text-sm text-neutral-500">
            Seller: <span className="font-medium text-neutral-700 dark:text-neutral-300">{seller.business_name}</span>{" "}
            &middot;{" "}
            <a href={`tel:${seller.phone}`} className="text-orange-600 hover:underline">
              Call
            </a>{" "}
            &middot;{" "}
            <a
              href={`https://wa.me/${seller.whatsapp.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-600 hover:underline"
            >
              WhatsApp
            </a>
          </p>
        )}

        <div className="mt-4 flex items-center justify-between rounded-lg bg-neutral-50 px-4 py-3 dark:bg-white/5">
          <span className="text-sm text-neutral-500">Order total</span>
          <span className="text-lg font-bold">{formatNaira(order.amount)}</span>
        </div>
      </div>

      {actionError && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
          {actionError}
        </p>
      )}

      {order.payment_status === "unpaid" && (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6 dark:border-orange-900/40 dark:bg-orange-900/20">
          <h2 className="font-semibold">Secure your order</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
            Your payment is held safely in escrow and only released to the
            seller once you confirm your gas arrived at the correct weight.
          </p>

          {mockCheckout ? (
            <div className="mt-4 rounded-lg border border-dashed border-orange-400 bg-white p-4 dark:bg-neutral-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                Test mode &mdash; no Paystack keys configured
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Reference <span className="font-mono">{mockCheckout.reference}</span>.
                In production this would open Paystack checkout; here you can
                simulate a successful payment to continue testing the app.
              </p>
              <button
                onClick={completeMockPayment}
                disabled={busy}
                className="mt-3 w-full rounded-lg bg-green-600 px-4 py-2.5 font-semibold text-white hover:bg-green-700 disabled:opacity-60"
              >
                {busy ? "Processing…" : "Simulate successful payment"}
              </button>
            </div>
          ) : (
            <button
              onClick={payNow}
              disabled={busy}
              className="mt-4 w-full rounded-lg bg-orange-600 px-4 py-2.5 font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
            >
              {busy ? "Starting payment…" : `Pay ${formatNaira(order.amount)} now`}
            </button>
          )}
        </div>
      )}

      {order.payment_status === "paid_held" && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900/40 dark:bg-blue-900/20">
          <h2 className="font-semibold text-blue-800 dark:text-blue-200">
            ✅ Payment secured &mdash; held until delivery is confirmed
          </h2>

          {order.status !== "delivered" ? (
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
              Waiting for the seller to mark your order as delivered. You&apos;ll be
              able to confirm receipt and release payment once they do.
            </p>
          ) : order.buyer_confirmed_at ? (
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
              You confirmed receipt. Payout to the seller is being processed
              &mdash; thanks for your patience.
            </p>
          ) : !showDisputeForm ? (
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                onClick={releasePayment}
                disabled={busy}
                className="rounded-lg bg-green-600 px-4 py-2.5 font-semibold text-white hover:bg-green-700 disabled:opacity-60"
              >
                {busy ? "Confirming…" : "Confirm receipt & release payment"}
              </button>
              <button
                onClick={() => setShowDisputeForm(true)}
                className="rounded-lg border border-black/10 px-4 py-2.5 font-medium hover:bg-white dark:border-white/10"
              >
                Report a problem
              </button>
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              <textarea
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                rows={3}
                placeholder="What went wrong? e.g. cylinder was underweight, no delivery, wrong size."
                className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-neutral-900"
              />
              <div className="flex gap-2">
                <button
                  onClick={submitDispute}
                  disabled={busy || !disputeReason.trim()}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  Submit report
                </button>
                <button
                  onClick={() => setShowDisputeForm(false)}
                  className="rounded-lg border border-black/10 px-4 py-2 text-sm dark:border-white/10"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {order.payment_status === "released" && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-green-800 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-200">
          <h2 className="font-semibold">🎉 Completed &mdash; payment released to the seller</h2>
          <p className="mt-1 text-sm">Thanks for using GasLink Surulere!</p>
        </div>
      )}

      {order.payment_status === "disputed" && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
          <h2 className="font-semibold">⚠️ Dispute reported</h2>
          <p className="mt-1 text-sm">
            &ldquo;{order.dispute_reason}&rdquo; &mdash; your payment stays held while we
            help resolve this with the seller.
          </p>
        </div>
      )}

      <Link href="/" className="inline-block text-sm text-orange-600 hover:underline">
        &larr; Back to marketplace
      </Link>
    </div>
  );
}
