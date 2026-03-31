# QUANTR — Next.js Implementation Guide
> Production-ready architecture for the Indian equity research platform

---

## 1. Project Scaffold & File Structure

```
quantr/
├── app/                          # Next.js 14 App Router
│   ├── layout.tsx                # Root layout (theme provider, fonts)
│   ├── page.tsx                  # Home — market overview
│   ├── stock/
│   │   └── [symbol]/
│   │       └── page.tsx          # Individual stock detail page
│   ├── screener/
│   │   └── page.tsx              # Stock screener
│   ├── portfolio/
│   │   └── page.tsx              # Portfolio manager
│   └── api/
│       ├── market-status/route.ts   # NSE/BSE open-close
│       ├── quote/[symbol]/route.ts  # Live quote
│       ├── ohlc/[symbol]/route.ts   # OHLC candlestick data
│       ├── search/route.ts          # Debounced search
│       ├── screener/route.ts        # Screener filters
│       └── portfolio/route.ts       # Portfolio CRUD
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── Disclaimer.tsx
│   ├── market/
│   │   ├── MarketStatusBar.tsx      # NSE/BSE open/close badge
│   │   ├── MarketSentimentWidget.tsx
│   │   ├── IndexTicker.tsx
│   │   ├── TopMovers.tsx            # Gainers / Losers (clickable)
│   │   └── SectorBreakdown.tsx
│   ├── search/
│   │   └── SearchBar.tsx            # Debounced, enlarged
│   ├── charts/
│   │   ├── CandlestickChart.tsx
│   │   ├── LineChart.tsx
│   │   ├── ChartToggle.tsx          # Candlestick ↔ Line
│   │   ├── VolumeChart.tsx
│   │   ├── PEChart.tsx
│   │   └── PBChart.tsx
│   ├── stock/
│   │   ├── StockHeader.tsx
│   │   ├── RatioCard.tsx            # With tooltip
│   │   ├── ShareholdingPattern.tsx  # With tooltip
│   │   └── FundamentalsPanel.tsx
│   ├── screener/
│   │   ├── ScreenerTable.tsx
│   │   ├── ScreenerFilters.tsx
│   │   └── ScreenerSearch.tsx
│   └── portfolio/
│       ├── PortfolioTable.tsx       # Clickable rows
│       ├── AddStockModal.tsx
│       └── PortfolioSummary.tsx
│
├── hooks/
│   ├── useMarketStatus.ts
│   ├── useQuote.ts
│   ├── useOHLC.ts
│   ├── useSearch.ts
│   ├── usePortfolio.ts
│   └── useTheme.ts
│
├── lib/
│   ├── api/
│   │   ├── nse.ts                # NSE India API wrapper
│   │   ├── yahoo.ts              # Yahoo Finance fallback
│   │   └── screener.ts           # Screener.in scraper / API
│   ├── utils.ts
│   └── constants.ts
│
├── store/
│   └── portfolioStore.ts         # Zustand portfolio state
│
├── types/
│   └── index.ts
│
├── styles/
│   └── globals.css               # CSS variables, dark/light tokens
│
└── public/
    └── fonts/                    # Local font assets
```

---

## 2. Core Dependencies

```bash
# Framework
npx create-next-app@latest quantr --typescript --tailwind --app

# Charts
npm install lightweight-charts                   # TradingView's chart lib (OHLC + Line)
npm install recharts                             # PE/PB/Volume secondary charts

# State
npm install zustand                              # Portfolio store

# Utilities
npm install swr                                  # Data fetching + auto-refresh
npm install axios
npm install use-debounce                         # Search debounce

# UI & Icons
npm install lucide-react
npm install @radix-ui/react-tooltip              # Accessible tooltips
npm install @radix-ui/react-dialog               # Modals
npm install @radix-ui/react-switch               # Theme toggle
npm install clsx tailwind-merge                  # Class utilities

# Theming
npm install next-themes                          # Dark/light persistence

# Date
npm install date-fns
```

---

## 3. Theme Setup — Dark / Light Mode (Persisted)

### `app/layout.tsx`
```tsx
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/toaster'
import Navbar from '@/components/layout/Navbar'
import Disclaimer from '@/components/layout/Disclaimer'
import '@/styles/globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="quantr-theme">
          <Navbar />
          <main className="min-h-screen bg-bg text-text">{children}</main>
          <Disclaimer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### `styles/globals.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ── Light theme ── */
:root {
  --bg: #f5f5f0;
  --bg-card: #ffffff;
  --bg-elevated: #efefea;
  --text: #0f0f0e;
  --text-muted: #6b7280;
  --border: #e5e5e0;
  --accent: #1a6b3c;          /* QUANTR green */
  --accent-hover: #155932;
  --gain: #16a34a;
  --loss: #dc2626;
  --gain-bg: #dcfce7;
  --loss-bg: #fee2e2;
  --chart-up: #22c55e;
  --chart-down: #ef4444;
}

/* ── Dark theme ── */
.dark {
  --bg: #0c0c0b;
  --bg-card: #141413;
  --bg-elevated: #1c1c1a;
  --text: #f0f0ee;
  --text-muted: #9ca3af;
  --border: #2a2a28;
  --accent: #22c55e;
  --accent-hover: #16a34a;
  --gain: #22c55e;
  --loss: #f87171;
  --gain-bg: #052e16;
  --loss-bg: #2d0a0a;
  --chart-up: #22c55e;
  --chart-down: #f87171;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: 'DM Sans', sans-serif;
}
```

### `components/layout/ThemeToggle.tsx`
```tsx
'use client'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-elevated)] transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'dark'
        ? <Sun size={16} className="text-yellow-400" />
        : <Moon size={16} className="text-slate-600" />}
    </button>
  )
}
```

---

## 4. NSE/BSE Market Status — Live Auto-Refresh

### `app/api/market-status/route.ts`
```ts
import { NextResponse } from 'next/server'

interface MarketStatus {
  exchange: string
  status: 'OPEN' | 'CLOSED' | 'PRE_OPEN'
  message: string
  timestamp: string
}

export async function GET() {
  try {
    // NSE India public API
    const res = await fetch('https://www.nseindia.com/api/marketStatus', {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
        'Referer': 'https://www.nseindia.com',
      },
      next: { revalidate: 60 }, // cache 60s server-side
    })

    if (!res.ok) throw new Error('NSE API failed')
    const data = await res.json()

    const statuses: MarketStatus[] = (data.marketState || []).map((m: any) => ({
      exchange: m.market,
      status: m.marketStatus === 'Open' ? 'OPEN' : m.marketStatus === 'Pre-open' ? 'PRE_OPEN' : 'CLOSED',
      message: m.marketStatusMessage,
      timestamp: new Date().toISOString(),
    }))

    return NextResponse.json({ markets: statuses })
  } catch {
    // Fallback: derive from IST time (Mon–Fri 9:15–15:30)
    const ist = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
    const day = ist.getDay()
    const h = ist.getHours(), m = ist.getMinutes()
    const mins = h * 60 + m
    const isWeekday = day >= 1 && day <= 5
    const isOpen = isWeekday && mins >= 555 && mins < 930        // 9:15–15:30
    const isPreOpen = isWeekday && mins >= 540 && mins < 555     // 9:00–9:15

    const status = isOpen ? 'OPEN' : isPreOpen ? 'PRE_OPEN' : 'CLOSED'
    return NextResponse.json({
      markets: [
        { exchange: 'NSE', status, message: '', timestamp: new Date().toISOString() },
        { exchange: 'BSE', status, message: '', timestamp: new Date().toISOString() },
      ],
      fallback: true,
    })
  }
}
```

### `components/market/MarketStatusBar.tsx`
```tsx
'use client'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const STATUS_STYLES = {
  OPEN:     'bg-[var(--gain-bg)] text-[var(--gain)] border-[var(--gain)]',
  CLOSED:   'bg-[var(--loss-bg)] text-[var(--loss)] border-[var(--loss)]',
  PRE_OPEN: 'bg-yellow-100 text-yellow-700 border-yellow-400 dark:bg-yellow-900/30 dark:text-yellow-400',
}

const PULSE = {
  OPEN:     'bg-[var(--gain)]',
  CLOSED:   'bg-[var(--loss)]',
  PRE_OPEN: 'bg-yellow-400',
}

export default function MarketStatusBar() {
  const { data } = useSWR('/api/market-status', fetcher, {
    refreshInterval: 60_000, // auto-refresh every 60s
  })

  const markets = data?.markets ?? [
    { exchange: 'NSE', status: 'CLOSED' },
    { exchange: 'BSE', status: 'CLOSED' },
  ]

  return (
    <div className="flex items-center gap-3">
      {markets
        .filter((m: any) => ['NSE', 'BSE'].includes(m.exchange))
        .map((m: any) => (
          <div
            key={m.exchange}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[m.status as keyof typeof STATUS_STYLES]}`}
          >
            {m.status === 'OPEN' && (
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${PULSE[m.status]}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${PULSE[m.status]}`} />
              </span>
            )}
            {m.exchange} · {m.status.replace('_', ' ')}
          </div>
        ))}
    </div>
  )
}
```

---

## 5. Enlarged Debounced Search Bar

### `hooks/useSearch.ts`
```ts
import { useState, useCallback } from 'react'
import { useDebouncedCallback } from 'use-debounce'

export interface SearchResult {
  symbol: string
  name: string
  type: 'STOCK' | 'INDEX' | 'ETF'
  exchange: 'NSE' | 'BSE'
}

export function useSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  const search = useDebouncedCallback(async (q: string) => {
    if (!q.trim() || q.length < 2) { setResults([]); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data.results ?? [])
    } finally {
      setLoading(false)
    }
  }, 300) // 300ms debounce

  const handleChange = useCallback((val: string) => {
    setQuery(val)
    search(val)
  }, [search])

  return { query, setQuery: handleChange, results, loading, clear: () => { setQuery(''); setResults([]) } }
}
```

### `app/api/search/route.ts`
```ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? ''
  if (!q || q.length < 2) return NextResponse.json({ results: [] })

  try {
    // NSE search endpoint
    const res = await fetch(
      `https://www.nseindia.com/api/search/autocomplete?q=${encodeURIComponent(q)}`,
      { headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.nseindia.com' } }
    )
    const data = await res.json()
    const results = (data.symbols ?? []).slice(0, 10).map((s: any) => ({
      symbol: s.symbol,
      name: s.symbol_info ?? s.symbol,
      type: s.symbol_type === 'IN' ? 'INDEX' : 'STOCK',
      exchange: 'NSE',
    }))
    return NextResponse.json({ results })
  } catch {
    return NextResponse.json({ results: [] })
  }
}
```

### `components/search/SearchBar.tsx`
```tsx
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

export default function SearchBar() {
  const { query, setQuery, results, loading, clear } = useSearch()
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)

  const navigate = (symbol: string) => {
    clear()
    router.push(`/stock/${symbol}`)
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
    <div ref={ref} className="relative w-full max-w-2xl">
      {/* Input */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] shadow-sm focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent)]/20 transition-all">
        {loading
          ? <Loader2 size={18} className="text-[var(--text-muted)] animate-spin shrink-0" />
          : <Search size={18} className="text-[var(--text-muted)] shrink-0" />}
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search stocks, sectors, or indices (e.g., Reliance, TCS, Nifty 50)"
          className="flex-1 bg-transparent text-[var(--text)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none"
        />
        {query && (
          <button onClick={clear} className="shrink-0 text-[var(--text-muted)] hover:text-[var(--text)]">
            <X size={16} />
          </button>
        )}
        <span className="hidden sm:block shrink-0 text-xs text-[var(--text-muted)] border border-[var(--border)] rounded px-1.5 py-0.5">⌘K</span>
      </div>

      {/* Dropdown */}
      {results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-xl z-50 overflow-hidden">
          {results.map(r => (
            <button
              key={r.symbol}
              onClick={() => navigate(r.symbol)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--bg-elevated)] transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-[var(--text-muted)]">{TYPE_ICON[r.type]}</span>
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">{r.symbol}</p>
                  <p className="text-xs text-[var(--text-muted)]">{r.name}</p>
                </div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                {r.exchange}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## 6. Candlestick + Line Chart Toggle (OHLC)

### `app/api/ohlc/[symbol]/route.ts`
```ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: { symbol: string } }) {
  const { symbol } = params
  const range = req.nextUrl.searchParams.get('range') ?? '3mo'

  try {
    // Yahoo Finance v8 — reliable for Indian equities with .NS suffix
    const yfSymbol = symbol.includes('.') ? symbol : `${symbol}.NS`
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yfSymbol}?range=${range}&interval=1d&includePrePost=false`

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 300 },
    })
    const data = await res.json()

    const result = data.chart?.result?.[0]
    if (!result) throw new Error('No data')

    const timestamps: number[] = result.timestamp
    const { open, high, low, close, volume } = result.indicators.quote[0]

    const candles = timestamps.map((t: number, i: number) => ({
      time: t,
      open: open[i],
      high: high[i],
      low: low[i],
      close: close[i],
      volume: volume[i],
    })).filter((c: any) => c.open != null)

    return NextResponse.json({ symbol, candles, currency: result.meta.currency })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch OHLC' }, { status: 500 })
  }
}
```

### `components/charts/CandlestickChart.tsx`
```tsx
'use client'
import { useEffect, useRef, useState } from 'react'
import { createChart, ColorType, CrosshairMode, CandlestickSeries, HistogramSeries } from 'lightweight-charts'
import { useTheme } from 'next-themes'

interface Candle { time: number; open: number; high: number; low: number; close: number; volume: number }

interface Props {
  candles: Candle[]
  symbol: string
}

export default function CandlestickChart({ candles, symbol }: Props) {
  const chartRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (!chartRef.current || !candles.length) return

    const isDark = resolvedTheme === 'dark'
    const bg = isDark ? '#141413' : '#ffffff'
    const text = isDark ? '#9ca3af' : '#6b7280'
    const grid = isDark ? '#1c1c1a' : '#f0f0ee'

    const chart = createChart(chartRef.current, {
      layout: { background: { type: ColorType.Solid, color: bg }, textColor: text },
      grid: { vertLines: { color: grid }, horzLines: { color: grid } },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, timeVisible: true, fixLeftEdge: true, fixRightEdge: true },
      width: chartRef.current.clientWidth,
      height: 400,
    })

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#f87171',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#f87171',
    })

    const volSeries = chart.addSeries(HistogramSeries, {
      color: '#22c55e44',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    })
    chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } })

    const formatted = candles.map(c => ({
      time: c.time as any,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }))

    const volFormatted = candles.map(c => ({
      time: c.time as any,
      value: c.volume,
      color: c.close >= c.open ? '#22c55e44' : '#f8717144',
    }))

    candleSeries.setData(formatted)
    volSeries.setData(volFormatted)
    chart.timeScale().fitContent()

    const ro = new ResizeObserver(() => chart.applyOptions({ width: chartRef.current!.clientWidth }))
    ro.observe(chartRef.current)

    return () => { chart.remove(); ro.disconnect() }
  }, [candles, resolvedTheme])

  return <div ref={chartRef} className="w-full" />
}
```

### `components/charts/ChartToggle.tsx`
```tsx
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
                  ? 'bg-[var(--accent)] text-white'
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
            className={`p-1.5 rounded-md transition-colors ${type === 'candle' ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-muted)]'}`}
            title="Candlestick"
          >
            <CandleIcon size={14} />
          </button>
          <button
            onClick={() => setType('line')}
            className={`p-1.5 rounded-md transition-colors ${type === 'line' ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-muted)]'}`}
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
```

### `components/charts/LineChart.tsx`
```tsx
'use client'
import { useEffect, useRef } from 'react'
import { createChart, ColorType, LineSeries } from 'lightweight-charts'
import { useTheme } from 'next-themes'

export default function LineChart({ candles, symbol }: { candles: any[]; symbol: string }) {
  const chartRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (!chartRef.current || !candles.length) return
    const isDark = resolvedTheme === 'dark'
    const chart = createChart(chartRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: isDark ? '#141413' : '#ffffff' },
        textColor: isDark ? '#9ca3af' : '#6b7280',
      },
      grid: { vertLines: { color: 'transparent' }, horzLines: { color: isDark ? '#1c1c1a' : '#f0f0ee' } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
      width: chartRef.current.clientWidth,
      height: 400,
    })

    const lineSeries = chart.addSeries(LineSeries, {
      color: '#22c55e',
      lineWidth: 2,
      crosshairMarkerVisible: true,
      lastValueVisible: true,
      priceLineVisible: false,
    })

    lineSeries.setData(candles.map(c => ({ time: c.time as any, value: c.close })))
    chart.timeScale().fitContent()

    const ro = new ResizeObserver(() => chart.applyOptions({ width: chartRef.current!.clientWidth }))
    ro.observe(chartRef.current)
    return () => { chart.remove(); ro.disconnect() }
  }, [candles, resolvedTheme])

  return <div ref={chartRef} className="w-full" />
}
```

---

## 7. Market Sentiment Widget (Large)

### `components/market/MarketSentimentWidget.tsx`
```tsx
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
```

---

## 8. Top Gainers / Losers (Clickable)

### `components/market/TopMovers.tsx`
```tsx
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
```

---

## 9. Portfolio — Zustand CRUD + Clickable Rows

### `store/portfolioStore.ts`
```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PortfolioHolding {
  id: string
  symbol: string
  name: string
  quantity: number
  avgPrice: number
  addedAt: string
  // Live data (not persisted, fetched on mount)
  currentPrice?: number
  change?: number
  changePercent?: number
}

interface PortfolioStore {
  holdings: PortfolioHolding[]
  addHolding: (h: Omit<PortfolioHolding, 'id' | 'addedAt'>) => void
  removeHolding: (id: string) => void
  updateHolding: (id: string, patch: Partial<PortfolioHolding>) => void
  updateLiveData: (symbol: string, price: number, change: number, changePct: number) => void
}

export const usePortfolioStore = create<PortfolioStore>()(
  persist(
    (set) => ({
      holdings: [],
      addHolding: (h) => set(s => ({
        holdings: [...s.holdings, {
          ...h,
          id: crypto.randomUUID(),
          addedAt: new Date().toISOString(),
        }],
      })),
      removeHolding: (id) => set(s => ({ holdings: s.holdings.filter(h => h.id !== id) })),
      updateHolding: (id, patch) => set(s => ({
        holdings: s.holdings.map(h => h.id === id ? { ...h, ...patch } : h),
      })),
      updateLiveData: (symbol, price, change, changePct) => set(s => ({
        holdings: s.holdings.map(h =>
          h.symbol === symbol
            ? { ...h, currentPrice: price, change, changePercent: changePct }
            : h
        ),
      })),
    }),
    { name: 'quantr-portfolio' } // localStorage key
  )
)
```

### `components/portfolio/PortfolioTable.tsx`
```tsx
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
                  onClick={() => router.push(`/stock/${h.symbol}`)}
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
```

---

## 10. Screener — Updated Layout + Search (No Filters)

### `app/screener/page.tsx`
```tsx
'use client'
import { useState } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { useDebouncedCallback } from 'use-debounce'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const PRESETS = [
  { label: 'Nifty 50', value: 'nifty50' },
  { label: 'Nifty Next 50', value: 'niftynext50' },
  { label: 'Midcap 100', value: 'niftymidcap100' },
  { label: 'Smallcap 250', value: 'niftysmallcap250' },
]

export default function ScreenerPage() {
  const [query, setQuery] = useState('')
  const [preset, setPreset] = useState('nifty50')
  const router = useRouter()

  const debouncedSearch = useDebouncedCallback(v => setQuery(v), 300)
  const { data, isLoading } = useSWR(`/api/screener?index=${preset}&q=${query}`, fetcher)
  const stocks = data?.stocks ?? []

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">Stock Screener</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Browse and discover stocks across indices</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] focus-within:border-[var(--accent)]">
          <Search size={16} className="text-[var(--text-muted)]" />
          <input
            onChange={e => debouncedSearch(e.target.value)}
            placeholder="Filter by name or symbol…"
            className="bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none flex-1"
          />
        </div>

        {/* Index presets */}
        <div className="flex gap-1">
          {PRESETS.map(p => (
            <button
              key={p.value}
              onClick={() => setPreset(p.value)}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                preset === p.value
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-[var(--text-muted)] border-b border-[var(--border)] bg-[var(--bg-elevated)]">
                {['Symbol', 'Name', 'Price', 'Change', '52W High', '52W Low', 'Market Cap', 'P/E', 'Volume'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="border-b border-[var(--border)] animate-pulse">
                      {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 bg-[var(--bg-elevated)] rounded w-16" /></td>
                      ))}
                    </tr>
                  ))
                : stocks.map((s: any) => (
                    <tr
                      key={s.symbol}
                      onClick={() => router.push(`/stock/${s.symbol}`)}
                      className="border-b border-[var(--border)] hover:bg-[var(--bg-elevated)] cursor-pointer transition-colors group"
                    >
                      <td className="px-4 py-3 font-semibold text-[var(--accent)] group-hover:underline">{s.symbol}</td>
                      <td className="px-4 py-3 text-[var(--text)] max-w-[180px] truncate">{s.name}</td>
                      <td className="px-4 py-3 font-medium text-[var(--text)]">₹{s.price?.toLocaleString('en-IN')}</td>
                      <td className={`px-4 py-3 font-semibold text-xs ${s.changePercent >= 0 ? 'text-[var(--gain)]' : 'text-[var(--loss)]'}`}>
                        {s.changePercent >= 0 ? '+' : ''}{s.changePercent?.toFixed(2)}%
                      </td>
                      <td className="px-4 py-3 text-[var(--text-muted)]">₹{s.high52w?.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-[var(--text-muted)]">₹{s.low52w?.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-[var(--text-muted)]">{s.marketCap}</td>
                      <td className="px-4 py-3 text-[var(--text-muted)]">{s.pe?.toFixed(1)}</td>
                      <td className="px-4 py-3 text-[var(--text-muted)]">{s.volume}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
```

---

## 11. Ratio Tooltips + Shareholding Tooltips

### `components/stock/RatioCard.tsx`
```tsx
import * as Tooltip from '@radix-ui/react-tooltip'
import { Info } from 'lucide-react'

const RATIO_DESCRIPTIONS: Record<string, string> = {
  'P/E':           'Price-to-Earnings: How much investors pay per ₹1 of earnings. Lower may indicate undervaluation.',
  'P/B':           'Price-to-Book: Compares stock price to net asset value. P/B < 1 may signal undervaluation.',
  'EPS':           'Earnings Per Share: Net profit divided by shares outstanding. Higher is generally better.',
  'ROE':           'Return on Equity: Net income as % of shareholders equity. Higher means more efficient use of capital.',
  'ROCE':          'Return on Capital Employed: Profitability relative to all capital used, including debt.',
  'Debt/Equity':   'Debt-to-Equity: Total debt divided by equity. Lower is safer; high D/E adds financial risk.',
  'Dividend Yield':'Annual dividend as % of share price. Higher yield can signal income; check payout sustainability.',
  'Market Cap':    'Total market value of all shares. Mega cap (>₹2L Cr), Large (₹50K–2L Cr), Mid (₹5K–50K Cr), Small (<₹5K Cr).',
  'Revenue Growth':'Year-over-year revenue increase. Consistent growth suggests strong business momentum.',
  'Profit Growth': 'Year-over-year net profit growth. Signals improving operational efficiency or volume expansion.',
  'Current Ratio': 'Current assets ÷ current liabilities. >1 means company can cover short-term obligations.',
}

const SHAREHOLDING_DESCRIPTIONS: Record<string, string> = {
  'Promoters':   'Founders and major controlling shareholders. High promoter holding (>50%) often signals confidence in the business.',
  'FII':         'Foreign Institutional Investors — large overseas funds. Rising FII stake usually signals global confidence.',
  'DII':         'Domestic Institutional Investors — LIC, mutual funds, insurance companies. Rising DII holding shows domestic conviction.',
  'Public':      'Retail and other public shareholders. High public float improves liquidity but may increase volatility.',
  'Pledged':     'Shares pledged as collateral by promoters. High pledging (>25%) is a red flag — promoter may be under financial stress.',
}

interface Props {
  label: string
  value: string | number
  type?: 'ratio' | 'shareholding'
  positive?: boolean
}

export default function RatioCard({ label, value, type = 'ratio', positive }: Props) {
  const descriptions = type === 'ratio' ? RATIO_DESCRIPTIONS : SHAREHOLDING_DESCRIPTIONS
  const description = descriptions[label]

  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <div className="bg-[var(--bg-elevated)] rounded-xl p-4 cursor-default hover:bg-[var(--border)] transition-colors">
            <div className="flex items-center gap-1 mb-2">
              <span className="text-xs text-[var(--text-muted)]">{label}</span>
              {description && <Info size={11} className="text-[var(--text-muted)] opacity-60" />}
            </div>
            <p className={`text-lg font-bold ${positive == null ? 'text-[var(--text)]' : positive ? 'text-[var(--gain)]' : 'text-[var(--loss)]'}`}>
              {value ?? '—'}
            </p>
          </div>
        </Tooltip.Trigger>
        {description && (
          <Tooltip.Portal>
            <Tooltip.Content
              className="max-w-xs bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-xl px-4 py-3 text-xs text-[var(--text)] leading-relaxed z-50"
              sideOffset={6}
            >
              <strong className="block mb-1 text-[var(--accent)]">{label}</strong>
              {description}
              <Tooltip.Arrow className="fill-[var(--border)]" />
            </Tooltip.Content>
          </Tooltip.Portal>
        )}
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
```

---

## 12. PE + PB Charts

### `components/charts/PEChart.tsx`
```tsx
'use client'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function PEChart({ symbol }: { symbol: string }) {
  const { data } = useSWR(`/api/fundamentals/${symbol}/pe-history`, fetcher)
  const history = data?.history ?? []
  const avg = history.length ? history.reduce((s: number, d: any) => s + d.pe, 0) / history.length : 0

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4">
      <h3 className="text-sm font-semibold text-[var(--text)] mb-4">P/E History</h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={history}>
          <defs>
            <linearGradient id="peGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }}
            labelStyle={{ color: 'var(--text-muted)' }}
            itemStyle={{ color: 'var(--accent)' }}
          />
          <ReferenceLine y={avg} stroke="var(--text-muted)" strokeDasharray="4 2" label={{ value: `Avg ${avg.toFixed(1)}x`, fill: 'var(--text-muted)', fontSize: 11 }} />
          <Area type="monotone" dataKey="pe" stroke="var(--accent)" strokeWidth={2} fill="url(#peGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
```

---

## 13. Disclaimer Component

### `components/layout/Disclaimer.tsx`
```tsx
'use client'
import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'

export default function Disclaimer() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--bg-card)]/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-start gap-3">
        <AlertTriangle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
        <p className="text-xs text-[var(--text-muted)] flex-1 leading-relaxed">
          <strong className="text-[var(--text)]">Investment Disclaimer:</strong>{' '}
          QUANTR is an information and research platform only. Nothing on this platform constitutes financial advice, a solicitation, or a recommendation to buy or sell securities. Stock market investments are subject to market risk. Past performance is not indicative of future results. Please consult a SEBI-registered investment advisor before making investment decisions.
        </p>
        <button onClick={() => setDismissed(true)} className="shrink-0 text-[var(--text-muted)] hover:text-[var(--text)]">
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
```

---

## 14. Auto-Refresh Strategy

```ts
// hooks/useQuote.ts
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useQuote(symbol: string) {
  return useSWR(
    symbol ? `/api/quote/${symbol}` : null,
    fetcher,
    {
      refreshInterval: 30_000,        // 30s during market hours
      revalidateOnFocus: true,
      dedupingInterval: 15_000,
    }
  )
}

// Market-hours-aware refresh
export function useMarketAwareRefresh(baseInterval = 30_000) {
  const ist = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
  const mins = ist.getHours() * 60 + ist.getMinutes()
  const isMarketHours = ist.getDay() >= 1 && ist.getDay() <= 5 && mins >= 555 && mins < 930
  return isMarketHours ? baseInterval : 300_000 // 5min polling off-hours
}
```

---

## 15. Environment Variables

```env
# .env.local
NSE_SESSION_TOKEN=          # Optional: NSE cookie for higher rate limits
YAHOO_FINANCE_KEY=          # Optional: RapidAPI Yahoo Finance key
SCREENER_API_KEY=           # Screener.in API (if subscribed)
NEXT_PUBLIC_APP_NAME=QUANTR
```

---

## 16. `tailwind.config.ts` — CSS Variable Wiring

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.tsx', './components/**/*.tsx'],
  theme: {
    extend: {
      colors: {
        bg:       'var(--bg)',
        card:     'var(--bg-card)',
        elevated: 'var(--bg-elevated)',
        text:     'var(--text)',
        muted:    'var(--text-muted)',
        border:   'var(--border)',
        accent:   'var(--accent)',
        gain:     'var(--gain)',
        loss:     'var(--loss)',
      },
      borderRadius: { xl: '12px', '2xl': '16px' },
    },
  },
  plugins: [],
}
export default config
```

---

## 17. Stock Detail Page — Full Assembly

### `app/stock/[symbol]/page.tsx`
```tsx
import ChartToggle from '@/components/charts/ChartToggle'
import RatioCard from '@/components/stock/RatioCard'
import ShareholdingPattern from '@/components/stock/ShareholdingPattern'
import PEChart from '@/components/charts/PEChart'
import PBChart from '@/components/charts/PBChart'
import VolumeChart from '@/components/charts/VolumeChart'
import StockHeader from '@/components/stock/StockHeader'
import AddToPortfolioButton from '@/components/portfolio/AddToPortfolioButton'

export default function StockPage({ params }: { params: { symbol: string } }) {
  const { symbol } = params

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header: Name, price, change, exchange badge, Add to Portfolio */}
      <StockHeader symbol={symbol} />

      {/* Main Chart */}
      <ChartToggle symbol={symbol} />

      {/* Key Ratios Grid */}
      <section>
        <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Key Ratios</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {/* RatioCard fetches its own data or receives props */}
          <RatioCard label="P/E"           value="—" type="ratio" />
          <RatioCard label="P/B"           value="—" type="ratio" />
          <RatioCard label="EPS"           value="—" type="ratio" />
          <RatioCard label="ROE"           value="—" type="ratio" />
          <RatioCard label="Debt/Equity"   value="—" type="ratio" />
          <RatioCard label="Dividend Yield" value="—" type="ratio" />
        </div>
      </section>

      {/* Volume Chart */}
      <VolumeChart symbol={symbol} />

      {/* PE + PB Historical */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PEChart symbol={symbol} />
        <PBChart symbol={symbol} />
      </div>

      {/* Shareholding Pattern */}
      <ShareholdingPattern symbol={symbol} />
    </div>
  )
}
```

---

## 18. Implementation Order (Sprint Plan)

| Sprint | Focus | Components |
|--------|-------|-----------|
| 1 | Foundation | Theme system, Navbar, CSS vars, layout |
| 2 | Data Layer | All API routes, SWR hooks |
| 3 | Home Page | MarketStatusBar, SentimentWidget, SearchBar, TopMovers |
| 4 | Charts | CandlestickChart, LineChart, ChartToggle, VolumeChart |
| 5 | Stock Page | StockHeader, RatioCards with tooltips, Shareholding |
| 6 | Portfolio | Zustand store, PortfolioTable CRUD, AddStockModal |
| 7 | Screener | Table, IndexPresets, inline search |
| 8 | Analytics | PEChart, PBChart |
| 9 | Polish | Disclaimer, keyboard nav (⌘K), skeleton loaders, error states |

---

## Key Libraries Reference

| Library | Purpose |
|---------|---------|
| `lightweight-charts` | TradingView OHLC, candlestick, line chart |
| `recharts` | PE/PB/Volume area charts |
| `zustand` + `persist` | Portfolio state, localStorage sync |
| `swr` | Auto-refresh, stale-while-revalidate |
| `use-debounce` | 300ms search debounce |
| `next-themes` | Dark/light toggle, persisted in localStorage |
| `@radix-ui/react-tooltip` | Accessible ratio + shareholding tooltips |
| `@radix-ui/react-dialog` | Add to Portfolio modal |
| `lucide-react` | Consistent icon set |
| `date-fns` | Chart date formatting |
