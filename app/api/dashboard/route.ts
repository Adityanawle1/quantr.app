import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Fetch top gainers – stocks sorted by highest price (since we don't have intraday change data, use price as proxy)
    const { data: allStocks, error } = await supabase
      .from("stocks")
      .select("id, symbol, name, sector, price, market_cap")
      .order("market_cap", { ascending: false })
      .limit(25);

    if (error) throw error;

    if (!allStocks || allStocks.length === 0) {
      return NextResponse.json({ gainers: [], losers: [] });
    }

    // Simulate daily change based on market cap ranking
    // In production, you'd store daily_change or fetch from a price API
    const withChange = allStocks.map((s, i) => ({
      ...s,
      change: parseFloat(((Math.sin(i * 1.7 + Date.now() / 86400000) * 4) + (i % 2 === 0 ? 1 : -1)).toFixed(2)),
    }));

    const gainers = withChange
      .filter((s) => s.change > 0)
      .sort((a, b) => b.change - a.change)
      .slice(0, 10);

    const losers = withChange
      .filter((s) => s.change < 0)
      .sort((a, b) => a.change - b.change)
      .slice(0, 10);

    return NextResponse.json({ gainers, losers });
  } catch (err: any) {
    console.error("[api/dashboard] Error:", err.message);
    return NextResponse.json({ gainers: [], losers: [] }, { status: 500 });
  }
}
