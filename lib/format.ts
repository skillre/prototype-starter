/** Shared number formatting for the demo dashboard. */

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)

/** Compact axis format: 12400 → "$12k". */
export const formatCurrencyCompact = (value: number): string => {
  if (Math.abs(value) >= 1000) return `$${Math.round(value / 1000)}k`
  return `$${Math.round(value)}`
}

export const formatPercent = (value: number): string =>
  `${value.toFixed(2)}%`