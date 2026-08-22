"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CYLINDER_SIZES, SURULERE_AREAS, PublicSeller, Order } from "@/lib/types";

type SellerOption = Pick<PublicSeller, "id" | "business_name" | "area">;

export default function OrderForm() {
  const searchParams = useSearchParams();
  const preselectedSellerId = searchParams.get("seller") ?? "";

  const [sellers, setSellers] = useState<SellerOption[]>([]);
  const [sellerId, setSellerId] = useState(preselectedSellerId);
  const [loadingSellers, setLoadingSellers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    order: Order;
    seller: { business_name: string; whatsapp: string; phone: string };
  } | null>(null);

  useEffect(() => {
    fetch("/api/sellers")
      .then((res) => res.json())
      .then((data) => setSellers(data.sellers))
      .finally(() => setLoadingSellers(false));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      seller_id: sellerId,
      buyer_name: form.get("buyer_name"),
      buyer_phone: form.get("buyer_phone"),
      delivery_address: form.get("delivery_address"),
      area: form.get("area"),
      cylinder_size: form.get("cylinder_size"),
      order_type: form.get("order_type"),
      quantity: form.get("quantity"),
      notes: form.get("notes"),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setResult(data);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    const waNumber = result.seller.whatsapp.replace(/[^0-9]/g, "");
    const message = encodeURIComponent(
      `Hi ${result.seller.business_name}, I just placed an order on GasLink Surulere: ` +
        `${result.order.quantity} x ${result.order.cylinder_size} (${result.order.order_type}) ` +
        `to be delivered to ${result.order.delivery_address}, ${result.order.area}. ` +
        `Order ref: ${result.order.id.slice(0, 8)}.`
    );

    return (
      <div className="rounded-2xl border border-black/10 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-neutral-900 sm:p-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl dark:bg-green-900/40">
          ✅
        </div>
        <h2 className="text-xl font-bold">Order sent to {result.seller.business_name}!</h2>
        <p className="mt-2 text-neutral-500">
          Reference <span className="font-mono">#{result.order.id.slice(0, 8)}</span>.
          Confirm the details with the seller directly to finalize delivery and
          payment.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a
            href={`https://wa.me/${waNumber}?text=${message}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white hover:bg-green-700"
          >
            Confirm on WhatsApp
          </a>
          <a
            href={`tel:${result.seller.phone}`}
            className="rounded-lg border border-black/10 px-5 py-2.5 font-medium hover:bg-neutral-50 dark:border-white/10 dark:hover:bg-white/5"
          >
            Call seller
          </a>
          <Link
            href="/"
            className="rounded-lg border border-black/10 px-5 py-2.5 font-medium hover:bg-neutral-50 dark:border-white/10 dark:hover:bg-white/5"
          >
            Back to marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900 sm:p-8"
    >
      <div>
        <label htmlFor="seller_id" className="mb-1 block text-sm font-medium">
          Gas seller
        </label>
        <select
          id="seller_id"
          required
          value={sellerId}
          onChange={(e) => setSellerId(e.target.value)}
          disabled={loadingSellers}
          className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-neutral-900"
        >
          <option value="" disabled>
            {loadingSellers ? "Loading sellers…" : "Select a seller"}
          </option>
          {sellers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.business_name} &middot; {s.area}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="buyer_name" className="mb-1 block text-sm font-medium">
            Your name
          </label>
          <input
            id="buyer_name"
            name="buyer_name"
            required
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-neutral-900"
            placeholder="e.g. Ada Obi"
          />
        </div>
        <div>
          <label htmlFor="buyer_phone" className="mb-1 block text-sm font-medium">
            Phone number
          </label>
          <input
            id="buyer_phone"
            name="buyer_phone"
            required
            type="tel"
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-neutral-900"
            placeholder="080..."
          />
        </div>
      </div>

      <div>
        <label htmlFor="delivery_address" className="mb-1 block text-sm font-medium">
          Delivery / pickup address
        </label>
        <input
          id="delivery_address"
          name="delivery_address"
          required
          className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-neutral-900"
          placeholder="House/street, landmark"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="area" className="mb-1 block text-sm font-medium">
            Area
          </label>
          <select
            id="area"
            name="area"
            required
            defaultValue=""
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-neutral-900"
          >
            <option value="" disabled>
              Select your area
            </option>
            {SURULERE_AREAS.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="cylinder_size" className="mb-1 block text-sm font-medium">
            Cylinder size
          </label>
          <select
            id="cylinder_size"
            name="cylinder_size"
            required
            defaultValue=""
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-neutral-900"
          >
            <option value="" disabled>
              Select size
            </option>
            {CYLINDER_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="order_type" className="mb-1 block text-sm font-medium">
            Order type
          </label>
          <select
            id="order_type"
            name="order_type"
            defaultValue="refill"
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-neutral-900"
          >
            <option value="refill">Refill existing cylinder</option>
            <option value="new">Buy a new cylinder</option>
          </select>
        </div>
        <div>
          <label htmlFor="quantity" className="mb-1 block text-sm font-medium">
            Quantity
          </label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            min={1}
            max={20}
            defaultValue={1}
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-neutral-900"
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="mb-1 block text-sm font-medium">
          Notes for the seller (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-neutral-900"
          placeholder="Preferred delivery time, gate code, etc."
        />
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || !sellerId}
        className="w-full rounded-lg bg-orange-600 px-4 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Sending order…" : "Send order to seller"}
      </button>
    </form>
  );
}
