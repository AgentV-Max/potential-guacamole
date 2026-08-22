"use client";

import { useState } from "react";
import Link from "next/link";
import { SURULERE_AREAS } from "@/lib/types";

export default function SellerSignupForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessCode, setAccessCode] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      business_name: form.get("business_name"),
      owner_name: form.get("owner_name"),
      phone: form.get("phone"),
      whatsapp: form.get("whatsapp"),
      area: form.get("area"),
      address: form.get("address"),
      price_5kg: form.get("price_5kg"),
      price_12_5kg: form.get("price_12_5kg"),
      price_25kg: form.get("price_25kg"),
      delivery: form.get("delivery") === "on",
      accessories: form.get("accessories") === "on",
    };

    try {
      const res = await fetch("/api/sellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setAccessCode(data.seller.access_code);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (accessCode) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-neutral-900 sm:p-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl dark:bg-green-900/40">
          🎉
        </div>
        <h2 className="text-xl font-bold">You&apos;re listed on GasLink!</h2>
        <p className="mt-2 text-neutral-500">
          Save your dashboard access code &mdash; you&apos;ll need it to view and
          manage incoming orders.
        </p>
        <p className="mx-auto mt-4 w-fit rounded-lg bg-neutral-100 px-4 py-2 font-mono text-lg font-bold tracking-wide dark:bg-white/10">
          {accessCode}
        </p>
        <p className="mt-3 text-xs text-neutral-500">
          New listings are reviewed before they&apos;re marked &ldquo;verified&rdquo;,
          but you&apos;ll start receiving orders right away.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href={`/dashboard?code=${encodeURIComponent(accessCode)}`}
            className="rounded-lg bg-orange-600 px-5 py-2.5 font-semibold text-white hover:bg-orange-700"
          >
            Go to my dashboard
          </Link>
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
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="business_name" className="mb-1 block text-sm font-medium">
            Business name
          </label>
          <input
            id="business_name"
            name="business_name"
            required
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-neutral-900"
            placeholder="e.g. Aguda Cooking Gas Depot"
          />
        </div>
        <div>
          <label htmlFor="owner_name" className="mb-1 block text-sm font-medium">
            Owner / manager name
          </label>
          <input
            id="owner_name"
            name="owner_name"
            required
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-neutral-900"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium">
            Phone number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-neutral-900"
            placeholder="080..."
          />
        </div>
        <div>
          <label htmlFor="whatsapp" className="mb-1 block text-sm font-medium">
            WhatsApp number (if different)
          </label>
          <input
            id="whatsapp"
            name="whatsapp"
            type="tel"
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-neutral-900"
            placeholder="Defaults to phone number"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="area" className="mb-1 block text-sm font-medium">
            Area in Surulere
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
          <label htmlFor="address" className="mb-1 block text-sm font-medium">
            Shop address
          </label>
          <input
            id="address"
            name="address"
            required
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-neutral-900"
            placeholder="Street, number, landmark"
          />
        </div>
      </div>

      <fieldset>
        <legend className="mb-1 text-sm font-medium">
          Prices (₦, leave blank if you don&apos;t stock a size)
        </legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="price_5kg" className="mb-1 block text-xs text-neutral-500">
              5kg
            </label>
            <input
              id="price_5kg"
              name="price_5kg"
              type="number"
              min={0}
              className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-neutral-900"
            />
          </div>
          <div>
            <label htmlFor="price_12_5kg" className="mb-1 block text-xs text-neutral-500">
              12.5kg
            </label>
            <input
              id="price_12_5kg"
              name="price_12_5kg"
              type="number"
              min={0}
              className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-neutral-900"
            />
          </div>
          <div>
            <label htmlFor="price_25kg" className="mb-1 block text-xs text-neutral-500">
              25kg
            </label>
            <input
              id="price_25kg"
              name="price_25kg"
              type="number"
              min={0}
              className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-neutral-900"
            />
          </div>
        </div>
      </fieldset>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="delivery" className="h-4 w-4" />
          I offer delivery
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="accessories" className="h-4 w-4" />
          I sell cylinders &amp; accessories
        </label>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-orange-600 px-4 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "List my gas business"}
      </button>
    </form>
  );
}
