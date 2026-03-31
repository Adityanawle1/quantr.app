'use client'
import useSWR from 'swr'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface SentimentData {
  advances: number
  declines: number
  unchanged: number
  vix: number
  fiiNet: number   // FII net buy/sell ₹ Cr
  diiNet: number
}

export default function MarketSentimentWidget() {
  const { data } = useSWR<SentimentData>('/api/market-sentiment', fetcher, {
    refreshInterval: 120_000,
  })

  const total = (data?.advances ?? 0) + (data?.declines ?? 0) + (data?.unchanged ?? 0) || 1
  const advPct = Math.round(((data?.advances ?? 0) / total) * 100)
  const decPct = Math.round(((data?.declines ?? 0) / total) * 100)

  const sentiment = advPct > 55 ? 'Bullish' : advPct < 45 ? 'Bearish' : 'Neutral'
  const sentColor = sentiment === 'Bullish' ? 'var(--gain)' : sentiment === 'Bearish' ? 'var(--loss)' : 'var(--text-muted)'

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-[var(--text)]">Market Breadth</h2>
        <span className="text-sm font-bold" style={{ color: sentColor }}>{sentiment}</span>
      </div>

      {/* Advance/Decline Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-[var(--text-muted)]">
          <span>Advances: <strong className="text-[var(--gain)]">{data?.advances ?? '—'}</strong></span>
          <span>Unchanged: {data?.unchanged ?? '—'}</span>
          <span>Declines: <strong className="text-[var(--loss)]">{data?.declines ?? '—'}</strong></span>
        </div>
        <div className="h-3 rounded-full flex overflow-hidden gap-0.5">
          <div className="bg-[var(--gain)] rounded-l-full transition-all" style={{ width: `${advPct}%` }} />
          <div className="bg-[var(--text-muted)] opacity-30 transition-all" style={{ width: `${100 - advPct - decPct}%` }} />
          <div className="bg-[var(--loss)] rounded-r-full transition-all" style={{ width: `${decPct}%` }} />
        </div>
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-[var(--gain)]">{advPct}%</span>
          <span className="text-[var(--loss)]">{decPct}%</span>
        </div>
      </div>

      {/* VIX + FII/DII */}
      <div className="grid grid-cols-3 gap-3">
        <MetricTile label="India VIX" value={data?.vix?.toFixed(2) ?? '—'} neutral />
        <MetricTile label="FII Net" value={data?.fiiNet != null ? `₹${(data.fiiNet / 100).toFixed(0)}Cr` : '—'} positive={data?.fiiNet != null && data.fiiNet > 0} />
        <MetricTile label="DII Net" value={data?.diiNet != null ? `₹${(data.diiNet / 100).toFixed(0)}Cr` : '—'} positive={data?.diiNet != null && data.diiNet > 0} />
      </div>
    </div>
  )
}

function MetricTile({ label, value, positive, neutral }: { label: string; value: string; positive?: boolean; neutral?: boolean }) {
  const color = neutral ? 'var(--text)' : positive ? 'var(--gain)' : 'var(--loss)'
  return (
    <div className="bg-[var(--bg-elevated)] rounded-xl p-3 text-center">
      <p className="text-xs text-[var(--text-muted)] mb-1">{label}</p>
      <p className="text-sm font-bold" style={{ color }}>{value}</p>
    </div>
  )
}
