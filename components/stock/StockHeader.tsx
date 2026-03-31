'use client'
import AddToPortfolioButton from '@/components/portfolio/AddToPortfolioButton'

export default function StockHeader({ symbol }: { symbol: string }) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold text-[var(--text)]">{symbol}</h1>
          <span className="px-2 py-0.5 text-xs font-semibold rounded bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border)]">NSE</span>
        </div>
        <p className="text-[var(--text-muted)]">Company Name Placeholder</p>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-2xl font-bold text-[var(--text)]">₹1,234.50</p>
          <p className="text-sm font-semibold text-[var(--gain)]">+12.45 (+1.02%)</p>
        </div>
        <AddToPortfolioButton symbol={symbol} name="Company Placeholder" price={1234.50} />
      </div>
    </div>
  )
}
