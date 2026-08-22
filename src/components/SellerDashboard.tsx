"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Order } from "@/lib/types";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  delivered: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  cancelled: "bg-neutral-200 text-neutral-600 dark:bg-white/10 dark:text-neutral-300",
};

export default function SellerDashboard() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState(searchParams.get("code") ?? "");
  const [inputCode, setInputCode] = useState(searchParams.get("code") ?? "");
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadOrders(accessCode: string) {
    if (!accessCode.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/orders?access_code=${encodeURIComponent(accessCode.trim())}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not load orders.");
        setOrders(null);
        setBusinessName(null);
        return;
      }
      setOrders(data.orders);
      setBusinessName(data.seller.business_name);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial load from a URL-provided access code
    if (code) loadOrders(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateStatus(orderId: string, status: string) {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_code: code, status }),
    });
    if (res.ok) loadOrders(code);
  }

  if (!businessName) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900 sm:p-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setCode(inputCode);
            loadOrders(inputCode);
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="code" className="mb-1 block text-sm font-medium">
              Seller access code
            </label>
            <input
              id="code"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="e.g. GAS-AGUD-502"
              className="w-full rounded-md border border-black/10 bg-white px-3 py-2 font-mono text-sm dark:border-white/10 dark:bg-neutral-900"
            />
            <p className="mt-1 text-xs text-neutral-500">
              You received this code when you registered your business on the{" "}
              <a href="/sell" className="text-orange-600 underline">
                Sell Gas
              </a>{" "}
              page.
            </p>
          </div>
          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-orange-600 px-4 py-2.5 font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
          >
            {loading ? "Checking…" : "View my orders"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">Orders for {businessName}</h2>
        <button
          onClick={() => {
            setBusinessName(null);
            setOrders(null);
          }}
          className="text-sm text-neutral-500 hover:underline"
        >
          Log out
        </button>
      </div>

      {orders && orders.length === 0 && (
        <p className="rounded-xl border border-dashed border-black/10 p-8 text-center text-neutral-500 dark:border-white/10">
          No orders yet. Share your listing link to get your first customer!
        </p>
      )}

      <div className="space-y-3">
        {orders?.map((order) => (
          <div
            key={order.id}
            className="rounded-xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-neutral-900"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold">
                  {order.buyer_name} &middot;{" "}
                  <span className="font-mono text-sm text-neutral-500">
                    {order.buyer_phone}
                  </span>
                </p>
                <p className="text-sm text-neutral-500">
                  {order.quantity} x {order.cylinder_size} ({order.order_type}) to{" "}
                  {order.delivery_address}, {order.area}
                </p>
                {order.notes && (
                  <p className="mt-1 text-sm italic text-neutral-500">
                    &ldquo;{order.notes}&rdquo;
                  </p>
                )}
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                  STATUS_STYLES[order.status] ?? STATUS_STYLES.pending
                }`}
              >
                {order.status}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {["pending", "confirmed", "delivered", "cancelled"]
                .filter((s) => s !== order.status)
                .map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(order.id, s)}
                    className="rounded-md border border-black/10 px-2.5 py-1 text-xs font-medium hover:bg-neutral-50 dark:border-white/10 dark:hover:bg-white/5"
                  >
                    Mark {s}
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
