import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getYfQuote } from "@/lib/yahoo-finance";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // 1. Get top 50 stocks by market cap from Supabase
    const { data: stocks, error } = await supabase
      .from("stocks")
      .select("symbol, name, price, market_cap")
      .order("market_cap", { ascending: false })
      .limit(50);

    if (error) {
      // If table doesn't exist (PGRST205), return gracefully
      if (error.code === 'PGRST205') return NextResponse.json({ topGainers: [], topLosers: [] });
      throw error;
    }
    if (!stocks || stocks.length === 0) {
      return NextResponse.json({ topGainers: [], topLosers: [] });
    }

    // 2. Fetch real-time quotes from Yahoo Finance
    const symbols = stocks.map((s: any) => s.symbol);
    const quotes = await getYfQuote(symbols);

    if (!quotes || quotes.length === 0) {
      return NextResponse.json({ topGainers: [], topLosers: [] });
    }

    // 3. Map quotes to our format
    const movers = stocks
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
        };
      })
      .filter(Boolean);

    // 4. Sort and return top gainers/losers
    const topGainers = [...movers]
      .sort((a: any, b: any) => b.changePercent - a.changePercent)
      .slice(0, 5);

    const topLosers = [...movers]
      .sort((a: any, b: any) => a.changePercent - b.changePercent)
      .slice(0, 5);

    return NextResponse.json({ topGainers, topLosers });
  } catch (error: any) {
    console.error("Movers API Error:", error.message);
    return NextResponse.json({ topGainers: [], topLosers: [] }, { status: 500 });
  }
}
