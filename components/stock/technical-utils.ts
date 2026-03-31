export function calculateSMA(data: any[], period: number): number | null {
  if (data.length < period) return null;
  const slice = data.slice(-period);
  const sum = slice.reduce((acc, curr) => acc + (curr.close || curr.value || 0), 0);
  return sum / period;
}

export function calculateRSI(data: any[], period: number = 14): number | null {
  if (data.length <= period) return null;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = data[i].close - data[i - 1].close;
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < data.length; i++) {
    const diff = data[i].close - data[i - 1].close;
    const currentGain = diff >= 0 ? diff : 0;
    const currentLoss = diff < 0 ? -diff : 0;

    avgGain = (avgGain * (period - 1) + currentGain) / period;
    avgLoss = (avgLoss * (period - 1) + currentLoss) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

export function getTechnicalSignal(price: number, smas: { sma20: number | null, sma50: number | null, sma200: number | null }, rsi: number | null) {
    let score = 0;
    let total = 0;

    if (smas.sma20) {
        if (price > smas.sma20) score++;
        total++;
    }
    if (smas.sma50) {
        if (price > smas.sma50) score++;
        total++;
    }
    if (smas.sma200) {
        if (price > smas.sma200) score++;
        total++;
    }
    if (rsi) {
        if (rsi < 30) score += 2; // Oversold is bullish
        else if (rsi > 70) score -= 2; // Overbought is bearish
        else if (rsi > 50) score += 0.5;
    }

    const ratio = score / total;
    if (ratio > 0.7) return { label: "Strong Bullish", color: "text-gain", bg: "bg-gain/10" };
    if (ratio > 0.5) return { label: "Bullish", color: "text-gain", bg: "bg-gain/5" };
    if (ratio < 0.3) return { label: "Bearish", color: "text-loss", bg: "bg-loss/10" };
    return { label: "Neutral", color: "text-t2", bg: "bg-highlight" };
}
