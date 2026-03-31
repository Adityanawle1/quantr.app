'use client'
import { useSearch } from '@/hooks/useSearch'
import { Search, X, TrendingUp, BarChart2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRef, useEffect } from 'react'

const TYPE_ICON = {
  STOCK: <TrendingUp size={14} />,
  INDEX: <BarChart2 size={14} />,
  ETF:   <BarChart2 size={14} />,
}

export default function SearchBar({ className }: { className?: string }) {
  const { query, setQuery, results, loading, clear } = useSearch()
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)

  const navigate = (symbol: string) => {
    setQuery('')
    router.push(`/stocks/${symbol}`)
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
  }

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) clear()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [clear])

  return (
    <div ref={ref} className={`relative w-full ${className || 'max-w-2xl mx-auto my-4'}`}>
      {/* Input */}
      <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl border border-[rgba(255,255,255,0.06)] bg-navy-card shadow-lg focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
        {loading
          ? <Loader2 size={20} className="text-t3 animate-spin shrink-0" />
          : <Search size={20} className="text-t3 shrink-0" />}
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search stocks, sectors, or indices (e.g., Reliance, TCS, Nifty 50)"
          className="flex-1 bg-transparent text-t1 placeholder:text-t3 text-base focus:outline-none"
        />
        {query && (
          <button onClick={clear} className="shrink-0 text-t3 hover:text-t1 transition-colors">
            <X size={18} />
          </button>
        )}
        <span className="hidden sm:block shrink-0 text-[10px] text-t3 border border-zinc-700/50 rounded px-1.5 py-0.5">⌘K</span>
      </div>

      {/* Dropdown */}
      {results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-navy-card border border-[rgba(255,255,255,0.06)] rounded-xl shadow-2xl z-[100] overflow-hidden">
          {results.map(r => (
            <button
              key={r.symbol}
              onClick={() => navigate(r.symbol)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-[#1E2B3E] transition-colors text-left border-b border-[rgba(255,255,255,0.03)] last:border-0"
            >
              <div className="flex items-center gap-3">
                <span className="text-t3 bg-black/20 p-2 rounded-lg">{TYPE_ICON[r.type]}</span>
                <div>
                  <p className="text-base font-semibold text-zinc-200">{r.symbol}</p>
                  <p className="text-sm text-t3">{r.name}</p>
                </div>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded bg-navy-surf text-emerald-400 border border-emerald-500/20">
                {r.exchange}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
