'use client'
import { usePortfolioStore } from '@/store/portfolioStore'
import { useRouter } from 'next/navigation'
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { useEffect } from 'react'

export default function PortfolioTable() {
  const { holdings, removeHolding, updateLiveData } = usePortfolioStore()
  const router = useRouter()

  // Refresh live prices every 60s
  useEffect(() => {
    if (!holdings.length) return
    const symbols = [...new Set(holdings.map(h => h.symbol))]

    const fetchPrices = async () => {
      for (const sym of symbols) {
        try {
          const res = await fetch(`/api/quote/${sym}`)
          const d = await res.json()
          updateLiveData(sym, d.price, d.change, d.changePercent)
        } catch {}
      }
    }

    fetchPrices()
    const interval = setInterval(fetchPrices, 60_000)
    return () => clearInterval(interval)
  }, [holdings.length])

  const totalInvested = holdings.reduce((s, h) => s + h.avgPrice * h.quantity, 0)
  const totalCurrent = holdings.reduce((s, h) => s + (h.currentPrice ?? h.avgPrice) * h.quantity, 0)
  const totalPnL = totalCurrent - totalInvested
  const totalPnLPct = totalInvested ? (totalPnL / totalInvested) * 100 : 0

  if (!holdings.length) {
    return (
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-12 text-center">
        <p className="text-[var(--text-muted)]">Your portfolio is empty.</p>
        <p className="text-sm text-[var(--text-muted)] mt-1">Search for a stock and add it to get started.</p>
      </div>
    )
  }

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden">
      {/* Summary */}
      <div className="grid grid-cols-3 border-b border-[var(--border)] divide-x divide-[var(--border)]">
        <SummaryCell label="Invested" value={`₹${totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} />
        <SummaryCell label="Current" value={`₹${totalCurrent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} />
        <SummaryCell
          label="P&L"
          value={`${totalPnL >= 0 ? '+' : ''}₹${Math.abs(totalPnL).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          subValue={`${totalPnLPct >= 0 ? '+' : ''}${totalPnLPct.toFixed(2)}%`}
          positive={totalPnL >= 0}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-[var(--text-muted)] border-b border-[var(--border)]">
              {['Stock', 'Qty', 'Avg Price', 'LTP', 'P&L', 'Day Change', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {holdings.map(h => {
              const ltp = h.currentPrice ?? h.avgPrice
              const pnl = (ltp - h.avgPrice) * h.quantity
              const pnlPct = ((ltp - h.avgPrice) / h.avgPrice) * 100
              return (
                <tr
                  key={h.id}
                  onClick={() => router.push(`/stocks/${h.symbol}`)}
                  className="border-b border-[var(--border)] hover:bg-[var(--bg-elevated)] cursor-pointer transition-colors group"
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">{h.symbol}</p>
                    <p className="text-xs text-[var(--text-muted)]">{h.name}</p>
                  </td>
                  <td className="px-4 py-3 text-[var(--text)]">{h.quantity}</td>
                  <td className="px-4 py-3 text-[var(--text)]">₹{h.avgPrice.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 font-medium text-[var(--text)]">₹{ltp.toLocaleString('en-IN')}</td>
                  <td className={`px-4 py-3 font-semibold ${pnl >= 0 ? 'text-[var(--gain)]' : 'text-[var(--loss)]'}`}>
                    {pnl >= 0 ? '+' : ''}₹{Math.abs(pnl).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    <span className="block text-xs">{pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%</span>
                  </td>
                  <td className={`px-4 py-3 text-xs font-semibold ${(h.changePercent ?? 0) >= 0 ? 'text-[var(--gain)]' : 'text-[var(--loss)]'}`}>
                    {(h.changePercent ?? 0) >= 0 ? '+' : ''}{(h.changePercent ?? 0).toFixed(2)}%
                  </td>
                  <td className="px-4 py-3" onClick={e => { e.stopPropagation(); removeHolding(h.id) }}>
                    <button className="opacity-0 group-hover:opacity-100 text-[var(--loss)] hover:scale-110 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SummaryCell({ label, value, subValue, positive }: { label: string; value: string; subValue?: string; positive?: boolean }) {
  return (
    <div className="px-5 py-4">
      <p className="text-xs text-[var(--text-muted)] mb-1">{label}</p>
      <p className={`text-lg font-bold ${subValue != null ? (positive ? 'text-[var(--gain)]' : 'text-[var(--loss)]') : 'text-[var(--text)]'}`}>{value}</p>
      {subValue && <p className={`text-xs font-semibold ${positive ? 'text-[var(--gain)]' : 'text-[var(--loss)]'}`}>{subValue}</p>}
    </div>
  )
}
