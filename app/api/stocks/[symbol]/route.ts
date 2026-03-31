import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const upperSymbol = symbol.toUpperCase();

    // Query 1: Try by exactly matching symbol
    let { data: stock, error } = await supabase
      .from("stocks")
      .select(`
        *,
        financials (*)
      `)
      .eq("symbol", upperSymbol)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;

    // Query 2: Try by nsSymbol if symbol doesn't match
    if (!stock) {
      const { data: byNs, error: nsError } = await supabase
        .from("stocks")
        .select(`
          *,
          financials (*)
        `)
        .eq("nsSymbol", `${upperSymbol}.NS`)
        .maybeSingle();

      if (nsError && nsError.code !== 'PGRST116') throw nsError;

      if (!byNs) {
        return NextResponse.json({ error: "Stock not found" }, { status: 404 });
      }
      stock = byNs;
    }

    // Supabase returns related arrays or objects depending on the relationship.
    // Let's format it.
    const financials = Array.isArray(stock.financials) ? stock.financials[0] : stock.financials;

    const formattedStock = {
      ...stock,
      financials: financials ? {
        ...financials,
        marketCap: financials.market_cap ? Number(financials.market_cap) : null,
        volume: financials.volume ? Number(financials.volume) : null,
        avgVolume: financials.avg_volume ? Number(financials.avg_volume) : null,
        // map snake_case to camelCase for the frontend components
        pe: financials.pe_ratio,
        pb: financials.pb_ratio,
        eps: financials.eps,
        dividendYield: financials.dividend_yield,
        weekHigh52: financials.week_high_52,
        weekLow52: financials.week_low_52,
        bookValue: financials.book_value,
        revenueGrowthYoy: financials.revenue_growth_yoy,
        profitGrowthYoy: financials.profit_growth_yoy,
        debtEquity: financials.debt_to_equity,
        currentPrice: financials.current_price,
        promoterHolding: financials.promoter_holding,
      } : null,
    };

    return NextResponse.json(formattedStock);
  } catch (error: any) {
    console.error(`[api/stocks/symbol] Error:`, error.message);
    if (error.code === 'PGRST205') {
       return NextResponse.json({ error: "Database not initialized" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
