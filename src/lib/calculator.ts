export const CALCULATOR_CYLINDER_SIZES = ["3kg", "5kg", "6kg", "12.5kg", "25kg", "50kg"] as const;
export type CalculatorCylinderSize = (typeof CALCULATOR_CYLINDER_SIZES)[number];

/** Typical continuous burn rate for a single medium-flame domestic burner. */
export const BURN_RATE_KG_PER_HOUR = 0.26;

export const HOUSEHOLD_SIZES = [
  { value: "small", label: "Small (1-2 people)", hoursPerDay: 1.0 },
  { value: "medium", label: "Medium (3-5 people)", hoursPerDay: 1.5 },
  { value: "large", label: "Large (6-8 people)", hoursPerDay: 2.2 },
  { value: "xlarge", label: "Extra Large (9+ people)", hoursPerDay: 3.0 },
] as const;
export type HouseholdSizeValue = (typeof HOUSEHOLD_SIZES)[number]["value"];

export const FOOD_FACTORS = [
  { value: "light", label: "Light Meals / Quick Frying", multiplier: 0.8 },
  { value: "mixed", label: "Mixed Cooking (rice, stew)", multiplier: 1.0 },
  { value: "heavy", label: "Beans / Slow Boiling", multiplier: 1.25 },
  { value: "commercial", label: "Commercial / High Volume", multiplier: 1.8 },
] as const;
export type FoodFactorValue = (typeof FOOD_FACTORS)[number]["value"];

export function cylinderSizeToKg(size: CalculatorCylinderSize): number {
  return parseFloat(size);
}

export function computeNetGasWeightKg(cylinderKg: number, volumePercent: number): number {
  return cylinderKg * (volumePercent / 100);
}

export function computeBurnHours(netWeightKg: number): number {
  return netWeightKg / BURN_RATE_KG_PER_HOUR;
}

export function computeSupplyDays(
  burnHours: number,
  household: HouseholdSizeValue,
  foodFactor: FoodFactorValue
): number {
  const hoursPerDay = HOUSEHOLD_SIZES.find((h) => h.value === household)!.hoursPerDay;
  const multiplier = FOOD_FACTORS.find((f) => f.value === foodFactor)!.multiplier;
  return burnHours / (hoursPerDay * multiplier);
}

export function computeGasEstimate(params: {
  cylinderSize: CalculatorCylinderSize;
  volumePercent: number;
  household: HouseholdSizeValue;
  foodFactor: FoodFactorValue;
}) {
  const cylinderKg = cylinderSizeToKg(params.cylinderSize);
  const netWeightKg = computeNetGasWeightKg(cylinderKg, params.volumePercent);
  const burnHours = computeBurnHours(netWeightKg);
  const supplyDays = computeSupplyDays(burnHours, params.household, params.foodFactor);
  return { cylinderKg, netWeightKg, burnHours, supplyDays };
}
