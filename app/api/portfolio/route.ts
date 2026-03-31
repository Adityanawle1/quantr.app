import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEMO_USER_ID } from "@/lib/auth-mock";
import { getYfQuote } from "@/lib/yahoo-finance";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const holdings = await prisma.portfolio.findMany({
      where: { userId: DEMO_USER_ID },
      include: {
        stock: {
          include: { financials: true }
        }
      }
    });

    if (holdings.length === 0) {
      return NextResponse.json({ summary: null, holdings: [] });
    }

    // Collect unique symbols for live quote fetching
    const symbols = Array.from(new Set(holdings.map(h => h.stock.symbol)));
    
    // Fetch live quotes from Yahoo Finance
    const liveQuotes = await getYfQuote(symbols);
    const quoteMap = new Map(liveQuotes.map(q => [q.symbol?.replace(".NS", "").replace(".BO", ""), q]));

    // Consolidate by Stock ID
    const consolidatedMap = new Map();

    for (const h of holdings) {
        const id = h.stock.id;
        if (!consolidatedMap.has(id)) {
            consolidatedMap.set(id, {
                symbol: h.stock.symbol,
                name: h.stock.name,
                sector: h.stock.sector,
                quantity: 0,
                totalInvestment: 0,
                stock: h.stock
            });
        }
        const data = consolidatedMap.get(id);
        data.quantity += h.quantity;
        data.totalInvestment += (h.quantity * h.buyPrice);
    }

    // Calculate Summary
    let totalInvestment = 0;
    let currentTotalValue = 0;
    let dayGain = 0;

    const formattedHoldings = Array.from(consolidatedMap.values()).map(data => {
      const h = data.stock;
      const quote = quoteMap.get(data.symbol);
      
      // Use live price if available, otherwise fallback to DB
      const currentPrice = quote?.regularMarketPrice || h.financials?.currentPrice || 0;
      const prevClose = quote?.regularMarketPreviousClose || h.financials?.previousClose || currentPrice;
      
      const qty = data.quantity;
      const avgPrice = qty > 0 ? (data.totalInvestment / qty) : 0;
      
      const investmentValue = data.totalInvestment;
      const currentValue = qty * currentPrice;
      const totalGain = currentValue - investmentValue;
      const totalGainPercent = investmentValue > 0 ? (totalGain / investmentValue) * 100 : 0;
      
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
        currentPrice: currentPrice,
        investmentValue,
        currentValue,
        totalGain,
        totalGainPercent,
        dayGain: dayGainForHolding,
        dayGainPercent: prevClose > 0 ? ((currentPrice - prevClose) / prevClose) * 100 : 0
      };
    }).sort((a, b) => b.currentValue - a.currentValue);

    const totalGain = currentTotalValue - totalInvestment;
    const totalGainPercent = totalInvestment > 0 ? (totalGain / totalInvestment) * 100 : 0;

    return NextResponse.json({
      summary: {
        totalInvestment,
        currentTotalValue,
        totalGain,
        totalGainPercent,
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
    const body = await request.json();
    const { symbol, quantity, buyPrice, buyDate } = body;

    if (!symbol || !quantity || !buyPrice) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find the stock by symbol or nsSymbol
    const stock = await prisma.stock.findFirst({
      where: {
        OR: [
          { symbol: symbol.toUpperCase() },
          { nsSymbol: symbol.toUpperCase().endsWith(".NS") ? symbol.toUpperCase() : `${symbol.toUpperCase()}.NS` }
        ]
      }
    });

    if (!stock) {
      return NextResponse.json({ error: `Stock ${symbol} not found in our database.` }, { status: 404 });
    }

    // Ensure demo user exists
    await prisma.user.upsert({
      where: { id: DEMO_USER_ID },
      update: {},
      create: {
        id: DEMO_USER_ID,
        email: "demo@quantr.app",
        name: "Demo Investor",
        plan: "ELITE"
      }
    });

    const holding = await prisma.portfolio.create({
      data: {
        userId: DEMO_USER_ID,
        stockId: stock.id,
        quantity: parseFloat(quantity),
        buyPrice: parseFloat(buyPrice),
        buyDate: buyDate ? new Date(buyDate) : new Date()
      }
    });

    return NextResponse.json(holding);
  } catch (error: any) {
    console.error("[api/portfolio] POST Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
