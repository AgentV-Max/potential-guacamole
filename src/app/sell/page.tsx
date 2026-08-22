import SellerSignupForm from "@/components/SellerSignupForm";

export default function SellPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="mb-2 text-2xl font-bold">Sell gas on GasLink</h1>
      <p className="mb-6 text-neutral-500">
        List your LPG business for free and start receiving orders from
        buyers across Surulere, Lagos.
      </p>
      <SellerSignupForm />
    </div>
  );
}
