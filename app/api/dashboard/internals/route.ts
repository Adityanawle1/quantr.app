import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getYfQuote } from "@/lib/yahoo-finance";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // 1. Get top 100 stocks by market cap from Supabase to ensure a good sample
    const { data: stocks, error } = await supabase
      .from("stocks")
      .select("symbol, name, price, market_cap")
      .order("market_cap", { ascending: false })
      .limit(100);

    if (error) {
      if (error.code === 'PGRST205') return NextResponse.json({ active: [], highs: [] });
      throw error;
    }
    if (!stocks || stocks.length === 0) {
      return NextResponse.json({ active: [], highs: [] });
    }

    // 2. Fetch real-time quotes from Yahoo Finance
    const symbols = stocks.map((s: any) => s.symbol);
    const quotes = await getYfQuote(symbols);

    if (!quotes || quotes.length === 0) {
      return NextResponse.json({ active: [], highs: [] });
    }

    // 3. Map quotes
    const internals = stocks
      .map((s: any) => {
        const nsSymbol = s.symbol.endsWith('.NS') ? s.symbol : `${s.symbol}.NS`;
        const quote = quotes.find((q: any) => q.symbol === nsSymbol || q.symbol === s.symbol);
        if (!quote) return null;

        return {
          symbol: s.symbol,
          name: s.name,
          price: quote.regularMarketPrice ?? s.price ?? 0,
          change: quote.regularMarketChange ?? 0,
          changePercent: quote.regularMarketChangePercent ?? 0,
          volume: quote.regularMarketVolume ?? 0,
          avgVolume: quote.averageDailyVolume10Day ?? 0,
          fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh ?? 0,
        };
      })
      .filter(Boolean);

    // 4. Sort for Most Active (Highest Volume)
    const active = [...internals]
      .sort((a: any, b: any) => b.volume - a.volume)
      .slice(0, 10);

    // 5. Sort for Near 52-Week Highs
    const highs = [...internals]
      .filter((a: any) => a.fiftyTwoWeekHigh > 0)
      .sort((a: any, b: any) => {
          const diffA = Math.abs(a.fiftyTwoWeekHigh - a.price) / a.fiftyTwoWeekHigh;
          const diffB = Math.abs(b.fiftyTwoWeekHigh - b.price) / b.fiftyTwoWeekHigh;
          return diffA - diffB; // Smallest difference first
      })
      .slice(0, 10);

    return NextResponse.json({ active, highs });
  } catch (error: any) {
    console.error("Internals API Error:", error.message);
    return NextResponse.json({ active: [], highs: [] }, { status: 500 });
  }
}
