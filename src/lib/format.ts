export function formatNaira(amount: number | null): string {
  if (amount === null) return "N/A";
  return `₦${amount.toLocaleString("en-NG")}`;
}
