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
