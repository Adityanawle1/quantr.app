'use client'
import { useState } from 'react'
import { CandlestickChart as CandleIcon, LineChart as LineIcon } from 'lucide-react'
import dynamic from 'next/dynamic'
import useSWR from 'swr'

const CandlestickChart = dynamic(() => import('./CandlestickChart'), { ssr: false })
const LineChart = dynamic(() => import('./LineChart'), { ssr: false })

const RANGES = ['1mo', '3mo', '6mo', '1y', '2y', '5y']
const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ChartToggle({ symbol }: { symbol: string }) {
  const [type, setType] = useState<'candle' | 'line'>('candle')
  const [range, setRange] = useState('3mo')

  const { data, isLoading } = useSWR(`/api/ohlc/${symbol}?range=${range}`, fetcher)

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4">
      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          {RANGES.map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                range === r
                  ? 'bg-[var(--accent)] text-t1'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 border border-[var(--border)] rounded-lg p-0.5">
          <button
            onClick={() => setType('candle')}
            className={`p-1.5 rounded-md transition-colors ${type === 'candle' ? 'bg-[var(--accent)] text-t1' : 'text-[var(--text-muted)]'}`}
            title="Candlestick"
          >
            <CandleIcon size={14} />
          </button>
          <button
            onClick={() => setType('line')}
            className={`p-1.5 rounded-md transition-colors ${type === 'line' ? 'bg-[var(--accent)] text-t1' : 'text-[var(--text-muted)]'}`}
            title="Line"
          >
            <LineIcon size={14} />
          </button>
        </div>
      </div>

      {/* Chart */}
      {isLoading ? (
        <div className="h-[400px] flex items-center justify-center text-[var(--text-muted)]">
          Loading chart data…
        </div>
      ) : data?.candles ? (
        type === 'candle'
          ? <CandlestickChart candles={data.candles} symbol={symbol} />
          : <LineChart candles={data.candles} symbol={symbol} />
      ) : (
        <div className="h-[400px] flex items-center justify-center text-[var(--text-muted)]">
          No chart data available
        </div>
      )}
    </div>
  )
}
