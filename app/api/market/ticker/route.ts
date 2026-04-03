import { NextResponse } from 'next/server';
import { getYfQuote } from '@/lib/yahoo-finance';

export const dynamic = 'force-dynamic';

const INDICES = [
  { symbol: '^BSESN', name: 'SENSEX' },
  { symbol: '^NSEI', name: 'NIFTY 50' },
  { symbol: '^NSEBANK', name: 'BANKNIFTY' },
  { symbol: '^CNXIT', name: 'NIFTY IT' },
  { symbol: '^CNXAUTO', name: 'NIFTY AUTO' },
  { symbol: 'NIFTY_MID_100.NS', name: 'BSE MIDCAP' }, // mapped to Nifty Midcap for reliable YF data
  { symbol: '^CNXPHARMA', name: 'NIFTY PHARMA' },
  { symbol: '^CNXMETAL', name: 'NIFTY METAL' },
];

export async function GET() {
  try {
    const symbols = INDICES.map(i => i.symbol);
    const quotes = await getYfQuote(symbols);
    
    if (!quotes || !Array.isArray(quotes)) {
      return NextResponse.json([]);
    }

    const formatted = INDICES.map((idx) => {
      const q = quotes.find((q: any) => q.symbol === idx.symbol || q.symbol === idx.symbol + '.NS');
      if (!q) return null;
      
      const isPositive = (q.regularMarketChange ?? 0) >= 0;
      
      return {
        name: idx.name,
        value: q.regularMarketPrice?.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 }) || "0.00",
        change: `${isPositive ? '+' : ''}${q.regularMarketChange?.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 }) || "0.00"}`,
        percent: `${isPositive ? '+' : ''}${q.regularMarketChangePercent?.toFixed(2) || "0.00"}%`,
        isPositive: isPositive
      };
    }).filter(Boolean);

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Ticker API Error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
