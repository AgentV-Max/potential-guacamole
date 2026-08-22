import Link from "next/link";
import { getDb } from "@/lib/db";
import { PublicSeller, Seller, SURULERE_AREAS, stripAccessCode } from "@/lib/types";
import SellerCard from "@/components/SellerCard";

export const dynamic = "force-dynamic";

type SearchParams = { area?: string; cylinder?: string; delivery?: string };

function loadSellers(params: SearchParams): PublicSeller[] {
  const db = getDb();
  let query = "SELECT * FROM sellers WHERE 1=1";
  const bind: Record<string, unknown> = {};

  if (params.area && params.area !== "all") {
    query += " AND area = @area";
    bind.area = params.area;
  }
  if (params.delivery === "1") {
    query += " AND delivery = 1";
  }
  if (params.cylinder === "5kg") query += " AND price_5kg IS NOT NULL";
  if (params.cylinder === "12.5kg") query += " AND price_12_5kg IS NOT NULL";
  if (params.cylinder === "25kg") query += " AND price_25kg IS NOT NULL";

  query += " ORDER BY verified DESC, rating DESC";

  const rows = db.prepare(query).all(bind) as Seller[];
  return rows.map(stripAccessCode);
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const sellers = loadSellers(params);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <section className="mb-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 px-6 py-10 text-white shadow-lg sm:px-10">
        <h1 className="text-3xl font-extrabold sm:text-4xl">
          Cooking gas, delivered from your own neighbourhood.
        </h1>
        <p className="mt-3 max-w-2xl text-orange-50">
          GasLink connects households and businesses in Surulere, Lagos with
          verified local LPG sellers &mdash; compare prices, check delivery
          options, and place your order in minutes. Pay through escrow: your
          money is only released once you confirm your gas arrived at the
          correct weight.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="#sellers"
            className="rounded-lg bg-white px-5 py-2.5 font-semibold text-orange-700 shadow hover:bg-orange-50"
          >
            Browse sellers
          </Link>
          <Link
            href="/calculator"
            className="rounded-lg border border-white/70 px-5 py-2.5 font-semibold text-white hover:bg-white/10"
          >
            Estimate my gas usage
          </Link>
          <Link
            href="/sell"
            className="rounded-lg border border-white/70 px-5 py-2.5 font-semibold text-white hover:bg-white/10"
          >
            Register as a seller
          </Link>
        </div>
      </section>

      <section id="sellers">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-xl font-bold">
            Gas sellers in Surulere ({sellers.length})
          </h2>
        </div>

        <form className="mb-8 flex flex-wrap gap-3 rounded-xl border border-black/10 bg-neutral-50 p-4 dark:border-white/10 dark:bg-white/5">
          <div className="flex flex-col gap-1">
            <label htmlFor="area" className="text-xs font-medium text-neutral-500">
              Area
            </label>
            <select
              id="area"
              name="area"
              defaultValue={params.area ?? "all"}
              className="rounded-md border border-black/10 bg-white px-3 py-1.5 text-sm dark:border-white/10 dark:bg-neutral-900"
            >
              <option value="all">All areas</option>
              {SURULERE_AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="cylinder" className="text-xs font-medium text-neutral-500">
              Cylinder size
            </label>
            <select
              id="cylinder"
              name="cylinder"
              defaultValue={params.cylinder ?? "all"}
              className="rounded-md border border-black/10 bg-white px-3 py-1.5 text-sm dark:border-white/10 dark:bg-neutral-900"
            >
              <option value="all">Any size</option>
              <option value="5kg">5kg</option>
              <option value="12.5kg">12.5kg</option>
              <option value="25kg">25kg</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="delivery" className="text-xs font-medium text-neutral-500">
              Delivery
            </label>
            <select
              id="delivery"
              name="delivery"
              defaultValue={params.delivery ?? "0"}
              className="rounded-md border border-black/10 bg-white px-3 py-1.5 text-sm dark:border-white/10 dark:bg-neutral-900"
            >
              <option value="0">Any</option>
              <option value="1">Offers delivery</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="rounded-md bg-orange-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-orange-700"
            >
              Apply filters
            </button>
          </div>
        </form>

        {sellers.length === 0 ? (
          <p className="rounded-xl border border-dashed border-black/10 p-10 text-center text-neutral-500 dark:border-white/10">
            No sellers match those filters yet. Try a different area, or{" "}
            <Link href="/sell" className="text-orange-600 underline">
              register your gas business
            </Link>
            .
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sellers.map((seller) => (
              <SellerCard key={seller.id} seller={seller} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
