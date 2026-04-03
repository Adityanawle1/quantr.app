import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getYfQuote } from "@/lib/yahoo-finance";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ROBUST APPROACH: Two sequential queries to avoid join issues
    // Step 1: Fetch portfolios
    const { data: rawHoldings, error: holdingsErr } = await supabase
      .from("portfolios")
      .select("id, quantity, buy_price, buy_date, stock_id")
      .eq("user_id", user.id);

    if (holdingsErr) {
      console.error("[api/portfolio] GET portfolios Error:", holdingsErr.message);
      throw holdingsErr;
    }

    if (!rawHoldings || rawHoldings.length === 0) {
      return NextResponse.json({ summary: null, holdings: [] });
    }

    // Step 2: Fetch unique stocks
    const stockIds = Array.from(new Set(rawHoldings.map(h => h.stock_id)));
    const { data: stocks, error: stocksErr } = await supabase
      .from("stocks")
      .select("id, symbol, name, sector, price")
      .in("id", stockIds);

    if (stocksErr) {
      console.error("[api/portfolio] GET stocks Error:", stocksErr.message);
      throw stocksErr;
    }

    const stockMap = new Map(stocks?.map(s => [s.id, s]) || []);

    // Step 3: Fetch live quotes from Yahoo Finance
    const symbols = Array.from(new Set(stocks?.map(s => s.symbol) || []));
    const liveQuotes = await getYfQuote(symbols);
    const quoteMap = new Map(liveQuotes.map(q => [q.symbol?.replace(".NS", "").replace(".BO", ""), q]));

    // Step 4: Consolidate by Stock ID
    const consolidatedMap = new Map();

    for (const h of rawHoldings) {
        const s = stockMap.get(h.stock_id);
        if (!s) continue;
        
        const id = s.id;
        if (!consolidatedMap.has(id)) {
            consolidatedMap.set(id, {
                symbol: s.symbol,
                name: s.name,
                sector: s.sector,
                quantity: 0,
                totalInvestment: 0,
                stock: s
            });
        }
        const data = consolidatedMap.get(id);
        data.quantity += h.quantity;
        data.totalInvestment += (h.quantity * (h.buy_price || 0));
    }

    // Step 5: Calculate Summary
    let totalInvestment = 0;
    let currentTotalValue = 0;
    let dayGain = 0;

    const formattedHoldings = Array.from(consolidatedMap.values()).map(data => {
      const h = data.stock;
      const quote = quoteMap.get(data.symbol);
      
      const currentPrice = quote?.regularMarketPrice || h.price || 0;
      const prevClose = quote?.regularMarketPreviousClose || currentPrice;
      
      const qty = data.quantity;
      const avgPrice = qty > 0 ? (data.totalInvestment / qty) : 0;
      
      const investmentValue = data.totalInvestment;
      const currentValue = qty * currentPrice;
      const totalGainVal = currentValue - investmentValue;
      const totalGainPct = investmentValue > 0 ? (totalGainVal / investmentValue) * 100 : 0;
      
      const dayGainForHolding = qty * (currentPrice - prevClose);

      totalInvestment += investmentValue;
      currentTotalValue += currentValue;
      dayGain += dayGainForHolding;

      return {
        symbol: data.symbol,
        name: data.name,
        sector: data.sector,
        quantity: qty,
        buyPrice: avgPrice,
        currentValue,
        investmentValue,
        totalGain: totalGainVal,
        totalGainPercent: totalGainPct,
        currentPrice,
        dayGain: dayGainForHolding,
        dayGainPercent: prevClose > 0 ? ((currentPrice - prevClose) / prevClose) * 100 : 0
      };
    }).sort((a, b) => b.currentValue - a.currentValue);

    const totalPortfolioGain = currentTotalValue - totalInvestment;
    const totalPortfolioGainPct = totalInvestment > 0 ? (totalPortfolioGain / totalInvestment) * 100 : 0;

    return NextResponse.json({
      summary: {
        totalInvestment,
        currentTotalValue,
        totalGain: totalPortfolioGain,
        totalGainPercent: totalPortfolioGainPct,
        dayGain,
        dayGainPercent: (currentTotalValue - dayGain) > 0 ? (dayGain / (currentTotalValue - dayGain)) * 100 : 0,
        isRealTime: true,
        timestamp: new Date().toISOString()
      },
      holdings: formattedHoldings
    });
  } catch (error: any) {
    console.error("[api/portfolio] GET Error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { symbol, quantity, buyPrice, buyDate } = body;

    if (!symbol || !quantity || !buyPrice) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Sync user profile
    await supabase.from("users").upsert({
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.full_name || user.email?.split('@')[0],
      });

    // Find the stock
    const { data: stock, error: stockErr } = await supabase
      .from("stocks")
      .select("id")
      .or(`symbol.eq.${symbol.toUpperCase()},nsSymbol.eq.${symbol.toUpperCase().endsWith(".NS") ? symbol.toUpperCase() : symbol.toUpperCase() + ".NS"}`)
      .maybeSingle();

    if (stockErr) throw stockErr;
    if (!stock) {
      return NextResponse.json({ error: `Stock ${symbol} not found in our database.` }, { status: 404 });
    }

    const now = new Date().toISOString();
    const { data: holding, error: insertErr } = await supabase
      .from("portfolios")
      .insert({
        id: crypto.randomUUID(),
        user_id: user.id,
        stock_id: stock.id,
        quantity: parseFloat(quantity),
        buy_price: parseFloat(buyPrice),
        buy_date: buyDate ? new Date(buyDate).toISOString() : now,
        createdAt: now,
        updatedAt: now
      })
      .select()
      .single();

    if (insertErr) {
      console.error("[api/portfolio] POST Supabase Error:", insertErr.message);
      throw insertErr;
    }

    return NextResponse.json(holding);
  } catch (error: any) {
    console.error("[api/portfolio] POST Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
