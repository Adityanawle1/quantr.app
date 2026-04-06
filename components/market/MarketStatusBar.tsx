'use client'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const STATUS_STYLES = {
  OPEN:     'bg-[var(--gain-bg)] text-[var(--gain)] border-[var(--gain)]',
  CLOSED:   'bg-[var(--loss-bg)] text-[var(--loss)] border-[var(--loss)]',
  PRE_OPEN: 'bg-yellow-100 text-yellow-700 border-yellow-400 dark:bg-yellow-900/30 dark:text-yellow-400',
}

const PULSE: Record<string, string> = {
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
