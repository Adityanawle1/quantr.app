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

    // Force CLOSED on weekends regardless of what NSE API says (cache issues)
    const ist = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
    const isWeekend = ist.getDay() === 0 || ist.getDay() === 6

    const statuses: MarketStatus[] = (data.marketState || []).map((m: any) => ({
      exchange: m.market,
      status: isWeekend ? 'CLOSED' : (m.marketStatus === 'Open' ? 'OPEN' : m.marketStatus === 'Pre-open' ? 'PRE_OPEN' : 'CLOSED'),
      message: isWeekend ? 'Market is Closed' : m.marketStatusMessage,
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
