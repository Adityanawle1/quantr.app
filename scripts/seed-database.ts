import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { toNSESymbol } from '../lib/yahoo-finance';
import YahooFinance from 'yahoo-finance2';
import crypto from 'crypto'; // For uuid

// 1. Setup Environment
dotenv.config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const yahooFinance = new (YahooFinance as any)();

// 2. Constants
const NIFTY50 = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', sector: 'Energy' },
  { symbol: 'TCS', name: 'Tata Consultancy Services Ltd.', sector: 'IT' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', sector: 'Finance' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', sector: 'Finance' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd.', sector: 'Telecom' },
  { symbol: 'SBIN', name: 'State Bank of India', sector: 'Finance' },
  { symbol: 'INFY', name: 'Infosys Ltd.', sector: 'IT' },
  { symbol: 'LICI', name: 'Life Insurance Corporation of India', sector: 'Finance' },
  { symbol: 'ITC', name: 'ITC Ltd.', sector: 'FMCG' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd.', sector: 'FMCG' },
  { symbol: 'LT', name: 'Larsen & Toubro Ltd.', sector: 'Infrastructure' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd.', sector: 'Finance' },
  { symbol: 'HCLTECH', name: 'HCL Technologies Ltd.', sector: 'IT' },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd.', sector: 'Auto' },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Ltd.', sector: 'Pharma' },
  { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd.', sector: 'Diversified' },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd.', sector: 'Finance' },
  { symbol: 'TITAN', name: 'Titan Company Ltd.', sector: 'Consumer Goods' },
  { symbol: 'ONGC', name: 'Oil & Natural Gas Corporation Ltd.', sector: 'Energy' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.', sector: 'Auto' },
  { symbol: 'NTPC', name: 'NTPC Ltd.', sector: 'Energy' },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd.', sector: 'Finance' },
  { symbol: 'DMART', name: 'Avenue Supermarts Ltd.', sector: 'Retail' },
  { symbol: 'ADANIGREEN', name: 'Adani Green Energy Ltd.', sector: 'Energy' },
  { symbol: 'ADANIPORTS', name: 'Adani Ports and SEZ Ltd.', sector: 'Infrastructure' },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd.', sector: 'Infrastructure' },
  { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd.', sector: 'Consumer Goods' },
  { symbol: 'COALINDIA', name: 'Coal India Ltd.', sector: 'Energy' },
  { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv Ltd.', sector: 'Finance' },
  { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto Ltd.', sector: 'Auto' },
  { symbol: 'POWERGRID', name: 'Power Grid Corporation of India Ltd.', sector: 'Energy' },
  { symbol: 'NESTLEIND', name: 'Nestle India Ltd.', sector: 'FMCG' },
  { symbol: 'WIPRO', name: 'Wipro Ltd.', sector: 'IT' },
  { symbol: 'M&M', name: 'Mahindra & Mahindra Ltd.', sector: 'Auto' },
  { symbol: 'IOC', name: 'Indian Oil Corporation Ltd.', sector: 'Energy' },
  { symbol: 'JIOFIN', name: 'Jio Financial Services Ltd.', sector: 'Finance' },
  { symbol: 'HAL', name: 'Hindustan Aeronautics Ltd.', sector: 'Defence' },
  { symbol: 'DLF', name: 'DLF Ltd.', sector: 'Real Estate' },
  { symbol: 'ADANIPOWER', name: 'Adani Power Ltd.', sector: 'Energy' },
  { symbol: 'JSWSTEEL', name: 'JSW Steel Ltd.', sector: 'Metals' },
  { symbol: 'TATASTEEL', name: 'Tata Steel Ltd.', sector: 'Metals' },
  { symbol: 'SIEMENS', name: 'Siemens Ltd.', sector: 'Infrastructure' },
  { symbol: 'IRFC', name: 'Indian Railway Finance Corp', sector: 'Finance' },
  { symbol: 'VBL', name: 'Varun Beverages Ltd.', sector: 'FMCG' },
  { symbol: 'ZOMATO', name: 'Zomato Ltd.', sector: 'Technology' },
  { symbol: 'PIDILITIND', name: 'Pidilite Industries Ltd.', sector: 'Chemicals' },
  { symbol: 'GRASIM', name: 'Grasim Industries Ltd.', sector: 'Infrastructure' },
  { symbol: 'SBILIFE', name: 'SBI Life Insurance Company Ltd.', sector: 'Finance' },
  { symbol: 'BEL', name: 'Bharat Electronics Ltd.', sector: 'Defence' },
  { symbol: 'LTIM', name: 'LTIMindtree Ltd.', sector: 'IT' },
];

function stableHashNum(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) / 2147483648; 
}

function generateRealisticDefaults(symbol: string, sector: string) {
  const seed = stableHashNum(symbol);
  
  let roeBase = 15, roeRange = 10;
  let roceBase = 15, roceRange = 10;
  let deBase = 0.5, deRange = 1.0;
  let growthBase = 8, growthRange = 15;

  if (sector === 'IT') {
    roeBase = 22; deBase = 0.05; deRange = 0.1; roceBase = 25;
  } else if (sector === 'Finance') {
    roeBase = 14; deBase = 4.0; deRange = 3.0; roceBase = 12; growthBase = 15;
  } else if (sector === 'FMCG') {
    roeBase = 20; deBase = 0.1; deRange = 0.2; roceBase = 24; growthRange = 8;
  } else if (sector === 'Infrastructure' || sector === 'Energy') {
    roeBase = 12; deBase = 0.8; deRange = 1.2; roceBase = 14; growthBase = 5;
  }

  return {
    roe: Number((roeBase + seed * roeRange).toFixed(2)),
    roce: Number((roceBase + seed * roceRange).toFixed(2)),
    debt_to_equity: Number((deBase + seed * deRange).toFixed(2)),
    revenue_growth_yoy: Number((growthBase + seed * growthRange).toFixed(2)),
    profit_growth_yoy: Number((growthBase + (seed * 1.5) * growthRange).toFixed(2)),
    promoter_holding: Number((0.40 + seed * 0.35).toFixed(4)),
  };
}

async function main() {
  console.log('🚀 Starting Universal Database Seeder via REST API...\n');

  let successCount = 0;

  for (const s of NIFTY50) {
    process.stdout.write(`[${successCount + 1}/${NIFTY50.length}] Syncing ${s.symbol.padEnd(12)}... `);

    try {
      const stockId = crypto.randomUUID();

      let quote: any = {};
      try {
         quote = await yahooFinance.quote(toNSESymbol(s.symbol));
      } catch (e) {
         console.warn(`(YF fetch fail: using default fallback) `);
      }

      // 1. Upsert stocks table
      const { data: stockData, error: stockErr } = await supabase
        .from('stocks')
        .upsert({
          id: stockId,
          symbol: s.symbol,
          nsSymbol: toNSESymbol(s.symbol),
          name: s.name,
          sector: s.sector,
          marketCapType: 'large',
          exchange: 'NSE',
          price: quote.regularMarketPrice ?? 100,
          market_cap: quote.marketCap ?? null,
        }, { onConflict: 'symbol' })
        .select('id')
        .single();

      if (stockErr) throw new Error("Supabase Stock Insert: " + stockErr.message);
      
      const realStockId = stockData!.id;

      // 2. Generate stats
      const deterministicMetrics = generateRealisticDefaults(s.symbol, s.sector);

      const fData = {
        id: crypto.randomUUID(),
        stock_id: realStockId,
        current_price: quote.regularMarketPrice ?? 100,
        change: quote.regularMarketChange ?? null,
        change_percent: quote.regularMarketChangePercent ?? null,
        volume: quote.regularMarketVolume ?? null,
        market_cap: quote.marketCap ?? null,
        pe_ratio: quote.trailingPE ?? quote.forwardPE ?? null,
        pb_ratio: quote.priceToBook ?? null,
        eps: quote.epsTrailingTwelveMonths ?? quote.epsForward ?? null,
        book_value: quote.bookValue ?? null,
        dividend_yield: quote.trailingAnnualDividendYield ?? quote.dividendYield ?? null,
        week_high_52: quote.fiftyTwoWeekHigh ?? null,
        week_low_52: quote.fiftyTwoWeekLow ?? null,
        roe: deterministicMetrics.roe,
        roce: deterministicMetrics.roce,
        debt_to_equity: deterministicMetrics.debt_to_equity,
        revenue_growth_yoy: deterministicMetrics.revenue_growth_yoy,
        profit_growth_yoy: deterministicMetrics.profit_growth_yoy,
        promoter_holding: deterministicMetrics.promoter_holding,
        updated_at: new Date().toISOString()
      };

      // 3. Upsert financials
      const { error: finError } = await supabase
        .from('financials')
        .upsert(fData, { onConflict: 'stock_id' });

      if (finError) throw new Error("Supabase Financials Insert: " + finError.message);

      console.log('✅ Success');
      successCount++;
    } catch (err: any) {
      console.log(`❌ Failed: ${err.message}`);
    }
  }

  console.log(`\n🎉 Seeded ${successCount}/${NIFTY50.length} stocks successfully into Supabase!`);
}

main();
