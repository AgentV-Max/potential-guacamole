"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  BuyerOrderView,
  PRICE_FIELD_BY_SIZE,
  PRICED_CYLINDER_SIZES,
  PricedCylinderSize,
  PublicSeller,
  SURULERE_AREAS,
} from "@/lib/types";
import { formatNaira } from "@/lib/format";

type SellerOption = Pick<
  PublicSeller,
  "id" | "business_name" | "area" | "price_5kg" | "price_12_5kg" | "price_25kg"
>;

export default function OrderForm() {
  const searchParams = useSearchParams();
  const preselectedSellerId = searchParams.get("seller") ?? "";
  const preselectedCylinder = searchParams.get("cylinder") ?? "";

  const [sellers, setSellers] = useState<SellerOption[]>([]);
  const [sellerId, setSellerId] = useState(preselectedSellerId);
  const [cylinderSize, setCylinderSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loadingSellers, setLoadingSellers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    order: BuyerOrderView;
    buyer_token: string;
    seller: { business_name: string; whatsapp: string; phone: string };
  } | null>(null);

  useEffect(() => {
    fetch("/api/sellers")
      .then((res) => res.json())
      .then((data) => setSellers(data.sellers))
      .finally(() => setLoadingSellers(false));
  }, []);

  const selectedSeller = useMemo(
    () => sellers.find((s) => s.id === sellerId) ?? null,
    [sellers, sellerId]
  );

  const availableSizes = useMemo(() => {
    if (!selectedSeller) return [];
    return PRICED_CYLINDER_SIZES.filter((size) => {
      const price = selectedSeller[PRICE_FIELD_BY_SIZE[size] as keyof SellerOption];
      return typeof price === "number";
    });
  }, [selectedSeller]);

  useEffect(
    /* eslint-disable react-hooks/set-state-in-effect -- keep the selected size in sync with the chosen seller's priced sizes */
    () => {
      if (
        preselectedCylinder &&
        availableSizes.includes(preselectedCylinder as PricedCylinderSize)
      ) {
        setCylinderSize(preselectedCylinder);
      } else if (availableSizes.length === 0) {
        setCylinderSize("");
      } else if (!availableSizes.includes(cylinderSize as PricedCylinderSize)) {
        setCylinderSize(availableSizes[0]);
      }
    },
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [availableSizes, preselectedCylinder]
  );

  const unitPrice = useMemo(() => {
    if (!selectedSeller || !cylinderSize) return null;
    const price = selectedSeller[PRICE_FIELD_BY_SIZE[cylinderSize as PricedCylinderSize] as keyof SellerOption];
    return typeof price === "number" ? price : null;
  }, [selectedSeller, cylinderSize]);

  const total = unitPrice !== null ? unitPrice * quantity : null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      seller_id: sellerId,
      buyer_name: form.get("buyer_name"),
      buyer_phone: form.get("buyer_phone"),
      buyer_email: form.get("buyer_email"),
      delivery_address: form.get("delivery_address"),
      area: form.get("area"),
      cylinder_size: cylinderSize,
      order_type: form.get("order_type"),
      quantity,
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
          Reference <span className="font-mono">#{result.order.id.slice(0, 8)}</span> &middot;{" "}
          Total <span className="font-semibold">{formatNaira(result.order.amount)}</span>
        </p>
        <p className="mx-auto mt-3 max-w-sm text-sm text-neutral-500">
          Secure your order with escrow payment: your money is held safely and only
          released to the seller once you confirm your gas arrived at the correct
          weight.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href={`/orders/${result.order.id}?token=${result.buyer_token}`}
            className="rounded-lg bg-orange-600 px-5 py-2.5 font-semibold text-white hover:bg-orange-700"
          >
            Proceed to secure payment
          </Link>
          <a
            href={`https://wa.me/${waNumber}?text=${message}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-black/10 px-5 py-2.5 font-medium hover:bg-neutral-50 dark:border-white/10 dark:hover:bg-white/5"
          >
            Message seller
          </a>
          <a
            href={`tel:${result.seller.phone}`}
            className="rounded-lg border border-black/10 px-5 py-2.5 font-medium hover:bg-neutral-50 dark:border-white/10 dark:hover:bg-white/5"
          >
            Call seller
          </a>
        </div>
        <p className="mt-4 text-xs text-neutral-500">
          Keep this page&apos;s link &mdash; it&apos;s the only way to manage payment for this
          order.
        </p>
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
        <label htmlFor="buyer_email" className="mb-1 block text-sm font-medium">
          Email (optional, for your payment receipt)
        </label>
        <input
          id="buyer_email"
          name="buyer_email"
          type="email"
          className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-neutral-900"
          placeholder="you@example.com"
        />
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
            required
            value={cylinderSize}
            onChange={(e) => setCylinderSize(e.target.value)}
            disabled={!selectedSeller || availableSizes.length === 0}
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-neutral-900"
          >
            <option value="" disabled>
              {selectedSeller ? "Select size" : "Select a seller first"}
            </option>
            {availableSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          {selectedSeller && availableSizes.length === 0 && (
            <p className="mt-1 text-xs text-red-600">
              This seller hasn&apos;t priced any cylinders yet.
            </p>
          )}
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
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-neutral-900"
          />
        </div>
      </div>

      {total !== null && (
        <div className="flex items-center justify-between rounded-lg bg-orange-50 px-4 py-3 text-sm dark:bg-orange-900/20">
          <span className="text-neutral-600 dark:text-neutral-300">
            {quantity} x {cylinderSize} @ {formatNaira(unitPrice)}
          </span>
          <span className="text-lg font-bold text-orange-700 dark:text-orange-300">
            {formatNaira(total)}
          </span>
        </div>
      )}

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
        disabled={submitting || !sellerId || !cylinderSize}
        className="w-full rounded-lg bg-orange-600 px-4 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Sending order…" : "Send order to seller"}
      </button>
    </form>
  );
}
