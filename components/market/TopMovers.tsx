'use client'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { useState } from 'react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function TopMovers() {
  const [tab, setTab] = useState<'gainers' | 'losers'>('gainers')
  const router = useRouter()
  const { data } = useSWR(`/api/movers?type=${tab}`, fetcher, { refreshInterval: 120_000 })
  const movers = data?.data ?? []

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setTab('gainers')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            tab === 'gainers' ? 'bg-[var(--gain-bg)] text-[var(--gain)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]'
          }`}
        >
          <TrendingUp size={14} /> Gainers
        </button>
        <button
          onClick={() => setTab('losers')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            tab === 'losers' ? 'bg-[var(--loss-bg)] text-[var(--loss)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]'
          }`}
        >
          <TrendingDown size={14} /> Losers
        </button>
      </div>

      <div className="space-y-1">
        {movers.slice(0, 8).map((m: any) => (
          <button
            key={m.symbol}
            onClick={() => router.push(`/stock/${m.symbol}`)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[var(--bg-elevated)] transition-colors group"
          >
            <div className="text-left">
              <p className="text-sm font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                {m.symbol}
              </p>
              <p className="text-xs text-[var(--text-muted)]">{m.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-[var(--text)]">₹{m.price?.toLocaleString('en-IN')}</p>
              <p className={`text-xs font-semibold ${m.changePercent >= 0 ? 'text-[var(--gain)]' : 'text-[var(--loss)]'}`}>
                {m.changePercent >= 0 ? '+' : ''}{m.changePercent?.toFixed(2)}%
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
