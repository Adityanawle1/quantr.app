import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol")?.toUpperCase();

    if (!symbol) {
      return NextResponse.json({ error: "symbol is required" }, { status: 400 });
    }

    // 1. Get the target stock to determine the sector
    let { data: stock, error: stockErr } = await supabase
      .from("stocks")
      .select("id, sector, name, symbol")
      .eq("symbol", symbol)
      .maybeSingle();

    if (stockErr && stockErr.code !== 'PGRST116') throw stockErr;

    if (!stock) {
        // Fallback for .NS symbols
        const { data: byNs, error: nsErr } = await supabase
          .from("stocks")
          .select("id, sector, name, symbol")
          .eq("nsSymbol", symbol.endsWith(".NS") ? symbol : `${symbol}.NS`)
          .maybeSingle();
          
        if (nsErr && nsErr.code !== 'PGRST116') throw nsErr;
        if (!byNs) return NextResponse.json({ error: "Stock not found" }, { status: 404 });
        
        return fetchPeers(byNs);
    }

    return fetchPeers(stock);
  } catch (error: any) {
    console.error("[api/stocks/peers] Error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function fetchPeers(targetStock: { id: string, sector: string, symbol: string, name: string }) {
    if (!targetStock.sector || targetStock.sector === "Unknown") {
        return NextResponse.json({ 
            stock: await formatStockWithFin(targetStock.id),
            peers: [], 
            sector: "Unknown" 
        });
    }

    // 2. Find up to 10 peers in the same sector, excluding the target stock
    const { data: peers, error } = await supabase
        .from("stocks")
        .select(`
            id, symbol, name, sector, price, market_cap,
            financials (*)
        `)
        .eq("sector", targetStock.sector)
        .neq("symbol", targetStock.symbol)
        .order("market_cap", { ascending: false })
        .limit(10);

    if (error) throw error;

    const targetWithFin = await formatStockWithFin(targetStock.id);

    return NextResponse.json({
        stock: targetWithFin,
        peers: (peers || []).map(formatEntry),
        sector: targetStock.sector
    });
}

async function formatStockWithFin(stockId: string) {
    const { data: s } = await supabase
        .from("stocks")
        .select(`
            id, symbol, name, sector, price, market_cap,
            financials (*)
        `)
        .eq("id", stockId)
        .maybeSingle();
        
    return s ? formatEntry(s) : null;
}

function formatEntry(s: any) {
  const fin = Array.isArray(s.financials) ? s.financials[0] : s.financials;
  
  return {
    symbol: s.symbol,
    name: s.name,
    sector: s.sector,
    price: fin?.current_price || s.price || 0,
    marketCap: fin?.market_cap ? Number(fin.market_cap) : (s.market_cap ? Number(s.market_cap) : 0),
    pe: fin?.pe_ratio || null,
    pb: fin?.pb_ratio || null,
    roe: fin?.roe || null,
    roce: fin?.roce || null,
    debtEquity: fin?.debt_to_equity || null,
    dividendYield: fin?.dividend_yield || null,
  };
}
