"use client";

import { TrendingUp, TrendingDown, DollarSign, PieChart, Clock } from "lucide-react";

interface PortfolioSummaryProps {
  summary: {
    totalInvestment: number;
    currentTotalValue: number;
    totalGain: number;
    totalGainPercent: number;
    dayGain: number;
    dayGainPercent: number;
    isRealTime?: boolean;
    timestamp?: string;
  } | null;
}

export function PortfolioSummary({ summary }: PortfolioSummaryProps) {
  if (!summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bento-card p-6 h-32 animate-pulse bg-highlight border-border-subtle" />
        ))}
      </div>
    );
  }

  const isTotalGain = summary.totalGain >= 0;
  const isDayGain = summary.dayGain >= 0;

  return (
    <div className="space-y-4">
      {summary.isRealTime && (
        <div className="flex items-center gap-2 px-1">
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gain/10 border border-gain/20 rounded-full">
            <div className="w-1.5 h-1.5 bg-gain rounded-full animate-pulse" />
            <span className="text-[9px] font-black text-gain uppercase tracking-widest">Live Market Data</span>
          </div>
          {summary.timestamp && (
            <span className="text-[9px] font-bold text-t3 uppercase tracking-widest opacity-60">
              Last Updated: {new Date(summary.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Value Card */}
        <div className="bg-navy-card border border-border-subtle rounded-md p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <DollarSign className="w-12 h-12 text-t1" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-t3 uppercase tracking-widest flex items-center gap-1.5 mb-2">
               <Clock className="w-3 h-3" />
               Portfolio Value
            </p>
            <h2 className="text-2xl font-sans font-bold text-t1">
              ₹{summary.currentTotalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-t3 font-medium uppercase font-mono tracking-tight">Inv: ₹{summary.totalInvestment.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Net P&L Card */}
        <div className="bg-navy-card border border-border-subtle rounded-md p-5 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              {isTotalGain ? <TrendingUp className="w-12 h-12 text-gain" /> : <TrendingDown className="w-12 h-12 text-loss" />}
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-t3 uppercase tracking-widest mb-2">Total Returns</p>
            <h2 className={`text-2xl font-mono font-bold ${isTotalGain ? 'text-gain' : 'text-loss'}`}>
              {isTotalGain ? '+' : ''}₹{Math.abs(summary.totalGain).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </h2>
            <div className={`inline-flex items-center text-xs font-mono font-bold mt-1 ${isTotalGain ? 'text-gain' : 'text-loss'}`}>
              {isTotalGain ? '+' : ''}{summary.totalGainPercent.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Day's P&L Card */}
        <div className="bg-navy-card border border-border-subtle rounded-md p-5 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <PieChart className="w-12 h-12 text-blue-500" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-t3 uppercase tracking-widest mb-2">Day's Change</p>
            <h2 className={`text-2xl font-mono font-bold ${isDayGain ? 'text-gain' : 'text-loss'}`}>
              {isDayGain ? '+' : ''}₹{Math.abs(summary.dayGain).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </h2>
            <div className={`inline-flex items-center text-xs font-mono font-bold mt-1 ${isDayGain ? 'text-gain' : 'text-loss'}`}>
              {isDayGain ? '+' : ''}{summary.dayGainPercent.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
