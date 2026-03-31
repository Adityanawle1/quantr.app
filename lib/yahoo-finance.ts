import YahooFinance from 'yahoo-finance2'

// Handle ESM/CJS interop for yahoo-finance2 v3
// The default export is the class that must be instantiated
const YFClass = (YahooFinance as any).default || YahooFinance;
export const yahooFinance = new YFClass();

export function toNSESymbol(symbol: string): string {
  if (symbol.startsWith('^')) return symbol
  return symbol.endsWith('.NS') || symbol.endsWith('.BO') ? symbol : `${symbol}.NS`
}

export async function getYfQuote(symbols: string | string[]): Promise<any[]> {
  try {
    const syms = Array.isArray(symbols) ? symbols : [symbols];
    const results = await yahooFinance.quote(syms.map(toNSESymbol));
    return Array.isArray(results) ? results : [results];
  } catch (e) {
    console.error(`getYfQuote failed:`, e)
    return []
  }
}

export async function getYfIndices(): Promise<any[]> {
  const INDICES = [
    { symbol: '^NSEI', name: 'Nifty 50' },
    { symbol: '^BSESN', name: 'SENSEX' },
    { symbol: '^NSEBANK', name: 'Bank Nifty' },
    { symbol: 'NIFTY_MID_100.NS', name: 'Midcap 100' },
  ];

  try {
    const quotes = await yahooFinance.quote(INDICES.map(i => i.symbol));
    const results = (Array.isArray(quotes) ? quotes : [quotes]) as any[];
    
    return INDICES.map((index) => {
      const q = results.find((r: any) => r.symbol === index.symbol);
      const seed = index.symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const isUp = (q?.regularMarketChangePercent ?? 0) >= 0;
      
      // Generate a visually distinct sparkline for each symbol based on its seed
      const sparkline = Array.from({ length: 8 }).map((_, i) => {
        const base = q?.regularMarketPrice || 100;
        const trend = isUp ? (i * 0.002) : -(i * 0.002);
        const noise = (Math.sin(seed + i) * 0.005);
        return base * (1 + trend + noise);
      });

      return {
        symbol: index.symbol,
        name: index.name,
        price: q?.regularMarketPrice ?? 0,
        change: q?.regularMarketChange ?? 0,
        changePercent: q?.regularMarketChangePercent ?? 0,
        sparkline
      } as any;
    });
  } catch (e) {
    console.error("getYfIndices failed:", e);
    return [];
  }
}

export async function getChartData(symbol: string, period: string) {
  const periodMap: Record<string, { period1: Date; interval: any }> = {
    '1d': { period1: new Date(Date.now() - 4 * 86400000), interval: '5m' },
    '1w': { period1: new Date(Date.now() - 7*86400000), interval: '30m' },
    '1m': { period1: new Date(Date.now() - 30*86400000), interval: '1d' },
    '3m': { period1: new Date(Date.now() - 90*86400000), interval: '1d' },
    '1y': { period1: new Date(Date.now() - 365*86400000), interval: '1wk' },
    '5y': { period1: new Date(Date.now() - 5*365*86400000), interval: '1mo' },
  }
  const config = periodMap[period] || periodMap['1w']
  try {
    const result: any = await yahooFinance.chart(toNSESymbol(symbol), {
      period1: config.period1,
      interval: config.interval,
    })
    
    if (!result?.quotes) return [];

    return result.quotes
      .filter((q: any) => q.date && q.close !== undefined)
      .map((q: any) => ({
        time: Math.floor(new Date(q.date).getTime() / 1000),
        open: q.open,
        high: q.high,
        low: q.low,
        close: q.close,
        volume: q.volume,
      }))
  } catch (e) {
    console.error(`getChartData failed for ${symbol}:`, e)
    return []
  }
}
