/**
 * Quantr Market Sync Engine
 * ─────────────────────────
 * Populates and refreshes 5,000+ NSE/BSE stocks in Supabase.
 *
 * Architecture:
 *   1. fetchAllIndianSymbols()  — one Alpha Vantage LISTING_STATUS call → batch upsert all symbols
 *   2. fetchAndUpsertFundamentals(limit) — rolling cursor, fetches OVERVIEW per symbol with rate limiting
 *   3. runFullSync() — orchestrator called by cron or manual trigger
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ── Config ──────────────────────────────────────────────
const RATE_DELAY_MS = 12_500;       // 12.5s between OVERVIEW calls (free tier = 5/min)
const UPSERT_BATCH_SIZE = 50;       // rows per Supabase upsert (avoids payload limits)
const FUNDAMENTALS_PER_RUN = 400;   // OVERVIEW calls per cron run (~80 min at 12.5s each)

// ── Helpers ─────────────────────────────────────────────
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function safeFloat(val: string | undefined | null): number | null {
  if (!val || val === "None" || val === "-" || val === "0" || val === "N/A") return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

function getSupabase(): SupabaseClient {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(url, key);
}

function getAlphaVantageKey(): string {
  return process.env.ALPHA_VANTAGE_API_KEY || "demo";
}

// ────────────────────────────────────────────────────────
// STEP 1: Fetch ALL Indian Symbols
// ────────────────────────────────────────────────────────
// Alpha Vantage LISTING_STATUS only returns US stocks.
// We fetch from NSE's publicly available equity list instead,
// then fall back to Alpha Vantage LISTING_STATUS as secondary.
// ────────────────────────────────────────────────────────
async function fetchFromNSE(): Promise<{ symbol: string; name: string; exchange: string }[]> {
  console.log("📋 Fetching equity list from NSE India...");

  try {
    const res = await fetch("https://archives.nseindia.com/content/equities/EQUITY_L.csv", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/csv",
      },
    });

    if (!res.ok) throw new Error(`NSE returned HTTP ${res.status}`);

    const csv = await res.text();
    const rows = csv.trim().split("\n").slice(1); // skip header
    const symbols: { symbol: string; name: string; exchange: string }[] = [];

    for (const row of rows) {
      if (!row.trim()) continue;
      // NSE CSV: SYMBOL, NAME OF COMPANY, SERIES, DATE OF LISTING, ...
      const cols = row.split(",");
      if (cols.length < 2) continue;

      const symbol = cols[0]?.trim().replace(/"/g, "");
      const name = cols[1]?.trim().replace(/"/g, "");
      const series = cols[2]?.trim().replace(/"/g, "");

      // Only include EQ (equity) series
      if (symbol && name && (!series || series === "EQ" || series === "BE" || series === "")) {
        symbols.push({ symbol, name, exchange: "NSE" });
      }
    }

    return symbols;
  } catch (err: any) {
    console.warn(`⚠️  NSE fetch failed: ${err.message}. Trying Alpha Vantage...`);
    return [];
  }
}

async function fetchFromAlphaVantage(apiKey: string): Promise<{ symbol: string; name: string; exchange: string }[]> {
  console.log("📋 Fetching listing status from Alpha Vantage...");

  const url = `https://www.alphavantage.co/query?function=LISTING_STATUS&state=active&apikey=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) return [];

  const csv = await res.text();
  if (csv.trim().startsWith("{")) return []; // rate limit JSON

  const rows = csv.trim().split("\n").slice(1);
  const symbols: { symbol: string; name: string; exchange: string }[] = [];

  for (const row of rows) {
    if (!row.trim()) continue;
    const cols = row.split(",");
    const [symbol, name, exchange] = cols;
    if (exchange === "NSE" || exchange === "BSE") {
      symbols.push({ symbol: symbol.trim(), name: name.trim(), exchange: exchange.trim() });
    }
  }

  return symbols;
}

export async function fetchAllIndianSymbols(): Promise<{
  inserted: number;
  total: number;
  errors: string[];
}> {
  const supabase = getSupabase();
  const apiKey = getAlphaVantageKey();
  const errors: string[] = [];

  // Try NSE first, then Alpha Vantage
  let symbols = await fetchFromNSE();

  if (symbols.length === 0) {
    symbols = await fetchFromAlphaVantage(apiKey);
  }

  // If both sources returned 0, report current DB state
  if (symbols.length === 0) {
    const { count } = await supabase.from("stocks").select("*", { count: "exact", head: true });
    console.log(`⚠️  No new symbols fetched. Current DB has ${count || 0} stocks.`);
    return { inserted: 0, total: count || 0, errors: ["No symbols returned from NSE or Alpha Vantage"] };
  }

  console.log(`✅ Found ${symbols.length} Indian equities. Upserting in batches of ${UPSERT_BATCH_SIZE}...`);

  // Batch upsert into stocks table
  let inserted = 0;
  for (let i = 0; i < symbols.length; i += UPSERT_BATCH_SIZE) {
    const batch = symbols.slice(i, i + UPSERT_BATCH_SIZE).map((s) => ({
      ...s,
      sector: null as string | null,
      price: 0,
      market_cap: null as number | null,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("stocks")
      .upsert(batch, { onConflict: "symbol", ignoreDuplicates: false });

    if (error) {
      errors.push(`Batch ${Math.floor(i / UPSERT_BATCH_SIZE)}: ${error.message}`);
    } else {
      inserted += batch.length;
    }
  }

  // Update total in sync_cursor
  await supabase
    .from("sync_cursor")
    .upsert({ id: "default", total_symbols: symbols.length, last_sync_at: new Date().toISOString() });

  console.log(`📊 Upserted ${inserted}/${symbols.length} symbols (${errors.length} batch errors)`);

  return { inserted, total: symbols.length, errors };
}

// ── Fundamentals Sync ───────────────────────────────────
import { yahooFinance } from "@/lib/yahoo-finance";

export async function fetchAndUpsertFundamentals(
  limitOrStocks: number | any[] = 50
): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
  nextOffset: number;
  errors: string[];
}> {
  const supabase = getSupabase();
  const apiKey = getAlphaVantageKey();
  const errors: string[] = [];

  let stocks: any[] = [];
  let offset = 0;
  let totalSymbols = 0;
  let isSpecific = false;

  if (Array.isArray(limitOrStocks)) {
    stocks = limitOrStocks;
    isSpecific = true;
  } else {
    const limit = limitOrStocks;
    // Read current cursor
    const { data: cursor } = await supabase
      .from("sync_cursor")
      .select("offset_value, total_symbols")
      .eq("id", "default")
      .single();

    offset = cursor?.offset_value || 0;
    totalSymbols = cursor?.total_symbols || 0;

    // If offset >= total, wrap around
    if (totalSymbols > 0 && offset >= totalSymbols) {
      offset = 0;
    }

    console.log(`🔄 Fundamentals sync: offset=${offset}, limit=${limit}, total=${totalSymbols}`);

    // Fetch the next batch of stocks that need OVERVIEW data
    const { data: fetchedStocks, error: fetchErr } = await supabase
      .from("stocks")
      .select("id, symbol, exchange")
      .order("symbol", { ascending: true })
      .range(offset, offset + limit - 1);

    if (fetchErr) throw new Error(`Failed to fetch stocks: ${fetchErr.message}`);
    stocks = fetchedStocks || [];
  }

  if (stocks.length === 0) {
    if (!isSpecific) {
      await supabase.from("sync_cursor").update({ offset_value: 0 }).eq("id", "default");
    }
    return { processed: 0, succeeded: 0, failed: 0, nextOffset: 0, errors: [] };
  }

  console.log(`📡 Processing ${stocks.length} symbols...`);

  let succeeded = 0;
  let failed = 0;
  let avRateLimited = false;

  for (let i = 0; i < stocks.length; i++) {
    const stock = stocks[i];
    let sector: string | null = null;
    let marketCap: number | null = null;
    let price: number | null = null;
    let pe: number | null = null;
    let pb: number | null = null;
    let divYield: number | null = null;
    let roe: number | null = null;
    let roce: number | null = null;
    let debtToEquity: number | null = null;
    let salesGrowth: number | null = null;
    let ev: number | null = null;
    let bookValue: number | null = null;
    let cash: number | null = null;
    let debt: number | null = null;
    let promoterHolding: number | null = null;
    let eps: number | null = null;

    try {
      let usedYahoo = false;

      // 1. Try Alpha Vantage (unless rate limited this run)
      if (!avRateLimited) {
        const symbolVariants = stock.exchange === "BSE" ? [`${stock.symbol}.BSE`, stock.symbol] : [stock.symbol];
        let avData: Record<string, any> = {};

        for (const sym of symbolVariants) {
          const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${sym}&apikey=${apiKey}`;
          const res = await fetch(overviewUrl);
          avData = await res.json();

          if (avData?.Information?.includes("rate limit") || avData?.Note?.includes("call volume")) {
            console.warn(`⚠️  Alpha Vantage rate limit hit at ${stock.symbol}. Falling back to Yahoo Finance for remainder of batch.`);
            avRateLimited = true;
            break;
          }
          if (avData?.Symbol || avData?.MarketCapitalization) break;
          
          if (sym !== symbolVariants[symbolVariants.length - 1]) await sleep(RATE_DELAY_MS);
        }

        if (avData?.MarketCapitalization && avData.MarketCapitalization !== "None") {
          sector = avData.Sector && avData.Sector !== "None" ? avData.Sector : null;
          marketCap = safeFloat(avData.MarketCapitalization);
          price = safeFloat(avData["50DayMovingAverage"]) || safeFloat(avData["AnalystTargetPrice"]);
          pe = safeFloat(avData.PERatio);
          pb = safeFloat(avData.PriceToBookRatio);
          divYield = safeFloat(avData.DividendYield);
          roe = safeFloat(avData.ReturnOnEquityTTM);
          roce = safeFloat(avData.ReturnOnCapitalEmployedTTM);
          debtToEquity = safeFloat(avData.DebtToEquityRatio);
          salesGrowth = safeFloat(avData.QuarterlyRevenueGrowthYOY);
          ev = safeFloat(avData.EBITDA); // Alpha Vantage doesn't strictly provide EV in overview readily but we can leave it null.
          bookValue = safeFloat(avData.BookValue);
          eps = safeFloat(avData.EPS);
        }
      }

      // 2. Fallback to Yahoo Finance if AV failed or hit limit
      if (!marketCap) {
        usedYahoo = true;
        const ySymbol = stock.exchange === "BSE" ? `${stock.symbol}.BO` : `${stock.symbol}.NS`;
        
        try {
          const quote = await yahooFinance.quoteSummary(ySymbol, {
            modules: ["summaryDetail", "financialData", "summaryProfile", "price", "defaultKeyStatistics"],
          }) as any;

          sector = quote.summaryProfile?.sector || null;
          marketCap = quote.summaryDetail?.marketCap || quote.price?.marketCap || null;
          price = quote.summaryDetail?.previousClose || quote.price?.regularMarketPrice || quote.financialData?.currentPrice || null;
          
          pe = quote.summaryDetail?.trailingPE || null;
          pb = quote.defaultKeyStatistics?.priceToBook || null;
          divYield = quote.summaryDetail?.dividendYield || null;
          roe = quote.financialData?.returnOnEquity || null;
          roce = quote.financialData?.returnOnAssets || null; // Using ROA as proxy for ROCE
          
          // Yahoo returns D/E as whole numbers sometimes (e.g. 124 for 1.24) or percentages
          const rawDe = quote.financialData?.debtToEquity;
          debtToEquity = rawDe ? rawDe / 100 : null; // Normalize to standard decimal
          
          salesGrowth = quote.financialData?.revenueGrowth || null;

          // New Finology metrics
          ev = quote.defaultKeyStatistics?.enterpriseValue || null;
          bookValue = quote.defaultKeyStatistics?.bookValue || null;
          cash = quote.financialData?.totalCash || null;
          debt = quote.financialData?.totalDebt || null;
          promoterHolding = quote.defaultKeyStatistics?.heldPercentInsiders || null;
          eps = quote.defaultKeyStatistics?.trailingEps || quote.summaryDetail?.trailingEps || null;

        } catch (yErr: any) {
          console.warn(`⚠️ Yahoo Finance failed for ${ySymbol}: ${yErr.message}`);
        }
      }

      // 3. Upsert to Database
      if (sector || marketCap || price !== null) {
        await supabase
          .from("stocks")
          .update({
            sector: sector || undefined,
            market_cap: marketCap || undefined,
            price: price || undefined,
            updated_at: new Date().toISOString(),
          })
          .eq("id", stock.id);
      }

      if (pe !== null || roe !== null || marketCap !== null) {
        const { error: finErr } = await supabase
          .from("financials")
          .upsert(
            {
              stock_id: stock.id,
              pe_ratio: pe,
              pb_ratio: pb,
              dividend_yield: divYield,
              roe,
              roce,
              debt_to_equity: debtToEquity,
              sales_growth: salesGrowth,
              enterprise_value: ev,
              book_value: bookValue,
              cash: cash,
              debt: debt,
              promoter_holding: promoterHolding,
              eps: eps,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "stock_id" }
          );

        if (finErr) {
          errors.push(`${stock.symbol} financials: ${finErr.message}`);
          failed++;
        } else {
          succeeded++;
        }
      } else {
        succeeded++; // Processed but no data
      }

      console.log(
        `  [${i + 1}/${stocks.length}] ${stock.symbol.padEnd(12)} ` +
        `[${usedYahoo ? 'Yahoo' : 'AV'}] ` +
        `PE=${pe?.toFixed(1) ?? "—"}  ROE=${roe ? (roe*100).toFixed(1)+'%' : "—"}  MCap=${marketCap ? (marketCap / 1e9).toFixed(1) + "B" : "—"}`
      );
    } catch (err: any) {
      failed++;
      errors.push(`${stock.symbol}: ${err.message}`);
      console.error(`  [${i + 1}/${stocks.length}] ${stock.symbol.padEnd(12)} ❌ ${err.message}`);
    }

    // Delay to play nicely with APIs
    if (i < stocks.length - 1) {
      await sleep(avRateLimited ? 1500 : RATE_DELAY_MS); // Faster delay if only using Yahoo
    }
  }

  // Update cursor
  let nextOffset = 0;
  if (!isSpecific) {
    nextOffset = offset + stocks.length;
    await supabase
      .from("sync_cursor")
      .update({
        offset_value: nextOffset >= totalSymbols ? 0 : nextOffset,
        last_sync_at: new Date().toISOString(),
        status: "completed",
      })
      .eq("id", "default");
  }

  console.log(`\n────────────────────────────────────`);
  console.log(`✅ Succeeded: ${succeeded}  ❌ Failed: ${failed}  📍 Next offset: ${nextOffset}`);
  console.log(`────────────────────────────────────\n`);

  return {
    processed: stocks.length,
    succeeded,
    failed,
    nextOffset: nextOffset >= totalSymbols ? 0 : nextOffset,
    errors,
  };
}

// ────────────────────────────────────────────────────────
// STEP 3: Full Sync Orchestrator
// ────────────────────────────────────────────────────────
export async function runFullSync(
  mode: "full" | "listings" | "fundamentals" = "full",
  fundamentalsLimit?: number
): Promise<{
  listings?: { inserted: number; total: number; errors: string[] };
  fundamentals?: { processed: number; succeeded: number; failed: number; nextOffset: number; errors: string[] };
}> {
  const supabase = getSupabase();
  const result: any = {};

  // Mark sync as running
  await supabase
    .from("sync_cursor")
    .upsert({ id: "default", status: "running", last_sync_at: new Date().toISOString() });

  try {
    if (mode === "full" || mode === "listings") {
      console.log("\n═══════════════════════════════════════");
      console.log("  PHASE 1: Syncing Symbol Listings");
      console.log("═══════════════════════════════════════\n");
      result.listings = await fetchAllIndianSymbols();
    }

    if (mode === "full" || mode === "fundamentals") {
      console.log("\n═══════════════════════════════════════");
      console.log("  PHASE 2: Syncing Fundamentals");
      console.log("═══════════════════════════════════════\n");
      result.fundamentals = await fetchAndUpsertFundamentals(fundamentalsLimit || FUNDAMENTALS_PER_RUN);
    }
  } catch (err: any) {
    await supabase.from("sync_cursor").update({ status: "error" }).eq("id", "default");
    throw err;
  }

  await supabase.from("sync_cursor").update({ status: "completed" }).eq("id", "default");

  return result;
}
