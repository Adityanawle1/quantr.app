/**
 * Quantr Market Syncer
 * --------------------
 * Fetches ALL active NSE symbols from Alpha Vantage,
 * pulls fundamental ratios (P/E, ROE, ROCE, Debt-to-Equity),
 * and upserts them into a Supabase database.
 *
 * Usage:  npm run sync
 * Requires:  SUPABASE_URL, SUPABASE_SERVICE_KEY, ALPHA_VANTAGE_API_KEY in .env
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

// ── Config ──────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!;   // service-role key for inserts
const AV_KEY       = process.env.ALPHA_VANTAGE_API_KEY!;
const RATE_DELAY   = 12_000;   // 12 seconds between AV calls (free tier = 5/min)
const BATCH_SIZE   = 50;       // how many symbols to process per run (set to Infinity for all)

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Helpers ─────────────────────────────────────────────
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function safeFloat(val: string | undefined): number | null {
  if (!val || val === "None" || val === "-" || val === "0") return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

// ── Step 1: Fetch Listing Status CSV ────────────────────
async function fetchActiveNSESymbols() {
  console.log("\n🔍  Fetching active listings from Alpha Vantage...");
  const url = `https://www.alphavantage.co/query?function=LISTING_STATUS&state=active&apikey=${AV_KEY}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Listing API returned ${res.status}`);

  const csv = await res.text();
  const rows = csv.trim().split("\n").slice(1);          // skip header

  const symbols: { symbol: string; name: string; exchange: string }[] = [];

  for (const row of rows) {
    if (!row) continue;
    const cols = row.split(",");
    const [symbol, name, exchange] = cols;

    // Keep only Indian exchange tickers
    if (exchange === "BSE" || exchange === "NSE") {
      symbols.push({ symbol: symbol.trim(), name: name.trim(), exchange: exchange.trim() });
    }
  }

  console.log(`✅  Found ${symbols.length} active Indian equities.\n`);
  return symbols;
}

// ── Step 2: Fetch Company Overview ──────────────────────
async function fetchOverview(symbol: string): Promise<Record<string, string>> {
  const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${AV_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data?.Information?.includes("rate limit")) {
    throw new Error("RATE_LIMIT");
  }

  return data;
}

// ── Step 3: Upsert into Supabase ────────────────────────
async function upsertStock(
  sym: { symbol: string; name: string; exchange: string },
  overview: Record<string, string>
) {
  // Upsert into stocks table
  const { data: stock, error: stockErr } = await supabase
    .from("stocks")
    .upsert(
      {
        symbol: sym.symbol,
        name: sym.name,
        exchange: sym.exchange,
        sector: overview.Sector && overview.Sector !== "None" ? overview.Sector : null,
        market_cap: safeFloat(overview.MarketCapitalization),
        price: safeFloat(overview["50DayMovingAverage"]) ?? 0,   // best approx without GLOBAL_QUOTE
      },
      { onConflict: "symbol" }
    )
    .select("id")
    .single();

  if (stockErr) {
    console.error(`   ❌ stocks upsert failed for ${sym.symbol}:`, stockErr.message);
    return;
  }

  // Upsert fundamentals
  const peRatio = safeFloat(overview.PERatio);
  if (peRatio !== null || safeFloat(overview.ReturnOnEquityTTM) !== null) {
    const { error: finErr } = await supabase
      .from("financials")
      .upsert(
        {
          stock_id: stock.id,
          pe_ratio: peRatio,
          pb_ratio: safeFloat(overview.PriceToBookRatio),
          dividend_yield: safeFloat(overview.DividendYield),
          roe: safeFloat(overview.ReturnOnEquityTTM),
          roce: safeFloat(overview.ReturnOnCapitalEmployedTTM),
          debt_to_equity: safeFloat(overview.DebtToEquityRatio),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "stock_id" }
      );

    if (finErr) {
      console.error(`   ❌ financials upsert failed for ${sym.symbol}:`, finErr.message);
    }
  }
}

// ── Main ────────────────────────────────────────────────
async function main() {
  // Validate env
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌  Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env");
    process.exit(1);
  }
  if (!AV_KEY) {
    console.error("❌  Missing ALPHA_VANTAGE_API_KEY in .env");
    process.exit(1);
  }

  const allSymbols = await fetchActiveNSESymbols();
  const batch = allSymbols.slice(0, BATCH_SIZE);

  console.log(`🚀  Processing ${batch.length} of ${allSymbols.length} symbols (batch size = ${BATCH_SIZE})\n`);

  let success = 0;
  let failed  = 0;

  for (let i = 0; i < batch.length; i++) {
    const sym = batch[i];

    try {
      process.stdout.write(`[${i + 1}/${batch.length}] ${sym.symbol.padEnd(12)} `);

      const overview = await fetchOverview(sym.symbol);
      await upsertStock(sym, overview);

      success++;
      console.log("✅  synced");
    } catch (err: any) {
      if (err.message === "RATE_LIMIT") {
        console.warn("\n⚠️  Alpha Vantage rate limit hit — stopping early.");
        break;
      }
      failed++;
      console.log(`❌  ${err.message}`);
    }

    // Rate-limit pause (skip after last item)
    if (i < batch.length - 1) {
      process.stdout.write(`   ⏳ waiting ${RATE_DELAY / 1000}s...\r`);
      await sleep(RATE_DELAY);
    }
  }

  console.log(`\n────────────────────────────────────`);
  console.log(`✅  Synced: ${success}   ❌  Failed: ${failed}`);
  console.log(`────────────────────────────────────\n`);
}

main();
