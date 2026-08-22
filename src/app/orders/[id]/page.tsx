import { Suspense } from "react";
import OrderStatus from "@/components/OrderStatus";

export default function OrderStatusPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Suspense fallback={<p className="text-neutral-500">Loading…</p>}>
        <OrderStatus />
      </Suspense>
    </div>
  );
}
