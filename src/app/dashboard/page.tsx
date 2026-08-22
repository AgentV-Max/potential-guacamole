import { Suspense } from "react";
import SellerDashboard from "@/components/SellerDashboard";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="mb-2 text-2xl font-bold">Seller dashboard</h1>
      <p className="mb-6 text-neutral-500">
        Enter your access code to view and manage orders sent to your gas
        business.
      </p>
      <Suspense fallback={<p className="text-neutral-500">Loading…</p>}>
        <SellerDashboard />
      </Suspense>
    </div>
  );
}
