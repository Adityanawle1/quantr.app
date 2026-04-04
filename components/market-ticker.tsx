'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface TickerItem {
  name: string;
  value: string;
  change: string;
  percent: string;
  isPositive: boolean;
}

const FALLBACK_DATA: TickerItem[] = [
  { name: "SENSEX", value: "73,651.35", change: "+200.45", percent: "+0.27%", isPositive: true },
  { name: "NIFTY 50", value: "22,405.60", change: "+55.30", percent: "+0.25%", isPositive: true },
  { name: "BANKNIFTY", value: "47,327.85", change: "-120.10", percent: "-0.25%", isPositive: false },
  { name: "NIFTY IT", value: "34,980.20", change: "+450.25", percent: "+1.30%", isPositive: true },
  { name: "NIFTY AUTO", value: "20,145.75", change: "+12.40", percent: "+0.06%", isPositive: true },
  { name: "BSE MIDCAP", value: "38,710.20", change: "-45.60", percent: "-0.12%", isPositive: false },
  { name: "NIFTY PHARMA", value: "18,655.40", change: "+85.20", percent: "+0.46%", isPositive: true },
  { name: "NIFTY METAL", value: "8,321.15", change: "-21.30", percent: "-0.25%", isPositive: false },
]

function TickerEntry({ item }: { item: TickerItem }) {
  return (
    <span className="inline-flex items-center gap-2 px-4 whitespace-nowrap">
      <span className="text-[13px] font-semibold text-t1 tracking-wide uppercase">
        {item.name}
      </span>
      <span
        className={`text-[13px] font-bold tabular-nums px-1.5 py-0.5 rounded ${item.isPositive
            ? "text-gain bg-gaindm"
            : "text-loss bg-lossdm"
          }`}
      >
        {item.value}
      </span>
      <span className="inline-flex items-center gap-0.5">
        {item.isPositive ? (
          <TrendingUp className="w-3 h-3 text-gain" />
        ) : (
          <TrendingDown className="w-3 h-3 text-loss" />
        )}
        <span className={`text-xs font-medium tabular-nums ${item.isPositive ? "text-gain" : "text-loss"
          }`}>
          {item.change} ({item.percent})
        </span>
      </span>
    </span>
  )
}

export function MarketTicker() {
  const [tickers, setTickers] = useState<TickerItem[]>(FALLBACK_DATA)

  useEffect(() => {
    const fetchTickers = async () => {
      try {
        const res = await fetch('/api/market/ticker')
        if (!res.ok) return
        const data = await res.json()
        if (data && Array.isArray(data) && data.length > 0) {
          setTickers(data)
        }
      } catch {
        // silently fall back to static data
      }
    }

    fetchTickers()
    const interval = setInterval(fetchTickers, 60000) // refresh every 60s
    return () => clearInterval(interval)
  }, [])

  const doubled = [...tickers, ...tickers]

  return (
    <div
      className="w-full bg-background-primary border-b border-border-subtle relative z-40 shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
    >
      <div
        className="py-2 overflow-hidden mask-marquee"
      >
        <div className="inline-flex items-center animate-marquee hover:[animation-play-state:paused]">
          {doubled.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center hover:scale-105 transition-transform duration-150 ease-out cursor-default"
            >
              <TickerEntry item={item} />
              <span className="text-t4 mx-2 opacity-30">•</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}