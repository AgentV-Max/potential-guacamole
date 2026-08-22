import Link from "next/link";
import { PublicSeller } from "@/lib/types";
import { formatNaira } from "@/lib/format";

export default function SellerCard({ seller }: { seller: PublicSeller }) {
  return (
    <div className="flex flex-col rounded-xl border border-black/10 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-neutral-900">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-semibold leading-tight">{seller.business_name}</h3>
        {seller.verified === 1 && (
          <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-300">
            Verified
          </span>
        )}
      </div>
      <p className="text-sm text-neutral-500">
        {seller.area}, Surulere &middot; ⭐ {seller.rating.toFixed(1)} (
        {seller.rating_count})
      </p>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded-lg bg-neutral-50 py-2 dark:bg-white/5">
          <dt className="text-xs text-neutral-500">5kg</dt>
          <dd className="font-semibold">{formatNaira(seller.price_5kg)}</dd>
        </div>
        <div className="rounded-lg bg-neutral-50 py-2 dark:bg-white/5">
          <dt className="text-xs text-neutral-500">12.5kg</dt>
          <dd className="font-semibold">{formatNaira(seller.price_12_5kg)}</dd>
        </div>
        <div className="rounded-lg bg-neutral-50 py-2 dark:bg-white/5">
          <dt className="text-xs text-neutral-500">25kg</dt>
          <dd className="font-semibold">{formatNaira(seller.price_25kg)}</dd>
        </div>
      </dl>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {seller.delivery === 1 && (
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            Delivery available
          </span>
        )}
        {seller.accessories === 1 && (
          <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
            Sells accessories
          </span>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <Link
          href={`/sellers/${seller.id}`}
          className="flex-1 rounded-lg border border-black/10 px-3 py-2 text-center text-sm font-medium hover:bg-neutral-50 dark:border-white/10 dark:hover:bg-white/5"
        >
          View details
        </Link>
        <Link
          href={`/order?seller=${seller.id}`}
          className="flex-1 rounded-lg bg-orange-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-orange-700"
        >
          Order gas
        </Link>
      </div>
    </div>
  );
}
