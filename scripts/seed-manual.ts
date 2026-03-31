import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

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
]

async function seed() {
  console.log('Seeding Nifty 50...')
  for (const s of NIFTY50) {
    const { data, error } = await supabase
      .from('Stock')
      .upsert({
        id: crypto.randomUUID(), // Explicit ID for Supabase API
        symbol: s.symbol,
        nsSymbol: `${s.symbol}.NS`,
        name: s.name,
        sector: s.sector,
        marketCapType: 'large',
        exchange: 'NSE'
      }, { onConflict: 'symbol' })

    if (error) {
      console.error(`Error for ${s.symbol}:`, error.message)
    } else {
      console.log(`Synced: ${s.symbol}`)
    }
  }
}

seed().catch(console.error)
