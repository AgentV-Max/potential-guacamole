import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { Seller, stripAccessCode } from "@/lib/types";
import { formatNaira } from "@/lib/format";

export const dynamic = "force-dynamic";

function loadSeller(id: string) {
  const db = getDb();
  const seller = db.prepare("SELECT * FROM sellers WHERE id = ?").get(id) as
    | Seller
    | undefined;
  return seller ? stripAccessCode(seller) : null;
}

export default async function SellerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const seller = loadSeller(id);
  if (!seller) notFound();

  const waNumber = seller.whatsapp.replace(/[^0-9]/g, "");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link href="/" className="text-sm text-orange-600 hover:underline">
        &larr; Back to all sellers
      </Link>

      <div className="mt-4 rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{seller.business_name}</h1>
            <p className="mt-1 text-neutral-500">
              {seller.address} &middot; {seller.area}, Surulere, Lagos
            </p>
          </div>
          {seller.verified === 1 && (
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-300">
              Verified seller
            </span>
          )}
        </div>

        <p className="mt-2 text-sm text-neutral-500">
          Run by {seller.owner_name} &middot; ⭐ {seller.rating.toFixed(1)} average
          rating ({seller.rating_count} reviews)
        </p>

        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-neutral-50 py-3 dark:bg-white/5">
            <p className="text-xs text-neutral-500">5kg cylinder</p>
            <p className="text-lg font-bold">{formatNaira(seller.price_5kg)}</p>
          </div>
          <div className="rounded-lg bg-neutral-50 py-3 dark:bg-white/5">
            <p className="text-xs text-neutral-500">12.5kg cylinder</p>
            <p className="text-lg font-bold">{formatNaira(seller.price_12_5kg)}</p>
          </div>
          <div className="rounded-lg bg-neutral-50 py-3 dark:bg-white/5">
            <p className="text-xs text-neutral-500">25kg cylinder</p>
            <p className="text-lg font-bold">{formatNaira(seller.price_25kg)}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-neutral-100 px-3 py-1 dark:bg-white/10">
            {seller.delivery === 1 ? "🚚 Delivery available" : "🏪 Pickup only"}
          </span>
          {seller.accessories === 1 && (
            <span className="rounded-full bg-neutral-100 px-3 py-1 dark:bg-white/10">
              🔧 Sells cylinders &amp; accessories
            </span>
          )}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/order?seller=${seller.id}`}
            className="rounded-lg bg-orange-600 px-5 py-2.5 text-center font-semibold text-white hover:bg-orange-700"
          >
            Order from this seller
          </Link>
          <a
            href={`https://wa.me/${waNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-black/10 px-5 py-2.5 text-center font-medium hover:bg-neutral-50 dark:border-white/10 dark:hover:bg-white/5"
          >
            Chat on WhatsApp
          </a>
          <a
            href={`tel:${seller.phone}`}
            className="rounded-lg border border-black/10 px-5 py-2.5 text-center font-medium hover:bg-neutral-50 dark:border-white/10 dark:hover:bg-white/5"
          >
            Call {seller.phone}
          </a>
        </div>
      </div>
    </div>
  );
}
