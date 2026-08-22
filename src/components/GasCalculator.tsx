"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CALCULATOR_CYLINDER_SIZES,
  CalculatorCylinderSize,
  FOOD_FACTORS,
  FoodFactorValue,
  HOUSEHOLD_SIZES,
  HouseholdSizeValue,
  computeGasEstimate,
} from "@/lib/calculator";
import { PRICED_CYLINDER_SIZES } from "@/lib/types";

export default function GasCalculator() {
  const [cylinderSize, setCylinderSize] = useState<CalculatorCylinderSize>("12.5kg");
  const [volumePercent, setVolumePercent] = useState(65);
  const [household, setHousehold] = useState<HouseholdSizeValue>("medium");
  const [foodFactor, setFoodFactor] = useState<FoodFactorValue>("heavy");

  const estimate = useMemo(
    () => computeGasEstimate({ cylinderSize, volumePercent, household, foodFactor }),
    [cylinderSize, volumePercent, household, foodFactor]
  );

  const refillByDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + Math.floor(estimate.supplyDays));
    return date.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
  }, [estimate.supplyDays]);

  const canOrderDirectly = (PRICED_CYLINDER_SIZES as readonly string[]).includes(cylinderSize);

  return (
    <div className="rounded-2xl border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-neutral-900">
      <div className="grid gap-0 sm:grid-cols-2">
        <div className="flex flex-col items-center justify-center gap-4 border-b border-black/10 p-8 dark:border-white/10 sm:border-b-0 sm:border-r">
          <span className="rounded-full border border-black/10 px-4 py-1 text-sm text-neutral-500 dark:border-white/10">
            {cylinderSize} Cylinder
          </span>
          <div className="relative h-40 w-24 overflow-hidden rounded-t-full rounded-b-lg border-2 border-orange-500">
            <div
              className="absolute bottom-0 w-full bg-orange-500/80 transition-all"
              style={{ height: `${volumePercent}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-full bg-black/60 px-2 py-1 text-xs font-semibold text-white">
                LPG
              </span>
            </div>
          </div>
        </div>

        <dl className="divide-y divide-black/10 dark:divide-white/10">
          <div className="flex items-center justify-between px-6 py-4">
            <dt className="text-sm text-neutral-500">Verified Net Gas Weight</dt>
            <dd className="text-lg font-bold">{estimate.netWeightKg.toFixed(2)} kg</dd>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <dt className="text-sm text-neutral-500">Burner Burn Duration</dt>
            <dd className="text-lg font-bold text-green-600 dark:text-green-400">
              ~{estimate.burnHours.toFixed(1)} hrs
            </dd>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <dt className="text-sm text-neutral-500">Estimated Household Supply</dt>
            <dd className="text-lg font-bold text-amber-600 dark:text-amber-400">
              ~{Math.max(0, Math.floor(estimate.supplyDays))} days left
            </dd>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <dt className="text-sm text-neutral-500">Plan to refill by</dt>
            <dd className="text-sm font-semibold">{refillByDate}</dd>
          </div>
        </dl>
      </div>

      <div className="space-y-6 border-t border-black/10 p-6 dark:border-white/10 sm:p-8">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="volume" className="text-sm font-medium">
              Current Cylinder Gas Volume
            </label>
            <span className="text-sm font-semibold">{volumePercent}%</span>
          </div>
          <input
            id="volume"
            type="range"
            min={0}
            max={100}
            value={volumePercent}
            onChange={(e) => setVolumePercent(Number(e.target.value))}
            className="w-full accent-orange-600"
          />
          <p className="mt-1 text-xs text-neutral-500">
            Estimate this from your last verified refill weight, or ask your seller to weigh it.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="cylinder" className="mb-1 block text-sm font-medium">
              Cylinder Size
            </label>
            <select
              id="cylinder"
              value={cylinderSize}
              onChange={(e) => setCylinderSize(e.target.value as CalculatorCylinderSize)}
              className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-neutral-900"
            >
              {CALCULATOR_CYLINDER_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="household" className="mb-1 block text-sm font-medium">
              Household Size
            </label>
            <select
              id="household"
              value={household}
              onChange={(e) => setHousehold(e.target.value as HouseholdSizeValue)}
              className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-neutral-900"
            >
              {HOUSEHOLD_SIZES.map((h) => (
                <option key={h.value} value={h.value}>
                  {h.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="foodFactor" className="mb-1 block text-sm font-medium">
              Cooking Style
            </label>
            <select
              id="foodFactor"
              value={foodFactor}
              onChange={(e) => setFoodFactor(e.target.value as FoodFactorValue)}
              className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-neutral-900"
            >
              {FOOD_FACTORS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {canOrderDirectly ? (
            <Link
              href={`/order?cylinder=${encodeURIComponent(cylinderSize)}`}
              className="rounded-lg bg-orange-600 px-5 py-2.5 font-semibold text-white hover:bg-orange-700"
            >
              Order a {cylinderSize} refill now
            </Link>
          ) : (
            <Link
              href="/order"
              className="rounded-lg bg-orange-600 px-5 py-2.5 font-semibold text-white hover:bg-orange-700"
            >
              Browse sellers
            </Link>
          )}
          <p className="text-xs text-neutral-500">
            This is an estimate to help you plan ahead &mdash; actual usage varies by burner and
            flame setting. Your final refill weight is verified by the seller at delivery.
          </p>
        </div>
      </div>
    </div>
  );
}
