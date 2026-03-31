"use client";

import { calculateSMA, calculateRSI, getTechnicalSignal } from "./technical-utils";
import { Info, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TechnicalOverviewProps {
  chartData: any[];
  currentPrice: number;
}

export function TechnicalOverview({ chartData, currentPrice }: TechnicalOverviewProps) {
  if (!chartData || chartData.length < 5) return null;

  const sma20 = calculateSMA(chartData, 20);
  const sma50 = calculateSMA(chartData, 50);
  const sma200 = calculateSMA(chartData, 200);
  const rsi = calculateRSI(chartData, 14);

  const signal = getTechnicalSignal(currentPrice, { sma20, sma50, sma200 }, rsi);

  return (
    <div className="bento-card p-6 flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-t1 font-jakarta">Technical Strength</h3>
        <div className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest ${signal.bg} ${signal.color} border border-border-subtle`}>
          {signal.label}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <TechnicalIndicator 
          label="SMA (20)" 
          value={sma20 ? `₹${sma20.toLocaleString("en-IN", { maximumFractionDigits: 1 })}` : "—"} 
          status={sma20 ? (currentPrice > sma20 ? "bullish" : "bearish") : "neutral"}
        />
        <TechnicalIndicator 
          label="SMA (50)" 
          value={sma50 ? `₹${sma50.toLocaleString("en-IN", { maximumFractionDigits: 1 })}` : "—"} 
          status={sma50 ? (currentPrice > sma50 ? "bullish" : "bearish") : "neutral"}
        />
        <TechnicalIndicator 
          label="SMA (200)" 
          value={sma200 ? `₹${sma200.toLocaleString("en-IN", { maximumFractionDigits: 1 })}` : "—"} 
          status={sma200 ? (currentPrice > sma200 ? "bullish" : "bearish") : "neutral"}
        />
        <div className="flex justify-between items-center py-2 border-t border-border-subtle mt-2">
            <span className="text-xs font-bold text-t3 uppercase tracking-widest">RSI (14)</span>
            <div className="flex flex-col items-end">
                <span className={`text-lg font-bold font-jakarta ${rsi && (rsi > 70 ? 'text-loss' : rsi < 30 ? 'text-gain' : 'text-t1')}`}>
                    {rsi ? rsi.toFixed(1) : "—"}
                </span>
                {rsi && (
                    <span className="text-[10px] text-t3 font-medium uppercase">
                        {rsi > 70 ? "Overbought" : rsi < 30 ? "Oversold" : "Neutral"}
                    </span>
                )}
            </div>
        </div>
      </div>

      <div className="pt-4 mt-auto">
        <div className="flex items-center space-x-2 p-3 bg-highlight rounded-xl border border-border-subtle">
            <Info className="w-4 h-4 text-t3" />
            <p className="text-[10px] text-t2 font-medium leading-relaxed">
                Technical indicators are calculated based on the selected period's closing prices.
            </p>
        </div>
      </div>
    </div>
  );
}

function TechnicalIndicator({ label, value, status }: { label: string, value: string, status: "bullish" | "bearish" | "neutral" }) {
    const Icon = status === "bullish" ? TrendingUp : status === "bearish" ? TrendingDown : Minus;
    const color = status === "bullish" ? "text-gain" : status === "bearish" ? "text-loss" : "text-t3";
    
    return (
        <div className="flex justify-between items-center group">
            <span className="text-xs font-bold text-t3 uppercase tracking-widest group-hover:text-t2 transition-all">{label}</span>
            <div className="flex items-center space-x-3">
                <span className="text-base font-bold text-t1 font-jakarta">{value}</span>
                <div className={`p-1.5 rounded-lg bg-highlight border border-border-subtle ${color}`}>
                    <Icon className="w-3.5 h-3.5" />
                </div>
            </div>
        </div>
    );
}
