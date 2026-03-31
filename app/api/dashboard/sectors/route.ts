import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getYfQuote } from "@/lib/yahoo-finance";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Get all stocks grouped by sector
    const { data: stocks, error } = await supabase
      .from("stocks")
      .select("symbol, sector, price, market_cap")
      .not("sector", "is", null)
      .order("market_cap", { ascending: false });

    if (error) {
      // If table doesn't exist (PGRST205), return gracefully
      if (error.code === 'PGRST205') return NextResponse.json({ sectors: [] });
      throw error;
    }

    if (!stocks || stocks.length === 0) {
      return NextResponse.json({ sectors: [] });
    }

    // Group stocks by sector, pick top 3 per sector for real-time quotes
    const sectorStocks = new Map<string, any[]>();
    for (const stock of stocks) {
      if (!stock.sector) continue;
      const list = sectorStocks.get(stock.sector) || [];
      if (list.length < 3) list.push(stock); // Top 3 by market cap per sector
      sectorStocks.set(stock.sector, list);
    }

    // Fetch real-time quotes for selected stocks
    const allSymbols = Array.from(sectorStocks.values()).flat().map(s => s.symbol);
    const quotes = await getYfQuote(allSymbols);

    // Calculate average sector performance from real quotes
    const sectors = Array.from(sectorStocks.entries())
      .map(([sectorName, sectorStockList]) => {
        let totalChange = 0;
        let count = 0;

        for (const s of sectorStockList) {
          const nsSymbol = s.symbol.endsWith('.NS') ? s.symbol : `${s.symbol}.NS`;
          const quote = quotes.find((q: any) => q.symbol === nsSymbol || q.symbol === s.symbol);
          if (quote && quote.regularMarketChangePercent != null) {
            totalChange += quote.regularMarketChangePercent;
            count++;
          }
        }

        return {
          name: sectorName,
          performance: count > 0 ? parseFloat((totalChange / count).toFixed(2)) : 0,
          stockCount: (sectorStocks.get(sectorName) || []).length,
        };
      })
      .filter(s => s.performance !== 0 || s.stockCount > 0)
      .sort((a, b) => b.performance - a.performance);

    return NextResponse.json({ sectors });
  } catch (err: any) {
    console.error("[api/dashboard/sectors] Error:", err.message);
    return NextResponse.json({ sectors: [] }, { status: 500 });
  }
}
