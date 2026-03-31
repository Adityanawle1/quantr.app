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
