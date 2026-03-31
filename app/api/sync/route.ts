import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY || "demo";

// Delay function to respect AlphaVantage 12s free tier limit
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchActiveListings() {
  console.log("Fetching active global symbols from Alpha Vantage...");
  const url = `https://www.alphavantage.co/query?function=LISTING_STATUS&state=active&apikey=${API_KEY}`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch listings");

  const csvText = await response.text();
  
  // Parse CSV (symbol,name,exchange,assetType,ipoDate,delistingDate,status)
  const lines = csvText.split("\n").slice(1);
  const nseSymbols: Array<{ symbol: string; name: string; exchange: string }> = [];

  for (const line of lines) {
    if (!line) continue;
    const [symbol, name, exchange] = line.split(",");
    
    // Alpha Vantage uses 'BSE' or 'NSE' for Indian exchanges
    if (exchange === "BSE" || exchange === "NSE") {
      nseSymbols.push({ symbol, name, exchange });
    }
  }

  console.log(`Found ${nseSymbols.length} active Indian equities.`);
  return nseSymbols;
}

async function fetchOverview(symbol: string) {
  const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.Information && data.Information.includes("rate limit")) {
    throw new Error("RATE_LIMIT");
  }

  return data;
}

export async function GET(request: Request) {
  // Simple auth check to ensure this isn't triggered accidentally by public users
  const authHeader = request.headers.get('authorization');
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  if (!API_KEY) {
    return NextResponse.json({ error: "ALPHA_VANTAGE_API_KEY missing" }, { status: 500 });
  }

  // We don't want to block the HTTP response for 10 minutes while it syncs.
  // We trigger the sync asynchronously and return immediately.
  runSyncerBackground();

  return NextResponse.json({ 
    success: true, 
    message: "Market sync background job started." 
  });
}

async function runSyncerBackground() {
  try {
    const symbols = await fetchActiveListings();
    
    // For demo purposes, we will only process the first 5 symbols
    const symbolsToProcess = symbols.slice(0, 5);
    
    console.log(`Starting fundamental sync for ${symbolsToProcess.length} symbols...`);

    for (let i = 0; i < symbolsToProcess.length; i++) {
        const { symbol, name, exchange } = symbolsToProcess[i];
        
        try {
            console.log(`[${i + 1}/${symbolsToProcess.length}] Fetching overview for ${symbol}...`);
            const overview = await fetchOverview(symbol);

            // Create or update the bare-bones stock record
            const stockRecord = await prisma.stock.upsert({
                where: { symbol },
                update: {
                    name,
                    exchange,
                    sector: overview.Sector && overview.Sector !== "None" ? overview.Sector : "Unknown",
                    marketCapType: (parseFloat(overview.MarketCapitalization) || 0) > 20000000000 ? "large" : "mid",
                },
                create: {
                    symbol,
                    nsSymbol: symbol.endsWith(".NS") ? symbol : `${symbol}.NS`,
                    name,
                    exchange,
                    sector: overview.Sector && overview.Sector !== "None" ? overview.Sector : "Unknown",
                    marketCapType: (parseFloat(overview.MarketCapitalization) || 0) > 20000000000 ? "large" : "mid",
                }
            });

            // If we got valid fundamental data, upsert the ratios
            if (overview.PERatio && overview.PERatio !== "None") {
                await prisma.financials.upsert({
                    where: { stockId: stockRecord.id },
                    update: {
                        currentPrice: overview.MarketPrice ? parseFloat(overview.MarketPrice) : 0,
                        pe: parseFloat(overview.PERatio),
                        pb: overview.PriceToBookRatio && overview.PriceToBookRatio !== "None" ? parseFloat(overview.PriceToBookRatio) : null,
                        dividendYield: overview.DividendYield && overview.DividendYield !== "None" ? parseFloat(overview.DividendYield) : null,
                        roe: overview.ReturnOnEquityTTM && overview.ReturnOnEquityTTM !== "None" ? parseFloat(overview.ReturnOnEquityTTM) : null,
                        roce: overview.ReturnOnCapitalEmployedTTM && overview.ReturnOnCapitalEmployedTTM !== "None" ? parseFloat(overview.ReturnOnCapitalEmployedTTM) : null,
                        debtEquity: overview.DebtToEquityRatio && overview.DebtToEquityRatio !== "None" ? parseFloat(overview.DebtToEquityRatio) : null,
                    },
                    create: {
                        stockId: stockRecord.id,
                        currentPrice: overview.MarketPrice ? parseFloat(overview.MarketPrice) : 0,
                        pe: parseFloat(overview.PERatio),
                        pb: overview.PriceToBookRatio && overview.PriceToBookRatio !== "None" ? parseFloat(overview.PriceToBookRatio) : null,
                        dividendYield: overview.DividendYield && overview.DividendYield !== "None" ? parseFloat(overview.DividendYield) : null,
                        roe: overview.ReturnOnEquityTTM && overview.ReturnOnEquityTTM !== "None" ? parseFloat(overview.ReturnOnEquityTTM) : null,
                        roce: overview.ReturnOnCapitalEmployedTTM && overview.ReturnOnCapitalEmployedTTM !== "None" ? parseFloat(overview.ReturnOnCapitalEmployedTTM) : null,
                        debtEquity: overview.DebtToEquityRatio && overview.DebtToEquityRatio !== "None" ? parseFloat(overview.DebtToEquityRatio) : null,
                    }
                });
            }

            console.log(`Successfully synced ${symbol}`);
        } catch (error: any) {
            if (error.message === "RATE_LIMIT") {
                console.warn(`Rate limit hit on ${symbol}. Aborting or you must implement retry-backoff.`);
                break;
            }
            console.error(`Failed to process ${symbol}:`, error.message);
        }

        // Wait 12 seconds to respect Alpha Vantage free tier limits
        if (i < symbolsToProcess.length - 1) {
            console.log("Waiting 12 seconds for API rate limits...");
            await delay(12000);
        }
    }

    console.log("Market sync complete.");
  } catch (error) {
    console.error("Critical syncer error:", error);
  }
}
