import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { supabase } from '@/lib/supabase';
import { getYfQuote } from '@/lib/yahoo-finance';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache for 1 hour

const NIFTY_FALLBACK = ['RELIANCE', 'TCS', 'HDFCBANK', 'ICICIBANK', 'INFY', 'SBIN', 'BHARTIARTL', 'ITC', 'LT', 'BAJFINANCE', 'AXISBANK', 'KOTAKBANK', 'MARUTI', 'SUNPHARMA', 'HUL', 'TATAMOTORS', 'M&M', 'TATASTEEL', 'POWERGRID', 'ULTRACEMCO', 'NTPC', 'TITAN', 'JSWSTEEL', 'TECHM', 'WIPRO', 'HCLTECH', 'ADANIENT', 'ADANIPORTS', 'ONGC', 'HINDALCO', 'GRASIM', 'COALINDIA', 'EICHERMOT', 'DIVISLAB', 'BAJAJFINSV', 'APOLLOHOSP', 'HEROMOTOCO', 'DRREDDY', 'CIPLA', 'TATSCONSUM', 'BRITANNIA', 'BPCL', 'INDUSINDBK', 'NESTLEIND', 'TATAPOWER', 'SBILIFE', 'HDFCLIFE', 'LTIM'];

export async function GET(request: Request, context: any) {
  const params = await Promise.resolve(context.params);
  const index = params.index as string;

  try {
    let url = '';
    let isSensex = false;
    
    if (index === 'nifty50') {
      url = 'https://en.wikipedia.org/wiki/NIFTY_50';
    } else if (index === 'sensex') {
      url = 'https://en.wikipedia.org/wiki/BSE_SENSEX';
      isSensex = true;
    } else {
      return NextResponse.json({ error: 'Invalid index' }, { status: 400 });
    }

    const res = await fetch(url, { next: { revalidate: 3600 } });
    const html = await res.text();
    const $ = cheerio.load(html);

    const symbols: string[] = [];

    $('table.wikitable').each((i, table) => {
      let symbolColIdx = -1;
      $(table).find('th').each((j, th) => {
        const text = $(th).text().trim().toLowerCase();
        if (text.includes('symbol') || text.includes('ticker')) {
          symbolColIdx = j;
        }
      });

      if (symbolColIdx !== -1) {
        $(table).find('tr').each((k, tr) => {
          if (k === 0) return;
          const td = $(tr).find('td').eq(symbolColIdx);
          let symbol = td.text().trim();
          
          if (symbol) {
             symbol = symbol.replace(/\[.*\]/g, '').trim();
             symbol = symbol.replace('.NS', '').replace('.BO', '').trim();
             symbol = symbol.split(' ')[0];
             
             if (symbol && !symbols.includes(symbol)) {
                symbols.push(symbol);
             }
          }
        });
      }
    });

    // Fallback if scraper breaks due to wikipedia structure change
    if (symbols.length === 0) {
      if (index === 'nifty50') symbols.push(...NIFTY_FALLBACK);
      else symbols.push('RELIANCE', 'TCS', 'HDFCBANK', 'ICICIBANK', 'INFY');
    }

    const topSymbols = isSensex ? symbols.slice(0, 30) : symbols.slice(0, 50);
    
    // Convert to Yahoo Finance NS format
    const yfSymbols = topSymbols.map(s => `${s}.NS`);
    
    let dbQuotes: any[] = [];
    try {
      dbQuotes = await getYfQuote(yfSymbols);
    } catch(e) {
      console.error("YF Failed, continuing without live quotes");
    }
    
    // Gather basic metadata from DB
    const { data: dbStocks } = await supabase
       .from('stocks')
       .select('symbol, name, sector')
       .in('symbol', topSymbols);
       
    const dbMap = new Map((dbStocks || []).map(s => [s.symbol, s]));

    const constituents = topSymbols.map(sym => {
      const q = dbQuotes.find(x => x?.symbol === `${sym}.NS` || x?.symbol === sym);
      const dbInfo = dbMap.get(sym);
      
      return {
        symbol: sym,
        name: dbInfo?.name || q?.shortName || sym,
        sector: dbInfo?.sector || 'Unknown',
        price: q?.regularMarketPrice || 0,
        change: q?.regularMarketChangePercent || 0,
        marketCap: q?.marketCap || 0
      }
    }).sort((a,b) => b.marketCap - a.marketCap); // Sort by highest Market Cap

    return NextResponse.json({ constituents });
  } catch (error: any) {
    console.error(`[/api/indices/${index}] Error:`, error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
