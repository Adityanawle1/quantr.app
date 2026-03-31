export function formatPrice(value: number): string {
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatCrore(value: number): string {
  if (value >= 1e7) return `₹${(value / 1e7).toFixed(2)}L Cr`
  if (value >= 1e5) return `₹${(value / 1e5).toFixed(2)} Cr`
  return `₹${value.toLocaleString('en-IN')}`
}

export function formatChange(value: number, showSign = true): string {
  const sign = showSign && value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}`
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function formatVolume(value: number): string {
  if (value >= 1e7) return `${(value / 1e7).toFixed(2)} Cr`
  if (value >= 1e5) return `${(value / 1e5).toFixed(2)} L`
  return value.toLocaleString('en-IN')
}

export function isGain(value: number): boolean {
  return value >= 0
}

export function formatCompact(val: number | bigint | null | undefined): string {
  if (val == null) return "—";
  const num = typeof val === 'bigint' ? Number(val) : val;
  if (Math.abs(num) >= 1e12) return `₹${(num / 1e12).toFixed(2)}T`;
  if (Math.abs(num) >= 1e9) return `₹${(num / 1e9).toFixed(2)}B`;
  if (Math.abs(num) >= 1e7) return `₹${(num / 1e7).toFixed(2)}Cr`;
  if (Math.abs(num) >= 1e5) return `₹${(num / 1e5).toFixed(2)}L`;
  return `₹${num.toLocaleString("en-IN")}`;
}
