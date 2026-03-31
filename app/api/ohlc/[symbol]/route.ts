import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
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
