import { Suspense } from "react";
import OrderForm from "@/components/OrderForm";

export default function OrderPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="mb-2 text-2xl font-bold">Request cooking gas</h1>
      <p className="mb-6 text-neutral-500">
        Fill in your details and we&apos;ll send your order straight to the
        seller. You&apos;ll confirm the final price and delivery time directly
        with them.
      </p>
      <Suspense fallback={<p className="text-neutral-500">Loading…</p>}>
        <OrderForm />
      </Suspense>
    </div>
  );
}
