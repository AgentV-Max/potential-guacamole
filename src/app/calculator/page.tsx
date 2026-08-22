import GasCalculator from "@/components/GasCalculator";

export default function CalculatorPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="mb-2 text-2xl font-bold">Gas usage calculator</h1>
      <p className="mb-6 text-neutral-500">
        Estimate how much cooking gas you have left and when to reorder, based
        on your cylinder, household size, and cooking style.
      </p>
      <GasCalculator />
    </div>
  );
}
